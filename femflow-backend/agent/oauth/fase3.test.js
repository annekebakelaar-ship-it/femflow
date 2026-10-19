import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import express from 'express'
import { generateKeyPairSync } from 'crypto'

import { maakOauthRouter, maakWellKnownRouter, SCOPE_UITLEG } from './router.js'
import { maakClientRegister } from './clients.js'
import { maakCimdRegister, maakSamengesteldRegister, keurDocument, kiesAuthMethode, CIMD_FOUT } from './cimd.js'
import { geheugenOpslag } from './opslag.js'
import { challengeVoor } from './pkce.js'
import { maakVerzoekToken, leesVerzoekToken, afgeleidGeheim } from './verzoek.js'
import { maakAuditLogger } from '../audit.js'

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

const verifier = 'a'.repeat(43)
const challenge = challengeVoor(verifier)

let server, basis, klok, opslag, auditRegels, toestemmingRijen, poolFouten

function maakNepPool() {
  return {
    async query(sql, params = []) {
      if (poolFouten.audit && sql.includes('femflow_agent_audit')) throw new Error('audittabel bestaat niet')
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
      if (sql.includes('INSERT INTO femflow_agent_audit')) return { rows: [] }
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

const alsApp = (pad, userId, body) =>
  fetch(basis + pad, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-test-user': userId },
    body: JSON.stringify(body),
  })

async function haalVerzoek(q = query()) {
  const r = await fetch(basis + '/api/v1/agent/oauth/authorize?' + new URLSearchParams(q))
  return r.ok ? (await r.json()).verzoek : null
}

async function koppel({ userId = IK, scope } = {}) {
  const q = query(scope ? { scope } : {})
  const verzoek = await haalVerzoek(q)
  const beslissing = await alsApp('/api/v1/agent/oauth/authorize/decision', userId, { verzoek, akkoord: true })
  const code = new URL((await beslissing.json()).redirect).searchParams.get('code')
  const r = await fetch(basis + '/api/v1/agent/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ grant_type: 'authorization_code', code, client_id: CLIENT, redirect_uri: REDIRECT, code_verifier: verifier, resource: RESOURCE }),
  })
  return r.json()
}

/** Eén JSON-RPC-aanroep op het echte MCP-endpoint. */
async function mcp(method, params, token, id = 1) {
  const r = await fetch(basis + '/api/v1/agent/oauth/mcp', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  })
  const tekst = await r.text()
  let body = null
  try {
    body = JSON.parse(tekst)
  } catch {
    const regel = tekst.split('\n').find((l) => l.startsWith('data: '))
    if (regel) body = JSON.parse(regel.slice(6))
  }
  return { status: r.status, headers: r.headers, body }
}

beforeEach(async () => {
  klok = START
  opslag = geheugenOpslag()
  auditRegels = []
  poolFouten = {}
  toestemmingRijen = new Map([[IK, { granted_at: '2026-10-19T08:00:00.000Z', revoked_at: null, versie: '1.0' }]])

  const app = express()
  app.use(express.json())
  const authenticateToken = (req, res, next) => {
    const id = req.headers['x-test-user']
    if (!id) return res.status(401).json({ error: 'No token provided' })
    req.userId = id
    next()
  }
  app.use('/', maakWellKnownRouter({ issuer: ISSUER, resource: RESOURCE }))
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
      frontendUrl: 'https://ovari.youcaps.test',
      audit: maakAuditLogger({
        pool: maakNepPool(),
        zout: 'test-zout',
        nu: () => new Date(klok),
        sink: (r) => auditRegels.push(r),
        waarschuw: () => {},
      }),
      nu: () => klok,
    })
  )
  await new Promise((klaar) => { server = app.listen(0, klaar) })
  basis = `http://127.0.0.1:${server.address().port}`
})

afterEach(async () => {
  await new Promise((klaar) => server.close(klaar))
})

describe('well-known ontdekkingsroutes', () => {
  it('serveert de authorization server metadata op het vereiste pad', async () => {
    const r = await fetch(basis + '/.well-known/oauth-authorization-server')
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.issuer).toBe(ISSUER)
    expect(body.client_id_metadata_document_supported).toBe(true)
    expect(body.authorization_response_iss_parameter_supported).toBe(true)
    expect(body.code_challenge_methods_supported).toEqual(['S256'])
  })

  it('serveert protected resource metadata op de root en op de padvariant', async () => {
    for (const pad of ['/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource/api/v1/agent/oauth/mcp']) {
      const body = await (await fetch(basis + pad)).json()
      expect(body.resource).toBe(RESOURCE)
      expect(body.authorization_servers).toEqual([ISSUER])
    }
  })
})

