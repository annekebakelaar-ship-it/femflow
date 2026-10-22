import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import express from 'express'
import { readFileSync } from 'node:fs'
import { generateKeyPairSync, createHash } from 'crypto'

import { maakOauthRouter } from './router.js'
import { maakClientRegister } from './clients.js'
import { geheugenOpslag } from './opslag.js'
import { maakAuditLogger } from '../audit.js'

// Een tokenverzoek is volgens RFC 6749 form-encoded. De backend las alleen
// JSON, dus de body kwam leeg binnen en de code werd nooit opgezocht. Deze
// tests draaien daarom op een app die de parsers van server.js nabootst.

const IK = '11111111-1111-4111-8111-111111111111'
const CLIENT = 'ovari-form-testclient'
const REDIRECT = 'https://assistent.voorbeeld.invalid/callback'
const ISSUER = 'https://femflow-test.invalid'
const RESOURCE = `${ISSUER}/api/v1/agent/oauth/mcp`
const KLOK = Date.parse('2026-10-22T10:00:00.000Z')

const verifier = 'a'.repeat(43)
const challenge = createHash('sha256').update(verifier).digest('base64url')
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const SLEUTELS = { prive: privateKey.export({ type: 'pkcs8', format: 'pem' }), publiek: publicKey.export({ type: 'spki', format: 'pem' }) }

const pool = {
  async query(sql) {
    if (sql.includes('FROM femflow_agent_consent')) {
      return { rows: [{ granted_at: '2026-10-22T09:00:00.000Z', revoked_at: null, versie: '1.0' }] }
    }
    if (sql.includes('FROM femflow_menstruation_data')) {
      return { rows: [{ start_date: '2026-10-08', cycle_length: 28, bleeding_days: 5, updated_at: '2026-10-08' }] }
    }
    if (sql.includes('FROM femflow_wearable_connections')) return { rows: [] }
    if (sql.includes('FROM femflow_biometric_readings')) return { rows: [] }
    if (sql.includes('FROM femflow_users')) return { rows: [{ birth_date: '1979-06-01', created_at: '2026-04-01' }] }
    if (sql.includes('FROM femflow_quiz_results')) return { rows: [] }
    if (sql.includes('femflow_agent_audit')) return { rows: [] }
    throw new Error('onverwachte query: ' + sql)
  },
}

let server, basis, opslag

beforeEach(async () => {
  opslag = geheugenOpslag()
  const app = express()
  // Dezelfde twee parsers als in server.js.
  app.use(express.json())
  app.use(express.urlencoded({ extended: false, limit: '32kb' }))
  app.use('/api/v1/agent/oauth', maakOauthRouter({
    pool,
    authenticateToken: (req, res, next) => { req.userId = IK; next() },
    clients: maakClientRegister([{ id: CLIENT, naam: 'Formulier-testclient', redirectUris: [REDIRECT] }]),
    opslag,
    sleutels: SLEUTELS,
    issuer: ISSUER,
    resource: RESOURCE,
    audit: maakAuditLogger({ zout: 'test-zout', nu: () => new Date(KLOK), sink: () => {}, waarschuw: () => {} }),
    nu: () => KLOK,
  }))
  await new Promise((k) => { server = app.listen(0, k) })
  basis = `http://127.0.0.1:${server.address().port}`
})

afterEach(async () => { await new Promise((k) => server.close(k)) })

/** Haalt een verse autorisatiecode op via de gewone weg. */
async function haalCode() {
  const q = new URLSearchParams({
    client_id: CLIENT, redirect_uri: REDIRECT, response_type: 'code',
    state: 'form-state-0123456789', code_challenge: challenge, code_challenge_method: 'S256',
    scope: 'ovari:cycle', resource: RESOURCE,
  })
  const autorisatie = await (await fetch(`${basis}/api/v1/agent/oauth/authorize?${q}`)).json()
  const beslissing = await (await fetch(`${basis}/api/v1/agent/oauth/authorize/decision`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ verzoek: autorisatie.verzoek, akkoord: true }),
  })).json()
  return new URL(beslissing.redirect).searchParams.get('code')
}

