import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import express from 'express'
import { generateKeyPairSync, randomBytes } from 'crypto'

import { maakOauthRouter, oauthIngeschakeld } from './router.js'
import { maakClientRegister, clientsUitOmgeving } from './clients.js'
import { geheugenOpslag } from './opslag.js'
import { challengeVoor } from './pkce.js'
import { maakToken } from './jwt.js'
import { maakAuditLogger } from '../audit.js'

// Twee verzonnen gebruikers en een verzonnen client. Niets hiervan bestaat.
const IK = '11111111-1111-4111-8111-111111111111'
const IEMAND_ANDERS = '22222222-2222-4222-8222-222222222222'
const CLIENT = 'chatgpt-test'
const REDIRECT = 'https://chat.example.com/connector/callback'
const ISSUER = 'https://femflow-api.test'
const RESOURCE = 'https://femflow-api.test/api/v1/agent/oauth/mcp'
const START = Date.parse('2026-10-19T09:00:00.000Z')

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const SLEUTELS = {
  prive: privateKey.export({ type: 'pkcs8', format: 'pem' }),
  publiek: publicKey.export({ type: 'spki', format: 'pem' }),
}

let server
let basis
let klok
let opslag
let auditRegels
let toestemmingRijen

function maakNepPool() {
  return {
    async query(sql, params = []) {
      if (sql.includes('FROM femflow_agent_consent')) {
        return { rows: toestemmingRijen.has(params[0]) ? [toestemmingRijen.get(params[0])] : [] }
      }
      if (sql.includes('FROM femflow_menstruation_data')) {
        return params[0] === IK
          ? { rows: [{ start_date: '2026-10-05', cycle_length: 28, bleeding_days: 5, updated_at: '2026-10-05' }] }
          : { rows: [{ start_date: '2026-01-01', cycle_length: 30, bleeding_days: 9, updated_at: '2026-01-01' }] }
      }
      if (sql.includes('FROM femflow_wearable_connections')) return { rows: [] }
      if (sql.includes('FROM femflow_biometric_readings')) return { rows: [] }
      if (sql.includes('FROM femflow_users')) return { rows: [{ birth_date: '1979-06-01', created_at: '2026-04-01' }] }
      if (sql.includes('FROM femflow_quiz_results')) return { rows: [] }
      throw new Error('onverwachte query: ' + sql)
    },
  }
}

const verifier = 'a'.repeat(43)
const challenge = challengeVoor(verifier)

function autorisatieQuery(extra = {}) {
  return {
    client_id: CLIENT,
    redirect_uri: REDIRECT,
    response_type: 'code',
    state: 'staat-van-de-client-123',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    scope: 'ovari:cycle ovari:recovery ovari:profile',
    ...extra,
  }
}

const alsApp = (pad, userId, body) =>
  fetch(basis + pad, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-test-user': userId },
    body: JSON.stringify(body),
  })