describe('CIMD-clientregistratie', () => {
  const CID = 'https://chatgpt.test/oauth/client.json'
  const document = {
    client_id: CID,
    client_name: 'ChatGPT',
    redirect_uris: ['https://chatgpt.test/connector_platform_oauth_redirect'],
    token_endpoint_auth_method: 'private_key_jwt',
    token_endpoint_auth_methods_supported: ['none', 'private_key_jwt'],
  }

  it('onderhandelt op de doorsnede en niet op het voorkeursveld alleen', () => {
    // Dit is de valkuil die bij YouCaps een breuk veroorzaakte.
    expect(kiesAuthMethode(document)).toBe('none')
    expect(kiesAuthMethode({ token_endpoint_auth_method: 'private_key_jwt' })).toBeNull()
    expect(kiesAuthMethode({})).toBe('none')
  })

  it('eist dat het document naar zichzelf verwijst', () => {
    expect(keurDocument(CID, { ...document, client_id: 'https://iets-anders.test/c.json' }).fout).toBe(CIMD_FOUT.CLIENT_ID_KLOPT_NIET)
  })

  it('weigert een redirect_uri op een andere host dan het document', () => {
    expect(keurDocument(CID, { ...document, redirect_uris: ['https://evil.test/cb'] }).fout).toBe(CIMD_FOUT.VREEMDE_REDIRECT)
  })

  it('weigert http en fragmenten in redirect_uris', () => {
    expect(keurDocument(CID, { ...document, redirect_uris: ['http://chatgpt.test/cb'] }).fout).toBe(CIMD_FOUT.VREEMDE_REDIRECT)
    expect(keurDocument(CID, { ...document, redirect_uris: ['https://chatgpt.test/cb#x'] }).fout).toBe(CIMD_FOUT.VREEMDE_REDIRECT)
  })

  it('accepteert een goed document', () => {
    const uitslag = keurDocument(CID, document)
    expect(uitslag.ok).toBe(true)
    expect(uitslag.client).toMatchObject({ id: CID, naam: 'ChatGPT', authMethode: 'none', bron: 'cimd' })
  })

  it('haalt alleen op bij een toegestane host, en cachet', async () => {
    let aanroepen = 0
    const nep = async () => {
      aanroepen++
      return { ok: true, text: async () => JSON.stringify(document) }
    }
    const register = maakCimdRegister({ toegestaneHosts: ['chatgpt.test'], fetchImpl: nep, nu: () => klok, waarschuw: () => {} })
    expect((await register.vind(CID)).naam).toBe('ChatGPT')
    expect((await register.vind(CID)).naam).toBe('ChatGPT')
    expect(aanroepen).toBe(1)
  })

  it('weigert een host die niet in de allowlist staat en haalt niets op', async () => {
    let aanroepen = 0
    const register = maakCimdRegister({
      toegestaneHosts: ['chatgpt.test'],
      fetchImpl: async () => { aanroepen++; return { ok: true, text: async () => '{}' } },
      waarschuw: () => {},
    })
    expect(await register.vind('https://evil.test/oauth/client.json')).toBeNull()
    expect(aanroepen).toBe(0)
  })

  it('is zonder allowlist volledig dicht', async () => {
    const register = maakCimdRegister({ fetchImpl: async () => { throw new Error('mag niet') }, waarschuw: () => {} })
    expect(await register.vind(CID)).toBeNull()
  })

  it('weigert een document dat geen JSON is of niet opgehaald kan worden', async () => {
    const stuk = maakCimdRegister({ toegestaneHosts: ['chatgpt.test'], fetchImpl: async () => ({ ok: false }), waarschuw: () => {} })
    expect(await stuk.vind(CID)).toBeNull()
    const rommel = maakCimdRegister({
      toegestaneHosts: ['chatgpt.test'],
      fetchImpl: async () => ({ ok: true, text: async () => '<html>' }),
      waarschuw: () => {},
    })
    expect(await rommel.vind(CID)).toBeNull()
  })

  it('stuurt vaste clients en CIMD-clients naar de juiste kant', async () => {
    const samen = maakSamengesteldRegister({
      statisch: maakClientRegister([{ id: 'vast', redirectUris: ['https://a.test/cb'] }]),
      cimd: maakCimdRegister({
        toegestaneHosts: ['chatgpt.test'],
        fetchImpl: async () => ({ ok: true, text: async () => JSON.stringify(document) }),
        waarschuw: () => {},
      }),
    })
    expect((await samen.vind('vast')).id).toBe('vast')
    expect((await samen.vind(CID)).id).toBe(CID)
    expect(await samen.vind('onbekend')).toBeNull()
  })
})

