import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import express from 'express'
import { generateKeyPairSync } from 'crypto'

import { maakOauthRouter } from './router.js'
import { maakAgentRouter } from '../index.js'
import { maakClientRegister } from './clients.js'
import { geheugenOpslag, hashGeheim } from './opslag.js'
import { challengeVoor } from './pkce.js'
import { maakToken, jwks, sleutelId } from './jwt.js'
import { ruimOp, startOpruimen } from './opruimen.js'
import { maakAuditLogger } from '../audit.js'

const IK = '11111111-1111-4111-8111-111111111111'
const CLIENT = 'chatgpt-test'
const REDIRECT = 'https://chat.example.com/connector/callback'
const ISSUER = 'https://femflow-api.test'
const RESOURCE = 'https://femflow-api.test/api/v1/agent/oauth/mcp'
const START = Date.parse('2026-10-19T09:00:00.000Z')

const paar = () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  return { prive: privateKey.export({ type: 'pkcs8', format: 'pem' }), publiek: publicKey.export({ type: 'spki', format: 'pem' }) }
}
const HUIDIG = paar()
const OUD = paar()

const verifier = 'a'.repeat(43)
const challenge = challengeVoor(verifier)

let server, basis, klok, opslag, auditRegels, toestemmingRijen, auditStuk

function maakNepPool() {
  return {
    async query(sql, params = []) {
      if (sql.includes('femflow_agent_audit')) {
        if (auditStuk) { const e = new Error('relation does not exist'); e.code = '42P01'; throw e }
        return { rows: [] }
      }
      if (sql.includes('FROM femflow_agent_consent')) {
        return { rows: toestemmingRijen.has(params[0]) ? [toestemmingRijen.get(params[0])] : [] }
      }
      if (sql.includes('FROM femflow_menstruation_data')) {
        return { rows: [{ start_date: '2026-10-05', cycle_length: 28, bleeding_days: 5, updated_at: '2026-10-05' }] }
      }
      if (sql.includes('FROM femflow_wearable_connections')) return { rows: [] }
      if (sql.includes('FROM femflow_biometric_readings')) return { rows: [] }
      if (sql.includes('FROM femflow_users')) return { rows: [{ birth_date: '1979-06-01', created_at: '2026-04-01' }] }
      if (sql.includes('FROM femflow_quiz_results')) return { rows: [] }
      throw new Error('onverwachte query: ' + sql)
    },
  }
}

function query(extra = {}) {
  return {
    client_id: CLIENT, redirect_uri: REDIRECT, response_type: 'code', state: 'staat-van-de-client-123',
    code_challenge: challenge, code_challenge_method: 'S256', scope: 'ovari:cycle ovari:recovery ovari:profile',
    resource: RESOURCE, ...extra,
  }
}

async function koppel(userId = IK) {
  const verzoek = (await (await fetch(basis + '/api/v1/agent/oauth/authorize?' + new URLSearchParams(query()))).json()).verzoek
  const beslissing = await fetch(basis + '/api/v1/agent/oauth/authorize/decision', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-test-user': userId },
    body: JSON.stringify({ verzoek, akkoord: true }),
  })
  const code = new URL((await beslissing.json()).redirect).searchParams.get('code')
  const r = await fetch(basis + '/api/v1/agent/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ grant_type: 'authorization_code', code, client_id: CLIENT, redirect_uri: REDIRECT, code_verifier: verifier }),
  })
  return r.json()
}

const restTool = (tool, token) =>
  fetch(`${basis}/api/v1/agent/oauth/mcp/tools/${tool}`, { method: 'POST', headers: { authorization: `Bearer ${token}` } })

