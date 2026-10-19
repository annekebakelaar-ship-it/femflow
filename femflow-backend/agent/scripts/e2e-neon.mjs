#!/usr/bin/env node
// End-to-end-test van de hele persoonlijke agent tegen de ECHTE Neon-
// testdatabase: inloggen, toestemming, autorisatie, code inwisselen,
// tokenrotatie, scopecontrole, tooluitvoering, auditlog en intrekken.
//
// Alleen fictieve gegevens, alleen ovari_agent_test. Het sleutelpaar voor deze
// run wordt in het geheugen gemaakt en nergens weggeschreven; de
// connectiestring wordt alleen doorgegeven aan het kindproces en nooit
// afgedrukt.
//
// Gebruik:  node agent/scripts/e2e-neon.mjs

import { spawn } from 'node:child_process'
import { generateKeyPairSync, randomBytes, createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { verbindMetTestdatabase, testDatabaseUrl } from './lib/neon-poort.mjs'

const HIER = dirname(fileURLToPath(import.meta.url))
const SERVER = join(HIER, '..', '..', 'server.js')

const POORT = Number(process.env.E2E_PORT || 5120)
const BASIS = `http://127.0.0.1:${POORT}`
const CLIENT = 'ovari-e2e-testclient'
const REDIRECT = 'https://assistent.voorbeeld.invalid/callback'
const REVIEW_EMAIL = 'ovari-test-1@voorbeeld.invalid'
const REVIEW_CODE = '424242'
const EEN = '11111111-1111-4111-8111-111111111111'

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const SLEUTELS = {
  prive: privateKey.export({ type: 'pkcs8', format: 'pem' }),
  publiek: publicKey.export({ type: 'spki', format: 'pem' }),
}

const verifier = randomBytes(32).toString('base64url')
const challenge = createHash('sha256').update(verifier).digest('base64url')

let fouten = 0
const meld = (goed, tekst, extra = '') => {
  if (!goed) fouten++
  console.log(`  ${goed ? 'ok  ' : 'FOUT'}  ${tekst}${extra ? ` — ${extra}` : ''}`)
}

function startServer() {
  const kind = spawn(process.execPath, [SERVER], {
    env: {
      ...process.env,
      PORT: String(POORT),
      DATABASE_URL: testDatabaseUrl(),
      JWT_SECRET: 'e2e-testgeheim-minstens-32-tekens-lang',
      REVIEW_EMAIL,
      REVIEW_CODE,
      FRONTEND_URL: 'https://ovari-test.voorbeeld.invalid',
      AGENT_ENABLED: 'true',
      AGENT_OAUTH_ENABLED: 'true',
      AGENT_AUDIT_SALT: 'e2e-zout-' + randomBytes(16).toString('hex'),
      AGENT_OAUTH_ISSUER: BASIS,
      AGENT_OAUTH_RESOURCE: `${BASIS}/api/v1/agent/oauth/mcp`,
      AGENT_OAUTH_PRIVATE_KEY: SLEUTELS.prive,
      AGENT_OAUTH_PUBLIC_KEY: SLEUTELS.publiek,
      AGENT_OAUTH_CLIENTS: JSON.stringify([{ id: CLIENT, naam: 'E2E-testassistent', redirectUris: [REDIRECT] }]),
      NODE_ENV: 'test',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const regels = []
  kind.stdout.on('data', (d) => regels.push(String(d)))
  kind.stderr.on('data', (d) => regels.push(String(d)))
  return { kind, regels }
}

async function wachtOpServer(pogingen = 40) {
  for (let i = 0; i < pogingen; i++) {
    try {
      const r = await fetch(`${BASIS}/api/v1/health`)
      if (r.ok) return true
    } catch { /* nog niet op */ }
    await new Promise((k) => setTimeout(k, 250))
  }
  return false
}

const json = async (pad, opties = {}) => {
  const r = await fetch(BASIS + pad, opties)
  const tekst = await r.text()
  let body = null
  try { body = JSON.parse(tekst) } catch {
    const regel = tekst.split('\n').find((l) => l.startsWith('data: '))
    if (regel) body = JSON.parse(regel.slice(6))
  }
  return { status: r.status, headers: r.headers, body }
}

const metApp = (pad, token, body, methode = 'POST') =>
  json(pad, {
    method: methode,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

const mcp = (methode, params, token) =>
  json('/api/v1/agent/oauth/mcp', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: Math.floor(Math.random() * 1e6), method: methode, params }),
  })

async function koppel({ scope = 'ovari:cycle ovari:recovery ovari:profile', appToken }) {
  const q = new URLSearchParams({
    client_id: CLIENT, redirect_uri: REDIRECT, response_type: 'code',
    state: 'e2e-' + randomBytes(8).toString('hex'), code_challenge: challenge,
    code_challenge_method: 'S256', scope, resource: `${BASIS}/api/v1/agent/oauth/mcp`,
  })
  const autorisatie = await json('/api/v1/agent/oauth/authorize?' + q)
  const beslissing = await metApp('/api/v1/agent/oauth/authorize/decision', appToken, { verzoek: autorisatie.body?.verzoek, akkoord: true })
  const code = beslissing.body?.redirect ? new URL(beslissing.body.redirect).searchParams.get('code') : null
  const tokens = await json('/api/v1/agent/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ grant_type: 'authorization_code', code, client_id: CLIENT, redirect_uri: REDIRECT, code_verifier: verifier }),
  })
  return { autorisatie, beslissing, code, tokens: tokens.body, tokenStatus: tokens.status }
}

const db = await verbindMetTestdatabase()
const { kind, regels } = startServer()

try {
  if (!(await wachtOpServer())) {
    console.error('De server kwam niet op. Laatste uitvoer:\n' + regels.join(''))
    process.exit(1)
  }
  console.log(`\nServer draait op ${BASIS} tegen de Neon-testdatabase`)
  meld(regels.join('').includes('MCP-laag met OAuth ingeschakeld'), 'MCP-laag is gemonteerd')

  // ---- 0. Schone uitgangstoestand ------------------------------------------
  // Een vorige run (of een losse proef) kan toestemming of tokens hebben
  // laten staan. De test hoort van een bekende stand te beginnen, anders
  // meet hij de vorige keer mee. Dit raakt alleen de fictieve testgebruiker.
  await db.query('UPDATE femflow_agent_oauth_refresh SET ingetrokken = TRUE WHERE user_id = $1 AND ingetrokken = FALSE', [EEN])
  await db.query('DELETE FROM femflow_agent_oauth_codes WHERE user_id = $1', [EEN])
  await db.query('DELETE FROM femflow_agent_consent WHERE user_id = $1', [EEN])
  await db.query('DELETE FROM femflow_agent_audit')
  console.log('\n0. Uitgangstoestand hersteld voor de testgebruiker')

  // ---- 1. Inloggen ---------------------------------------------------------
  console.log('\n1. Inloggen als fictieve testgebruiker')
  await json('/api/v1/auth/request-code', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: REVIEW_EMAIL }) })
  const inlog = await json('/api/v1/auth/verify-code', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: REVIEW_EMAIL, code: REVIEW_CODE }),
  })
  const appToken = inlog.body?.token
  meld(Boolean(appToken), 'app-JWT ontvangen')
  meld(inlog.body?.userId === EEN, 'de login koppelt aan de geseede testgebruiker', inlog.body?.userId)

  // ---- 2. Toestemming ------------------------------------------------------
  console.log('\n2. Toestemming geven in de app')
  const statusVoor = await metApp('/api/v1/agent/status', appToken, undefined, 'GET')
  meld(statusVoor.body?.toestemming === false, 'nog geen toestemming')
  const gegeven = await metApp('/api/v1/agent/consent', appToken, {})
  meld(gegeven.body?.toestemming === true, 'toestemming gegeven')
  const inDb = await db.query('SELECT granted_at, revoked_at, versie FROM femflow_agent_consent WHERE user_id = $1', [EEN])
  meld(inDb.rows.length === 1 && inDb.rows[0].revoked_at === null, 'toestemming staat in Neon', inDb.rows[0]?.versie)

  // ---- 3. Koppelen ---------------------------------------------------------
  console.log('\n3. Autorisatie, toestemming en code inwisselen')
  const k = await koppel({ appToken })
  meld(k.autorisatie.status === 200 && Boolean(k.autorisatie.body?.verzoek), 'autorisatieverzoek gekeurd en ondertekend')
  meld(Boolean(k.code), 'autorisatiecode ontvangen')
  meld(k.tokenStatus === 200 && Boolean(k.tokens?.access_token), 'toegangstoken ontvangen', `geldig ${k.tokens?.expires_in}s`)
  const codeRij = await db.query('SELECT gebruikt, scope, consent_versie FROM femflow_agent_oauth_codes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [EEN])
  meld(codeRij.rows[0]?.gebruikt === true, 'de code staat in Neon als verbruikt')
  const refreshRij = await db.query('SELECT COUNT(*)::int AS n FROM femflow_agent_oauth_refresh WHERE user_id = $1 AND ingetrokken = FALSE', [EEN])
  meld(refreshRij.rows[0].n === 1, 'een geldig refreshtoken in Neon')

  // ---- 4. Tools ------------------------------------------------------------
  console.log('\n4. Persoonlijke tools via het MCP-protocol')
  const lijst = await mcp('tools/list', {}, k.tokens.access_token)
  meld(lijst.body?.result?.tools?.length === 3, 'drie tools zichtbaar', (lijst.body?.result?.tools || []).map((t) => t.name).join(', '))

  const cyclus = await mcp('tools/call', { name: 'get_my_cycle_overview', arguments: {} }, k.tokens.access_token)
  const c = cyclus.body?.result?.structuredContent
  meld(c?.cyclusdag === 15, 'cyclusdag 15 uit echte Neon-gegevens', `dag ${c?.cyclusdag}`)
  meld(c?.opgegeven_cycluslengte === 28, 'cycluslengte 28 (van Een, niet de 31 van Twee)')

  const herstel = await mcp('tools/call', { name: 'get_my_recovery_trend', arguments: {} }, k.tokens.access_token)
  const h = herstel.body?.result?.structuredContent
  meld(h?.beschikbaar === true && h?.nachten_gemeten > 0, 'hersteltrend berekend', `${h?.nachten_gemeten} nachten, HRV ${h?.richting?.hrv_ms}`)
  meld(h?.richting?.hrv_ms === 'hoger', 'de opgaande HRV-trend uit de seed wordt herkend')

  const profiel = await mcp('tools/call', { name: 'get_my_profile_context', arguments: {} }, k.tokens.access_token)
  const p = profiel.body?.result?.structuredContent
  meld(p?.leeftijd === 47, 'leeftijd uit de geboortedatum', String(p?.leeftijd))
  meld(JSON.stringify(p).includes('voorbeeld.invalid') === false, 'geen e-mailadres in het antwoord')
  meld(p?.gekoppelde_wearables?.[0]?.provider === 'oura', 'wearable-koppeling zichtbaar zonder token')

  // De koppeling hoort nu zichtbaar te zijn in de app. Dit moet VOOR de
  // replaytest hieronder, want die trekt met opzet alles in.
  const koppelingen = await metApp('/api/v1/agent/oauth/koppelingen', appToken, undefined, 'GET')
  meld((koppelingen.body?.koppelingen || []).length >= 1, 'koppeling zichtbaar in de app', JSON.stringify(koppelingen.body?.koppelingen?.[0]?.scopes))
  meld(!JSON.stringify(koppelingen.body).match(/refresh_token|access_token|eyJ/), 'geen tokens in het overzicht')

  // ---- 5. Scopecontrole ----------------------------------------------------
  console.log('\n5. Scopecontrole met een beperkt token')
  const smal = await koppel({ scope: 'ovari:cycle', appToken })
  const smalLijst = await mcp('tools/list', {}, smal.tokens.access_token)
  meld(smalLijst.body?.result?.tools?.length === 1, 'alleen de cyclustool zichtbaar')
  const geweigerd = await json('/api/v1/agent/oauth/mcp/tools/get_my_recovery_trend', {
    method: 'POST', headers: { authorization: `Bearer ${smal.tokens.access_token}` },
  })
  meld(geweigerd.status === 403 && geweigerd.body?.reden === 'scope_tekort', 'hersteltool geweigerd wegens scope')

  // ---- 6. Tokenrotatie -----------------------------------------------------
  console.log('\n6. Tokenrotatie')
  const ververst = await json('/api/v1/agent/oauth/token', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: k.tokens.refresh_token, client_id: CLIENT }),
  })
  meld(ververst.status === 200 && Boolean(ververst.body?.access_token), 'nieuw tokenpaar ontvangen')
  const nogmaals = await json('/api/v1/agent/oauth/token', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: k.tokens.refresh_token, client_id: CLIENT }),
  })
  meld(nogmaals.status === 400, 'het oude refreshtoken werkt niet meer')
  // Hergebruik van een refreshtoken is een inbraaksignaal: alles van deze
  // gebruiker hoort daarop ingetrokken te worden. Dat is hier zichtbaar.
  const naReplay = await db.query('SELECT COUNT(*)::int AS n FROM femflow_agent_oauth_refresh WHERE user_id = $1 AND ingetrokken = FALSE', [EEN])
  meld(naReplay.rows[0].n === 0, 'de replay heeft alle koppelingen van deze gebruiker ingetrokken')
  const nieuwWerkt = await mcp('tools/call', { name: 'get_my_cycle_overview', arguments: {} }, ververst.body.access_token)
  meld(nieuwWerkt.body?.result?.structuredContent?.cyclusdag === 15, 'het nieuwe token werkt')

  // ---- 7. Auditlog ---------------------------------------------------------
  console.log('\n7. Auditlog in Neon')
  const audit = await db.query('SELECT gebruiker, tool, toestemming, resultaat FROM femflow_agent_audit ORDER BY tijdstip')
  const codes = audit.rows.map((r) => r.resultaat)
  meld(audit.rows.length > 0, `${audit.rows.length} auditregels weggeschreven`)
  meld(codes.includes('ok'), 'geslaagde aanroepen gelogd')
  meld(codes.includes('geweigerd_scope'), 'scopeweigering gelogd')
  meld(codes.includes('toestemming_gegeven'), 'toestemming gelogd')
  const pseudoniemen = [...new Set(audit.rows.map((r) => r.gebruiker))]
  meld(pseudoniemen.every((p) => /^[0-9a-f]{16}$/.test(p)), 'alle gebruikers zijn gepseudonimiseerd', `${pseudoniemen.length} verschillende`)
  meld(!JSON.stringify(audit.rows).includes(EEN), 'geen echt user_id in het auditlog')
  const inhoud = await db.query("SELECT COUNT(*)::int AS n FROM femflow_agent_audit WHERE resultaat NOT IN ('ok','geweigerd_geen_token','geweigerd_geen_toestemming','geweigerd_ingetrokken','geweigerd_oude_versie','geweigerd_onbekende_tool','geweigerd_scope','geweigerd_limiet','serverfout','toestemming_gegeven','toestemming_ingetrokken')")
  meld(inhoud.rows[0].n === 0, 'alleen bekende resultaatcodes in het log')

  // ---- 8. Intrekken --------------------------------------------------------
  console.log('\n8. Intrekken werkt onmiddellijk')
  const ingetrokken = await metApp('/api/v1/agent/consent', appToken, undefined, 'DELETE')
  meld(ingetrokken.body?.toestemming === false, 'toestemming ingetrokken via de app')
  const naIntrekken = await mcp('tools/call', { name: 'get_my_cycle_overview', arguments: {} }, ververst.body.access_token)
  const weigering = naIntrekken.body?.result?.structuredContent?.reden || naIntrekken.body?.error?.message
  meld(weigering === 'toestemming_ingetrokken', 'de tool weigert meteen, met een nog geldig token', weigering)
  const restNa = await json('/api/v1/agent/oauth/mcp/tools/get_my_cycle_overview', {
    method: 'POST', headers: { authorization: `Bearer ${ververst.body.access_token}` },
  })
  meld(restNa.status === 403, 'ook de REST-route weigert')
  const auditNa = await db.query("SELECT COUNT(*)::int AS n FROM femflow_agent_audit WHERE resultaat IN ('toestemming_ingetrokken','geweigerd_ingetrokken')")
  meld(auditNa.rows[0].n >= 2, 'intrekken en de weigering daarna staan in het log')

  // ---- 9. Opruimen voor een volgende run ----------------------------------
  await db.query('UPDATE femflow_agent_oauth_refresh SET ingetrokken = TRUE WHERE user_id = $1', [EEN])
  console.log('\n  info  alle refreshtokens van de testgebruiker ingetrokken, toestemming staat uit')
} catch (err) {
  console.error('\nE2E afgebroken:', err.message)
  fouten++
} finally {
  kind.kill()
  await db.end()
}

const uitvoer = regels.join('')
if (/UnhandledPromiseRejection|Assertion failed/i.test(uitvoer)) {
  meld(false, 'de server heeft een onopgevangen fout gelogd')
}
console.log(`\n${fouten} fout(en).`)
process.exit(fouten > 0 ? 1 : 0)