describe('toestemmingsscherm en redirectaanvallen', () => {
  it('stuurt een browser naar het scherm in de app met een ondertekend verzoek', async () => {
    const r = await fetch(basis + '/api/v1/agent/oauth/authorize?' + new URLSearchParams(query()), {
      headers: { accept: 'text/html' },
      redirect: 'manual',
    })
    expect(r.status).toBe(302)
    const doel = new URL(r.headers.get('location'))
    expect(doel.origin + doel.pathname).toBe('https://ovari.youcaps.test/agent/toestemming')
    expect(doel.searchParams.get('verzoek')).toBeTruthy()
  })

  it('vertelt het scherm welke client welke gegevens vraagt', async () => {
    const verzoek = await haalVerzoek()
    const body = await (await fetch(basis + '/api/v1/agent/oauth/verzoek?verzoek=' + encodeURIComponent(verzoek))).json()
    expect(body.client.naam).toBe('ChatGPT (test)')
    expect(body.scopes.map((s) => s.scope)).toEqual(['ovari:cycle', 'ovari:recovery', 'ovari:profile'])
    expect(body.scopes[0].deelt).toBe(SCOPE_UITLEG['ovari:cycle'].deelt)
  })

  it('negeert een redirect_uri die in de beslissing wordt meegesmokkeld', async () => {
    const verzoek = await haalVerzoek()
    const r = await alsApp('/api/v1/agent/oauth/authorize/decision', IK, {
      verzoek,
      akkoord: true,
      redirect_uri: 'https://evil.test/steal',
      client_id: 'evil',
    })
    const { redirect } = await r.json()
    expect(new URL(redirect).origin).toBe('https://chat.example.com')
  })

  it('weigert een verzoek met een vervalste handtekening', async () => {
    const verzoek = await haalVerzoek()
    const [b64] = verzoek.split('.')
    const r = await alsApp('/api/v1/agent/oauth/authorize/decision', IK, { verzoek: `${b64}.vervalst`, akkoord: true })
    expect(r.status).toBe(400)
    expect((await r.json()).reden).toBe('handtekening_klopt_niet')
  })

  it('weigert een verzoek waarin de scope is opgerekt', async () => {
    const geheim = afgeleidGeheim(SLEUTELS.prive)
    const echt = leesVerzoekToken(await haalVerzoek(query({ scope: 'ovari:cycle' })), geheim, () => klok).verzoek
    // Opgerekt pakketje, ondertekend met een ANDER geheim: moet stuklopen.
    const vals = maakVerzoekToken(
      {
        client: { id: CLIENT, naam: 'x' },
        redirectUri: echt.redirect_uri,
        scope: 'ovari:cycle ovari:recovery ovari:profile',
        state: echt.state,
        codeChallenge: echt.code_challenge,
      },
      Buffer.from('een ander geheim'),
      () => klok
    )
    const r = await alsApp('/api/v1/agent/oauth/authorize/decision', IK, { verzoek: vals, akkoord: true })
    expect(r.status).toBe(400)
  })

  it('laat een verzoek verlopen', async () => {
    const verzoek = await haalVerzoek()
    klok += 11 * 60_000
    const r = await alsApp('/api/v1/agent/oauth/authorize/decision', IK, { verzoek, akkoord: true })
    expect((await r.json()).reden).toBe('verlopen')
  })

  it('zet iss in het antwoord, zodat een client de server kan herkennen', async () => {
    const verzoek = await haalVerzoek()
    const r = await alsApp('/api/v1/agent/oauth/authorize/decision', IK, { verzoek, akkoord: true })
    expect(new URL((await r.json()).redirect).searchParams.get('iss')).toBe(ISSUER)
  })

  it('weigert een resource-indicator die niet van ons is', async () => {
    const r = await fetch(basis + '/api/v1/agent/oauth/authorize?' + new URLSearchParams(query({ resource: 'https://andermans-mcp.test/mcp' })), { redirect: 'manual' })
    expect(r.status).toBe(302)
    expect(new URL(r.headers.get('location')).searchParams.get('error')).toBe('invalid_target')
  })
})