async function mcp(method, params, token) {
  const r = await fetch(basis + '/api/v1/agent/oauth/mcp', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', authorization: `Bearer ${token}` },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const tekst = await r.text()
  try { return { status: r.status, body: JSON.parse(tekst) } } catch {
    const regel = tekst.split('\n').find((l) => l.startsWith('data: '))
    return { status: r.status, body: regel ? JSON.parse(regel.slice(6)) : null }
  }
}

beforeEach(async () => {
  klok = START
  opslag = geheugenOpslag()
  auditRegels = []
  auditStuk = false
  toestemmingRijen = new Map([[IK, { granted_at: '2026-10-19T08:00:00.000Z', revoked_at: null, versie: '1.0' }]])

  const pool = maakNepPool()
  const audit = maakAuditLogger({ pool, zout: 'test-zout', nu: () => new Date(klok), sink: (r) => auditRegels.push(r), waarschuw: () => {} })
  const authenticateToken = (req, res, next) => {
    const id = req.headers['x-test-user']
    if (!id) return res.status(401).json({ error: 'No token provided' })
    req.userId = id
    next()
  }

  const app = express()
  app.use(express.json())
  app.use('/api/v1/agent', maakAgentRouter({ pool, authenticateToken, nu: () => new Date(klok), audit }))
  app.use('/api/v1/agent/oauth', maakOauthRouter({
    pool, authenticateToken,
    clients: maakClientRegister([{ id: CLIENT, naam: 'ChatGPT (test)', redirectUris: [REDIRECT] }]),
    opslag,
    sleutels: { prive: HUIDIG.prive, publiek: HUIDIG.publiek, oudPubliek: [OUD.publiek] },
    issuer: ISSUER, resource: RESOURCE, audit, nu: () => klok,
  }))
  await new Promise((klaar) => { server = app.listen(0, klaar) })
  basis = `http://127.0.0.1:${server.address().port}`
})

afterEach(async () => {
  await new Promise((klaar) => server.close(klaar))
})

describe('fail-closed bij een mislukte auditregistratie', () => {
  it('geeft via de app geen gegevens terug als de auditregel niet opgeslagen kan worden', async () => {
    await fetch(basis + '/api/v1/agent/consent', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-user': IK }, body: '{}' })
    auditStuk = true

    const r = await fetch(basis + '/api/v1/agent/tools/get_my_cycle_overview', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user': IK },
      body: '{}',
    })
    expect(r.status).toBe(503)
    const body = await r.json()
    expect(body).toEqual({ ok: false, reden: 'audit_niet_beschikbaar' })
    expect(JSON.stringify(body)).not.toMatch(/cyclusdag|cycluslengte/)
  })

  it('geeft via de MCP-REST-route geen gegevens terug', async () => {
    const tokens = await koppel()
    auditStuk = true
    const r = await restTool('get_my_cycle_overview', tokens.access_token)
    expect(r.status).toBe(503)
    expect((await r.json()).reden).toBe('audit_niet_beschikbaar')
  })

  it('geeft via het MCP-protocol een fout zonder inhoud', async () => {
    const tokens = await koppel()
    auditStuk = true
    const { body } = await mcp('tools/call', { name: 'get_my_cycle_overview', arguments: {} }, tokens.access_token)
    expect(body.result.isError).toBe(true)
    expect(body.result.structuredContent).toEqual({ ok: false, reden: 'audit_niet_beschikbaar' })
    expect(JSON.stringify(body)).not.toMatch(/cyclusdag/)
  })

  it('serveert weer zodra het auditlog het weer doet', async () => {
    const tokens = await koppel()
    auditStuk = true
    expect((await restTool('get_my_cycle_overview', tokens.access_token)).status).toBe(503)
    auditStuk = false
    const r = await restTool('get_my_cycle_overview', tokens.access_token)
    expect(r.status).toBe(200)
    expect((await r.json()).resultaat.cyclusdag).toBe(15)
  })

  it('blijft weigeren als de auditregel van een WEIGERING niet geschreven kan worden', async () => {
    auditStuk = true
    const r = await restTool('get_my_cycle_overview', 'onzin-token')
    expect(r.status).toBe(401)
  })
})

describe('sleutelrotatie', () => {
  it('publiceert beide sleutels tijdens de rotatie', async () => {
    const body = await (await fetch(basis + '/api/v1/agent/oauth/jwks.json')).json()
    expect(body.keys).toHaveLength(2)
    expect(body.keys.map((k) => k.kid)).toEqual([sleutelId(HUIDIG.publiek), sleutelId(OUD.publiek)])
    expect(JSON.stringify(body)).not.toMatch(/"d"|PRIVATE/)
  })

  it('accepteert een token dat met de oude sleutel is ondertekend', async () => {
    const seconden = Math.floor(klok / 1000)
    const oudToken = maakToken(
      { iss: ISSUER, aud: RESOURCE, sub: IK, client_id: CLIENT, scope: 'ovari:cycle', iat: seconden, exp: seconden + 600, jti: 'oud', consent_version: '1.0' },
      OUD.prive,
      { typ: 'at+jwt' }
    )
    expect((await restTool('get_my_cycle_overview', oudToken)).status).toBe(200)
  })

  it('weigert een token van een sleutel die niet in de lijst staat', async () => {
    const vreemd = paar()
    const seconden = Math.floor(klok / 1000)
    const token = maakToken(
      { iss: ISSUER, aud: RESOURCE, sub: IK, client_id: CLIENT, scope: 'ovari:cycle', iat: seconden, exp: seconden + 600, jti: 'x', consent_version: '1.0' },
      vreemd.prive,
      { typ: 'at+jwt' }
    )
    expect((await restTool('get_my_cycle_overview', token)).status).toBe(401)
  })

  it('laat zich niet misleiden door een kid die naar een andere sleutel wijst', async () => {
    const vreemd = paar()
    const seconden = Math.floor(klok / 1000)
    const token = maakToken(
      { iss: ISSUER, aud: RESOURCE, sub: IK, client_id: CLIENT, scope: 'ovari:cycle', iat: seconden, exp: seconden + 600, jti: 'x', consent_version: '1.0' },
      vreemd.prive,
      { typ: 'at+jwt' }
    )
    const [h, p, s] = token.split('.')
    const header = JSON.parse(Buffer.from(h, 'base64url').toString())
    header.kid = sleutelId(HUIDIG.publiek) // doet alsof het onze sleutel is
    const vervalst = `${Buffer.from(JSON.stringify(header)).toString('base64url')}.${p}.${s}`
    expect((await restTool('get_my_cycle_overview', vervalst)).status).toBe(401)
  })

  it('weigert alg none', async () => {
    const payload = { iss: ISSUER, aud: RESOURCE, sub: IK, client_id: CLIENT, scope: 'ovari:cycle', iat: 1, exp: 9999999999, jti: 'x', consent_version: '1.0' }
    const token = [
      Buffer.from(JSON.stringify({ alg: 'none', typ: 'at+jwt' })).toString('base64url'),
      Buffer.from(JSON.stringify(payload)).toString('base64url'),
      '',
    ].join('.')
    expect((await restTool('get_my_cycle_overview', token)).status).toBe(401)
  })

  it('jwks werkt ook met een enkele sleutel', () => {
    expect(jwks(HUIDIG.publiek).keys).toHaveLength(1)
  })
})

describe('opruimen van codes en tokens', () => {
  it('verwijdert verlopen codes pas na een uur genade', async () => {
    await opslag.bewaarCode(hashGeheim('oud'), { userId: IK, clientId: CLIENT, redirectUri: REDIRECT, scope: 'ovari:cycle', codeChallenge: challenge, consentVersie: '1.0', vervaltOp: START - 2 * 60 * 60_000 })
    await opslag.bewaarCode(hashGeheim('net-verlopen'), { userId: IK, clientId: CLIENT, redirectUri: REDIRECT, scope: 'ovari:cycle', codeChallenge: challenge, consentVersie: '1.0', vervaltOp: START - 60_000 })

    const uitslag = await ruimOp({ opslag, nu: () => START })
    expect(uitslag.codes).toBe(1)
    expect(await opslag.leesCode(hashGeheim('oud'))).toBeNull()
    expect(await opslag.leesCode(hashGeheim('net-verlopen'))).not.toBeNull()
  })

  it('verwijdert verlopen refreshtokens maar laat geldige en pas ingetrokken staan', async () => {
    await opslag.bewaarRefresh(hashGeheim('verlopen'), { userId: IK, clientId: CLIENT, scope: 'ovari:cycle', consentVersie: '1.0', vervaltOp: START - 1000 })
    await opslag.bewaarRefresh(hashGeheim('geldig'), { userId: IK, clientId: CLIENT, scope: 'ovari:cycle', consentVersie: '1.0', vervaltOp: START + 86400_000 })
    await opslag.bewaarRefresh(hashGeheim('ingetrokken'), { userId: IK, clientId: CLIENT, scope: 'ovari:cycle', consentVersie: '1.0', vervaltOp: START + 86400_000 })
    await opslag.trekRefreshIn(hashGeheim('ingetrokken'))

    const uitslag = await ruimOp({ opslag, nu: () => START })
    expect(uitslag.refresh).toBe(1)
    expect(await opslag.leesRefresh(hashGeheim('geldig'))).not.toBeNull()
    // Blijft staan: hergebruik hiervan is een signaal, geen onbekend token.
    expect(await opslag.leesRefresh(hashGeheim('ingetrokken'))).not.toBeNull()
  })

  it('raakt een lopende koppeling niet', async () => {
    const tokens = await koppel()
    await ruimOp({ opslag, nu: () => klok })
    expect((await restTool('get_my_cycle_overview', tokens.access_token)).status).toBe(200)
  })

  it('geeft een stopfunctie terug en houdt het proces niet wakker', () => {
    const stop = startOpruimen({ opslag, elkeMs: 60_000, log: () => {}, waarschuw: () => {} })
    expect(typeof stop).toBe('function')
    stop()
  })
})

describe('database onbereikbaar', () => {
  // Dit was een echte vondst tijdens de rooktest: een afgewezen promise in een
  // Express 4-handler is een unhandled rejection en nam het HELE proces mee.
  // Niet alleen de agent lag eruit, de hele API lag eruit.
  function maakStukkeApp() {
    const stuk = { async query() { const e = new Error('connect ECONNREFUSED'); e.code = 'ECONNREFUSED'; throw e } }
    const app = express()
    app.use(express.json())
    const auth = (req, res, next) => { req.userId = IK; next() }
    app.use('/api/v1/agent/oauth', maakOauthRouter({
      pool: stuk, authenticateToken: auth,
      clients: maakClientRegister([{ id: CLIENT, naam: 'ChatGPT (test)', redirectUris: [REDIRECT] }]),
      opslag: { async leesCode() { throw new Error('db weg') }, async bewaarCode() { throw new Error('db weg') },
        async leesRefresh() { throw new Error('db weg') }, async trekRefreshIn() { throw new Error('db weg') },
        async lijstKoppelingen() { throw new Error('db weg') }, async trekAllesInVoorGebruiker() { throw new Error('db weg') },
        async markeerCodeGebruikt() { throw new Error('db weg') }, async bewaarRefresh() { throw new Error('db weg') },
        async trekKoppelingIn() { throw new Error('db weg') } },
      sleutels: { prive: HUIDIG.prive, publiek: HUIDIG.publiek },
      issuer: ISSUER, resource: RESOURCE, nu: () => klok,
    }))
    return app
  }

  let stukServer, stukBasis
  beforeEach(async () => {
    await new Promise((klaar) => { stukServer = maakStukkeApp().listen(0, klaar) })
    stukBasis = `http://127.0.0.1:${stukServer.address().port}`
  })
  afterEach(async () => { await new Promise((klaar) => stukServer.close(klaar)) })

  const post = (pad, body) =>
    fetch(stukBasis + pad, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body || {}) })

  it('geeft 503 op /token in plaats van het proces mee te nemen', async () => {
    const r = await post('/api/v1/agent/oauth/token', { grant_type: 'authorization_code', code: 'x', client_id: CLIENT, redirect_uri: REDIRECT, code_verifier: 'a'.repeat(43) })
    expect(r.status).toBe(503)
    expect((await r.json()).error).toBe('server_error')
  })

  it('geeft 503 op de beslissing en op de koppelingenlijst', async () => {
    const beslissing = await post('/api/v1/agent/oauth/authorize/decision', { verzoek: 'x.y', akkoord: true })
    expect([400, 503]).toContain(beslissing.status)
    const lijst = await fetch(stukBasis + '/api/v1/agent/oauth/koppelingen')
    expect(lijst.status).toBe(503)
  })

  it('geeft 503 op een tool in plaats van gegevens of een crash', async () => {
    const seconden = Math.floor(klok / 1000)
    const token = maakToken(
      { iss: ISSUER, aud: RESOURCE, sub: IK, client_id: CLIENT, scope: 'ovari:cycle', iat: seconden, exp: seconden + 600, jti: 'x', consent_version: '1.0' },
      HUIDIG.prive, { typ: 'at+jwt' }
    )
    const r = await fetch(stukBasis + '/api/v1/agent/oauth/mcp/tools/get_my_cycle_overview', {
      method: 'POST', headers: { authorization: `Bearer ${token}` },
    })
    expect(r.status).toBe(503)
  })
})

