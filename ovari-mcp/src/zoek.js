// Zoeken in de kennisbank. Pure functies, geen afhankelijkheden, volledig
// testbaar. Negentien artikelen is te weinig voor een zoekindex of een
// vectordatabase; een gewogen woordscore doet het hier beter en is uit te leggen.

import { volledigeTekst } from './artikelen.js'

// Nederlandse stopwoorden. Bewust kort gehouden: alleen woorden die in vrijwel
// elke vraag voorkomen en dus niets onderscheiden.
const STOPWOORDEN = new Set([
  'aan', 'af', 'al', 'als', 'bij', 'dan', 'dat', 'de', 'der', 'des', 'die', 'dit',
  'doe', 'door', 'een', 'en', 'er', 'ge', 'geen', 'haar', 'had', 'heb', 'hebben',
  'heeft', 'het', 'hij', 'hoe', 'ik', 'in', 'is', 'je', 'kan', 'kun', 'kunnen',
  'maar', 'me', 'meer', 'men', 'met', 'mij', 'mijn', 'na', 'naar', 'niet', 'nog',
  'nu', 'of', 'om', 'ook', 'op', 'over', 'te', 'ten', 'ter', 'tot', 'uit', 'van',
  'veel', 'voor', 'want', 'wat', 'we', 'wel', 'wat', 'wie', 'wij', 'worden',
  'wordt', 'zal', 'ze', 'zij', 'zijn', 'zo', 'zou', 'the', 'and', 'for', 'you',
])

// Gewicht per veld. De titel weegt het zwaarst omdat een treffer daar bijna
// altijd betekent dat het artikel echt over het onderwerp gaat.
export const GEWICHT = {
  id: 4,
  title: 6,
  subtitle: 3,
  description: 3,
  kop: 2,
  tekst: 1,
}

// Minimale relevantie. Afgeleid uit de gewichten hierboven, niet gekozen.
//
// De score van een artikel is de som van het zwaarste veld per geraakte term,
// maal een dekkingsfactor. Daardoor valt elk bewijsniveau op een herkenbare
// waarde:
//
//   1  een enkele term, alleen in de lopende tekst    (GEWICHT.tekst)
//   2  een term in een tussenkop, of twee in de tekst (GEWICHT.kop)
//   3  een term in de ondertitel of de omschrijving   (GEWICHT.subtitle)
//   6  een term in de titel                           (GEWICHT.title)
//
// Een enkele terloopse vermelding in de lopende tekst zegt niets: het woord
// "vrouwen" staat in vijftien van de negentien artikelen. De lichtste vorm van
// bewijs die wel iets zegt, is een term in een tussenkop. Die grens is dus
// GEWICHT.kop, en die is gemeten: irrelevante vragen halen hoogstens 0,67 en
// toevallige treffers landen precies op 1,0.
export const DREMPEL = GEWICHT.kop