const zonderLogin = (pad, body) =>
  fetch(basis + pad, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

/** Haalt het ondertekende verzoek op zoals het toestemmingsscherm dat doet. */
async function haalVerzoek(query = autorisatieQuery()) {
  const r = await fetch(basis + '/api/v1/agent/oauth/authorize?' + new URLSearchParams(query))
  if (!r.ok) return null
  return (await r.json()).verzoek
}

/** Doorloopt de hele koppeling en geeft de tokens terug. */
async function koppel({ userId = IK, scope } = {}) {
  const query = autorisatieQuery(scope ? { scope } : {})
  const verzoek = await haalVerzoek(query)
  const beslissing = await alsApp('/api/v1/agent/oauth/authorize/decision', userId, { verzoek, akkoord: true })
  const { redirect } = await beslissing.json()
  const code = new URL(redirect).searchParams.get('code')
  const r = await zonderLogin('/api/v1/agent/oauth/token', {
    grant_type: 'authorization_code',
    code,
    client_id: CLIENT,
    redirect_uri: REDIRECT,
    code_verifier: verifier,
  })
  return { status: r.status, tokens: await r.json(), code, state: new URL(redirect).searchParams.get('state') }
}

const metToken = (tool, token) =>
  fetch(`${basis}/api/v1/agent/oauth/mcp/tools/${tool}`, {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : {},
  })

beforeEach(async () => {
  klok = START
  opslag = geheugenOpslag()
  auditRegels = []
  toestemmingRijen = new Map([[IK, { granted_at: '2026-10-19T08:00:00.000Z', revoked_at: null, versie: '1.0' }]])

  const app = express()
  app.use(express.json())
  const authenticateToken = (req, res, next) => {
    const id = req.headers['x-test-user']
    if (!id) return res.status(401).json({ error: 'No token provided' })
    req.userId = id
    next()
  }
  app.use(
    '/api/v1/agent/oauth',
    maakOauthRouter({
      pool: maakNepPool(),
      authenticateToken,
      clients: maakClientRegister([{ id: CLIENT, naam: 'ChatGPT (test)', redirectUris: [REDIRECT] }]),
      opslag,
      sleutels: SLEUTELS,
      issuer: ISSUER,
      resource: RESOURCE,
      audit: maakAuditLogger({ zout: 'test-zout', nu: () => new Date(klok), sink: (r) => auditRegels.push(r) }),
      nu: () => klok,
    })
  )
  await new Promise((klaar) => { server = app.listen(0, klaar) })
  basis = `http://127.0.0.1:${server.address().port}`
})

afterEach(async () => {
  await new Promise((klaar) => server.close(klaar))
})

describe('vlag en clients', () => {
  it('staat standaard uit', () => {
    expect(oauthIngeschakeld({})).toBe(false)
    expect(oauthIngeschakeld({ AGENT_OAUTH_ENABLED: 'true' })).toBe(true)
  })

  it('heeft zonder configuratie geen enkele client', () => {
    expect(clientsUitOmgeving({}).aantal()).toBe(0)
    expect(clientsUitOmgeving({ AGENT_OAUTH_CLIENTS: 'kapot' }, () => {}).aantal()).toBe(0)
  })

  it('weigert een redirect_uri die geen https is of een jokerteken heeft', () => {
    expect(() => maakClientRegister([{ id: 'x', redirectUris: ['http://evil.example.com/cb'] }])).toThrow()
    expect(() => maakClientRegister([{ id: 'x', redirectUris: ['https://example.com/*'] }])).toThrow()
  })
})

describe('inloggen en koppelen', () => {
  it('doorloopt de hele stroom en levert een werkend token', async () => {
    const { status, tokens, state } = await koppel()
    expect(status).toBe(200)
    expect(tokens.token_type).toBe('Bearer')
    expect(tokens.expires_in).toBe(600)
    expect(state).toBe('staat-van-de-client-123')

    const r = await metToken('get_my_cycle_overview', tokens.access_token)
    expect(r.status).toBe(200)
    expect((await r.json()).resultaat.cyclusdag).toBe(15)
  })

  it('geeft de state ongewijzigd terug en weigert een verzoek zonder state', async () => {
    const r = await fetch(`${basis}/api/v1/agent/oauth/authorize?` + new URLSearchParams(autorisatieQuery({ state: '' })), { redirect: 'manual' })
    expect(r.status).toBe(302)
    expect(new URL(r.headers.get('location')).searchParams.get('error')).toBe('invalid_request')
  })

  it('weigert een niet-geregistreerde redirect_uri zonder door te sturen', async () => {
    const r = await fetch(
      `${basis}/api/v1/agent/oauth/authorize?` + new URLSearchParams(autorisatieQuery({ redirect_uri: 'https://evil.example.com/cb' })),
      { redirect: 'manual' }
    )
    expect(r.status).toBe(400)
    expect((await r.json()).error).toBe('invalid_request')
  })

  it('geeft geen code zonder ingelogde gebruiker', async () => {
    const r = await zonderLogin('/api/v1/agent/oauth/authorize/decision', { verzoek: await haalVerzoek(), akkoord: true })
    expect(r.status).toBe(401)
  })

  it('geeft geen code als de gebruiker niet akkoord gaat', async () => {
    const r = await alsApp('/api/v1/agent/oauth/authorize/decision', IK, { verzoek: await haalVerzoek(), akkoord: false })
    const { redirect } = await r.json()
    expect(new URL(redirect).searchParams.get('error')).toBe('access_denied')
    expect(new URL(redirect).searchParams.get('code')).toBeNull()
  })

  it('weigert een verkeerde code_verifier', async () => {
    const beslissing = await alsApp('/api/v1/agent/oauth/authorize/decision', IK, { verzoek: await haalVerzoek(), akkoord: true })
    const code = new URL((await beslissing.json()).redirect).searchParams.get('code')
    const r = await zonderLogin('/api/v1/agent/oauth/token', {
      grant_type: 'authorization_code',
      code,
      client_id: CLIENT,
      redirect_uri: REDIRECT,
      code_verifier: 'b'.repeat(43),
    })
    expect(r.status).toBe(400)
    expect((await r.json()).error).toBe('invalid_grant')
  })

  it('trekt alles in als dezelfde code twee keer wordt ingewisseld', async () => {
    const { tokens, code } = await koppel()
    const tweede = await zonderLogin('/api/v1/agent/oauth/token', {
      grant_type: 'authorization_code', code, client_id: CLIENT, redirect_uri: REDIRECT, code_verifier: verifier,
    })
    expect(tweede.status).toBe(400)

    const ververst = await zonderLogin('/api/v1/agent/oauth/token', {
      grant_type: 'refresh_token', refresh_token: tokens.refresh_token, client_id: CLIENT,
    })
    expect(ververst.status).toBe(400)
  })

  it('accepteert geen app-JWT als MCP-token', async () => {
    const appJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + Buffer.from(JSON.stringify({ userId: IK })).toString('base64url') + '.' + randomBytes(32).toString('base64url')
    const r = await metToken('get_my_cycle_overview', appJwt)
    expect(r.status).toBe(401)
    expect(r.headers.get('www-authenticate')).toMatch(/invalid_token/)
  })
})

describe('tokenverloop en verversen', () => {
  it('weigert een verlopen token', async () => {
    const { tokens } = await koppel()
    klok += 11 * 60_000
    const r = await metToken('get_my_cycle_overview', tokens.access_token)
    expect(r.status).toBe(401)
    expect((await r.json()).reden).toBe('token_verlopen')
  })

  it('geeft met een refreshtoken een nieuw werkend token', async () => {
    const { tokens } = await koppel()
    klok += 11 * 60_000
    const r = await zonderLogin('/api/v1/agent/oauth/token', {
      grant_type: 'refresh_token', refresh_token: tokens.refresh_token, client_id: CLIENT,
    })
    expect(r.status).toBe(200)
    const nieuw = await r.json()
    expect((await metToken('get_my_cycle_overview', nieuw.access_token)).status).toBe(200)
  })

  it('roteert het refreshtoken: de oude werkt daarna niet meer', async () => {
    const { tokens } = await koppel()
    await zonderLogin('/api/v1/agent/oauth/token', { grant_type: 'refresh_token', refresh_token: tokens.refresh_token, client_id: CLIENT })
    const nogmaals = await zonderLogin('/api/v1/agent/oauth/token', { grant_type: 'refresh_token', refresh_token: tokens.refresh_token, client_id: CLIENT })
    expect(nogmaals.status).toBe(400)
  })
})

describe('toestemming', () => {
  it('koppelt niet als de agent-toestemming in de app uit staat', async () => {
    const verzoek = await haalVerzoek()
    toestemmingRijen.delete(IK)
    const r = await alsApp('/api/v1/agent/oauth/authorize/decision', IK, { verzoek, akkoord: true })
    expect(r.status).toBe(403)
    expect(auditRegels.at(-1).resultaat).toBe('geweigerd_geen_toestemming')
  })

  it('stopt een bestaand token zodra de toestemming wordt ingetrokken', async () => {
    const { tokens } = await koppel()
    expect((await metToken('get_my_cycle_overview', tokens.access_token)).status).toBe(200)

    toestemmingRijen.set(IK, { granted_at: '2026-10-19T08:00:00.000Z', revoked_at: '2026-10-19T09:05:00.000Z', versie: '1.0' })

    const r = await metToken('get_my_cycle_overview', tokens.access_token)
    expect(r.status).toBe(403)
    expect((await r.json()).reden).toBe('toestemming_ingetrokken')
    expect(auditRegels.at(-1).resultaat).toBe('geweigerd_ingetrokken')
  })

  it('weigert een token dat op een oudere toestemmingversie is uitgegeven', async () => {
    const { tokens } = await koppel()
    toestemmingRijen.set(IK, { granted_at: '2026-10-19T09:30:00.000Z', revoked_at: null, versie: '2.0' })
    const r = await metToken('get_my_profile_context', tokens.access_token)
    expect(r.status).toBe(403)
    expect((await r.json()).reden).toBe('toestemming_oude_versie')
  })
})

describe('scopes en toegang per gebruiker', () => {
  it('weigert een tool waarvoor de scope ontbreekt', async () => {
    const { tokens } = await koppel({ scope: 'ovari:cycle' })
    expect((await metToken('get_my_cycle_overview', tokens.access_token)).status).toBe(200)
    const r = await metToken('get_my_recovery_trend', tokens.access_token)
    expect(r.status).toBe(403)
    expect((await r.json()).reden).toBe('scope_tekort')
    expect(auditRegels.at(-1).resultaat).toBe('geweigerd_scope')
  })

  it('leest nooit de gegevens van een andere gebruiker', async () => {
    const { tokens } = await koppel({ userId: IK })
    const body = await (await metToken('get_my_cycle_overview', tokens.access_token)).json()
    expect(body.resultaat.opgegeven_cycluslengte).toBe(28) // die van IK, niet 30
  })

  it('weigert een token waarin sub is omgezet naar een andere gebruiker', async () => {
    const { tokens } = await koppel()
    const [h, p, s] = tokens.access_token.split('.')
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString())
    payload.sub = IEMAND_ANDERS
    const geknoeid = `${h}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.${s}`
    const r = await metToken('get_my_cycle_overview', geknoeid)
    expect(r.status).toBe(401)
    expect((await r.json()).reden).toBe('ongeldig_token')
  })

  it('weigert een token dat met een andere sleutel is ondertekend', async () => {
    const ander = generateKeyPairSync('rsa', { modulusLength: 2048 })
    const vals = maakToken(
      {
        iss: ISSUER, aud: RESOURCE, sub: IEMAND_ANDERS, client_id: CLIENT,
        scope: 'ovari:cycle', iat: Math.floor(klok / 1000), exp: Math.floor(klok / 1000) + 600,
        jti: 'aaaa', consent_version: '1.0',
      },
      ander.privateKey.export({ type: 'pkcs8', format: 'pem' })
    )
    expect((await metToken('get_my_cycle_overview', vals)).status).toBe(401)
  })

  it('weigert een token voor een andere audience', async () => {
    const vals = maakToken(
      {
        iss: ISSUER, aud: 'https://iets-anders.example/mcp', sub: IK, client_id: CLIENT,
        scope: 'ovari:cycle', iat: Math.floor(klok / 1000), exp: Math.floor(klok / 1000) + 600,
        jti: 'bbbb', consent_version: '1.0',
      },
      SLEUTELS.prive
    )
    const r = await metToken('get_my_cycle_overview', vals)
    expect(r.status).toBe(401)
    expect((await r.json()).reden).toBe('verkeerde_audience')
  })
})

