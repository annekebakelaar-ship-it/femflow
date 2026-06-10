// Data-aggregatie voor het Huisartsrapport.
// Pure functies, geen netwerk of opslag: alles wordt aangeleverd door de
// aanroeper zodat dit testbaar blijft en het rapport volledig client-side is.

import { getCycleLengths, hasEarlyTransitionMarker, hasLateTransitionMarker } from './cycleHelper'

export const RAPPORT_PERIODE_MAANDEN = 6

function maandKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function maandLabel(key) {
  const [jaar, maand] = key.split('-')
  const namen = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
  return `${namen[parseInt(maand, 10) - 1]} ${jaar}`
}

function median(values) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// Cyclusoverzicht: per cyclus de lengte, afwijking t.o.v. eigen baseline
// (mediaan van alle cycli in de periode) en STRAW+10-relevante markers.
export function buildCyclusOverzicht(menstrualData, nu = new Date()) {
  const vanaf = new Date(nu)
  vanaf.setMonth(vanaf.getMonth() - RAPPORT_PERIODE_MAANDEN)

  const alle = getCycleLengths(menstrualData)
  const cycli = alle.filter(c => new Date(c.endDate) >= vanaf)

  const baseline = median(cycli.map(c => c.length))

  const rijen = cycli.map((cyclus, i) => ({
    nummer: i + 1,
    start: new Date(cyclus.startDate),
    lengte: cyclus.length,
    afwijking: baseline != null ? cyclus.length - baseline : null,
    sprongMarker: hasEarlyTransitionMarker(cycli, i),     // >= 7 dagen verschil met vorige
    langeCyclusMarker: hasLateTransitionMarker(cyclus),   // >= 60 dagen (mogelijk overgeslagen)
  }))

  return { rijen, baseline, voldoendeData: rijen.length >= 2 }
}

// Slaap & herstel per maand uit wearable-readings (femflow_biometric_readings).
// Temperatuur zit niet in de huidige koppeling; het rapport meldt dat expliciet.
export function buildWearablePerMaand(readings, nu = new Date()) {
  if (!readings || readings.length === 0) return null

  const vanaf = new Date(nu)
  vanaf.setMonth(vanaf.getMonth() - RAPPORT_PERIODE_MAANDEN)

  const perMaand = new Map()
  for (const r of readings) {
    const datum = new Date(r.reading_date)
    if (datum < vanaf) continue
    const key = maandKey(datum)
    if (!perMaand.has(key)) perMaand.set(key, { slaap: [], hrv: [] })
    if (r.sleep_duration_min != null) perMaand.get(key).slaap.push(r.sleep_duration_min)
    if (r.hrv_ms != null) perMaand.get(key).hrv.push(r.hrv_ms)
  }

  const maanden = [...perMaand.keys()].sort().map(key => {
    const m = perMaand.get(key)
    const avg = arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null)
    return {
      maand: key,
      label: maandLabel(key),
      slaapuurGem: m.slaap.length ? Math.round((avg(m.slaap) / 60) * 10) / 10 : null,
      hrvGem: m.hrv.length ? Math.round(avg(m.hrv)) : null,
      nachten: m.slaap.length,
    }
  })

  if (maanden.length === 0) return null

  // HRV-trend: gemiddelde tweede helft t.o.v. eerste helft van de periode
  const hrvWaarden = maanden.filter(m => m.hrvGem != null).map(m => m.hrvGem)
  let hrvTrend = null
  if (hrvWaarden.length >= 2) {
    const helft = Math.floor(hrvWaarden.length / 2)
    const eerste = hrvWaarden.slice(0, helft)
    const tweede = hrvWaarden.slice(helft)
    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length
    hrvTrend = Math.round((avg(tweede) - avg(eerste)) * 10) / 10
  }

  return { maanden, hrvTrend }
}

// Symptoomfrequenties over de rapportperiode (telling, geen interpretatie)
export function buildSymptoomFrequenties(symptomLog, nu = new Date()) {
  if (!symptomLog || symptomLog.length === 0) return []

  const vanaf = new Date(nu)
  vanaf.setMonth(vanaf.getMonth() - RAPPORT_PERIODE_MAANDEN)

  const telling = new Map()
  for (const entry of symptomLog) {
    if (!entry.date || new Date(entry.date) < vanaf) continue
    const label = entry.label || entry.symptom
    telling.set(label, (telling.get(label) || 0) + 1)
  }

  return [...telling.entries()]
    .map(([label, aantal]) => ({ label, aantal }))
    .sort((a, b) => b.aantal - a.aantal)
}

export function formatDatum(date) {
  return new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}
