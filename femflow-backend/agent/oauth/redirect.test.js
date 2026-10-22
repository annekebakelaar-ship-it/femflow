import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import express from 'express'
import { generateKeyPairSync, createHash } from 'crypto'

import { redirectPast, isLoopback } from './redirect.js'
import { keurDocument, maakCimdRegister, CIMD_FOUT } from './cimd.js'
import { maakOauthRouter } from './router.js'
import { geheugenOpslag } from './opslag.js'
import { maakAuditLogger } from '../audit.js'

// De twee echte documenten van OpenAI, letterlijk overgenomen zodat de test
// niet van het netwerk afhangt. Opgehaald op 22 oktober 2026.
const WEB_ID = 'https://chatgpt.com/oauth/client.json'
const WEB_DOC = {
  client_id: WEB_ID,
  client_uri: 'https://chatgpt.com/',
  redirect_uris: ['https://chatgpt.com/connector_platform_oauth_redirect'],
  token_endpoint_auth_method: 'private_key_jwt',
  token_endpoint_auth_methods_supported: ['none', 'private_key_jwt'],
  grant_types: ['authorization_code', 'refresh_token'],
  response_types: ['code'],
  client_name: 'ChatGPT',
  jwks_uri: 'https://chatgpt.com/oauth/jwks.json',
}

const CODEX_ID = 'https://chatgpt.com/oauth/codex/client.json'
const CODEX_DOC = {
  client_id: CODEX_ID,
  client_uri: 'https://chatgpt.com/codex',
  application_type: 'native',
  redirect_uris: ['http://127.0.0.1/callback', 'http://localhost/callback'],
  token_endpoint_auth_method: 'none',
  token_endpoint_auth_methods_supported: ['none'],
  grant_types: ['authorization_code', 'refresh_token'],
  response_types: ['code'],
  client_name: 'Codex',
}

describe('isLoopback', () => {
  it('herkent de adressen uit RFC 8252', () => {
    expect(isLoopback('http://127.0.0.1/callback')).toBe(true)
    expect(isLoopback('http://127.0.0.1:1455/callback')).toBe(true)
    expect(isLoopback('http://[::1]:8080/callback')).toBe(true)
    expect(isLoopback('http://localhost:3000/callback')).toBe(true)
  })

  it('trapt niet in adressen die erop lijken', () => {
    for (const vals of [
      'http://0.0.0.0:1234/callback',
      'http://127.0.0.1.evil.example/callback',
      'http://localhost.evil.example/callback',
      'http://127.1.1.1/callback',
      'https://127.0.0.1/callback', // https hoort via de gewone regel te gaan
      'http://user:pw@127.0.0.1/callback',
      'http://127.0.0.1/callback#fragment',
      'niet eens een url',
    ]) {
      expect(isLoopback(vals), vals).toBe(false)
    }
  })
})