describe('intrekken', () => {
  it('maakt een ingetrokken refreshtoken onbruikbaar', async () => {
    const { tokens } = await koppel()
    await zonderLogin('/api/v1/agent/oauth/revoke', { refresh_token: tokens.refresh_token, client_id: CLIENT })
    const r = await zonderLogin('/api/v1/agent/oauth/token', {
      grant_type: 'refresh_token', refresh_token: tokens.refresh_token, client_id: CLIENT,
    })
    expect(r.status).toBe(400)
  })

  it('antwoordt ook op een onbekend token met succes, zonder iets te verraden', async () => {
    const r = await zonderLogin('/api/v1/agent/oauth/revoke', { refresh_token: 'bestaat-niet', client_id: CLIENT })
    expect(r.status).toBe(200)
  })
})

describe('auditspoor van de MCP-laag', () => {
  it('legt elke weigering en elke geslaagde aanroep vast zonder inhoud', async () => {
    const { tokens } = await koppel()
    await metToken('get_my_cycle_overview', tokens.access_token)
    await metToken('get_my_cycle_overview', null)
    await metToken('bestaat_niet', tokens.access_token)

    const codes = auditRegels.map((r) => r.resultaat)
    expect(codes).toContain('ok')
    expect(codes).toContain('geweigerd_geen_token')
    expect(codes).toContain('geweigerd_onbekende_tool')

    const tekst = JSON.stringify(auditRegels)
    expect(tekst).not.toContain(IK)
    expect(tekst).not.toContain(tokens.access_token.slice(0, 20))
    expect(tekst).not.toMatch(/cyclusdag|bestaat_niet/)
  })
})

describe('ontdekking', () => {
  it('publiceert alleen de publieke sleutel', async () => {
    const jwks = await (await fetch(`${basis}/api/v1/agent/oauth/jwks.json`)).json()
    expect(jwks.keys[0]).toMatchObject({ kty: 'RSA', alg: 'RS256', use: 'sig' })
    expect(jwks.keys[0].d).toBeUndefined()
    expect(JSON.stringify(jwks)).not.toContain('PRIVATE')
  })

  it('wijst naar zichzelf als authorization server en noemt de scopes', async () => {
    const as = await (await fetch(`${basis}/api/v1/agent/oauth/metadata`)).json()
    expect(as.code_challenge_methods_supported).toEqual(['S256'])
    expect(as.grant_types_supported).toEqual(['authorization_code', 'refresh_token'])
    const pr = await (await fetch(`${basis}/api/v1/agent/oauth/protected-resource`)).json()
    expect(pr.authorization_servers).toEqual([ISSUER])
    expect(pr.scopes_supported).toHaveLength(3)
  })
})
