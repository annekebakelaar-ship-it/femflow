// Leest de kennisbank rechtstreeks uit de bestaande app.
//
// Bewuste keuze: EEN bron van waarheid. Verandert een artikel in
// src/content/artikelen.js, dan verandert het hier mee. Er wordt niets
// gekopieerd en niets teruggeschreven. Dit bestand leest alleen.
//
// De data in artikelen.js is puur: geen imports, geen browser-API's, geen
// persoonsgegevens. Alle negentien artikelen staan al openbaar op
// ovari.youcaps.app/kennis, dus hier komt niets naar buiten dat nog niet
// openbaar was.
import { ARTIKELEN } from '../../src/content/artikelen.js'

export const BASIS = 'https://ovari.youcaps.app'

export const DISCLAIMER =
  'Ovari geeft informatie, geen medisch advies, en is geen medisch hulpmiddel. ' +
  'Raadpleeg bij klachten die je zorgen baren je huisarts.'

// De categorieen zoals ze in de app heten, met een Nederlands label. De sleutels
// komen uit artikelen.js en worden hier alleen vertaald voor de leesbaarheid.
export const CATEGORIE_LABEL = {
  cycle: 'Cyclus',
  mood: 'Stemming',
  sleep: 'Slaap',
  stress: 'Stress en herstel',
  nutrition: 'Voeding',
  exercise: 'Beweging',
}

export const NIVEAU_LABEL = {
  beginner: 'Basis',
  intermediate: 'Verdieping',
  advanced: 'Diepgaand',
}

export const CATEGORIEEN = Object.keys(CATEGORIE_LABEL)

export function artikelUrl(id) {
  return `${BASIS}/kennis/${id}`
}

export function alleArtikelen() {
  return ARTIKELEN
}

export function vindArtikel(id) {
  if (typeof id !== 'string') return null
  return ARTIKELEN.find((a) => a.id === id) || null
}

// Alle tekst van een artikel achter elkaar, voor zoeken en voor fetch_article.
export function volledigeTekst(artikel) {
  return artikel.body.map((s) => `${s.kop}\n\n${s.tekst}`).join('\n\n')
}

// De publieke vorm van een artikel. Alles wat een tool teruggeeft loopt hier
// doorheen, zodat er nooit per ongeluk een veld bijkomt.
export function publiekeVorm(artikel) {
  return {
    id: artikel.id,
    title: artikel.title,
    subtitle: artikel.subtitle,
    description: artikel.description,
    category: artikel.category,
    category_label: CATEGORIE_LABEL[artikel.category] || artikel.category,
    level: NIVEAU_LABEL[artikel.difficulty] || artikel.difficulty,
    read_time_minutes: artikel.readTime,
    url: artikelUrl(artikel.id),
  }
}
