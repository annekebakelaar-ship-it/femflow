#!/usr/bin/env node
// Rooktest voor een ECHTE ChatGPT-koppeling op een publieke testomgeving.
//
// Dit script doet alles wat zonder mens te doen is: ontdekking, consistentie
// van issuer, audience, JWKS en scopes, de 401-uitdaging, en de weigeringen
// die een aanvaller zou proberen. Wat een mens moet doen (inloggen, op
// akkoord drukken, de connector in ChatGPT aanmaken) wordt aan het eind als
// stappenlijst afgedrukt.
//
// Er zijn GEEN geheimen voor nodig en er worden geen gegevens gewijzigd.
//
// Gebruik:
//   node agent/scripts/smoke-chatgpt.mjs https://ovari-test-api.example.com
//
// Exitcode 0 = klaar voor de handmatige stappen, 1 = eerst repareren.

const basis = (process.argv[2] || '').replace(/\/$/, '')
if (!basis) {
  console.error('Geef het publieke adres van de testomgeving mee, bijvoorbeeld:')
  console.error('  node agent/scripts/smoke-chatgpt.mjs https://ovari-test-api.example.com')
  process.exit(2)
}

const CHATGPT_CLIENT = 'https://chatgpt.com/oauth/client.json'
const CHATGPT_REDIRECT = 'https://chatgpt.com/connector_platform_oauth_redirect'

let geslaagd = 0
let gezakt = 0
const regels = []

function meld(naam, goed, uitleg = '') {
  regels.push(`${goed ? 'ok  ' : 'FOUT'}  ${naam}${uitleg ? ` — ${uitleg}` : ''}`)
  goed ? geslaagd++ : gezakt++
}

async function haal(pad, opties = {}) {
  try {
    const r = await fetch(basis + pad, { redirect: 'manual', ...opties })
    const tekst = await r.text()
    let json = null
    try { json = JSON.parse(tekst) } catch { /* geen JSON, mag */ }
    return { status: r.status, headers: r.headers, json, tekst }
  } catch (err) {
    return { status: 0, fout: err.message, headers: new Headers(), json: null, tekst: '' }
  }
}

// 1. Ontdekking: authorization server
const as = await haal('/.well-known/oauth-authorization-server')
meld('authorization server metadata bereikbaar', as.status === 200, `status ${as.status}`)
if (as.json) {
  meld('issuer is precies dit adres', as.json.issuer === basis, `${as.json.issuer}`)
  meld('alleen S256 als PKCE-methode', JSON.stringify(as.json.code_challenge_methods_supported) === JSON.stringify(['S256']))
  meld('geen implicit of password grant', !['implicit', 'password'].some((g) => (as.json.grant_types_supported || []).includes(g)))
  meld('CIMD aangekondigd voor ChatGPT', as.json.client_id_metadata_document_supported === true)
  meld('endpoints staan onder de issuer', [as.json.authorization_endpoint, as.json.token_endpoint, as.json.jwks_uri].every((u) => typeof u === 'string' && u.startsWith(basis)))
}

// 2. Ontdekking: protected resource
const pr = await haal('/.well-known/oauth-protected-resource')
meld('protected resource metadata bereikbaar', pr.status === 200, `status ${pr.status}`)
if (pr.json && as.json) {
  meld('resource wijst naar deze authorization server', (pr.json.authorization_servers || []).includes(as.json.issuer))
  meld('resource is het MCP-endpoint', typeof pr.json.resource === 'string' && pr.json.resource.endsWith('/api/v1/agent/oauth/mcp'), pr.json.resource)
  meld('drie scopes aangeboden', (pr.json.scopes_supported || []).length === 3, (pr.json.scopes_supported || []).join(' '))
}

// 3. JWKS
const jwks = await haal('/api/v1/agent/oauth/jwks.json')
meld('JWKS bereikbaar', jwks.status === 200, `status ${jwks.status}`)
if (jwks.json) {
  const sleutels = jwks.json.keys || []
  meld('minstens een RS256-sleutel', sleutels.some((k) => k.alg === 'RS256' && k.kty === 'RSA'))
  meld('geen prive-materiaal in JWKS', !sleutels.some((k) => k.d || k.p || k.q), sleutels.map((k) => k.kid).join(', '))
}

