// De resource-serverkant: de poort van de persoonlijke MCP-laag.
//
// Elke tool-aanroep moet hier langs, en deze volgorde is bewust:
//   1. is er een bearer token;
//   2. klopt de handtekening (RS256, onze sleutel);
//   3. kloppen de claims: uitgever, audience, levensduur, vorm;
//   4. dekt de scope deze tool;
//   5. bestaat de gebruiker nog en staat haar toestemming nog aan;
//   6. is de toestemmingversie uit het token nog actueel.
//
// Pas daarna wordt er een gegevensquery gedaan. Elke weigering gaat naar het
// auditlog met een eigen code en zonder inhoud.
//
// PER GEBRUIKER: `sub` komt uit het ondertekende token en is de enige bron van
// identiteit. Een tool-aanroep heeft geen gebruikersparameter, dus er is geen
// pad waarlangs client A de gegevens van gebruiker B kan opvragen.

import { leesToken } from './jwt.js'
import { SCOPES, SCOPE_PER_TOOL } from './metadata.js'
import { heeftToestemming, leesToestemming, TOESTEMMING_VERSIE } from '../toestemming.js'
import { RESULTAAT } from '../audit.js'

export const WEIGERING = {
  GEEN_TOKEN: 'geen_token',
  ONGELDIG_TOKEN: 'ongeldig_token',
  VERLOPEN: 'token_verlopen',
  VERKEERDE_AUDIENCE: 'verkeerde_audience',
  SCOPE_TEKORT: 'scope_tekort',
  GEEN_TOESTEMMING: 'geen_toestemming',
  TOESTEMMING_INGETROKKEN: 'toestemming_ingetrokken',
  TOESTEMMING_VERLOPEN: 'toestemming_oude_versie',
  ONBEKENDE_TOOL: 'onbekende_tool',
}

const VERPLICHTE_CLAIMS = ['iss', 'aud', 'sub', 'client_id', 'scope', 'iat', 'exp', 'jti', 'consent_version']
const TOEGESTANE_CLAIMS = new Set(VERPLICHTE_CLAIMS)

export function bearerUit(headers = {}) {
  const ruw = headers.authorization || headers.Authorization
  if (typeof ruw !== 'string' || ruw.trim() === '') return null
  const m = /^\s*Bearer\s+(.+?)\s*$/i.exec(ruw)
  return m ? m[1].trim() : null
}

/** Keurt de claims. Puur, zodat elke regel los te testen is. */
export function keurClaims(payload, { issuer, resource, nu }) {
  const seconden = Math.floor(nu / 1000)
  if (!payload || typeof payload !== 'object') return WEIGERING.ONGELDIG_TOKEN
  if (VERPLICHTE_CLAIMS.some((c) => !Object.hasOwn(payload, c))) return WEIGERING.ONGELDIG_TOKEN
  if (Object.keys(payload).some((c) => !TOEGESTANE_CLAIMS.has(c))) return WEIGERING.ONGELDIG_TOKEN
  if (payload.iss !== issuer) return WEIGERING.ONGELDIG_TOKEN
  if (payload.aud !== resource) return WEIGERING.VERKEERDE_AUDIENCE
  if (typeof payload.sub !== 'string' || payload.sub === '') return WEIGERING.ONGELDIG_TOKEN
  if (!Number.isSafeInteger(payload.iat) || !Number.isSafeInteger(payload.exp)) return WEIGERING.ONGELDIG_TOKEN
  if (payload.exp <= payload.iat) return WEIGERING.ONGELDIG_TOKEN
  if (payload.iat > seconden + 60) return WEIGERING.ONGELDIG_TOKEN
  if (payload.exp <= seconden) return WEIGERING.VERLOPEN
  if (typeof payload.scope !== 'string' || payload.scope.length > 256) return WEIGERING.ONGELDIG_TOKEN
  const scopes = payload.scope.split(' ').filter(Boolean)
  if (scopes.length === 0) return WEIGERING.ONGELDIG_TOKEN
  if (new Set(scopes).size !== scopes.length) return WEIGERING.ONGELDIG_TOKEN
  if (scopes.some((s) => !SCOPES.includes(s))) return WEIGERING.ONGELDIG_TOKEN
  return null
}

const AUDITCODE = {
  [WEIGERING.GEEN_TOKEN]: RESULTAAT.GEWEIGERD_GEEN_TOKEN,
  [WEIGERING.ONGELDIG_TOKEN]: RESULTAAT.GEWEIGERD_GEEN_TOKEN,
  [WEIGERING.VERLOPEN]: RESULTAAT.GEWEIGERD_GEEN_TOKEN,
  [WEIGERING.VERKEERDE_AUDIENCE]: RESULTAAT.GEWEIGERD_GEEN_TOKEN,
  [WEIGERING.SCOPE_TEKORT]: RESULTAAT.GEWEIGERD_SCOPE,
  [WEIGERING.GEEN_TOESTEMMING]: RESULTAAT.GEWEIGERD_GEEN_TOESTEMMING,
  [WEIGERING.TOESTEMMING_INGETROKKEN]: RESULTAAT.GEWEIGERD_INGETROKKEN,
  [WEIGERING.TOESTEMMING_VERLOPEN]: RESULTAAT.GEWEIGERD_OUDE_VERSIE,
  [WEIGERING.ONBEKENDE_TOOL]: RESULTAAT.GEWEIGERD_ONBEKENDE_TOOL,
}

