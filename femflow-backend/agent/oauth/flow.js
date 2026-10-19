// De OAuth 2.1-stroom zelf: autorisatieverzoek keuren, code uitgeven, code
// inwisselen, verversen en intrekken.
//
// Alles hier is injecteerbaar (opslag, klok, toevalsbron, ondertekening), zodat
// de hele stroom met mocks te testen is zonder database, zonder netwerk en
// zonder echte sleutels.
//
// KEUZES, EN WAAROM:
// - Alleen de authorization code grant met PKCE S256. Geen implicit, geen
//   password grant, geen tokens in een URL-fragment.
// - redirect_uri moet LETTERLIJK gelijk zijn aan een geregistreerde URI. Geen
//   wildcards, geen prefix-match, geen "localhost mag altijd".
// - De code is 60 seconden geldig, eenmalig, en wordt gehasht bewaard.
// - Een hergebruikte code trekt de hele grant in. Dat is de reactie die RFC
//   9700 voorschrijft: hergebruik betekent dat iemand meekeek.
// - Refreshtokens roteren bij elk gebruik en zijn gebonden aan client,
//   gebruiker en scope.
// - state wordt niet door ons verzonnen of gecontroleerd op inhoud: het is van
//   de client. Wij geven hem ONGEWIJZIGD terug, zodat de client zijn eigen
//   CSRF-controle kan doen, en weigeren een verzoek zonder state.

import { randomBytes } from 'crypto'
import { hashGeheim } from './opslag.js'
import { verifierPast, geldigeChallenge, METHODE } from './pkce.js'

export const CODE_GELDIG_MS = 60_000
export const TOKEN_GELDIG_MS = 10 * 60_000
export const REFRESH_GELDIG_MS = 30 * 24 * 60 * 60_000

export const FOUT = {
  INVALID_REQUEST: 'invalid_request',
  INVALID_CLIENT: 'invalid_client',
  INVALID_GRANT: 'invalid_grant',
  INVALID_SCOPE: 'invalid_scope',
  UNSUPPORTED_GRANT: 'unsupported_grant_type',
  ACCESS_DENIED: 'access_denied',
}

function nieuwGeheim() {
  return randomBytes(32).toString('base64url')
}

/**
 * Keurt een /authorize-verzoek. Geeft nooit een redirect terug naar een
 * onbekende URI: bij een fout in client_id of redirect_uri moet de fout op
 * onze eigen pagina blijven, anders is het een open redirect.
 */
export function valideerAutorisatieVerzoek({ query = {}, clients, scopes }) {
  const client = clients.vind(query.client_id)
  if (!client) {
    return { ok: false, naarClient: false, fout: FOUT.INVALID_CLIENT, beschrijving: 'onbekende client_id' }
  }
  if (!query.redirect_uri || !client.redirectUris.includes(query.redirect_uri)) {
    return { ok: false, naarClient: false, fout: FOUT.INVALID_REQUEST, beschrijving: 'redirect_uri niet geregistreerd' }
  }

  // Vanaf hier mag een fout wel naar de client terug, want de URI is vertrouwd.
  const terug = (fout, beschrijving) => ({
    ok: false,
    naarClient: true,
    redirectUri: query.redirect_uri,
    state: typeof query.state === 'string' ? query.state : null,
    fout,
    beschrijving,
  })

  if (query.response_type !== 'code') return terug(FOUT.INVALID_REQUEST, 'alleen response_type=code')
  if (typeof query.state !== 'string' || query.state.length < 8 || query.state.length > 512) {
    return terug(FOUT.INVALID_REQUEST, 'state ontbreekt of heeft een onwaarschijnlijke lengte')
  }
  if (query.code_challenge_method !== METHODE) return terug(FOUT.INVALID_REQUEST, 'alleen code_challenge_method=S256')
  if (!geldigeChallenge(query.code_challenge)) return terug(FOUT.INVALID_REQUEST, 'ongeldige code_challenge')

  const gevraagd = String(query.scope || '').split(' ').filter(Boolean)
  if (gevraagd.length === 0) return terug(FOUT.INVALID_SCOPE, 'scope is verplicht')
  const onbekend = gevraagd.filter((s) => !scopes.includes(s))
  if (onbekend.length > 0) return terug(FOUT.INVALID_SCOPE, `onbekende scope: ${onbekend.join(' ')}`)
  const tevaak = new Set(gevraagd).size !== gevraagd.length
  if (tevaak) return terug(FOUT.INVALID_SCOPE, 'dubbele scope')

  return {
    ok: true,
    client,
    redirectUri: query.redirect_uri,
    state: query.state,
    codeChallenge: query.code_challenge,
    scope: gevraagd.join(' '),
  }
}

/**
 * Geeft een code uit NADAT de gebruiker is ingelogd en akkoord heeft gegeven.
 * De code is gebonden aan haar user_id; er is geen pad waarlangs een client
 * een ander user_id kan meegeven.
 */
