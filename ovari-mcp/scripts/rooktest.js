// Rooktest: start de server op een vrije poort, maakt met de officiele
// MCP-client verbinding en roept beide tools aan. Dit is de test die zegt of
// een echte client, zoals ChatGPT, hiermee overweg kan.
//
// Draaien: npm run rook
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { maakApp } from '../server.js'

const regels = []
let fouten = 0

function meld(label, gelukt, detail = '') {
  regels.push(`${gelukt ? 'OK  ' : 'FOUT'} ${label}${detail ? ` | ${detail}` : ''}`)
  if (!gelukt) fouten++
}

const httpServer = maakApp().listen(0)
await new Promise((klaar) => httpServer.once('listening', klaar))
const poort = httpServer.address().port
const basis = `http://127.0.0.1:${poort}`

try {
  // 1. Gezondheidscheck
  const gezond = await (await fetch(`${basis}/health`)).json()
  meld('health', gezond.status === 'healthy', `${gezond.articles} artikelen`)

  // 2. GET op /mcp hoort geweigerd te worden
  const getMcp = await fetch(`${basis}/mcp`)
  meld('GET /mcp geeft 405', getMcp.status === 405, `status ${getMcp.status}`)

  // 3. Een vreemde Origin hoort 403 te krijgen
  const vreemd = await fetch(`${basis}/mcp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://kwaadaardig.example' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
  })
  meld('vreemde Origin geeft 403', vreemd.status === 403, `status ${vreemd.status}`)

  // 4. Domeinverificatie voor OpenAI: exact de token, als platte tekst
  process.env.OPENAI_APPS_CHALLENGE_TOKEN = 'rooktest-token-abc123'
  const uitdaging = await fetch(`${basis}/.well-known/openai-apps-challenge`)
  const uitdagingTekst = await uitdaging.text()
  meld(
    'challenge geeft exact de token terug',
    uitdaging.status === 200 && uitdagingTekst === 'rooktest-token-abc123',
    `status ${uitdaging.status}, body ${JSON.stringify(uitdagingTekst)}`
  )
  meld(
    'challenge is platte tekst',
    (uitdaging.headers.get('content-type') || '').startsWith('text/plain'),
    uitdaging.headers.get('content-type')
  )
  delete process.env.OPENAI_APPS_CHALLENGE_TOKEN
  const zonderToken = await fetch(`${basis}/.well-known/openai-apps-challenge`)
  meld('zonder token geen verzonnen antwoord maar 503', zonderToken.status === 503)

  // 5. Verbinden met de echte client
  const client = new Client({ name: 'ovari-rooktest', version: '0.1.0' })
  const transport = new StreamableHTTPClientTransport(new URL(`${basis}/mcp`))
  await client.connect(transport)
  meld('verbinding en handshake', true)

  // 5. Tools opvragen
  const { tools } = await client.listTools()
  const namen = tools.map((t) => t.name).sort()
  meld('tools/list', namen.join(',') === 'fetch_article,search_knowledge', namen.join(', '))

  const alleenLezen = tools.every(
    (t) => t.annotations?.readOnlyHint === true && t.annotations?.destructiveHint === false
  )
  meld('alle tools zijn alleen lezen', alleenLezen)

  const schemas = tools.every((t) => t.inputSchema && t.outputSchema)
  meld('elke tool heeft een invoer- en uitvoerschema', schemas)

  // 6. Zoeken
  const zoekResultaat = await client.callTool({
    name: 'search_knowledge',
    arguments: { query: 'waarom slaap ik slechter voor mijn menstruatie', limit: 3 },
  })
  const zoekData = zoekResultaat.structuredContent
  meld(
    'search_knowledge',
    zoekData?.results?.[0]?.id === 'slaap-en-cyclus',
    `${zoekData?.total_matches} treffers, bovenaan: ${zoekData?.results?.[0]?.id}`
  )
  meld(
    'zoekresultaat bevat geen persoonsgegevens',
    !JSON.stringify(zoekData).match(/email|user_id|token|birth_date/i)
  )

  // 7. Artikel ophalen
  const artikel = await client.callTool({
    name: 'fetch_article',
    arguments: { id: 'slaap-en-cyclus' },
  })
  const artikelData = artikel.structuredContent
  meld(
    'fetch_article',
    artikelData?.sections?.length > 0,
    `${artikelData?.sections?.length} secties, ${artikelData?.text?.length} tekens`
  )

  // 8. Onbekend artikel hoort netjes te falen
  const onbekend = await client.callTool({
    name: 'fetch_article',
    arguments: { id: 'bestaat-echt-niet' },
  })
  meld('onbekend id geeft een nette fout', onbekend.isError === true)

  // 9. Ongeldige invoer hoort geweigerd te worden. De SDK controleert dat
  // tegen het invoerschema en geeft een foutresultaat terug, geen uitzondering.
  const ongeldig = [
    { label: 'te korte zoekvraag', args: { query: 'x' } },
    { label: 'limiet buiten bereik', args: { query: 'slaap', limit: 99 } },
    { label: 'zoekvraag ontbreekt', args: {} },
    { label: 'onbekende categorie', args: { query: 'slaap', category: 'onzin' } },
  ]
  for (const geval of ongeldig) {
    const uitkomst = await client.callTool({ name: 'search_knowledge', arguments: geval.args })
    const tekst = String(uitkomst.content?.[0]?.text || '')
    meld(`${geval.label} wordt geweigerd`, uitkomst.isError === true && tekst.includes('-32602'))
  }

  await client.close()
} catch (err) {
  meld('onverwachte fout', false, err?.message || String(err))
} finally {
  httpServer.close()
}

console.log(regels.join('\n'))
console.log(fouten === 0 ? '\nAlles goed.' : `\n${fouten} controle(s) mislukt.`)
process.exit(fouten === 0 ? 0 : 1)
