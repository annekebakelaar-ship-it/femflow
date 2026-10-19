#!/usr/bin/env node
// Controleert de OAuth- en MCP-configuratie van een omgeving VOORDAT je hem
// aanzet. Leest alleen de omgeving, raakt niets aan, en drukt NOOIT
// sleutelmateriaal of geheimen af: alleen lengtes, kid's en ja/nee.
//
// Gebruik:
//   node agent/scripts/config-check.mjs
//   AGENT_OAUTH_ISSUER=... node agent/scripts/config-check.mjs
//
// Exitcode 0 = klaar om aan te zetten, 1 = er moet iets gebeuren.

import { createPublicKey, createPrivateKey } from 'node:crypto'
import { sleutelId } from '../oauth/jwt.js'
import { clientsUitOmgeving } from '../oauth/clients.js'
import { hostsUitOmgeving } from '../oauth/cimd.js'
import { authorizationServerMetadata, protectedResourceMetadata, SCOPES } from '../oauth/metadata.js'

const env = process.env
const bevindingen = []
const ok = (t) => bevindingen.push({ niveau: 'ok', t })
const let_op = (t) => bevindingen.push({ niveau: 'let op', t })
const fout = (t) => bevindingen.push({ niveau: 'FOUT', t })

// ---- Vlaggen ---------------------------------------------------------------
const agentAan = String(env.AGENT_ENABLED || '').toLowerCase() === 'true'
const oauthAan = String(env.AGENT_OAUTH_ENABLED || '').toLowerCase() === 'true'
bevindingen.push({ niveau: 'info', t: `AGENT_ENABLED=${agentAan} AGENT_OAUTH_ENABLED=${oauthAan}` })
if (oauthAan && !agentAan) fout('AGENT_OAUTH_ENABLED staat aan terwijl AGENT_ENABLED uit staat: de laag wordt dan niet gemonteerd')

// ---- Issuer en resource ----------------------------------------------------
const issuer = env.AGENT_OAUTH_ISSUER || ''
const resource = env.AGENT_OAUTH_RESOURCE || ''

function urlOf(naam, waarde) {
  try {
    const u = new URL(waarde)
    if (u.protocol !== 'https:' && u.hostname !== 'localhost') {
      fout(`${naam} moet https zijn (nu ${u.protocol})`)
      return null
    }
    return u
  } catch {
    fout(`${naam} ontbreekt of is geen geldige URL`)
    return null
  }
}

const issuerUrl = urlOf('AGENT_OAUTH_ISSUER', issuer)
const resourceUrl = urlOf('AGENT_OAUTH_RESOURCE', resource)

if (issuer.endsWith('/')) fout('AGENT_OAUTH_ISSUER mag geen slash op het eind hebben: clients vergelijken letterlijk')
if (issuerUrl && resourceUrl) {
  if (!resource.startsWith(issuer)) {
    let_op('De resource staat niet onder de issuer. Dat mag, maar controleer dan of beide kanten precies dezelfde waarden gebruiken')
  }
  if (!resource.endsWith('/api/v1/agent/oauth/mcp')) {
    let_op(`De resource wijst niet naar het MCP-endpoint (${resource}); de aud van elk token wordt hiermee vergeleken`)
  } else {
    ok('Resource wijst naar het MCP-endpoint en wordt de aud van elk token')
  }
}

// ---- Sleutels --------------------------------------------------------------
const prive = env.AGENT_OAUTH_PRIVATE_KEY || ''
const publiek = env.AGENT_OAUTH_PUBLIC_KEY || ''
const oud = (env.AGENT_OAUTH_PUBLIC_KEYS_OUD || '').split('|||').map((s) => s.trim()).filter(Boolean)

if (!prive || !publiek) {
  fout('Sleutelpaar ontbreekt (AGENT_OAUTH_PRIVATE_KEY en AGENT_OAUTH_PUBLIC_KEY)')
} else {
  try {
    const afgeleid = createPublicKey(createPrivateKey(prive)).export({ type: 'spki', format: 'pem' })
    const kidAfgeleid = sleutelId(afgeleid)
    const kidOpgegeven = sleutelId(publiek)
    if (kidAfgeleid !== kidOpgegeven) {
      fout(`De publieke sleutel hoort NIET bij de prive-sleutel (kid ${kidOpgegeven} tegen ${kidAfgeleid}). Elk token wordt dan geweigerd`)
    } else {
      ok(`Sleutelpaar hoort bij elkaar, kid ${kidAfgeleid}`)
    }
    for (const pem of oud) ok(`Oude publieke sleutel blijft geldig voor verificatie, kid ${sleutelId(pem)}`)
    if (oud.length > 1) let_op('Meer dan een oude sleutel: ruim op zodra de rotatie rond is')
  } catch (err) {
    fout(`Sleutels zijn niet te lezen: ${err.message}`)
  }
}
if (prive.includes('BEGIN RSA PRIVATE KEY')) {
  let_op('De prive-sleutel staat in PKCS#1-vorm; PKCS#8 (BEGIN PRIVATE KEY) is wat hier verwacht wordt')
}