export async function geefCodeUit({ opslag, verzoek, userId, consentVersie, nu = () => Date.now(), geheim = nieuwGeheim }) {
  if (!userId) throw new TypeError('geefCodeUit vereist een ingelogde gebruiker')
  const code = geheim()
  await opslag.bewaarCode(hashGeheim(code), {
    userId,
    clientId: verzoek.client.id,
    redirectUri: verzoek.redirectUri,
    scope: verzoek.scope,
    codeChallenge: verzoek.codeChallenge,
    consentVersie,
    vervaltOp: nu() + CODE_GELDIG_MS,
  })
  return code
}

function tokenPayload({ rij, issuer, resource, nu }) {
  const uitgegeven = Math.floor(nu() / 1000)
  return {
    iss: issuer,
    aud: resource,
    sub: rij.userId,
    client_id: rij.clientId,
    scope: rij.scope,
    iat: uitgegeven,
    exp: uitgegeven + TOKEN_GELDIG_MS / 1000,
    jti: randomBytes(16).toString('hex'),
    consent_version: rij.consentVersie,
  }
}

/** Code inwisselen voor tokens. */
export async function wisselCodeIn({
  opslag, clients, body = {}, issuer, resource, tekenToken,
  nu = () => Date.now(), geheim = nieuwGeheim,
}) {
  const client = clients.vind(body.client_id)
  if (!client) return { ok: false, fout: FOUT.INVALID_CLIENT }
  if (!body.code) return { ok: false, fout: FOUT.INVALID_GRANT }

  const hash = hashGeheim(body.code)
  const rij = await opslag.leesCode(hash)
  if (!rij) return { ok: false, fout: FOUT.INVALID_GRANT }

  if (rij.gebruikt) {
    // Hergebruik: de code lekte. Alles van deze gebruiker gaat eruit.
    await opslag.trekAllesInVoorGebruiker(rij.userId)
    return { ok: false, fout: FOUT.INVALID_GRANT, hergebruik: true }
  }
  await opslag.markeerCodeGebruikt(hash)

  if (rij.vervaltOp <= nu()) return { ok: false, fout: FOUT.INVALID_GRANT, verlopen: true }
  if (rij.clientId !== client.id) return { ok: false, fout: FOUT.INVALID_GRANT }
  if (rij.redirectUri !== body.redirect_uri) return { ok: false, fout: FOUT.INVALID_GRANT }
  if (!verifierPast(body.code_verifier, rij.codeChallenge)) return { ok: false, fout: FOUT.INVALID_GRANT }

  return geefTokensUit({ opslag, rij, issuer, resource, tekenToken, nu, geheim })
}

async function geefTokensUit({ opslag, rij, issuer, resource, tekenToken, nu, geheim }) {
  const toegang = tekenToken(tokenPayload({ rij, issuer, resource, nu }))
  const ververs = geheim()
  await opslag.bewaarRefresh(hashGeheim(ververs), {
    userId: rij.userId,
    clientId: rij.clientId,
    scope: rij.scope,
    consentVersie: rij.consentVersie,
    vervaltOp: nu() + REFRESH_GELDIG_MS,
  })
  return {
    ok: true,
    userId: rij.userId,
    antwoord: {
      access_token: toegang,
      token_type: 'Bearer',
      expires_in: TOKEN_GELDIG_MS / 1000,
      refresh_token: ververs,
      scope: rij.scope,
    },
  }
}

/** Refreshtoken inwisselen. Roteert altijd: de oude wordt meteen ingetrokken. */
export async function ververs({
  opslag, clients, body = {}, issuer, resource, tekenToken,
  nu = () => Date.now(), geheim = nieuwGeheim,
}) {
  const client = clients.vind(body.client_id)
  if (!client) return { ok: false, fout: FOUT.INVALID_CLIENT }
  if (!body.refresh_token) return { ok: false, fout: FOUT.INVALID_GRANT }

  const hash = hashGeheim(body.refresh_token)
  const rij = await opslag.leesRefresh(hash)
  if (!rij) return { ok: false, fout: FOUT.INVALID_GRANT }
  if (rij.ingetrokken) {
    await opslag.trekAllesInVoorGebruiker(rij.userId)
    return { ok: false, fout: FOUT.INVALID_GRANT, hergebruik: true }
  }
  if (rij.vervaltOp <= nu()) return { ok: false, fout: FOUT.INVALID_GRANT, verlopen: true }
  if (rij.clientId !== client.id) return { ok: false, fout: FOUT.INVALID_GRANT }

  await opslag.trekRefreshIn(hash)
  return geefTokensUit({ opslag, rij, issuer, resource, tekenToken, nu, geheim })
}

/** RFC 7009. Geeft altijd succes terug, ook bij een onbekend token. */
export async function trekIn({ opslag, body = {} }) {
  if (body.refresh_token) await opslag.trekRefreshIn(hashGeheim(body.refresh_token))
  return { ok: true }
}

/** Toestemming ingetrokken in de app betekent: alle koppelingen eruit. */
export async function trekGebruikerIn({ opslag, userId }) {
  return opslag.trekAllesInVoorGebruiker(userId)
}