// 4. De 401-uitdaging op het MCP-endpoint
const mcp = await haal('/api/v1/agent/oauth/mcp', {
  method: 'POST',
  headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
})
meld('MCP zonder token geeft 401', mcp.status === 401, `status ${mcp.status}`)
meld('WWW-Authenticate wijst naar de metadata', /resource_metadata=/.test(mcp.headers.get('www-authenticate') || ''))
meld('geen gegevens in het 401-antwoord', !/cyclusdag|hrv|slaap/i.test(mcp.tekst))

// 5. Autorisatie: de weigeringen die ertoe doen
const basisQuery = {
  response_type: 'code',
  client_id: CHATGPT_CLIENT,
  redirect_uri: CHATGPT_REDIRECT,
  scope: 'ovari:cycle',
  state: 'rooktest-state-0123456789',
  code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
  code_challenge_method: 'S256',
  resource: pr.json?.resource || `${basis}/api/v1/agent/oauth/mcp`,
}

const vreemdeRedirect = await haal('/api/v1/agent/oauth/authorize?' + new URLSearchParams({ ...basisQuery, redirect_uri: 'https://evil.example.com/steal' }))
meld('vreemde redirect_uri wordt geweigerd zonder door te sturen', vreemdeRedirect.status === 400, `status ${vreemdeRedirect.status}`)

const plain = await haal('/api/v1/agent/oauth/authorize?' + new URLSearchParams({ ...basisQuery, code_challenge_method: 'plain' }))
meld('PKCE plain wordt geweigerd', plain.status === 302 && /error=invalid_request/.test(plain.headers.get('location') || ''))

const vreemdeResource = await haal('/api/v1/agent/oauth/authorize?' + new URLSearchParams({ ...basisQuery, resource: 'https://andermans-mcp.example/mcp' }))
meld('resource van een andere server wordt geweigerd', vreemdeResource.status === 302 && /error=invalid_target/.test(vreemdeResource.headers.get('location') || ''))

const echt = await haal('/api/v1/agent/oauth/authorize?' + new URLSearchParams(basisQuery))
const cimdWerkt = echt.status === 200 && echt.json?.verzoek
meld('ChatGPT als CIMD-client wordt herkend', Boolean(cimdWerkt), cimdWerkt ? echt.json.client.naam : `status ${echt.status} (staat chatgpt.com in AGENT_OAUTH_CIMD_HOSTS?)`)

const browser = await haal('/api/v1/agent/oauth/authorize?' + new URLSearchParams(basisQuery), { headers: { accept: 'text/html' } })
meld('browser wordt naar het toestemmingsscherm gestuurd', browser.status === 302 && /\/agent\/toestemming\?verzoek=/.test(browser.headers.get('location') || ''))

// 6. Token-endpoint weigert onzin
const token = await haal('/api/v1/agent/oauth/token', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ grant_type: 'authorization_code', code: 'bestaat-niet', client_id: CHATGPT_CLIENT, redirect_uri: CHATGPT_REDIRECT, code_verifier: 'x'.repeat(43) }),
})
meld('onbekende code levert invalid_grant', token.status === 400 && token.json?.error === 'invalid_grant', token.json?.error || `status ${token.status}`)

// ---- Uitslag ---------------------------------------------------------------
console.log(`\nRooktest tegen ${basis}\n`)
for (const r of regels) console.log('  ' + r)
console.log(`\n${geslaagd} goed, ${gezakt} fout.`)

if (gezakt === 0) {
  console.log(`
Wat er hierna met de hand moet, in deze volgorde:

  1. Log in de testomgeving in als FICTIEVE testgebruiker (nooit een echt account).
  2. Zet in die app de agent-toestemming aan (Profiel, toestemming voor assistenten).
  3. Maak in ChatGPT een connector aan die wijst naar:
       ${basis}/api/v1/agent/oauth/mcp
     ChatGPT vindt de rest zelf via de well-known-adressen.
  4. Doorloop de koppeling. Je hoort het Ovari-toestemmingsscherm te zien met
     de clientnaam en de drie scopes.
  5. Vraag in ChatGPT iets wat een tool nodig heeft. Verwacht gegevens van de
     testgebruiker, nooit van iemand anders.
  6. Trek de koppeling in via Profiel, Koppelingen. Vraag het daarna opnieuw:
     ChatGPT hoort nu een weigering te krijgen, geen oude gegevens.
  7. Controleer het auditlog:
       SELECT tijdstip, gebruiker, tool, toestemming, resultaat
       FROM femflow_agent_audit ORDER BY tijdstip DESC LIMIT 20;
     Er horen alleen deze vijf velden in te staan, en geen inhoud.
`)
}
process.exit(gezakt > 0 ? 1 : 0)
