// Endpoints van de authorization server en van de persoonlijke MCP-laag.
//
// STANDAARD UIT. Zonder AGENT_OAUTH_ENABLED=true wordt deze router nergens
// gemonteerd, en zonder sleutelpaar weigert hij zichzelf te bouwen. Dat is
// expres: een half geconfigureerde OAuth-server is gevaarlijker dan geen.
//
// De browserkant van /authorize (inloggen en akkoord geven) is bewust GEEN
// server-gerenderde pagina. De gebruiker logt in de app in, de app toont het
// toestemmingsscherm en roept daarna /authorize/decision aan met haar
// gewone app-JWT. Dat app-JWT blijft binnen de app: het gaat nooit naar de
// client en wordt nooit als MCP-token gebruikt.

import express from 'express'

import { maakToken, jwks } from './jwt.js'
import { authorizationServerMetadata, protectedResourceMetadata, wwwAuthenticate, SCOPES, SCOPE_PER_TOOL } from './metadata.js'
import { valideerAutorisatieVerzoek, geefCodeUit, wisselCodeIn, ververs, trekIn, FOUT } from './flow.js'
import { maakHulpbronWacht } from './hulpbron.js'
import { vindTool } from '../tools.js'
import { heeftToestemming, leesToestemming, TOESTEMMING_VERSIE } from '../toestemming.js'
import { RESULTAAT } from '../audit.js'

export function oauthIngeschakeld(env = process.env) {
  return String(env.AGENT_OAUTH_ENABLED ?? '').trim().toLowerCase() === 'true'
}

/**
 * @param {{
 *   pool: object, authenticateToken: Function, clients: object, opslag: object,
 *   sleutels: {prive: string, publiek: string}, issuer: string, resource: string,
 *   audit?: object, nu?: () => number,
 * }} opties
 */
