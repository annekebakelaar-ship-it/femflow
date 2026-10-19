// Minimale RS256-ondertekening en -verificatie voor de toegangstokens van de
// persoonlijke MCP-laag. Geen afhankelijkheid: node:crypto kan dit.
//
// WAAROM RS256 EN NIET HET APP-JWT:
// Het app-JWT (HS256 met JWT_SECRET, 30 dagen geldig, volledige toegang tot
// de API) mag nooit aan ChatGPT gegeven worden. Dat zou betekenen dat een
// externe partij een sleutel in handen heeft waarmee alles kan wat de app
// kan, zonder scope, zonder eigen verlooptijd en zonder intrekbaarheid.
// Deze tokens zijn een aparte soort: eigen sleutelpaar, eigen uitgever, een
// audience die alleen de MCP-laag accepteert, scopes per tool, korte
// levensduur en een jti waarmee ze in te trekken zijn.
//
// De verificatiekant leest alleen de PUBLIEKE sleutel. Draait de MCP-laag
// ooit als eigen dienst, dan haalt die de sleutel op via /oauth/jwks.json en
// is er geen gedeeld geheim tussen de twee.

import { createPublicKey, createPrivateKey, sign as signeer, verify as verifieer, createHash } from 'crypto'

const HEADER_ALG = 'RS256'

function b64url(buf) {
  return Buffer.from(buf).toString('base64url')
}

function vanB64url(deel) {
  if (!/^[A-Za-z0-9_-]+$/.test(deel)) throw new Error('ongeldige base64url')
  const bytes = Buffer.from(deel, 'base64url')
  if (bytes.toString('base64url') !== deel) throw new Error('ongeldige base64url')
  return bytes
}

/** Sleutel-id volgens de JWK-thumbprint-gedachte: stabiel en zonder geheim. */
export function sleutelId(publiekePem) {
  const jwk = createPublicKey(publiekePem).export({ format: 'jwk' })
  return createHash('sha256').update(`${jwk.n}.${jwk.e}`).digest('hex').slice(0, 16)
}

export function jwks(publiekePem) {
  const jwk = createPublicKey(publiekePem).export({ format: 'jwk' })
  return { keys: [{ ...jwk, kid: sleutelId(publiekePem), alg: HEADER_ALG, use: 'sig' }] }
}

export function maakToken(payload, priveSleutelPem) {
  const sleutel = createPrivateKey(priveSleutelPem)
  const header = { alg: HEADER_ALG, typ: 'JWT', kid: sleutelId(createPublicKey(sleutel).export({ type: 'spki', format: 'pem' })) }
  const basis = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`
  const handtekening = signeer('sha256', Buffer.from(basis), sleutel)
  return `${basis}.${b64url(handtekening)}`
}

/**
 * Controleert handtekening en vorm. Claims worden hier NIET inhoudelijk
 * gekeurd; dat doet hulpbron.js, zodat de regels op een plek staan.
 * Gooit bij elke twijfel.
 */
export function leesToken(token, publiekePem) {
  if (typeof token !== 'string') throw new Error('token ontbreekt')
  const delen = token.split('.')
  if (delen.length !== 3) throw new Error('token heeft niet drie delen')
  const [h, p, s] = delen

  const header = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(vanB64url(h)))
  // Alleen RS256. Zo kan niemand met alg:none of een HMAC-truc binnenkomen.
  if (header.alg !== HEADER_ALG || header.typ !== 'JWT') throw new Error('verkeerde header')

  const sleutel = createPublicKey(publiekePem)
  if (!verifieer('sha256', Buffer.from(`${h}.${p}`), sleutel, vanB64url(s))) {
    throw new Error('handtekening klopt niet')
  }

  const payload = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(vanB64url(p)))
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('payload is geen object')
  return payload
}
