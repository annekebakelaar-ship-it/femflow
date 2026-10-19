// Ovari MCP-server, fase 1: alleen de openbare kennisbank.
//
// Wat deze dienst WEL doet: twee tools die zoeken in en lezen uit de negentien
// artikelen die al openbaar op ovari.youcaps.app/kennis staan.
//
// Wat deze dienst NIET doet, en ook niet kan:
//   - geen verbinding met de database, er is geen databasestuurprogramma geladen
//   - geen inloggen, geen OAuth, geen tokens
//   - geen persoonsgegevens, geen wearable-data, geen symptoomlogboeken
//   - geen schrijfacties van welke soort dan ook
//
// De bestaande Express-backend in femflow-backend/ wordt niet aangeraakt. Dit
// is een losse service met een eigen package.json en eigen afhankelijkheden.
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { fileURLToPath } from 'node:url'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { TOOLS, SERVER_INSTRUCTIES } from './src/tools.js'
import { alleArtikelen } from './src/artikelen.js'

export const NAAM = 'ovari-kennisbank'
export const VERSIE = '0.1.0'

// Origins die een browser mag gebruiken. Een server-naar-server aanroep stuurt
// geen Origin mee; die laten we door. Staat er wel een Origin en hoort hij niet
// in deze lijst, dan is het 403. Dat schrijft de specificatie voor als
// bescherming tegen DNS-rebinding.
const STANDAARD_ORIGINS = [
  'https://chatgpt.com',
  'https://chat.openai.com',
  'https://claude.ai',
]

export function toegestaneOrigins() {
  const uitOmgeving = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return [...new Set([...STANDAARD_ORIGINS, ...uitOmgeving])]
}

export function maakMcpServer() {
  const server = new McpServer(
    { name: NAAM, version: VERSIE },
    { instructions: SERVER_INSTRUCTIES }
  )

  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
        annotations: tool.annotations,
      },
      tool.handler
    )
  }

  return server
}

export function maakApp() {
  const app = express()
  app.disable('x-powered-by')

  // Achter Render zit een proxy; nodig zodat de snelheidslimiet het echte
  // client-IP ziet in plaats van dat van de proxy.
  app.set('trust proxy', 1)

  const origins = toegestaneOrigins()
  app.use(cors({ origin: origins, exposedHeaders: ['Mcp-Session-Id'] }))
  app.use(express.json({ limit: '256kb' }))

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Te veel verzoeken, probeer het over een minuut opnieuw' },
    })
  )

  function controleerOrigin(req, res, next) {
    const origin = req.headers.origin
    if (!origin) return next()
    if (origins.includes(origin)) return next()
    return res.status(403).json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Origin niet toegestaan' },
    })
  }

  // Het MCP-eindpunt. Staatloos: elk verzoek krijgt een eigen server en
  // transport. Dat past bij een gratis host die processen mag herstarten, en
  // bij een dienst zonder gebruikerssessies.
  app.post('/mcp', controleerOrigin, async (req, res) => {
    const server = maakMcpServer()
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    })

    res.on('close', () => {
      transport.close().catch(() => {})
      server.close().catch(() => {})
    })

    try {
      await server.connect(transport)
      await transport.handleRequest(req, res, req.body)
    } catch (err) {
      console.error('MCP-fout:', err)
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Interne fout' },
        })
      }
    }
  })

  // De huidige transportversie kent geen GET-stroom en geen sessies meer, dus
  // die methoden zijn hier niet toegestaan.
  const nietToegestaan = (req, res) =>
    res.status(405).set('Allow', 'POST').json({
      jsonrpc: '2.0',
      error: { code: -32601, message: 'Alleen POST op /mcp' },
    })
  app.get('/mcp', nietToegestaan)
  app.delete('/mcp', nietToegestaan)

  // Domeinverificatie voor het OpenAI Plugin Submission Portal.
  //
  // Het portaal haalt dit adres op en verwacht exact de token als platte tekst,
  // verder niets. Geen JSON, geen lijst, geen tweede token.
  //
  // De token staat bewust niet in de code. Hij komt uit het portaal, kan per
  // inzending verschillen en hoort bij de dienst, niet bij de broncode. Zet hem
  // als OPENAI_APPS_CHALLENGE_TOKEN in de omgeving van de Render-service.
  // Is hij niet gezet, dan geeft dit adres 503 in plaats van een verzonnen
  // waarde, zodat de verificatie nooit op een verkeerd antwoord kan slagen.
  app.get('/.well-known/openai-apps-challenge', (req, res) => {
    const token = (process.env.OPENAI_APPS_CHALLENGE_TOKEN || '').trim()
    if (!token) {
      return res
        .status(503)
        .type('text/plain')
        .send('OPENAI_APPS_CHALLENGE_TOKEN is niet gezet op deze dienst')
    }
    res.type('text/plain').send(token)
  })

  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: NAAM,
      version: VERSIE,
      tools: TOOLS.map((t) => t.name),
      articles: alleArtikelen().length,
      timestamp: new Date().toISOString(),
    })
  })

  // Iemand die het adres in een browser plakt, hoort te lezen wat dit is.
  app.get('/', (req, res) => {
    res.type('text/plain').send(
      [
        'Ovari MCP-server',
        '',
        'Een read-only MCP-server over de openbare Ovari-kennisbank.',
        'Alleen voorlichting over de cyclus, de perimenopauze en de overgang.',
        'Geen persoonsgegevens, geen inlog, geen gezondheidsdata van gebruikers.',
        '',
        `MCP-eindpunt: POST /mcp`,
        `Tools: ${TOOLS.map((t) => t.name).join(', ')}`,
        `Artikelen: ${alleArtikelen().length}`,
        '',
        'Lees de artikelen zelf op https://ovari.youcaps.app/kennis',
      ].join('\n')
    )
  })

  return app
}

// Alleen luisteren als dit bestand direct wordt gestart, zodat de rooktest de
// app in hetzelfde proces kan opstarten zonder een vaste poort te bezetten.
const ditBestandIsGestart =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

if (ditBestandIsGestart) {
  const poort = process.env.PORT || 5100
  maakApp().listen(poort, () => {
    console.log(`Ovari MCP-server luistert op poort ${poort}`)
    console.log(`MCP-eindpunt: http://localhost:${poort}/mcp`)
    console.log(`Tools: ${TOOLS.map((t) => t.name).join(', ')}`)
  })
}
