// Pure samenvatters voor de agenttools. Geen database, geen netwerk, geen
// Express: alles komt binnen als gewone objecten, zodat elke regel met
// fictieve gegevens te testen is.
//
// REGEL: deze module geeft NOOIT e-mailadres of naam terug. Een agent heeft
// de identiteit van de gebruiker niet nodig om over haar gegevens te praten,
// en wat hier niet uit komt kan ook nooit in een model-prompt belanden.

export const REDENEN = {
  GEEN_CYCLUSGEGEVENS: 'geen_cyclusgegevens',
  GEEN_WEARABLE: 'geen_wearable',
  GEEN_METINGEN: 'geen_metingen',
  TE_WEINIG_METINGEN: 'te_weinig_metingen',
  VEROUDERD: 'verouderd',
}

const DAG_MS = 86400000

function naarDatum(waarde) {
  if (!waarde) return null
  const d = waarde instanceof Date ? waarde : new Date(waarde)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Zet een waarde om naar een kalenderdag [jaar, maand, dag].
 *
 * VALKUIL DIE DIT OPLOST: node-postgres geeft een DATE-kolom terug als een
 * JS-Date op LOKALE middernacht. In Amsterdam is '2026-10-05' dan
 * 2026-10-04T22:00:00Z, en wie daarna op UTC-dagniveau rekent komt een dag te
 * laag uit. Dat is precies wat er gebeurde: cyclusdag 16 in plaats van 15.
 * Een kalenderdatum hoort geen tijdzone te hebben, dus lezen we de lokale
 * velden van een Date en knippen we een string gewoon af op tien tekens.
 */
function kalenderdag(waarde) {
  if (typeof waarde === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(waarde.trim())
    if (m) return [Number(m[1]), Number(m[2]) - 1, Number(m[3])]
  }
  const d = naarDatum(waarde)
  if (!d) return null
  return [d.getFullYear(), d.getMonth(), d.getDate()]
}

/** Hele kalenderdagen tussen twee datums, zonder tijdzoneverschuiving. */
export function dagenTussen(van, tot) {
  const a = kalenderdag(van)
  const b = kalenderdag(tot)
  if (!a || !b) return null
  return Math.round((Date.UTC(...b) - Date.UTC(...a)) / DAG_MS)
}

function isoDag(waarde) {
  // Zelfde kalenderregel als dagenTussen: een DATE uit de database mag niet
  // door een tijdzone een dag opschuiven.
  const k = kalenderdag(waarde)
  if (!k) return null
  const [j, m, d] = k
  return [j, String(m + 1).padStart(2, '0'), String(d).padStart(2, '0')].join('-')
}

function gemiddelde(waarden) {
  const echte = waarden.filter((w) => typeof w === 'number' && Number.isFinite(w))
  if (echte.length === 0) return null
  return Math.round((echte.reduce((a, b) => a + b, 0) / echte.length) * 10) / 10
}

/**
 * Cyclusoverzicht uit de ENE rij die de backend per gebruiker bewaart
 * (femflow_menstruation_data heeft UNIQUE(user_id)). De dag-voor-dag historie
 * staat versleuteld op het toestel en komt hier bewust niet langs.
 */
export function vatCyclusSamen({ rij, nu = new Date() } = {}) {
  if (!rij || !rij.start_date) {
    return { beschikbaar: false, reden: REDENEN.GEEN_CYCLUSGEGEVENS }
  }

  const lengte = Number(rij.cycle_length)
  const verstreken = dagenTussen(rij.start_date, nu)
  if (verstreken === null || !Number.isFinite(lengte) || lengte <= 0) {
    return { beschikbaar: false, reden: REDENEN.GEEN_CYCLUSGEGEVENS }
  }

  // Meer dan twee opgegeven cycluslengtes verder betekent dat er sinds de
  // laatste invoer niets meer is bijgehouden. Dan is rekenen misleidend.
  const verouderd = verstreken > lengte * 2

  const cyclusdag = verouderd ? null : (verstreken % lengte) + 1

  // In kalenderdagen rekenen, niet met een Date verschuiven: die draagt een
  // tijdzone mee en dan komt de uitkomst een dag naast de stringvariant uit.
  const [jaar, maand, dag] = kalenderdag(rij.start_date)
  const stappen = Math.floor(verstreken / lengte) + 1
  const volgendeStart = new Date(Date.UTC(jaar, maand, dag + stappen * lengte))

  return {
    beschikbaar: !verouderd,
    reden: verouderd ? REDENEN.VEROUDERD : null,
    laatste_start: isoDag(rij.start_date),
    dagen_sinds_laatste_start: verstreken,
    opgegeven_cycluslengte: lengte,
    bloedingsdagen: Number.isFinite(Number(rij.bleeding_days)) ? Number(rij.bleeding_days) : null,
    cyclusdag,
    // volgendeStart is zelf in UTC gebouwd, dus die lezen we ook in UTC.
    verwachte_volgende_start: verouderd ? null : volgendeStart.toISOString().slice(0, 10),
    bijgewerkt_op: isoDag(rij.updated_at),
    // Expliciet meesturen zodat een model dit niet als voorspelling verkoopt.
    basis: 'een door de gebruiker opgegeven cycluslengte, geen gemeten reeks',
  }
}

/**
 * Hersteltrend uit de wearable-metingen. Vergelijkt de laatste 7 dagen met de
 * 21 dagen daarvoor. Zegt expliciet waarom er niets is als dat zo is, zodat
 * een model geen gemiddelden of voorbeeldwaarden gaat verzinnen.
 */
export function vatHerstelSamen({ metingen = [], verbindingen = [], nu = new Date(), minimumNachten = 5 } = {}) {
  if (!Array.isArray(verbindingen) || verbindingen.length === 0) {
    return { beschikbaar: false, reden: REDENEN.GEEN_WEARABLE }
  }

  const gedragen = (Array.isArray(metingen) ? metingen : []).filter((m) => {
    const dagen = dagenTussen(m?.reading_date, nu)
    if (dagen === null || dagen < 0 || dagen > 27) return false
    return [m.sleep_duration_min, m.hrv_ms, m.resting_heart_rate].some(
      (w) => typeof w === 'number' && Number.isFinite(w)
    )
  })

  if (gedragen.length === 0) {
    return { beschikbaar: false, reden: REDENEN.GEEN_METINGEN, providers: verbindingen.map((v) => v.wearable_type) }
  }
  if (gedragen.length < minimumNachten) {
    return {
      beschikbaar: false,
      reden: REDENEN.TE_WEINIG_METINGEN,
      nachten_gemeten: gedragen.length,
      minimum_nachten: minimumNachten,
    }
  }

  const laatste = gedragen
    .map((m) => dagenTussen(m.reading_date, nu))
    .reduce((a, b) => Math.min(a, b), Number.POSITIVE_INFINITY)
  if (laatste > 10) {
    return { beschikbaar: false, reden: REDENEN.VEROUDERD, dagen_sinds_laatste_meting: laatste }
  }

  const recent = gedragen.filter((m) => dagenTussen(m.reading_date, nu) <= 6)
  const ervoor = gedragen.filter((m) => dagenTussen(m.reading_date, nu) > 6)

  function blok(rijen) {
    if (rijen.length === 0) return null
    return {
      nachten: rijen.length,
      slaapduur_min: gemiddelde(rijen.map((m) => m.sleep_duration_min)),
      diepe_slaap_min: gemiddelde(rijen.map((m) => m.deep_sleep_min)),
      hrv_ms: gemiddelde(rijen.map((m) => m.hrv_ms)),
      rust_hartslag: gemiddelde(rijen.map((m) => m.resting_heart_rate)),
      herstel_index: gemiddelde(rijen.map((m) => m.recovery_index)),
    }
  }

  const a = blok(recent)
  const b = blok(ervoor)
  const richting = {}
  if (a && b) {
    for (const sleutel of ['slaapduur_min', 'diepe_slaap_min', 'hrv_ms', 'rust_hartslag', 'herstel_index']) {
      const nieuw = a[sleutel]
      const oud = b[sleutel]
      if (nieuw === null || oud === null || oud === 0) { richting[sleutel] = null; continue }
      const verschil = ((nieuw - oud) / Math.abs(oud)) * 100
      richting[sleutel] = Math.abs(verschil) < 5 ? 'gelijk' : verschil > 0 ? 'hoger' : 'lager'
    }
  }

  return {
    beschikbaar: true,
    reden: null,
    providers: verbindingen.map((v) => v.wearable_type),
    nachten_gemeten: gedragen.length,
    dagen_sinds_laatste_meting: laatste,
    laatste_zeven_dagen: a,
    drie_weken_daarvoor: b,
    richting,
    basis: 'gemeten nachten uit de gekoppelde wearable, geen schatting',
  }
}

/**
 * Context over de gebruiker zelf: leeftijd, quizuitkomst, wat er gekoppeld is
 * en hoe compleet haar gegevens zijn. Zonder naam en zonder e-mailadres.
 */
export function vatProfielSamen({ gebruiker = null, quiz = null, verbindingen = [], cyclusRij = null, nu = new Date() } = {}) {
  let leeftijd = null
  if (gebruiker?.birth_date) {
    const dagen = dagenTussen(gebruiker.birth_date, nu)
    if (dagen !== null && dagen > 0) leeftijd = Math.floor(dagen / 365.25)
  }

  return {
    beschikbaar: true,
    leeftijd,
    lid_sinds: isoDag(gebruiker?.created_at),
    quiz_gedaan: Boolean(quiz),
    quiz_datum: isoDag(quiz?.created_at),
    quiz_uitkomst: quiz?.constellation ?? null,
    gekoppelde_wearables: (Array.isArray(verbindingen) ? verbindingen : []).map((v) => ({
      provider: v.wearable_type,
      laatste_synchronisatie: isoDag(v.last_sync_at),
    })),
    gegevens: {
      cyclus_ingevuld: Boolean(cyclusRij?.start_date),
      wearable_gekoppeld: Array.isArray(verbindingen) && verbindingen.length > 0,
    },
    // Check-ins (symptomen) staan versleuteld op het toestel en zijn hier
    // principieel niet beschikbaar; zie README.md.
    check_ins_beschikbaar: false,
  }
}
