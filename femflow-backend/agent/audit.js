// Auditlog voor de persoonlijke agent.
//
// WAT ER WEL IN GAAT: tijdstip, een gepseudonimiseerde verwijzing naar de
// gebruiker, de toolnaam, de toestemmingstatus en een resultaatcode.
//
// WAT ER NOOIT IN GAAT: gezondheidsinhoud, cyclusdagen, metingen, tokens,
// request bodies, e-mailadressen, namen of het echte user_id. Dat is geen
// belofte in een comment maar een eigenschap van de functie: schrijfRegel()
// accepteert alleen de velden hieronder. Er is geen vrij veld waar per
// ongeluk een meetwaarde in kan belanden, en een test controleert dat.
//
// Het pseudoniem is een HMAC-SHA256 over het user_id met een geheim zout,
// afgekapt op 16 hex-tekens. Daarmee kun je wel zien dat twee regels over
// dezelfde gebruiker gaan (nodig om misbruik te herkennen), maar niet wie dat
// is, ook niet als de logtabel uitlekt. Zonder het zout is het onomkeerbaar.

import { createHmac, randomBytes } from 'crypto'

export const RESULTAAT = {
  OK: 'ok',
  GEWEIGERD_GEEN_TOKEN: 'geweigerd_geen_token',
  GEWEIGERD_GEEN_TOESTEMMING: 'geweigerd_geen_toestemming',
  GEWEIGERD_INGETROKKEN: 'geweigerd_ingetrokken',
  GEWEIGERD_OUDE_VERSIE: 'geweigerd_oude_versie',
  GEWEIGERD_ONBEKENDE_TOOL: 'geweigerd_onbekende_tool',
  GEWEIGERD_SCOPE: 'geweigerd_scope',
  GEWEIGERD_LIMIET: 'geweigerd_limiet',
  SERVERFOUT: 'serverfout',
  TOESTEMMING_GEGEVEN: 'toestemming_gegeven',
  TOESTEMMING_INGETROKKEN: 'toestemming_ingetrokken',
}

const GELDIGE_RESULTATEN = new Set(Object.values(RESULTAAT))

/** Gebeurtenissen zonder tool: toestemming geven of intrekken. */
export const GEEN_TOOL = null

/**
 * Pseudonimiseert een user_id. Puur, zodat het te testen is.
 * @returns {string} 16 hex-tekens, of 'onbekend' als er geen id is.
 */
export function pseudoniem(userId, zout) {
  if (!userId) return 'onbekend'
  if (!zout) throw new TypeError('pseudoniem vereist een zout')
  return createHmac('sha256', zout).update(String(userId)).digest('hex').slice(0, 16)
}

/**
 * Bouwt de regel die weggeschreven wordt. Puur en zonder database, zodat een
 * test kan bewijzen dat er niets anders in zit dan deze vijf velden.
 */
export function maakRegel({ userId, tool, toestemming, resultaat, zout, nu = new Date() }) {
  if (!GELDIGE_RESULTATEN.has(resultaat)) {
    throw new TypeError(`onbekende resultaatcode: ${resultaat}`)
  }
  if (tool !== GEEN_TOOL && typeof tool !== 'string') {
    throw new TypeError('tool moet een naam of null zijn')
  }
  return {
    tijdstip: nu.toISOString(),
    gebruiker: pseudoniem(userId, zout),
    tool: tool ?? null,
    toestemming: Boolean(toestemming),
    resultaat,
  }
}

/**
 * @param {{
 *   pool?: {query: Function},
 *   zout?: string,
 *   nu?: () => Date,
 *   sink?: (regel: object) => void | Promise<void>,
 *   waarschuw?: (bericht: string) => void,
 * }} opties
 */
export function maakAuditLogger({ pool, zout, nu = () => new Date(), sink, waarschuw = console.warn } = {}) {
  // Zonder zout in de omgeving draait de agent niet zonder log, maar met een
  // zout dat per processtart verschilt. Regels blijven dan binnen een run aan
  // elkaar te knopen en daarbuiten niet. Dat is een bewuste afweging: liever
  // minder correleerbaar dan helemaal geen auditspoor.
  let gebruiktZout = zout
  let vluchtig = false
  if (!gebruiktZout) {
    gebruiktZout = randomBytes(32).toString('hex')
    vluchtig = true
    waarschuw('AGENT_AUDIT_SALT ontbreekt: auditpseudoniemen zijn alleen binnen deze processtart te koppelen')
  }

  let tabelOntbreektGemeld = false

  async function schrijfRegel({ userId, tool = GEEN_TOOL, toestemming = false, resultaat }) {
    const regel = maakRegel({ userId, tool, toestemming, resultaat, zout: gebruiktZout, nu: nu() })
    try {
      if (sink) await sink(regel)
      if (pool) {
        await pool.query(
          `INSERT INTO femflow_agent_audit (tijdstip, gebruiker, tool, toestemming, resultaat)
           VALUES ($1, $2, $3, $4, $5)`,
          [regel.tijdstip, regel.gebruiker, regel.tool, regel.toestemming, regel.resultaat]
        )
      }
    } catch (err) {
      // Niet opnieuw gooien: de aanroeper beslist wat een mislukt log betekent.
      // Voor een geslaagde tooluitvoering is dat fail-closed (geen gegevens
      // terug), voor een weigering verandert het niets, want die weigering
      // staat toch al vast. Wel een keer melden, zodat het niet stil blijft.
      if (!tabelOntbreektGemeld) {
        tabelOntbreektGemeld = true
        waarschuw(`Auditlog schrijven mislukt (${err.code || err.message}); agentregels worden niet vastgelegd`)
      }
      return { ok: false, regel, fout: err.code || err.message }
    }
    return { ok: true, regel }
  }

  return { schrijfRegel, vluchtigZout: vluchtig }
}