// BUG 2: server.js bouwde wel een auditlogger voor de app-router, maar gaf er
// geen mee aan de OAuth/MCP-router. Daardoor logde de MCP-laag in productie
// niets EN had de fail-closed-regel niets om handen. Dit is een bewaking op de
// bedrading zelf, want die kun je alleen in het echte bestand zien.
describe('bedrading in server.js', () => {
  const server = readFileSync(new URL('../../server.js', import.meta.url), 'utf8')

  it('geeft beide routers dezelfde auditlogger mee', () => {
    expect(server).toMatch(/const auditLogger = maakAuditLogger\(/)
    expect(server).toMatch(/maakAgentRouter\(\{[^}]*audit: auditLogger/s)
    expect(server).toMatch(/maakOauthRouter\(\{[\s\S]*?audit: auditLogger/)
  })

  it('leest het auditzout uit de omgeving', () => {
    expect(server).toMatch(/zout: process\.env\.AGENT_AUDIT_SALT/)
  })

  it('monteert de OAuth-laag alleen achter beide vlaggen', () => {
    expect(server).toMatch(/if \(agentIngeschakeld\(\)\) \{/)
    expect(server).toMatch(/if \(oauthIngeschakeld\(\)\) \{/)
  })
})

describe('vangnet tegen onopgevangen fouten', () => {
  const server = readFileSync(new URL('../../server.js', import.meta.url), 'utf8')

  it('vangt een afgewezen promise op zonder het proces te stoppen', () => {
    expect(server).toMatch(/process\.on\('unhandledRejection'/)
    const blok = server.slice(server.indexOf("process.on('unhandledRejection'"), server.indexOf("process.on('uncaughtException'"))
    expect(blok).not.toMatch(/process\.exit/)
  })

  it('stopt wel netjes bij een onopgevangen uitzondering', () => {
    expect(server).toMatch(/process\.on\('uncaughtException'/)
    const blok = server.slice(server.indexOf("process.on('uncaughtException'"))
    expect(blok).toMatch(/process\.exit\(1\)/)
  })

  it('heeft een afsluitende Express-foutafhandelaar die JSON teruggeeft', () => {
    expect(server).toMatch(/app\.use\(\(err, req, res, next\) => \{/)
    expect(server).toMatch(/res\.status\(500\)\.json\(\{ error: 'server_error' \}\)/)
  })

  it('heeft geen enkele async route zonder try/catch', () => {
    const regels = server.replace(/\r\n/g, '\n').split('\n')
    const zonder = []
    for (let i = 0; i < regels.length; i++) {
      if (!/^app\.(get|post|put|delete)\('[^']+'.*async \(req, res\)/.test(regels[i])) continue
      let eind = i
      for (let j = i + 1; j < regels.length; j++) { if (regels[j] === '})') { eind = j; break } }
      if (!/\n\s*try \{/.test(regels.slice(i, eind).join('\n'))) zonder.push(regels[i].slice(0, 60))
    }
    expect(zonder).toEqual([])
  })

  it('laat geen auditregel als zwevende promise achter in de agent-router', () => {
    const router = readFileSync(new URL('../index.js', import.meta.url), 'utf8')
    const zwevend = router.split('\n').filter((r, i, alle) =>
      /logboek\.schrijfRegel\(\{/.test(r) && !/await/.test(r) && !/\.catch/.test(alle.slice(i, i + 8).join('\n')))
    expect(zwevend).toEqual([])
  })
})
