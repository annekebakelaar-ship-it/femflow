import { Capacitor } from '@capacitor/core'

// Beoordelingsverzoek via Play In-App Review.
//
// Googles richtlijn: GEEN eigen vraag vooraf ("vind je Ovari fijn?"), het
// systeemvenster hoort direct na een positief moment te verschijnen. Play
// beslist zelf of het venster echt getoond wordt (eigen quotum, en niets als
// iemand de app al beoordeeld heeft), dus we weten nooit of de gebruiker iets
// gezien heeft. Daarom onthouden we alleen DAT we het gevraagd hebben en
// wachten we daarna maanden voor een volgende poging.
//
// Deze feature stuurt bewust geen analytics: een beoordeling is geen
// gezondheidsdata, maar het moment waarop iemand hem krijgt zegt wel iets
// over haar gebruik.

const SLEUTEL = 'femflow_beoordeling_gevraagd'
const WACHT_DAGEN = 120
const CHECKIN_DREMPEL = 5

// Pure beslisregel, los getest.
export function magVragen({ native, gevraagdOp, nu = new Date() }) {
  if (!native) return false
  if (!gevraagdOp) return true
  const toen = new Date(gevraagdOp)
  if (Number.isNaN(toen.getTime())) return true
  return (nu - toen) / 86400000 >= WACHT_DAGEN
}

// Een gebruiker die op vijf verschillende dagen heeft ingecheckt gebruikt de
// app echt; losse tikken op één dag tellen daarom als één dag.
export function genoegCheckins(log, drempel = CHECKIN_DREMPEL) {
  if (!Array.isArray(log)) return false
  const dagen = new Set()
  for (const entry of log) {
    if (entry && typeof entry.date === 'string') dagen.add(entry.date.slice(0, 10))
  }
  return dagen.size >= drempel
}

function lees() {
  try { return localStorage.getItem(SLEUTEL) } catch { return null }
}

function schrijf(waarde) {
  try { localStorage.setItem(SLEUTEL, waarde) } catch { /* privemodus: niet erg */ }
}

// Vraagt het Play-venster aan. Geeft true als de aanvraag gelukt is, niet of
// de gebruiker daadwerkelijk iets zag.
export async function vraagBeoordeling() {
  if (!magVragen({ native: Capacitor.isNativePlatform(), gevraagdOp: lees() })) return false
  try {
    const { InAppReview } = await import('@capacitor-community/in-app-review')
    await InAppReview.requestReview()
    schrijf(new Date().toISOString())
    return true
  } catch {
    // Geen Play Services, sideload of geen netwerk: stil laten gaan en de
    // teller NIET zetten, zodat een volgend positief moment het opnieuw mag.
    return false
  }
}

// Zelfde aanvraag, maar pas nadat het scherm tot rust is gekomen. Google wil
// het venster niet midden in een handeling.
export function vraagBeoordelingStraks(vertraging = 1500) {
  window.setTimeout(() => { vraagBeoordeling() }, vertraging)
}
