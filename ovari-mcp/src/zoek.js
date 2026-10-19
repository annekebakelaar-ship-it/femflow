// Zoeken in de kennisbank. Pure functies, geen afhankelijkheden, volledig
// testbaar. Negentien artikelen is te weinig voor een zoekindex of een
// vectordatabase; een gewogen woordscore doet het hier beter en is uit te leggen.
//
// Tweetalig sinds 25 september 2026. De artikelen blijven Nederlands en zijn de
// enige bron van waarheid. Een Engelse vraag wordt niet vertaald maar
// omgezet naar begrippen: "heavy periods" en "hevige menstruatie" zijn hetzelfde
// begrip, en een artikel dat een van beide raakt, raakt dat begrip. Geen
// vertaaldienst, geen taalmodel, geen extra afhankelijkheid.

import { volledigeTekst } from './artikelen.js'

// Woorden die in vrijwel elke vraag voorkomen en dus niets onderscheiden.
// Nederlands en Engels door elkaar, want een vraag kan beide bevatten.
const STOPWOORDEN = new Set([
  // Nederlands, functiewoorden
  'aan', 'af', 'al', 'als', 'bij', 'dan', 'dat', 'de', 'der', 'des', 'die', 'dit',
  'doe', 'door', 'een', 'en', 'er', 'ge', 'geen', 'haar', 'had', 'heb', 'hebben',
  'heeft', 'het', 'hij', 'ik', 'in', 'is', 'je', 'kan', 'kun', 'kunnen',
  'maar', 'me', 'meer', 'men', 'met', 'mij', 'mijn', 'na', 'naar', 'niet', 'nog',
  'nu', 'of', 'om', 'ook', 'op', 'te', 'ten', 'ter', 'tot', 'uit', 'van',
  'veel', 'voor', 'want', 'we', 'wel', 'wie', 'wij', 'worden', 'wordt', 'word',
  'zal', 'ze', 'zij', 'zo', 'zou', 'zijn',
  // Nederlands, vraag- en vulwoorden. Deze wogen even zwaar als inhoudswoorden
  // en lieten daardoor het verkeerde artikel bovenaan eindigen.
  'waarom', 'wat', 'welke', 'hoe', 'wanneer', 'tijdens', 'helpt', 'help',
  'tegen', 'ineens', 'steeds', 'moet', 'laten', 'doen', 'krijg', 'krijgen',
  'echt', 'soms', 'vaak', 'altijd', 'beste', 'goed', 'goede', 'last',
  // Engels
  'a', 'an', 'the', 'is', 'are', 'am', 'was', 'were', 'be', 'been', 'being',
  'i', 'me', 'my', 'you', 'your', 'we', 'it', 'its', 'this', 'that', 'these',
  'of', 'to', 'in', 'on', 'at', 'for', 'with', 'from', 'by', 'and', 'or', 'but',
  'do', 'does', 'did', 'can', 'could', 'will', 'would', 'should', 'may', 'might',
  'have', 'has', 'had', 'get', 'gets', 'getting', 'got', 'keep', 'keeps',
  'up', 'down', 'out', 'so', 'very', 'really', 'just', 'what', 'why', 'how',
  'when', 'where', 'which', 'who', 'during', 'about', 'into', 'over', 'after',
  'before', 'all', 'any', 'some', 'more', 'most', 'best', 'good', 'suddenly',
  'still', 'again', 'help', 'helps', 'there', 'their', 'them', 'they', 'because',
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
// De score van een artikel is de som van het zwaarste veld per geraakt begrip,
// maal een dekkingsfactor. Daardoor valt elk bewijsniveau op een herkenbare
// waarde:
//
//   1  een enkel begrip, alleen in de lopende tekst    (GEWICHT.tekst)
//   2  een begrip in een tussenkop, of twee in de tekst (GEWICHT.kop)
//   3  een begrip in de ondertitel of de omschrijving   (GEWICHT.subtitle)
//   6  een begrip in de titel                           (GEWICHT.title)
//
// Een enkele terloopse vermelding in de lopende tekst zegt niets: het woord
// "vrouwen" staat in vijftien van de negentien artikelen. De lichtste vorm van
// bewijs die wel iets zegt, is een term in een tussenkop. Die grens is dus
// GEWICHT.kop, en die is gemeten: irrelevante vragen halen hoogstens 0,67 en
// toevallige treffers landen precies op 1,0.
export const DREMPEL = GEWICHT.kop

// ---------------------------------------------------------------------------
// Begrippen
// ---------------------------------------------------------------------------
// Elk begrip koppelt aanleidingen in de vraag aan Nederlandse zoektermen die
// aantoonbaar in de negentien artikelen voorkomen. De test
// "elke term komt voor in de kennisbank" bewaakt dat laatste.
//
// Een begrip is EEN eenheid in de score. Raakt een artikel een van de termen,
// dan telt dat als een treffer voor dat begrip, met het zwaarste veld waarin
// het voorkomt. Zo levert "low iron" hetzelfde op als "ijzertekort", en niet
// per ongeluk dubbel.
//
// De aanleidingen mogen uit meerdere woorden bestaan. Langere combinaties gaan
// voor, zodat "heavy periods" niet uiteenvalt in "heavy" en "periods".
export const CONCEPTEN = [
  {
    naam: 'overgang',
    aanleiding: ['perimenopause', 'perimenopausal', 'menopause', 'menopausal', 'climacteric'],
    termen: ['perimenopauze', 'overgang', 'menopauze'],
  },
  {
    naam: 'cyclus',
    aanleiding: ['menstrual cycle', 'period', 'periods', 'menstruation', 'menstrual', 'cycle'],
    termen: ['cyclus', 'menstruatie'],
  },
  {
    naam: 'hevig bloedverlies',
    aanleiding: ['heavy periods', 'heavy period', 'heavy bleeding', 'heavy menstrual bleeding', 'menorrhagia'],
    termen: ['hevige', 'bloedverlies', 'menstruatie'],
  },
  {
    naam: 'ijzer',
    aanleiding: ['low iron', 'iron deficiency', 'iron', 'anemia', 'anaemia', 'ferritin'],
    termen: ['ijzer', 'ijzertekort', 'bloedarmoede'],
  },
  {
    naam: 'slaap',
    aanleiding: ['sleep', 'sleeping', 'asleep', 'insomnia', 'sleepless'],
    termen: ['slaap', 'slapen'],
  },
  {
    naam: 'wakker worden',
    aanleiding: ['waking up', 'wake up', 'waking', 'awake', 'wakeful'],
    termen: ['wakker', 'slaap'],
  },
  {
    naam: 'nacht',
    aanleiding: ['night', 'nights', 'nightly', 'nocturnal'],
    termen: ['nacht', 'nachten'],
  },
  {
    naam: 'nachtzweten',
    aanleiding: ['night sweats', 'night sweat', 'sweating at night', 'sweats'],
    termen: ['nachtzweten', 'zweten'],
  },
  {
    naam: 'opvliegers',
    aanleiding: ['hot flashes', 'hot flushes', 'hot flash', 'hot flush', 'flushes', 'flashes'],
    termen: ['opvliegers'],
  },
  {
    naam: 'hart',
    aanleiding: ['heart palpitations', 'palpitations', 'racing heart', 'heart rate', 'heart', 'cardiovascular'],
    termen: ['hartkloppingen', 'hart', 'hartslag'],
  },
  {
    naam: 'hartslagvariabiliteit',
    aanleiding: ['heart rate variability', 'hrv', 'resting heart rate'],
    termen: ['hartslagvariabiliteit', 'hrv', 'rusthartslag'],
  },
  {
    naam: 'botten',
    aanleiding: ['bone loss', 'bone density', 'bone health', 'bones', 'bone', 'osteoporosis', 'osteopenia'],
    termen: ['botten', 'botgezondheid', 'botontkalking', 'botdichtheid'],
  },
  {
    naam: 'gewrichten',
    aanleiding: ['joint pain', 'aching joints', 'stiff joints', 'joints', 'joint', 'stiffness'],
    termen: ['gewrichten', 'gewrichtsklachten', 'stijfheid'],
  },
  {
    naam: 'brain fog',
    aanleiding: ['brain fog', 'foggy', 'concentration', 'concentrate', 'memory', 'forgetful', 'focus'],
    termen: ['concentratie', 'geheugen', 'brain'],
  },
  {
    naam: 'stemming',
    aanleiding: ['mood', 'depressed', 'depression', 'low mood', 'sad', 'sadness', 'tearful'],
    termen: ['stemming', 'somber', 'somberheid'],
  },
  {
    naam: 'angst',
    aanleiding: ['anxiety', 'anxious', 'irritable', 'irritability', 'panic', 'on edge'],
    termen: ['angst', 'prikkelbaar', 'prikkelbaarheid'],
  },
  {
    naam: 'stress',
    aanleiding: ['stress', 'stressed', 'burnout', 'resilience', 'overwhelmed'],
    termen: ['stress', 'veerkracht'],
  },
  {
    naam: 'wearable',
    aanleiding: ['wearable', 'tracker', 'smartwatch', 'oura ring', 'oura'],
    termen: ['wearable'],
  },
  {
    naam: 'beweging',
    aanleiding: ['exercise', 'training', 'workout', 'strength training', 'lifting', 'running'],
    termen: ['trainen', 'beweging', 'kracht'],
  },
  {
    naam: 'voeding',
    aanleiding: ['nutrition', 'diet', 'supplements', 'supplement', 'vitamins', 'vitamin', 'protein'],
    termen: ['voeding', 'supplementen', 'vitamine'],
  },
  {
    naam: 'pms',
    aanleiding: ['pms', 'premenstrual', 'pmdd'],
    termen: ['pms', 'premenstrueel'],
  },
  {
    naam: 'seksualiteit',
    aanleiding: ['vaginal dryness', 'painful sex', 'dryness', 'libido', 'sex drive', 'sexual', 'intimacy'],
    termen: ['droogte', 'libido', 'vaginale', 'seks'],
  },
  {
    naam: 'hormonen',
    aanleiding: ['hormones', 'hormone', 'hormonal', 'estrogen', 'oestrogen', 'progesterone', 'blood test'],
    termen: ['hormonen', 'hormoon', 'oestrogeen', 'progesteron'],
  },
  {
    naam: 'vermoeidheid',
    aanleiding: ['tired', 'tiredness', 'fatigue', 'exhausted', 'exhaustion', 'no energy'],
    termen: ['moe', 'vermoeidheid', 'energie'],
  },
  {
    naam: 'temperatuur',
    aanleiding: ['body temperature', 'temperature', 'overheating'],
    termen: ['temperatuur'],
  },
  {
    naam: 'ovulatie',
    aanleiding: ['ovulation', 'ovulating', 'fertile window'],
    termen: ['ovulatie', 'eisprong'],
  },
  {
    naam: 'huisarts',
    aanleiding: ['doctor', 'gp', 'physician', 'see a doctor'],
    termen: ['huisarts'],
  },
]

// Accenten weg, alles klein, alles wat geen letter of cijfer is wordt een spatie.
export function normaliseer(tekst) {
  return String(tekst == null ? '' : tekst)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
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

// Aanleidingen gesorteerd op lengte, zodat "heavy periods" voorgaat op "periods".
const AANLEIDINGEN = CONCEPTEN.flatMap((c) =>
  c.aanleiding.map((a) => ({ woorden: a.split(' '), concept: c }))
).sort((a, b) => b.woorden.length - a.woorden.length)

// Zet een vraag om in begrippen. Elk begrip is een groep alternatieven; een
// artikel dat er een van raakt, raakt dat begrip.
//
// Een puur Nederlandse vraag levert groepen van precies een term op, en
// gedraagt zich dus exact zoals voorheen.
export function groepenUit(vraag) {
  const tokens = normaliseer(vraag).split(' ').filter(Boolean)
  const gebruikt = new Array(tokens.length).fill(false)
  const groepen = []
  const gezien = new Set()

  for (const { woorden, concept } of AANLEIDINGEN) {
    if (gezien.has(concept.naam)) continue
    for (let i = 0; i + woorden.length <= tokens.length; i++) {
      if (gebruikt.slice(i, i + woorden.length).some(Boolean)) continue
      let past = true
      for (let j = 0; j < woorden.length; j++) {
        if (tokens[i + j] !== woorden[j]) { past = false; break }
      }
      if (!past) continue
      for (let j = 0; j < woorden.length; j++) gebruikt[i + j] = true
      groepen.push({ naam: concept.naam, termen: concept.termen })
      gezien.add(concept.naam)
      break
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    if (gebruikt[i]) continue
    const woord = tokens[i]
    if (woord.length < 2) continue
    if (STOPWOORDEN.has(woord)) continue
    if (gezien.has(woord)) continue
    gezien.add(woord)
    groepen.push({ naam: woord, termen: [woord] })
  }

  return groepen
}

// Alle zoektermen als platte lijst. Wordt gebruikt voor het tekstfragment en
// voor wat de tool terugmeldt als gebruikte termen.
export function termenUit(vraag) {
  const uit = []
  for (const groep of groepenUit(vraag)) {
    for (const term of groep.termen) if (!uit.includes(term)) uit.push(term)
  }
  return uit
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

// Losse strings blijven toegestaan; die worden een groep van een.
function alsGroepen(invoer) {
  return (invoer || []).map((g) =>
    typeof g === 'string' ? { naam: g, termen: [g] } : g
  )
}

// Per begrip het zwaarste veld waarin een van de alternatieven voorkomt.
// Daarna een dekkingsbonus, zodat een artikel dat alle begrippen raakt wint van
// een artikel dat er een heel vaak raakt.
export function scoorArtikel(artikel, invoer) {
  const groepen = alsGroepen(invoer)
  if (groepen.length === 0) return { score: 0, geraakt: [] }

  const beste = new Map()
  const geraakteTermen = new Map()

  for (const veld of veldenVan(artikel)) {
    const gewicht = GEWICHT[veld.soort]
    const woorden = normaliseer(veld.tekst).split(' ')
    for (const groep of groepen) {
      if (beste.get(groep.naam) >= gewicht) continue
      for (const term of groep.termen) {
        if (woorden.some((w) => matcht(w, term))) {
          if (!(beste.get(groep.naam) >= gewicht)) {
            beste.set(groep.naam, gewicht)
            geraakteTermen.set(groep.naam, term)
          }
          break
        }
      }
    }
  }

  const geraakt = [...geraakteTermen.values()]
  if (geraakt.length === 0) return { score: 0, geraakt: [] }

  const basis = [...beste.values()].reduce((a, b) => a + b, 0)
  const dekking = beste.size / groepen.length
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
  const groepen = groepenUit(vraag)

  const kandidaten = categorie
    ? artikelen.filter((a) => a.category === categorie)
    : artikelen

  if (groepen.length === 0) return { termen: [], groepen, totaal: 0, treffers: [] }

  const treffers = []
  for (const artikel of kandidaten) {
    const { score, geraakt } = scoorArtikel(artikel, groepen)
    // Onder de drempel telt het niet als treffer. Een vraag die nergens over
    // gaat hoort een lege lijst op te leveren, niet negentien slappe hits.
    if (score < DREMPEL) continue
    treffers.push({ artikel, score, geraakt, fragment: fragment(artikel, geraakt) })
  }

  treffers.sort((a, b) => b.score - a.score || a.artikel.readTime - b.artikel.readTime)
  return {
    termen: termenUit(vraag),
    groepen,
    totaal: treffers.length,
    treffers: treffers.slice(0, limiet),
  }
}