// ---- Clients en redirects --------------------------------------------------
const statisch = clientsUitOmgeving(env, () => {})
const cimdHosts = hostsUitOmgeving(env)
if (statisch.aantal() === 0 && cimdHosts.length === 0) {
  fout('Geen enkele client: zonder AGENT_OAUTH_CLIENTS of AGENT_OAUTH_CIMD_HOSTS kan niemand koppelen')
} else {
  if (statisch.aantal()) ok(`${statisch.aantal()} vaste client(s) geregistreerd`)
  if (cimdHosts.length) ok(`CIMD toegestaan voor: ${cimdHosts.join(', ')}`)
  if (cimdHosts.some((h) => h.includes('*'))) fout('Een CIMD-host met een jokerteken is geen allowlist')
}

try {
  const lijst = JSON.parse(env.AGENT_OAUTH_CLIENTS || '[]')
  for (const c of lijst) {
    for (const uri of c.redirectUris || []) {
      const u = new URL(uri)
      if (u.protocol !== 'https:' && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') {
        fout(`redirect_uri is geen https: ${uri}`)
      }
    }
  }
} catch {
  if (env.AGENT_OAUTH_CLIENTS) fout('AGENT_OAUTH_CLIENTS is geen geldige JSON')
}

// ---- Auditzout -------------------------------------------------------------
if (!env.AGENT_AUDIT_SALT) {
  fout('AGENT_AUDIT_SALT ontbreekt: pseudoniemen zijn dan alleen binnen een processtart te koppelen')
} else if (env.AGENT_AUDIT_SALT.length < 32) {
  let_op(`AGENT_AUDIT_SALT is kort (${env.AGENT_AUDIT_SALT.length} tekens); 64 hex-tekens is een prima maat`)
} else {
  ok(`AGENT_AUDIT_SALT aanwezig (${env.AGENT_AUDIT_SALT.length} tekens)`)
}

// ---- Scheiding van omgevingen ---------------------------------------------
if (issuer.includes('femflow-api.onrender.com') && !issuer.includes('test')) {
  let_op('De issuer wijst naar de productie-API. Voor een eerste koppeling hoort hier een aparte testdienst te staan')
}
if (env.DATABASE_URL && env.DATABASE_URL.includes('neon.tech') && !/test|branch|dev/i.test(env.DATABASE_URL)) {
  let_op('DATABASE_URL lijkt de productiedatabase; gebruik voor de testkoppeling een eigen Neon-branch')
}

// ---- Ontdekkingsdocumenten -------------------------------------------------
if (issuerUrl && resourceUrl) {
  const as = authorizationServerMetadata({ issuer })
  const pr = protectedResourceMetadata({ resource, issuer })
  const problemen = []
  if (!as.code_challenge_methods_supported.includes('S256')) problemen.push('S256 ontbreekt')
  if (as.grant_types_supported.includes('implicit')) problemen.push('implicit grant staat aan')
  if (!pr.authorization_servers.includes(issuer)) problemen.push('protected resource wijst niet naar de issuer')
  if (pr.scopes_supported.length !== SCOPES.length) problemen.push('scopes lopen uiteen')
  if (problemen.length) fout(`Ontdekkingsdocumenten: ${problemen.join(', ')}`)
  else ok(`Ontdekkingsdocumenten kloppen (${SCOPES.length} scopes, alleen code grant, S256)`)
}

// ---- Uitslag ---------------------------------------------------------------
const breed = Math.max(...bevindingen.map((b) => b.niveau.length))
for (const b of bevindingen) console.log(`${b.niveau.padEnd(breed)}  ${b.t}`)

const fouten = bevindingen.filter((b) => b.niveau === 'FOUT').length
const letops = bevindingen.filter((b) => b.niveau === 'let op').length
console.log(`\n${fouten} fout(en), ${letops} aandachtspunt(en).`)
process.exit(fouten > 0 ? 1 : 0)