describe('het echte MCP-endpoint', () => {
  it('weigert zonder token met een WWW-Authenticate die de weg wijst', async () => {
    const { status, headers, body } = await mcp('tools/list', {}, null)
    expect(status).toBe(401)
    expect(headers.get('www-authenticate')).toMatch(/resource_metadata=/)
    expect(body.error.message).toBe('geen_token')
  })

  it('toont alleen de tools waarvoor het token scope heeft', async () => {
    const tokens = await koppel({ scope: 'ovari:cycle' })
    const { body } = await mcp('tools/list', {}, tokens.access_token)
    const namen = body.result.tools.map((t) => t.name)
    expect(namen).toEqual(['get_my_cycle_overview'])
  })

  it('voert een tool uit en geeft gestructureerde inhoud terug', async () => {
    const tokens = await koppel()
    const { body } = await mcp('tools/call', { name: 'get_my_cycle_overview', arguments: {} }, tokens.access_token)
    expect(body.result.structuredContent.cyclusdag).toBe(15)
    expect(auditRegels.at(-1)).toMatchObject({ tool: 'get_my_cycle_overview', resultaat: 'ok' })
  })

  it('stopt middenin zodra de toestemming wordt ingetrokken', async () => {
    const tokens = await koppel()
    expect((await mcp('tools/call', { name: 'get_my_cycle_overview', arguments: {} }, tokens.access_token)).body.result.structuredContent.cyclusdag).toBe(15)

    toestemmingRijen.set(IK, { granted_at: '2026-10-19T08:00:00.000Z', revoked_at: '2026-10-19T09:10:00.000Z', versie: '1.0' })

    const { body } = await mcp('tools/call', { name: 'get_my_cycle_overview', arguments: {} }, tokens.access_token)
    expect(body.error ? body.error.message : body.result.structuredContent.reden).toMatch(/ingetrokken/)
  })

  it('weigert GET op het MCP-endpoint', async () => {
    const r = await fetch(basis + '/api/v1/agent/oauth/mcp')
    expect(r.status).toBe(405)
  })
})

describe('koppelingen beheren in de app', () => {
  it('toont de actieve koppeling zonder ooit een token te tonen', async () => {
    await koppel()
    const r = await fetch(basis + '/api/v1/agent/oauth/koppelingen', { headers: { 'x-test-user': IK } })
    const body = await r.json()
    expect(body.koppelingen).toHaveLength(1)
    expect(body.koppelingen[0]).toMatchObject({ client_id: CLIENT, naam: 'ChatGPT (test)' })
    expect(JSON.stringify(body)).not.toMatch(/refresh|access_token|eyJ/)
  })

  it('toont niets van een andere gebruiker', async () => {
    await koppel()
    const body = await (await fetch(basis + '/api/v1/agent/oauth/koppelingen', { headers: { 'x-test-user': IEMAND_ANDERS } })).json()
    expect(body.koppelingen).toHaveLength(0)
  })

  it('trekt een koppeling in, waarna verversen stukloopt', async () => {
    const tokens = await koppel()
    await alsApp('/api/v1/agent/oauth/koppelingen/intrekken', IK, { client_id: CLIENT })
    const r = await fetch(basis + '/api/v1/agent/oauth/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: tokens.refresh_token, client_id: CLIENT }),
    })
    expect(r.status).toBe(400)
    expect(auditRegels.at(-1).resultaat).toBe('toestemming_ingetrokken')
  })
})

describe('robuustheid', () => {
  it('weigert te serveren als het auditlog niet kan schrijven (fail-closed, fase 4)', async () => {
    poolFouten.audit = true
    const tokens = await koppel()
    const r = await fetch(basis + '/api/v1/agent/oauth/mcp/tools/get_my_cycle_overview', {
      method: 'POST',
      headers: { authorization: `Bearer ${tokens.access_token}` },
    })
    expect(r.status).toBe(503)
    expect((await r.json()).reden).toBe('audit_niet_beschikbaar')
  })

  it('begrenst het tokenendpoint', async () => {
    const pogingen = []
    for (let i = 0; i < 35; i++) {
      pogingen.push(
        fetch(basis + '/api/v1/agent/oauth/token', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ grant_type: 'authorization_code', code: 'fout', client_id: CLIENT, redirect_uri: REDIRECT, code_verifier: verifier }),
        })
      )
    }
    const statussen = (await Promise.all(pogingen)).map((r) => r.status)
    expect(statussen).toContain(429)
  })
})
