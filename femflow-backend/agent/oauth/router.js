// Endpoints van de authorization server en van de persoonlijke MCP-laag.
//
// STANDAARD UIT. Zonder AGENT_OAUTH_ENABLED=true wordt deze router nergens
// gemonteerd, en zonder sleutelpaar of zonder client weigert server.js hem te
// bouwen. Een half geconfigureerde OAuth-server is gevaarlijker dan geen.
//
// De browserkant van /authorize is het toestemmingsscherm IN de app. Deze
// router keurt het verzoek, ondertekent het (verzoek.js) en stuurt de browser
// naar dat scherm. De gebruiker beslist daar, ingelogd met haar gewone
// app-JWT, dat de app nooit verlaat en nooit als MCP-token dient.

import express from 'express'
import rateLimit from 'express-rate-limit'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'

import { maakToken, jwks } from './jwt.js'
import {
  authorizationServerMetadata, protectedResourceMetadata, wwwAuthenticate, SCOPES, SCOPE_PER_TOOL,
} from './metadata.js'
import { valideerAutorisatieVerzoek, geefCodeUit, wisselCodeIn, ververs, trekIn, trekGebruikerIn, FOUT } from './flow.js'
import { maakHulpbronWacht } from './hulpbron.js'
import { maakVerzoekToken, leesVerzoekToken, afgeleidGeheim } from './verzoek.js'
import { redirectPast } from './redirect.js'
import { TOOLS, vindTool } from '../tools.js'
import { heeftToestemming, leesToestemming, TOESTEMMING_VERSIE } from '../toestemming.js'
import { RESULTAAT } from '../audit.js'

export const MCP_NAAM = 'ovari-persoonlijk'
export const MCP_VERSIE = '0.3.0'

/** Wat er per scope gedeeld wordt, in gewone taal, voor het toestemmingsscherm. */
export const SCOPE_UITLEG = {
  'ovari:cycle': {
    titel: 'Je cyclus',
    deelt: 'De datum van je laatste menstruatie, de cycluslengte die je zelf hebt ingevuld, welke cyclusdag het vandaag is en de verwachte volgende start.',
  },
  'ovari:recovery': {
    titel: 'Je herstel',
    deelt: 'Gemiddelden van je gekoppelde wearable over de laatste vier weken: slaapduur, diepe slaap, HRV, rusthartslag en herstelscore.',
  },
  'ovari:profile': {
    titel: 'Je profiel',
    deelt: 'Je leeftijd, hoe lang je Ovari gebruikt, de uitkomst van de overgangsquiz en welke wearable gekoppeld is. Nooit je naam of e-mailadres.',
  },
}

export function oauthIngeschakeld(env = process.env) {
  return String(env.AGENT_OAUTH_ENABLED ?? '').trim().toLowerCase() === 'true'
}