// Accenten weg, alles klein, alles wat geen letter of cijfer is wordt een spatie.
export function normaliseer(tekst) {
  return String(tekst == null ? '' : tekst)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function termenUit(vraag) {
  const gezien = new Set()
  const uit = []
  for (const woord of normaliseer(vraag).split(' ')) {
    if (woord.length < 2) continue
    if (STOPWOORDEN.has(woord)) continue
    if (gezien.has(woord)) continue
    gezien.add(woord)
    uit.push(woord)
  }
  return uit
}

// Een term matcht een woord als het woord ermee begint, zodat "slaap" ook
// "slaapduur" vindt. Andersom mag ook, maar alleen bij langere termen, zodat
// "overgangsklachten" het artikel over de overgang vindt zonder dat korte
// termen alles raken.
export function matcht(woord, term) {
  if (woord === term) return true
  if (woord.startsWith(term) && term.length >= 3) return true
  if (term.startsWith(woord) && term.length >= 6 && woord.length >= 4) return true
  return false
}

function veldenVan(artikel) {
  const velden = [
    { soort: 'id', tekst: artikel.id.replace(/-/g, ' ') },
    { soort: 'title', tekst: artikel.title },
    { soort: 'subtitle', tekst: artikel.subtitle },
    { soort: 'description', tekst: artikel.description },
  ]
  for (const sectie of artikel.body) {
    velden.push({ soort: 'kop', tekst: sectie.kop })
    velden.push({ soort: 'tekst', tekst: sectie.tekst })
  }
  return velden
}

// Per term het zwaarste veld waarin hij voorkomt. Daarna een dekkingsbonus,
// zodat een artikel dat alle termen raakt wint van een artikel dat er een
// heel vaak raakt.
export function scoorArtikel(artikel, termen) {
  if (termen.length === 0) return { score: 0, geraakt: [] }

  const besteVoorTerm = new Map()
  for (const veld of veldenVan(artikel)) {
    const gewicht = GEWICHT[veld.soort]
    const woorden = normaliseer(veld.tekst).split(' ')
    for (const term of termen) {
      if (besteVoorTerm.get(term) >= gewicht) continue
      if (woorden.some((w) => matcht(w, term))) {
        besteVoorTerm.set(term, Math.max(besteVoorTerm.get(term) || 0, gewicht))
      }
    }
  }

  const geraakt = [...besteVoorTerm.keys()]
  if (geraakt.length === 0) return { score: 0, geraakt: [] }

  const basis = [...besteVoorTerm.values()].reduce((a, b) => a + b, 0)
  const dekking = geraakt.length / termen.length
  return { score: Math.round(basis * (0.5 + 0.5 * dekking) * 100) / 100, geraakt }
}

// Een leesbaar fragment rond de eerste treffer in de lopende tekst.
export function fragment(artikel, termen, maxLengte = 220) {
  const tekst = volledigeTekst(artikel)
  const plat = normaliseer(tekst)

  let positie = -1
  for (const term of termen) {
    const gevonden = plat.search(new RegExp(`(^| )${term}`))
    if (gevonden !== -1 && (positie === -1 || gevonden < positie)) positie = gevonden
  }
  if (positie === -1) return artikel.description

  const start = Math.max(0, positie - 60)
  let stuk = tekst.slice(start, start + maxLengte)
  if (start > 0) {
    const spatie = stuk.indexOf(' ')
    if (spatie > 0) stuk = stuk.slice(spatie + 1)
  }
  if (start + maxLengte < tekst.length) {
    const laatste = stuk.lastIndexOf(' ')
    if (laatste > 0) stuk = stuk.slice(0, laatste)
  }
  stuk = stuk.replace(/\s+/g, ' ').trim()
  const voor = start > 0 ? '... ' : ''
  const na = start + maxLengte < tekst.length ? ' ...' : ''
  return `${voor}${stuk}${na}`
}

// Geeft de best passende artikelen terug, hoogste score eerst. Bij gelijke
// score wint het kortste artikel, want dat is meestal het meest gerichte.
export function zoek(artikelen, vraag, opties = {}) {
  const limiet = Math.min(Math.max(parseInt(opties.limit, 10) || 5, 1), 10)
  const categorie = opties.category || null
  const termen = termenUit(vraag)

  const kandidaten = categorie
    ? artikelen.filter((a) => a.category === categorie)
    : artikelen

  if (termen.length === 0) return { termen, treffers: [] }

  const treffers = []
  for (const artikel of kandidaten) {
    const { score, geraakt } = scoorArtikel(artikel, termen)
    // Onder de drempel telt het niet als treffer. Een vraag die nergens over
    // gaat hoort een lege lijst op te leveren, niet negentien slappe hits.
    if (score < DREMPEL) continue
    treffers.push({ artikel, score, geraakt, fragment: fragment(artikel, geraakt) })
  }

  treffers.sort((a, b) => b.score - a.score || a.artikel.readTime - b.artikel.readTime)
  return { termen, totaal: treffers.length, treffers: treffers.slice(0, limiet) }
}