const alsFormulier = (pad, velden) =>
  fetch(basis + pad, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(velden).toString(),
  })

const alsJson = (pad, body) =>
  fetch(basis + pad, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('/token met een form-encoded body', () => {
  it('wisselt een code in en geeft een bruikbaar token', async () => {
    const code = await haalCode()
    const r = await alsFormulier('/api/v1/agent/oauth/token', {
      grant_type: 'authorization_code', code, client_id: CLIENT, redirect_uri: REDIRECT, code_verifier: verifier,
    })
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.token_type).toBe('Bearer')
    expect(body.expires_in).toBe(600)
    expect(body.scope).toBe('ovari:cycle')

    const tool = await fetch(`${basis}/api/v1/agent/oauth/mcp/tools/get_my_cycle_overview`, {
      method: 'POST', headers: { authorization: `Bearer ${body.access_token}` },
    })
    expect(tool.status).toBe(200)
    expect((await tool.json()).resultaat.cyclusdag).toBe(15)
  })

  it('ververst ook form-encoded', async () => {
    const code = await haalCode()
    const eerste = await (await alsFormulier('/api/v1/agent/oauth/token', {
      grant_type: 'authorization_code', code, client_id: CLIENT, redirect_uri: REDIRECT, code_verifier: verifier,
    })).json()

    const r = await alsFormulier('/api/v1/agent/oauth/token', {
      grant_type: 'refresh_token', refresh_token: eerste.refresh_token, client_id: CLIENT,
    })
    expect(r.status).toBe(200)
    expect((await r.json()).access_token).toBeTruthy()
  })

  it('zoekt de code echt op: een onbekende code geeft invalid_grant, niet unsupported_grant_type', async () => {
    const r = await alsFormulier('/api/v1/agent/oauth/token', {
      grant_type: 'authorization_code', code: 'deze-code-bestaat-niet', client_id: CLIENT,
      redirect_uri: REDIRECT, code_verifier: verifier,
    })
    expect(r.status).toBe(400)
    expect((await r.json()).error).toBe('invalid_grant')
  })

  it('weigert een onbekend grant_type', async () => {
    const r = await alsFormulier('/api/v1/agent/oauth/token', { grant_type: 'password', username: 'x', password: 'y' })
    expect(r.status).toBe(400)
    expect((await r.json()).error).toBe('unsupported_grant_type')
  })

  it('weigert een lege body', async () => {
    const r = await alsFormulier('/api/v1/agent/oauth/token', {})
    expect(r.status).toBe(400)
    expect((await r.json()).error).toBe('unsupported_grant_type')
  })
})