export function maakOauthRouter({
  pool, authenticateToken, clients, opslag, sleutels, issuer, resource, audit,
  frontendUrl = process.env.FRONTEND_URL || '', nu = () => Date.now(), limieten = {},
}) {
  if (!sleutels?.prive || !sleutels?.publiek) throw new TypeError('maakOauthRouter vereist een sleutelpaar')
  if (!issuer || !resource) throw new TypeError('maakOauthRouter vereist issuer en resource')

  const router = express.Router()
  const tekenToken = (payload) => maakToken(payload, sleutels.prive, { typ: 'at+jwt' })
  // Tijdens een rotatie zijn er twee geldige publieke sleutels; ondertekenen
  // gebeurt altijd met de huidige prive-sleutel. Zie SLEUTELROTATIE.md.
  const publiekeSleutels = [sleutels.publiek, ...(sleutels.oudPubliek || [])].filter(Boolean)
  const wacht = maakHulpbronWacht({ pool, publiekeSleutels, issuer, resource, audit, nu })
  const verzoekGeheim = afgeleidGeheim(sleutels.prive)
  const metadataUrl = `${issuer}/.well-known/oauth-protected-resource`

  // ---- Snelheidslimieten -------------------------------------------------
  // Per IP, want een client heeft hier nog geen identiteit. Tokens en codes
  // raden moet duur zijn; de MCP-laag krijgt een ruimere limiet omdat een
  // gesprek meerdere aanroepen doet.
  const limiet = (max, windowMs = 60_000) =>
    rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, message: { error: 'slow_down' } })
  const autorisatieLimiet = limieten.autorisatie || limiet(20)
  const tokenLimiet = limieten.token || limiet(30)
  const mcpLimiet = limieten.mcp || limiet(120)

  // Express 4 vangt een afgewezen promise in een handler NIET op: die wordt
  // een unhandled rejection en neemt in Node het hele proces mee. Dat is
  // precies wat er gebeurde toen de database even weg was tijdens /token:
  // niet alleen de agent lag eruit, de hele API lag eruit. Elke async
  // handler gaat daarom door deze wikkel.
  const vang = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error(`Agent-OAuth fout op ${req.method} ${req.path}:`, err.message)
      if (!res.headersSent) res.status(503).json({ error: 'server_error' })
    })

  // ---- Ontdekking --------------------------------------------------------
  router.get('/jwks.json', (req, res) => res.json(jwks(publiekeSleutels)))
  router.get('/metadata', (req, res) => res.json(authorizationServerMetadata({ issuer })))
  router.get('/protected-resource', (req, res) => res.json(protectedResourceMetadata({ resource, issuer })))

  // ---- Autorisatie -------------------------------------------------------
  router.get('/authorize', autorisatieLimiet, vang(async (req, res) => {
    const uitslag = await valideerAutorisatieVerzoek({ query: req.query, clients, scopes: SCOPES, resource })
    if (!uitslag.ok && !uitslag.naarClient) {
      // Onbekende client of niet-geregistreerde redirect_uri: de fout blijft
      // hier. Doorsturen naar een niet-gekeurde URI is een open redirect.
      // res.locals is alleen voor de tijdelijke diagnostiek; het antwoord
      // hieronder is onveranderd.
      res.locals.diagnoseReden = uitslag.fout
      return res.status(400).json({ error: uitslag.fout, error_description: uitslag.beschrijving })
    }
    if (!uitslag.ok) {
      res.locals.diagnoseReden = uitslag.fout
      const terug = new URL(uitslag.redirectUri)
      terug.searchParams.set('error', uitslag.fout)
      terug.searchParams.set('error_description', uitslag.beschrijving)
      terug.searchParams.set('iss', issuer)
      if (uitslag.state) terug.searchParams.set('state', uitslag.state)
      return res.redirect(302, terug.toString())
    }

    const verzoek = maakVerzoekToken(uitslag, verzoekGeheim, nu)
    const scopes = uitslag.scope.split(' ').map((s) => ({ scope: s, ...SCOPE_UITLEG[s] }))

    // Een browser hoort het toestemmingsscherm in de app te zien; een client
    // die het programmatisch opvraagt krijgt dezelfde gegevens als JSON.
    if (frontendUrl && String(req.headers.accept || '').includes('text/html')) {
      const scherm = new URL('/agent/toestemming', frontendUrl)
      scherm.searchParams.set('verzoek', verzoek)
      return res.redirect(302, scherm.toString())
    }
    res.json({
      ok: true,
      client: { id: uitslag.client.id, naam: uitslag.client.naam },
      scopes,
      verzoek,
      beslis_endpoint: `${issuer}/api/v1/agent/oauth/authorize/decision`,
    })
  }))

  // Het scherm leest hiermee uit wat het moet tonen, zonder opnieuw de
  // oorspronkelijke parameters te hoeven vertrouwen.
  router.get('/verzoek', autorisatieLimiet, (req, res) => {
    const gelezen = leesVerzoekToken(req.query.verzoek, verzoekGeheim, nu)
    if (!gelezen.ok) return res.status(400).json({ error: FOUT.INVALID_REQUEST, reden: gelezen.reden })
    const v = gelezen.verzoek
    res.json({
      client: { id: v.client_id, naam: v.client_naam },
      scopes: v.scope.split(' ').map((s) => ({ scope: s, ...SCOPE_UITLEG[s] })),
      toestemming_versie: TOESTEMMING_VERSIE,
    })
  })

  // De beslissing. Alles wat ertoe doet komt uit het ondertekende verzoek,
  // niets uit losse velden in de body.
  router.post('/authorize/decision', autorisatieLimiet, authenticateToken, vang(async (req, res) => {
    const gelezen = leesVerzoekToken(req.body?.verzoek, verzoekGeheim, nu)
    if (!gelezen.ok) return res.status(400).json({ error: FOUT.INVALID_REQUEST, reden: gelezen.reden })
    const v = gelezen.verzoek

    // Nogmaals keuren tegen het register: een client kan ingetrokken zijn
    // tussen het tonen van het scherm en de klik.
    const client = await clients.vind(v.client_id)
    // Opnieuw tegen de registratie houden: tussen tonen en klikken kan een
    // client ingetrokken zijn of zijn redirects hebben gewijzigd.
    if (!client || !redirectPast(client.redirectUris, v.redirect_uri)) {
      return res.status(400).json({ error: FOUT.INVALID_CLIENT })
    }

    const terug = new URL(v.redirect_uri)
    terug.searchParams.set('state', v.state)
    terug.searchParams.set('iss', issuer)

    if (req.body?.akkoord !== true) {
      terug.searchParams.set('error', FOUT.ACCESS_DENIED)
      return res.json({ redirect: terug.toString() })
    }

    const oordeel = heeftToestemming(await leesToestemming(pool, req.userId))
    if (!oordeel.ok) {
      await audit?.schrijfRegel({ userId: req.userId, tool: null, toestemming: false, resultaat: RESULTAAT.GEWEIGERD_GEEN_TOESTEMMING })
      return res.status(403).json({ error: FOUT.ACCESS_DENIED, error_description: oordeel.reden })
    }

    const code = await geefCodeUit({
      opslag,
      verzoek: { client, redirectUri: v.redirect_uri, scope: v.scope, codeChallenge: v.code_challenge },
      userId: req.userId,
      consentVersie: TOESTEMMING_VERSIE,
      nu,
    })
    terug.searchParams.set('code', code)
    res.json({ redirect: terug.toString() })
  }))

  // ---- Tokens ------------------------------------------------------------
  router.post('/token', tokenLimiet, vang(async (req, res) => {
    const body = req.body || {}
    let uitslag
    if (body.grant_type === 'authorization_code') {
      uitslag = await wisselCodeIn({ opslag, clients, body, issuer, resource, tekenToken, nu })
    } else if (body.grant_type === 'refresh_token') {
      uitslag = await ververs({ opslag, clients, body, issuer, resource, tekenToken, nu })
    } else {
      return res.status(400).json({ error: FOUT.UNSUPPORTED_GRANT })
    }
    if (!uitslag.ok) return res.status(400).json({ error: uitslag.fout })
    res.set('Cache-Control', 'no-store')
    res.json(uitslag.antwoord)
  }))

  router.post('/revoke', tokenLimiet, vang(async (req, res) => {
    await trekIn({ opslag, body: req.body || {} })
    res.status(200).json({ ok: true })
  }))

  // ---- Koppelingen beheren (in de app) -----------------------------------
  router.get('/koppelingen', authenticateToken, vang(async (req, res) => {
    const lijst = await opslag.lijstKoppelingen(req.userId)
    res.json({
      koppelingen: await Promise.all(
        lijst.map(async (k) => ({
          client_id: k.clientId,
          naam: (await clients.vind(k.clientId))?.naam || k.clientId,
          scopes: k.scope.split(' '),
          vervalt_op: new Date(k.vervaltOp).toISOString(),
        }))
      ),
    })
  }))

  router.post('/koppelingen/intrekken', authenticateToken, vang(async (req, res) => {
    const clientId = req.body?.client_id
    const aantal = clientId
      ? await opslag.trekKoppelingIn(req.userId, clientId)
      : await trekGebruikerIn({ opslag, userId: req.userId })
    await audit?.schrijfRegel({ userId: req.userId, tool: null, toestemming: false, resultaat: RESULTAAT.TOESTEMMING_INGETROKKEN })
    res.json({ ok: true, ingetrokken: aantal })
  }))

  // ---- De persoonlijke MCP-laag ------------------------------------------
  // Dezelfde drie read-only tools als in de app, achter een OAuth-token.
  router.get('/mcp/tools', (req, res) => {
    res.json({ tools: Object.entries(SCOPE_PER_TOOL).map(([naam, scope]) => ({ naam, scope })) })
  })

  // REST-variant, handig om los te testen.
  router.post('/mcp/tools/:naam', mcpLimiet, vang(async (req, res) => {
    const uitslag = await wacht.controleer({ headers: req.headers, tool: req.params.naam })
    if (!uitslag.ok) {
      if (uitslag.status === 401) {
        res.set('WWW-Authenticate', wwwAuthenticate({
          metadataUrl, scope: SCOPE_PER_TOOL[req.params.naam], fout: 'invalid_token', beschrijving: uitslag.reden,
        }))
      }
      return res.status(uitslag.status).json({ ok: false, reden: uitslag.reden })
    }
    const tool = vindTool(req.params.naam)
    try {
      const resultaat = await tool.handler({ pool, userId: uitslag.userId, nu: new Date(nu()) })
      // FAIL-CLOSED: geen opgeslagen auditregel, geen gegevens.
      const geschreven = await wacht.logGelukt(uitslag.userId, tool.naam)
      if (!geschreven.ok) return res.status(503).json({ ok: false, reden: 'audit_niet_beschikbaar' })
      res.json({ ok: true, naam: tool.naam, resultaat })
    } catch (err) {
      console.error(`MCP-tool ${tool.naam} error:`, err)
      await audit?.schrijfRegel({ userId: uitslag.userId, tool: tool.naam, toestemming: true, resultaat: RESULTAAT.SERVERFOUT })
      res.status(500).json({ ok: false, reden: 'serverfout' })
    }
  }))

  // Echte MCP: JSON-RPC over HTTP, staatloos, zelfde transport als de
  // publieke kennisbank-MCP gebruikt.
  router.post('/mcp', mcpLimiet, vang(async (req, res) => {
    const poort = await wacht.controleerToken({ headers: req.headers })
    if (!poort.ok) {
      if (poort.status === 401) {
        res.set('WWW-Authenticate', wwwAuthenticate({
          metadataUrl, scope: SCOPES.join(' '), fout: 'invalid_token', beschrijving: poort.reden,
        }))
      }
      await wacht.logWeigering(null, null, poort.reden)
      return res.status(poort.status).json({
        jsonrpc: '2.0',
        error: { code: poort.status === 401 ? -32001 : -32003, message: poort.reden },
        id: req.body?.id ?? null,
      })
    }

    const server = new McpServer({ name: MCP_NAAM, version: MCP_VERSIE })
    // Alleen de tools waar dit token scope voor heeft komen in de lijst. Wat
    // je niet mag, bestaat voor deze sessie niet.
    for (const tool of TOOLS) {
      if (!poort.scopes.includes(SCOPE_PER_TOOL[tool.naam])) continue
      server.registerTool(
        tool.naam,
        { title: tool.titel, description: tool.beschrijving, inputSchema: {}, annotations: tool.annotaties },
        async () => {
          // Opnieuw keuren bij elke aanroep: zo werkt intrekken onmiddellijk,
          // ook midden in een gesprek.
          const nu2 = await wacht.controleer({ headers: req.headers, tool: tool.naam })
          if (!nu2.ok) {
            return {
              isError: true,
              content: [{ type: 'text', text: `Access refused: ${nu2.reden}. Do not guess any values.` }],
              structuredContent: { ok: false, reden: nu2.reden },
            }
          }
          const resultaat = await tool.handler({ pool, userId: nu2.userId, nu: new Date(nu()) })
          // FAIL-CLOSED, ook in een gesprek: lukt de auditregel niet, dan komt
          // er geen inhoud terug maar een fout die het model niet kan invullen.
          const geschreven = await wacht.logGelukt(nu2.userId, tool.naam)
          if (!geschreven.ok) {
            return {
              isError: true,
              content: [{ type: 'text', text: 'Ovari cannot serve this right now because the required audit record could not be stored. Do not guess any values; tell the user to try again later.' }],
              structuredContent: { ok: false, reden: 'audit_niet_beschikbaar' },
            }
          }
          return {
            content: [{ type: 'text', text: JSON.stringify(resultaat) }],
            structuredContent: resultaat,
          }
        }
      )
    }

    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
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
        res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Interne fout' }, id: null })
      }
    }
  }))

  const alleenPost = (req, res) =>
    res.status(405).set('Allow', 'POST').json({ jsonrpc: '2.0', error: { code: -32601, message: 'Alleen POST op /mcp' }, id: null })
  router.get('/mcp', alleenPost)
  router.delete('/mcp', alleenPost)

  return router
}

/**
 * De well-known-adressen horen op de root van het domein, niet onder een
 * API-pad. Deze router wordt in server.js op '/' gemonteerd.
 */
export function maakWellKnownRouter({ issuer, resource }) {
  const router = express.Router()
  const as = () => authorizationServerMetadata({ issuer })
  const pr = () => protectedResourceMetadata({ resource, issuer })

  router.get('/.well-known/oauth-authorization-server', (req, res) => res.json(as()))
  // Een client probeert eerst de padvariant en daarna de root (RFC 9728).
  router.get('/.well-known/oauth-protected-resource', (req, res) => res.json(pr()))
  router.get('/.well-known/oauth-protected-resource/*', (req, res) => res.json(pr()))
  return router
}