describe('redirectPast', () => {
  const codex = CODEX_DOC.redirect_uris
  const web = WEB_DOC.redirect_uris

  it('laat elke poort toe op een geregistreerd loopback-adres', () => {
    expect(redirectPast(codex, 'http://127.0.0.1:1455/callback')).toBe(true)
    expect(redirectPast(codex, 'http://127.0.0.1:62999/callback')).toBe(true)
    expect(redirectPast(codex, 'http://localhost:1455/callback')).toBe(true)
    expect(redirectPast(codex, 'http://127.0.0.1/callback')).toBe(true)
  })

  it('eist hetzelfde pad, ook bij loopback', () => {
    expect(redirectPast(codex, 'http://127.0.0.1:1455/ander-pad')).toBe(false)
    expect(redirectPast(codex, 'http://127.0.0.1:1455/callback/extra')).toBe(false)
    expect(redirectPast(codex, 'http://127.0.0.1:1455/')).toBe(false)
  })

  it('eist dezelfde host: localhost en 127.0.0.1 zijn niet uitwisselbaar', () => {
    expect(redirectPast(['http://127.0.0.1/callback'], 'http://localhost:1455/callback')).toBe(false)
    expect(redirectPast(['http://localhost/callback'], 'http://127.0.0.1:1455/callback')).toBe(false)
  })

  it('weigert fragment, inloggegevens en een afwijkende query', () => {
    expect(redirectPast(codex, 'http://127.0.0.1:1455/callback#code')).toBe(false)
    expect(redirectPast(codex, 'http://kwaadaardig:wachtwoord@127.0.0.1:1455/callback')).toBe(false)
    expect(redirectPast(codex, 'http://127.0.0.1:1455/callback?extra=1')).toBe(false)
  })

  it('geeft https geen poortvrijheid', () => {
    expect(redirectPast(web, 'https://chatgpt.com/connector_platform_oauth_redirect')).toBe(true)
    expect(redirectPast(web, 'https://chatgpt.com:8443/connector_platform_oauth_redirect')).toBe(false)
    expect(redirectPast(web, 'https://chatgpt.com/ander_pad')).toBe(false)
    expect(redirectPast(web, 'https://evil.example/connector_platform_oauth_redirect')).toBe(false)
  })

  it('vertrouwt een loopback-adres niet als de client er geen heeft geregistreerd', () => {
    expect(redirectPast(web, 'http://127.0.0.1:1455/callback')).toBe(false)
    expect(redirectPast(web, 'http://localhost/callback')).toBe(false)
  })

  it('weigert rommel', () => {
    expect(redirectPast(codex, '')).toBe(false)
    expect(redirectPast(codex, undefined)).toBe(false)
    expect(redirectPast([], 'http://127.0.0.1:1455/callback')).toBe(false)
  })
})

describe('CIMD-keuring van de twee echte ChatGPT-clients', () => {
  it('accepteert de webclient zoals voorheen', () => {
    const uit = keurDocument(WEB_ID, WEB_DOC)
    expect(uit.ok).toBe(true)
    expect(uit.client).toMatchObject({ naam: 'ChatGPT', authMethode: 'none', native: false })
  })

  it('accepteert de Codex-client met loopback-redirects', () => {
    const uit = keurDocument(CODEX_ID, CODEX_DOC)
    expect(uit.ok).toBe(true)
    expect(uit.client).toMatchObject({ naam: 'Codex', authMethode: 'none', native: true })
    expect(uit.client.redirectUris).toEqual(['http://127.0.0.1/callback', 'http://localhost/callback'])
  })

  it('geeft een NIET-native document geen loopback-ruimte', () => {
    const zonderNative = { ...CODEX_DOC, application_type: undefined }
    expect(keurDocument(CODEX_ID, zonderNative).fout).toBe(CIMD_FOUT.VREEMDE_REDIRECT)
  })

  it('weigert een native document dat buiten loopback wil terugkomen', () => {
    for (const uri of [
      'http://evil.example/callback',
      'http://0.0.0.0:1234/callback',
      'http://127.0.0.1.evil.example/callback',
      'http://127.0.0.1/callback#frag',
      'http://beheerder:geheim@127.0.0.1/callback',
    ]) {
      const doc = { ...CODEX_DOC, redirect_uris: [uri] }
      expect(keurDocument(CODEX_ID, doc).fout, uri).toBe(CIMD_FOUT.VREEMDE_REDIRECT)
    }
  })

  it('blijft eisen dat het document naar zichzelf verwijst', () => {
    const doc = { ...CODEX_DOC, client_id: WEB_ID }
    expect(keurDocument(CODEX_ID, doc).fout).toBe(CIMD_FOUT.CLIENT_ID_KLOPT_NIET)
  })

  it('haalt alleen op bij een host uit de allowlist', async () => {
    const register = maakCimdRegister({
      toegestaneHosts: ['chatgpt.com'],
      fetchImpl: async () => ({ ok: true, text: async () => JSON.stringify(CODEX_DOC) }),
      waarschuw: () => {},
    })
    expect((await register.vind(CODEX_ID)).naam).toBe('Codex')
    expect(await register.vind('https://evil.example/oauth/codex/client.json')).toBeNull()
  })
})