describe('de beveiliging blijft dezelfde, ook form-encoded', () => {
  it('blijft PKCE eisen', async () => {
    const code = await haalCode()
    const r = await alsFormulier('/api/v1/agent/oauth/token', {
      grant_type: 'authorization_code', code, client_id: CLIENT, redirect_uri: REDIRECT, code_verifier: 'b'.repeat(43),
    })
    expect(r.status).toBe(400)
    expect((await r.json()).error).toBe('invalid_grant')
  })

  it('weigert een afwijkende redirect_uri', async () => {
    const code = await haalCode()
    const r = await alsFormulier('/api/v1/agent/oauth/token', {
      grant_type: 'authorization_code', code, client_id: CLIENT,
      redirect_uri: 'https://evil.example/callback', code_verifier: verifier,
    })
    expect(r.status).toBe(400)
    expect((await r.json()).error).toBe('invalid_grant')
  })

  it('weigert een andere client', async () => {
    const code = await haalCode()
    const r = await alsFormulier('/api/v1/agent/oauth/token', {
      grant_type: 'authorization_code', code, client_id: 'iemand-anders', redirect_uri: REDIRECT, code_verifier: verifier,
    })
    expect(r.status).toBe(400)
    expect((await r.json()).error).toBe('invalid_client')
  })

  it('houdt de code eenmalig, ook over de twee verpakkingen heen', async () => {
    const code = await haalCode()
    const eerste = await alsFormulier('/api/v1/agent/oauth/token', {
      grant_type: 'authorization_code', code, client_id: CLIENT, redirect_uri: REDIRECT, code_verifier: verifier,
    })
    expect(eerste.status).toBe(200)

    const tweede = await alsJson('/api/v1/agent/oauth/token', {
      grant_type: 'authorization_code', code, client_id: CLIENT, redirect_uri: REDIRECT, code_verifier: verifier,
    })
    expect(tweede.status).toBe(400)
    expect((await tweede.json()).error).toBe('invalid_grant')
  })

  it('weigert een resource-indicator van een andere server', async () => {
    const code = await haalCode()
    const r = await alsFormulier('/api/v1/agent/oauth/token', {
      grant_type: 'authorization_code', code, client_id: CLIENT, redirect_uri: REDIRECT,
      code_verifier: verifier, resource: 'https://andermans-mcp.invalid/mcp',
    })
    expect(r.status).toBe(400)
    expect((await r.json()).error).toBe('invalid_target')
  })
})

describe('JSON blijft werken', () => {
  it('wisselt een code in via JSON', async () => {
    const code = await haalCode()
    const r = await alsJson('/api/v1/agent/oauth/token', {
      grant_type: 'authorization_code', code, client_id: CLIENT, redirect_uri: REDIRECT, code_verifier: verifier,
    })
    expect(r.status).toBe(200)
    expect((await r.json()).token_type).toBe('Bearer')
  })
})

describe('/revoke in beide verpakkingen', () => {
  async function tokensViaFormulier() {
    const code = await haalCode()
    return (await alsFormulier('/api/v1/agent/oauth/token', {
      grant_type: 'authorization_code', code, client_id: CLIENT, redirect_uri: REDIRECT, code_verifier: verifier,
    })).json()
  }

  it('trekt een refreshtoken echt in bij een form-encoded verzoek', async () => {
    const tokens = await tokensViaFormulier()
    const r = await alsFormulier('/api/v1/agent/oauth/revoke', { token: tokens.refresh_token, refresh_token: tokens.refresh_token, client_id: CLIENT })
    expect(r.status).toBe(200)

    const ververs = await alsFormulier('/api/v1/agent/oauth/token', {
      grant_type: 'refresh_token', refresh_token: tokens.refresh_token, client_id: CLIENT,
    })
    expect(ververs.status).toBe(400)
  })

  it('doet hetzelfde via JSON', async () => {
    const tokens = await tokensViaFormulier()
    expect((await alsJson('/api/v1/agent/oauth/revoke', { refresh_token: tokens.refresh_token })).status).toBe(200)
    const ververs = await alsJson('/api/v1/agent/oauth/token', {
      grant_type: 'refresh_token', refresh_token: tokens.refresh_token, client_id: CLIENT,
    })
    expect(ververs.status).toBe(400)
  })

  it('antwoordt ook op een onbekend token met succes, zonder iets te verraden', async () => {
    expect((await alsFormulier('/api/v1/agent/oauth/revoke', { refresh_token: 'bestaat-niet' })).status).toBe(200)
  })
})

describe('bedrading in server.js', () => {
  const server = readFileSync(new URL('../../server.js', import.meta.url), 'utf8')

  it('leest zowel JSON als form-encoded bodies', () => {
    expect(server).toMatch(/app\.use\(express\.json\(\)\)/)
    expect(server).toMatch(/app\.use\(express\.urlencoded\(\{ extended: false, limit: '32kb' \}\)\)/)
  })

  it('zet de parsers voor de routers, anders komt de body te laat', () => {
    expect(server.indexOf('express.urlencoded')).toBeLessThan(server.indexOf("app.use('/api/v1/agent'"))
  })
})