/**
 * @param {{pool: object, publiekeSleutel: string, issuer: string, resource: string,
 *          audit: {schrijfRegel: Function}, nu?: () => number}} opties
 */
export function maakHulpbronWacht({ pool, publiekeSleutel, issuer, resource, audit, nu = () => Date.now() }) {
  async function log(userId, tool, toestemming, weigering) {
    if (!audit) return
    await audit.schrijfRegel({
      userId,
      tool,
      toestemming,
      resultaat: weigering ? AUDITCODE[weigering] || RESULTAAT.SERVERFOUT : RESULTAAT.OK,
    })
  }

  /**
   * @returns {Promise<{ok: true, userId: string, scope: string, clientId: string}
   *                 | {ok: false, reden: string, status: number}>}
   */
  async function controleer({ headers, tool }) {
    const nodigeScope = SCOPE_PER_TOOL[tool]
    if (!nodigeScope) {
      await log(null, null, false, WEIGERING.ONBEKENDE_TOOL)
      return { ok: false, reden: WEIGERING.ONBEKENDE_TOOL, status: 404 }
    }

    const bearer = bearerUit(headers)
    if (!bearer) {
      await log(null, tool, false, WEIGERING.GEEN_TOKEN)
      return { ok: false, reden: WEIGERING.GEEN_TOKEN, status: 401 }
    }

    let payload
    try {
      payload = leesToken(bearer, publiekeSleutel)
    } catch {
      await log(null, tool, false, WEIGERING.ONGELDIG_TOKEN)
      return { ok: false, reden: WEIGERING.ONGELDIG_TOKEN, status: 401 }
    }

    const fout = keurClaims(payload, { issuer, resource, nu: nu() })
    if (fout) {
      // Het token is ondertekend door ons, dus sub mag in het auditlog
      // (gepseudonimiseerd) ook als de claims verder niet deugen.
      await log(payload.sub, tool, false, fout)
      return { ok: false, reden: fout, status: 401 }
    }

    const scopes = payload.scope.split(' ')
    if (!scopes.includes(nodigeScope)) {
      await log(payload.sub, tool, true, WEIGERING.SCOPE_TEKORT)
      return { ok: false, reden: WEIGERING.SCOPE_TEKORT, status: 403, nodigeScope }
    }

    const rij = await leesToestemming(pool, payload.sub)
    const oordeel = heeftToestemming(rij)
    if (!oordeel.ok) {
      const weigering = rij?.revoked_at
        ? WEIGERING.TOESTEMMING_INGETROKKEN
        : rij?.granted_at
          ? WEIGERING.TOESTEMMING_VERLOPEN
          : WEIGERING.GEEN_TOESTEMMING
      await log(payload.sub, tool, false, weigering)
      return { ok: false, reden: weigering, status: 403 }
    }

    // Toestemming is sinds het token vernieuwd: opnieuw akkoord vragen.
    if (payload.consent_version !== (rij.versie || TOESTEMMING_VERSIE)) {
      await log(payload.sub, tool, true, WEIGERING.TOESTEMMING_VERLOPEN)
      return { ok: false, reden: WEIGERING.TOESTEMMING_VERLOPEN, status: 403 }
    }

    return { ok: true, userId: payload.sub, scope: payload.scope, clientId: payload.client_id }
  }

  /**
   * Zelfde keten maar zonder tool: voor het MCP-endpoint, dat eerst het token
   * keurt en pas daarna weet welke tool gevraagd wordt. De toestemming wordt
   * bij elke aanroep opnieuw gelezen, dus intrekken werkt meteen.
   */
  async function controleerToken({ headers }) {
    const bearer = bearerUit(headers)
    if (!bearer) return { ok: false, reden: WEIGERING.GEEN_TOKEN, status: 401 }
    let payload
    try {
      payload = leesToken(bearer, publiekeSleutel)
    } catch {
      return { ok: false, reden: WEIGERING.ONGELDIG_TOKEN, status: 401 }
    }
    const fout = keurClaims(payload, { issuer, resource, nu: nu() })
    if (fout) return { ok: false, reden: fout, status: 401 }

    const rij = await leesToestemming(pool, payload.sub)
    const oordeel = heeftToestemming(rij)
    if (!oordeel.ok) {
      const weigering = rij?.revoked_at
        ? WEIGERING.TOESTEMMING_INGETROKKEN
        : rij?.granted_at
          ? WEIGERING.TOESTEMMING_VERLOPEN
          : WEIGERING.GEEN_TOESTEMMING
      return { ok: false, reden: weigering, status: 403 }
    }
    if (payload.consent_version !== (rij.versie || TOESTEMMING_VERSIE)) {
      return { ok: false, reden: WEIGERING.TOESTEMMING_VERLOPEN, status: 403 }
    }
    return { ok: true, userId: payload.sub, scopes: payload.scope.split(' '), clientId: payload.client_id }
  }

  return {
    controleer,
    controleerToken,
    logGelukt: (userId, tool) => log(userId, tool, true, null),
    logWeigering: (userId, tool, weigering) => log(userId, tool, false, weigering),
  }
}