describe('de hele stroom met de Codex-client', () => {
  const IK = '11111111-1111-4111-8111-111111111111'
  const ISSUER = 'https://femflow-test.invalid'
  const RESOURCE = `${ISSUER}/api/v1/agent/oauth/mcp`
  const verifier = 'a'.repeat(43)
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const SLEUTELS = { prive: privateKey.export({ type: 'pkcs8', format: 'pem' }), publiek: publicKey.export({ type: 'spki', format: 'pem' }) }
  const KLOK = Date.parse('2026-10-22T09:00:00.000Z')

  let server, basis, opslag

  const pool = {
    async query(sql) {
      if (sql.includes('FROM femflow_agent_consent')) {
        return { rows: [{ granted_at: '2026-10-22T08:00:00.000Z', revoked_at: null, versie: '1.0' }] }
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

  beforeEach(async () => {
    opslag = geheugenOpslag()
    const app = express()
    app.use(express.json())
    const authenticateToken = (req, res, next) => { req.userId = IK; next() }
    app.use('/api/v1/agent/oauth', maakOauthRouter({
      pool,
      authenticateToken,
      clients: maakCimdRegister({
        toegestaneHosts: ['chatgpt.com'],
        fetchImpl: async (url) => ({
          ok: true,
          text: async () => JSON.stringify(String(url).includes('/codex/') ? CODEX_DOC : WEB_DOC),
        }),
        waarschuw: () => {},
      }),
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

  const vraag = (redirect, extra = {}) =>
    new URLSearchParams({
      client_id: CODEX_ID, redirect_uri: redirect, response_type: 'code',
      state: 'codex-state-0123456789', code_challenge: challenge, code_challenge_method: 'S256',
      scope: 'ovari:cycle', resource: RESOURCE, ...extra,
    })

  it('accepteert Codex met een willekeurige poort en levert een werkend token', async () => {
    const redirect = 'http://127.0.0.1:1455/callback'
    const autorisatie = await (await fetch(`${basis}/api/v1/agent/oauth/authorize?` + vraag(redirect))).json()
    expect(autorisatie.ok).toBe(true)
    expect(autorisatie.client.naam).toBe('Codex')

    const beslissing = await (await fetch(`${basis}/api/v1/agent/oauth/authorize/decision`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ verzoek: autorisatie.verzoek, akkoord: true }),
    })).json()
    const terug = new URL(beslissing.redirect)
    expect(terug.origin).toBe('http://127.0.0.1:1455')
    const code = terug.searchParams.get('code')
    expect(code).toBeTruthy()

    const tokens = await fetch(`${basis}/api/v1/agent/oauth/token`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ grant_type: 'authorization_code', code, client_id: CODEX_ID, redirect_uri: redirect, code_verifier: verifier }),
    })
    expect(tokens.status).toBe(200)
    const body = await tokens.json()
    expect(body.token_type).toBe('Bearer')

    const tool = await fetch(`${basis}/api/v1/agent/oauth/mcp/tools/get_my_cycle_overview`, {
      method: 'POST', headers: { authorization: `Bearer ${body.access_token}` },
    })
    expect(tool.status).toBe(200)
    expect((await tool.json()).resultaat.cyclusdag).toBe(15)
  })

  it('weigert een redirect die niet geregistreerd is, ook al lijkt hij op loopback', async () => {
    for (const vals of ['http://127.0.0.1:1455/steal', 'http://0.0.0.0:1455/callback', 'https://evil.example/callback']) {
      const r = await fetch(`${basis}/api/v1/agent/oauth/authorize?` + vraag(vals), { redirect: 'manual' })
      expect(r.status, vals).toBe(400)
      expect((await r.json()).error).toBe('invalid_request')
    }
  })

  it('weigert de code als bij het inwisselen een ander pad wordt opgegeven', async () => {
    const redirect = 'http://127.0.0.1:1455/callback'
    const autorisatie = await (await fetch(`${basis}/api/v1/agent/oauth/authorize?` + vraag(redirect))).json()
    const beslissing = await (await fetch(`${basis}/api/v1/agent/oauth/authorize/decision`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ verzoek: autorisatie.verzoek, akkoord: true }),
    })).json()
    const code = new URL(beslissing.redirect).searchParams.get('code')

    const r = await fetch(`${basis}/api/v1/agent/oauth/token`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ grant_type: 'authorization_code', code, client_id: CODEX_ID, redirect_uri: 'http://127.0.0.1:1455/anders', code_verifier: verifier }),
    })
    expect(r.status).toBe(400)
    expect((await r.json()).error).toBe('invalid_grant')
  })

  it('laat bij het inwisselen alleen de poort verschillen', async () => {
    const redirect = 'http://127.0.0.1:1455/callback'
    const autorisatie = await (await fetch(`${basis}/api/v1/agent/oauth/authorize?` + vraag(redirect))).json()
    const beslissing = await (await fetch(`${basis}/api/v1/agent/oauth/authorize/decision`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ verzoek: autorisatie.verzoek, akkoord: true }),
    })).json()
    const code = new URL(beslissing.redirect).searchParams.get('code')

    const r = await fetch(`${basis}/api/v1/agent/oauth/token`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ grant_type: 'authorization_code', code, client_id: CODEX_ID, redirect_uri: 'http://127.0.0.1:1456/callback', code_verifier: verifier }),
    })
    expect(r.status).toBe(200)
  })

  it('blijft PKCE eisen, ook voor de native client', async () => {
    const redirect = 'http://127.0.0.1:1455/callback'
    const zonderPkce = await fetch(
      `${basis}/api/v1/agent/oauth/authorize?` + vraag(redirect, { code_challenge_method: 'plain' }),
      { redirect: 'manual' }
    )
    expect(zonderPkce.status).toBe(302)
    expect(zonderPkce.headers.get('location')).toMatch(/error=invalid_request/)

    const autorisatie = await (await fetch(`${basis}/api/v1/agent/oauth/authorize?` + vraag(redirect))).json()
    const beslissing = await (await fetch(`${basis}/api/v1/agent/oauth/authorize/decision`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ verzoek: autorisatie.verzoek, akkoord: true }),
    })).json()
    const code = new URL(beslissing.redirect).searchParams.get('code')

    const verkeerd = await fetch(`${basis}/api/v1/agent/oauth/token`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ grant_type: 'authorization_code', code, client_id: CODEX_ID, redirect_uri: redirect, code_verifier: 'b'.repeat(43) }),
    })
    expect(verkeerd.status).toBe(400)
  })

  it('houdt de code eenmalig', async () => {
    const redirect = 'http://127.0.0.1:1455/callback'
    const autorisatie = await (await fetch(`${basis}/api/v1/agent/oauth/authorize?` + vraag(redirect))).json()
    const beslissing = await (await fetch(`${basis}/api/v1/agent/oauth/authorize/decision`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ verzoek: autorisatie.verzoek, akkoord: true }),
    })).json()
    const code = new URL(beslissing.redirect).searchParams.get('code')
    const inwisselen = () => fetch(`${basis}/api/v1/agent/oauth/token`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ grant_type: 'authorization_code', code, client_id: CODEX_ID, redirect_uri: redirect, code_verifier: verifier }),
    })
    expect((await inwisselen()).status).toBe(200)
    expect((await inwisselen()).status).toBe(400)
  })

  it('werkt nog steeds voor de webclient, met zijn eigen https-redirect', async () => {
    const q = vraag('https://chatgpt.com/connector_platform_oauth_redirect', { client_id: WEB_ID })
    const autorisatie = await (await fetch(`${basis}/api/v1/agent/oauth/authorize?` + q)).json()
    expect(autorisatie.ok).toBe(true)
    expect(autorisatie.client.naam).toBe('ChatGPT')
  })
})