export function maakOauthRouter({
  pool, authenticateToken, clients, opslag, sleutels, issuer, resource, audit, nu = () => Date.now(),
}) {
  if (!sleutels?.prive || !sleutels?.publiek) throw new TypeError('maakOauthRouter vereist een sleutelpaar')
  if (!issuer || !resource) throw new TypeError('maakOauthRouter vereist issuer en resource')

  const router = express.Router()
  const tekenToken = (payload) => maakToken(payload, sleutels.prive)
  const wacht = maakHulpbronWacht({ pool, publiekeSleutel: sleutels.publiek, issuer, resource, audit, nu })
  const metadataUrl = `${issuer}/api/v1/agent/oauth/protected-resource`

  // ---- Ontdekking -------------------------------------------------------
  router.get('/jwks.json', (req, res) => res.json(jwks(sleutels.publiek)))
  router.get('/metadata', (req, res) => res.json(authorizationServerMetadata({ issuer })))
  router.get('/protected-resource', (req, res) => res.json(protectedResourceMetadata({ resource, issuer })))

  // ---- Autorisatie ------------------------------------------------------
  // Keurt het verzoek en vertelt de app wat zij aan de gebruiker moet tonen.
  // Geeft zelf nooit een code: daar is een ingelogde gebruiker voor nodig.
  router.get('/authorize', (req, res) => {
    const uitslag = valideerAutorisatieVerzoek({ query: req.query, clients, scopes: SCOPES })
    if (!uitslag.ok && !uitslag.naarClient) {
      return res.status(400).json({ error: uitslag.fout, error_description: uitslag.beschrijving })
    }
    if (!uitslag.ok) {
      const terug = new URL(uitslag.redirectUri)
      terug.searchParams.set('error', uitslag.fout)
      terug.searchParams.set('error_description', uitslag.beschrijving)
      if (uitslag.state) terug.searchParams.set('state', uitslag.state)
      return res.redirect(302, terug.toString())
    }
    res.json({
      ok: true,
      client: { id: uitslag.client.id, naam: uitslag.client.naam },
      scopes: uitslag.scope.split(' '),
      // De app toont hiermee het toestemmingsscherm en stuurt alles terug.
      beslis_endpoint: `${issuer}/api/v1/agent/oauth/authorize/decision`,
    })
  })

  // De gebruiker beslist, ingelogd in de app, met haar eigen app-JWT.
  router.post('/authorize/decision', authenticateToken, async (req, res) => {
    const uitslag = valideerAutorisatieVerzoek({ query: req.body || {}, clients, scopes: SCOPES })
    if (!uitslag.ok) {
      return res.status(400).json({ error: uitslag.fout, error_description: uitslag.beschrijving })
    }
    if (req.body?.akkoord !== true) {
      const terug = new URL(uitslag.redirectUri)
      terug.searchParams.set('error', FOUT.ACCESS_DENIED)
      terug.searchParams.set('state', uitslag.state)
      return res.json({ redirect: terug.toString() })
    }

    // Koppelen mag alleen als de agent-toestemming in de app aan staat.
    const oordeel = heeftToestemming(await leesToestemming(pool, req.userId))
    if (!oordeel.ok) {
      await audit?.schrijfRegel({ userId: req.userId, tool: null, toestemming: false, resultaat: RESULTAAT.GEWEIGERD_GEEN_TOESTEMMING })
      return res.status(403).json({ error: FOUT.ACCESS_DENIED, error_description: oordeel.reden })
    }

    const code = await geefCodeUit({
      opslag,
      verzoek: uitslag,
      userId: req.userId,
      consentVersie: TOESTEMMING_VERSIE,
      nu,
    })
    const terug = new URL(uitslag.redirectUri)
    terug.searchParams.set('code', code)
    terug.searchParams.set('state', uitslag.state)
    res.json({ redirect: terug.toString() })
  })

  // ---- Tokens -----------------------------------------------------------
  router.post('/token', async (req, res) => {
    const body = req.body || {}
    let uitslag
    if (body.grant_type === 'authorization_code') {
      uitslag = await wisselCodeIn({ opslag, clients, body, issuer, resource, tekenToken, nu })
    } else if (body.grant_type === 'refresh_token') {
      uitslag = await ververs({ opslag, clients, body, issuer, resource, tekenToken, nu })
    } else {
      return res.status(400).json({ error: FOUT.UNSUPPORTED_GRANT })
    }

    if (!uitslag.ok) {
      return res.status(400).json({ error: uitslag.fout })
    }
    // Tokens horen niet in een cache, ook niet in die van een proxy.
    res.set('Cache-Control', 'no-store')
    res.json(uitslag.antwoord)
  })

  router.post('/revoke', async (req, res) => {
    await trekIn({ opslag, body: req.body || {} })
    res.status(200).json({ ok: true })
  })

  // ---- De persoonlijke MCP-laag ----------------------------------------
  // Zelfde drie tools als in de app, maar achter een OAuth-token in plaats van
  // het app-JWT. Alleen lezen, geen gebruikersparameter, scope per tool.
  router.get('/mcp/tools', (req, res) => {
    res.json({
      tools: Object.entries(SCOPE_PER_TOOL).map(([naam, scope]) => ({ naam, scope })),
    })
  })

  router.post('/mcp/tools/:naam', async (req, res) => {
    const uitslag = await wacht.controleer({ headers: req.headers, tool: req.params.naam })
    if (!uitslag.ok) {
      if (uitslag.status === 401) {
        res.set('WWW-Authenticate', wwwAuthenticate({
          metadataUrl,
          scope: SCOPE_PER_TOOL[req.params.naam],
          fout: 'invalid_token',
          beschrijving: uitslag.reden,
        }))
      }
      return res.status(uitslag.status).json({ ok: false, reden: uitslag.reden })
    }

    const tool = vindTool(req.params.naam)
    try {
      const resultaat = await tool.handler({ pool, userId: uitslag.userId, nu: new Date(nu()) })
      await wacht.logGelukt(uitslag.userId, tool.naam)
      res.json({ ok: true, naam: tool.naam, resultaat })
    } catch (err) {
      console.error(`MCP-tool ${tool.naam} error:`, err)
      await audit?.schrijfRegel({ userId: uitslag.userId, tool: tool.naam, toestemming: true, resultaat: RESULTAAT.SERVERFOUT })
      res.status(500).json({ ok: false, reden: 'serverfout' })
    }
  })

  return router
}
