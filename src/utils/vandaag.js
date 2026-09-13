// Pure helpers voor de home "Vandaag": begroeting, tegelwaarden en de korte
// adviesregel. Getest in vandaag.test.js.

const LEEG = '—'

export function begroeting(uur) {
  if (uur < 5) return 'Goedenacht'
  if (uur < 12) return 'Goedemorgen'
  if (uur < 18) return 'Goedemiddag'
  return 'Goedenavond'
}

export function herstelTekst(hrvMs) {
  return hrvMs == null || Number.isNaN(Number(hrvMs)) ? LEEG : `${Math.round(hrvMs)} ms`
}

// Eerst afronden op hele minuten, anders wordt 59,6 min "0u 60m"
export function slaapTekst(minuten) {
  if (minuten == null || Number.isNaN(Number(minuten))) return LEEG
  const m = Math.round(minuten)
  return `${Math.floor(m / 60)}u ${m % 60}m`
}

export function temperatuurTekst(graden) {
  if (graden == null || Number.isNaN(Number(graden))) return LEEG
  return `${Number(graden).toFixed(1).replace('.', ',')}°`
}

export function energieTekst(readiness) {
  return readiness == null || Number.isNaN(Number(readiness)) ? LEEG : `${Math.round(readiness)}/100`
}

export function voornaamUit(naam) {
  return (naam || '').trim().split(/\s+/)[0] || ''
}

// Korte adviesregel per uitkomst van leefstijlAdvies; de volledige uitleg
// staat achter "Meer uitleg" in de Leefstijl-hub
export const ADVIES_TEKST = {
  avondritueel: 'Je sliep kort. Maak er vanavond een rustige avond van.',
  ademwerk: 'Je herstel is lager dan normaal. Neem vandaag bewust rust.',
  wandelen: 'Houd het vandaag zacht. Een stevige wandeling is genoeg.',
  meditatie: 'Plan vandaag ruimte voor herstel en luister naar je energie.',
  'kracht-zwaar': 'Je herstel is goed. Een mooie dag om stevig te trainen.',
  'kracht-basis': 'Kies vandaag voor regelmaat. Een rustige krachtsessie is genoeg.',
}

export function adviesTekst(activiteitId) {
  return ADVIES_TEKST[activiteitId] || ADVIES_TEKST['kracht-basis']
}
