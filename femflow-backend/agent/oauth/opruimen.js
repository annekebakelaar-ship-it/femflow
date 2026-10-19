// Opruimen van verlopen autorisatiecodes en refreshtokens.
//
// WAAROM DIT MOET: een verlopen code of een ingetrokken refreshtoken heeft
// geen functie meer, maar de rij blijft wel staan en blijft dus een doelwit.
// Een tabel die eindeloos groeit is bovendien een stille kostenpost op Neon.
//
// WAT ER BEWAARD BLIJFT: een ingetrokken refreshtoken blijft nog een tijd
// staan, zodat hergebruik na intrekken nog herkend kan worden als aanval.
// Pas daarna gaat de rij weg. Het auditlog blijft altijd staan: dat is geen
// geheim maar een verantwoordingsspoor.

export const CODE_GENADE_MS = 60 * 60_000
export const BEWAAR_INGETROKKEN_DAGEN = 30

/**
 * @param {{opslag: object, nu?: () => number, bewaarDagen?: number}} opties
 * @returns {Promise<{codes: number, refresh: number}>}
 */
export async function ruimOp({ opslag, nu = () => Date.now(), bewaarDagen = BEWAAR_INGETROKKEN_DAGEN }) {
  if (typeof opslag.ruimOp !== 'function') return { codes: 0, refresh: 0 }
  return opslag.ruimOp({ nu: nu(), bewaarDagen })
}

/**
 * Zet een periodieke opruiming op. Geeft een stopfunctie terug.
 * De timer houdt het proces niet wakker (unref), zodat hij een herstart of
 * een test nooit ophoudt.
 */
export function startOpruimen({ opslag, elkeMs = 6 * 60 * 60_000, nu = () => Date.now(), waarschuw = console.warn, log = console.log }) {
  const timer = setInterval(async () => {
    try {
      const uitslag = await ruimOp({ opslag, nu })
      if (uitslag.codes || uitslag.refresh) {
        log(`Agent-opruiming: ${uitslag.codes} codes en ${uitslag.refresh} refreshtokens verwijderd`)
      }
    } catch (err) {
      waarschuw(`Agent-opruiming mislukt: ${err.message}`)
    }
  }, elkeMs)
  if (typeof timer.unref === 'function') timer.unref()
  return () => clearInterval(timer)
}
