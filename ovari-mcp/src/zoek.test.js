import { describe, it, expect } from 'vitest'
import {
  normaliseer, termenUit, matcht, scoorArtikel, zoek, fragment,
  DREMPEL, GEWICHT, CONCEPTEN, groepenUit,
} from './zoek.js'
import { alleArtikelen, vindArtikel, publiekeVorm } from './artikelen.js'

const ARTIKELEN = alleArtikelen()

describe('normaliseer', () => {
  it('haalt accenten en leestekens weg', () => {
    expect(normaliseer('Énergie, HRV!')).toBe('energie hrv')
  })
  it('gaat om met leegte', () => {
    expect(normaliseer(null)).toBe('')
    expect(normaliseer(undefined)).toBe('')
  })
})

describe('termenUit', () => {
  it('laat stopwoorden vallen, Nederlands en Engels', () => {
    expect(termenUit('waarom slaap ik slecht in de overgang')).toEqual([
      'slaap', 'slecht', 'overgang',
    ])
    expect(termenUit('why is the my and for')).toEqual([])
  })
  it('ontdubbelt', () => {
    expect(termenUit('slaap slaap slaap')).toEqual(['slaap'])
  })
  it('geeft niets terug bij alleen stopwoorden', () => {
    expect(termenUit('en de het van')).toEqual([])
  })
})

describe('matcht', () => {
  it('vindt een woord dat met de term begint', () => {
    expect(matcht('slaapduur', 'slaap')).toBe(true)
  })
  it('vindt een samenstelling die met het woord begint', () => {
    expect(matcht('overgang', 'overgangsklachten')).toBe(true)
  })
  it('matcht niet op een te korte term', () => {
    expect(matcht('slaapduur', 'sl')).toBe(false)
  })
})

describe('scoorArtikel', () => {
  const slaap = vindArtikel('slaap-en-cyclus')

  it('geeft nul zonder termen', () => {
    expect(scoorArtikel(slaap, []).score).toBe(0)
  })
  it('geeft nul bij een woord dat nergens staat', () => {
    expect(scoorArtikel(slaap, ['boekhouding']).score).toBe(0)
  })
  it('weegt een treffer in de titel zwaarder dan een in de lopende tekst', () => {
    const inTitel = scoorArtikel(slaap, ['slaap']).score
    const inTekst = scoorArtikel(slaap, ['progesteron']).score
    expect(inTitel).toBeGreaterThan(inTekst)
  })
})

describe('zoek', () => {
  it('zet het meest voor de hand liggende artikel bovenaan', () => {
    const { treffers } = zoek(ARTIKELEN, 'waarom slaap ik slechter voor mijn menstruatie')
    expect(treffers.length).toBeGreaterThan(0)
    expect(treffers[0].artikel.id).toBe('slaap-en-cyclus')
  })

  it('vindt het artikel over opvliegers', () => {
    const { treffers } = zoek(ARTIKELEN, 'opvliegers en nachtzweten')
    expect(treffers[0].artikel.id).toBe('opvliegers-nachtzweten')
  })

  it('vindt het nieuwste artikel over droogte', () => {
    const { treffers } = zoek(ARTIKELEN, 'pijn bij seks en droogte')
    expect(treffers[0].artikel.id).toBe('droogte-en-pijn-bij-seks')
  })

  it('respecteert de limiet', () => {
    const { treffers } = zoek(ARTIKELEN, 'overgang', { limit: 2 })
    expect(treffers).toHaveLength(2)
  })

  it('knijpt de limiet af op tien', () => {
    const { treffers } = zoek(ARTIKELEN, 'overgang', { limit: 99 })
    expect(treffers.length).toBeLessThanOrEqual(10)
  })

  it('filtert op categorie', () => {
    const { treffers } = zoek(ARTIKELEN, 'overgang', { category: 'sleep' })
    expect(treffers.every((t) => t.artikel.category === 'sleep')).toBe(true)
  })

  it('geeft niets terug bij een vraag zonder bruikbare woorden', () => {
    expect(zoek(ARTIKELEN, 'de en het').treffers).toEqual([])
  })

  it('geeft niets terug bij een onderwerp buiten de kennisbank', () => {
    expect(zoek(ARTIKELEN, 'hypotheekrente aftrekbaar').treffers).toEqual([])
  })

  it('telt het totaal los van de limiet', () => {
    const { totaal, treffers } = zoek(ARTIKELEN, 'overgang', { limit: 2 })
    expect(totaal).toBeGreaterThan(treffers.length)
  })
})

describe('fragment', () => {
  it('blijft binnen de lengte en bevat tekst', () => {
    const artikel = vindArtikel('opvliegers-nachtzweten')
    const stuk = fragment(artikel, ['opvliegers'])
    expect(stuk.length).toBeLessThanOrEqual(240)
    expect(stuk.length).toBeGreaterThan(20)
  })
  it('valt terug op de omschrijving zonder treffer', () => {
    const artikel = vindArtikel('opvliegers-nachtzweten')
    expect(fragment(artikel, ['boekhouding'])).toBe(artikel.description)
  })
})

describe('publiekeVorm', () => {
  const velden = [
    'id', 'title', 'subtitle', 'description', 'category',
    'category_label', 'level', 'read_time_minutes', 'url',
  ]

  it('geeft precies de afgesproken velden terug, niet meer', () => {
    const vorm = publiekeVorm(vindArtikel('cyclus-vier-fasen'))
    expect(Object.keys(vorm).sort()).toEqual([...velden].sort())
  })

  it('bouwt een openbare url', () => {
    const vorm = publiekeVorm(vindArtikel('cyclus-vier-fasen'))
    expect(vorm.url).toBe('https://ovari.youcaps.app/kennis/cyclus-vier-fasen')
  })

  it('vertaalt de categorie en het niveau naar het Nederlands', () => {
    const vorm = publiekeVorm(vindArtikel('cyclus-vier-fasen'))
    expect(vorm.category_label).toBe('Cyclus')
    expect(vorm.level).toBe('Basis')
  })
})

describe('de kennisbank zelf', () => {
  it('bevat negentien artikelen met een uniek id', () => {
    const ids = ARTIKELEN.map((a) => a.id)
    expect(ids).toHaveLength(19)
    expect(new Set(ids).size).toBe(19)
  })

  it('heeft nergens een leeg tekstblok', () => {
    for (const artikel of ARTIKELEN) {
      expect(artikel.body.length).toBeGreaterThan(0)
      for (const sectie of artikel.body) {
        expect(sectie.kop.length).toBeGreaterThan(0)
        expect(sectie.tekst.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('relevantiedrempel', () => {
  it('is afgeleid uit het gewicht van een tussenkop, niet los gekozen', () => {
    expect(DREMPEL).toBe(GEWICHT.kop)
  })

  it('geeft nooit iets terug dat onder de drempel scoort', () => {
    for (const vraag of ['overgang', 'slaap', 'vrouwen', 'hoe blijf ik gezond', 'menstruatie']) {
      for (const treffer of zoek(ARTIKELEN, vraag).treffers) {
        expect(treffer.score, `${vraag} / ${treffer.artikel.id}`).toBeGreaterThanOrEqual(DREMPEL)
      }
    }
  })

  // 1. Duidelijke vraag over de perimenopauze hoort het juiste artikel te geven.
  it('zet bij een duidelijke overgangsvraag het juiste artikel bovenaan', () => {
    const gevallen = [
      ['opvliegers en nachtzweten', 'opvliegers-nachtzweten'],
      ['moet ik mijn hormonen laten testen', 'hormonen-meten-overgang'],
      ['droogte en pijn bij seks', 'droogte-en-pijn-bij-seks'],
      ['hoe herken ik de perimenopauze', 'perimenopauze-herkennen'],
    ]
    for (const [vraag, verwacht] of gevallen) {
      const { treffers } = zoek(ARTIKELEN, vraag)
      expect(treffers.length, vraag).toBeGreaterThan(0)
      expect(treffers[0].artikel.id, vraag).toBe(verwacht)
    }
  })

  // Bekende grens van de huidige score: alle zoektermen wegen even zwaar, ook
  // een nietszeggend woord als "tegen". Bij "wat helpt tegen botontkalking in
  // de overgang" raken twee artikelen allebei drie van de vier termen en
  // eindigen ze op dezelfde score. Het juiste artikel staat er dus wel bij,
  // maar niet gegarandeerd bovenaan. Zie de aantekening in de README.
  it('geeft het juiste artikel bij een vraag met veel vulwoorden, in de top drie', () => {
    const { treffers } = zoek(ARTIKELEN, 'wat helpt tegen botontkalking in de overgang')
    const top3 = treffers.slice(0, 3).map((t) => t.artikel.id)
    expect(top3).toContain('botgezondheid-overgang')
  })

  // 2. Indirect geformuleerd, zonder de vakterm te noemen.
  it('vindt het juiste artikel ook zonder dat de vakterm valt', () => {
    // Waar twee artikelen allebei een verdedigbaar antwoord zijn, staan ze er
    // allebei. Wakker worden in de nacht past bij het slaapartikel en bij dat
    // over nachtzweten.
    const gevallen = [
      ['ik word s nachts steeds wakker', ['slaap-en-cyclus', 'opvliegers-nachtzweten']],
      ['hartkloppingen na de menopauze', ['hart-na-overgang']],
      ['ik kan me slecht concentreren sinds de overgang', ['brain-fog-overgang']],
      ['ik ben moe en heb hevige menstruaties', ['ijzer-en-menstruatie']],
      ['somber en prikkelbaar rond mijn menstruatie', ['pms-en-stemming']],
    ]
    for (const [vraag, verwacht] of gevallen) {
      const { treffers } = zoek(ARTIKELEN, vraag)
      expect(treffers.length, vraag).toBeGreaterThan(0)
      expect(verwacht, vraag).toContain(treffers[0].artikel.id)
    }
  })

  // 3. Brede gezondheidsvraag zonder duidelijk verband: klein houden, en wat
  //    overblijft moet aantoonbaar boven de drempel liggen.
  it('houdt een brede gezondheidsvraag klein', () => {
    const breed = zoek(ARTIKELEN, 'hoe blijf ik gezond')
    expect(breed.totaal).toBeLessThanOrEqual(3)
    for (const treffer of breed.treffers) {
      expect(treffer.score).toBeGreaterThanOrEqual(DREMPEL)
    }
  })

  it('laat een breed onderwerp dat wel echt behandeld wordt staan', () => {
    const vitamines = zoek(ARTIKELEN, 'heb ik vitamines nodig')
    expect(vitamines.totaal).toBeLessThanOrEqual(2)
    expect(vitamines.treffers[0].artikel.id).toBe('botgezondheid-overgang')
  })

  // 4. Volledig buiten het onderwerp: niets teruggeven.
  it('geeft niets terug bij een onderwerp buiten de kennisbank', () => {
    for (const vraag of [
      'hypotheekrente aftrekbaar',
      'beste pizza recept',
      'hoe repareer ik mijn fiets',
      'python script schrijven',
    ]) {
      const uitkomst = zoek(ARTIKELEN, vraag)
      expect(uitkomst.totaal, vraag).toBe(0)
      expect(uitkomst.treffers, vraag).toEqual([])
    }
  })

  // 5. Een algemeen woord dat toevallig overal staat, mag niet alles matchen.
  it('laat een algemeen woord niet bijna de hele kennisbank matchen', () => {
    const zonderDrempel = ARTIKELEN.filter((a) => scoorArtikel(a, ['vrouwen']).score > 0).length
    const metDrempel = zoek(ARTIKELEN, 'vrouwen').totaal
    expect(zonderDrempel).toBeGreaterThan(10)
    expect(metDrempel).toBeLessThanOrEqual(3)
  })

  it('snoeit ook de staart van een op zich goede vraag', () => {
    const uitkomst = zoek(ARTIKELEN, 'waarom slaap ik slechter voor mijn menstruatie')
    expect(uitkomst.treffers[0].artikel.id).toBe('slaap-en-cyclus')
    expect(uitkomst.totaal).toBeLessThan(ARTIKELEN.length)
  })
})

describe('tweetalig zoeken', () => {
  // Woordenschat van de index, om te controleren dat elke Nederlandse term uit
  // de conceptlijst echt ergens in de negentien artikelen staat.
  const woordenPerArtikel = ARTIKELEN.map(
    (a) =>
      new Set(
        normaliseer(
          [
            a.id.replace(/-/g, ' '), a.title, a.subtitle, a.description,
            ...a.body.flatMap((s) => [s.kop, s.tekst]),
          ].join(' ')
        ).split(' ')
      )
  )
  const komtVoor = (term) =>
    woordenPerArtikel.some((woorden) => [...woorden].some((w) => matcht(w, term)))

  it('gebruikt alleen Nederlandse termen die echt in de kennisbank staan', () => {
    for (const concept of CONCEPTEN) {
      for (const term of concept.termen) {
        expect(komtVoor(term), `${concept.naam} / ${term}`).toBe(true)
      }
    }
  })

  it('laat een Nederlandse vraag zich precies zo gedragen als voorheen', () => {
    // Zonder Engelse aanleiding is elke groep een enkele term, dus het
    // scoremodel doet exact hetzelfde als voor de tweetalige laag.
    const groepen = groepenUit('hevige menstruaties ijzertekort')
    expect(groepen.every((g) => g.termen.length === 1)).toBe(true)
  })

  it('laat een meerwoordsbegrip voorgaan op de losse woorden', () => {
    const namen = groepenUit('heavy periods').map((g) => g.naam)
    expect(namen).toContain('hevig bloedverlies')
    expect(namen).not.toContain('cyclus')
  })

  it('vindt bij Engelse vragen hetzelfde artikel als bij de Nederlandse', () => {
    const paren = [
      ['Kunnen hevige menstruaties ijzertekort veroorzaken?', 'Can heavy periods during perimenopause cause low iron?', 'ijzer-en-menstruatie'],
      ['Wat helpt tegen botontkalking tijdens de overgang?', 'How can I protect my bones during perimenopause?', 'botgezondheid-overgang'],
      ['Waarom heb ik ineens hartkloppingen?', 'Why am I suddenly getting heart palpitations?', 'hart-na-overgang'],
    ]
    for (const [nl, en, verwacht] of paren) {
      expect(zoek(ARTIKELEN, nl).treffers[0]?.artikel.id, nl).toBe(verwacht)
      expect(zoek(ARTIKELEN, en).treffers[0]?.artikel.id, en).toBe(verwacht)
    }
  })

  it('vindt het slaapartikel bij een Engelse vraag over wakker worden', () => {
    const { treffers } = zoek(ARTIKELEN, 'I keep waking up at night')
    expect(treffers.length).toBeGreaterThan(0)
    expect(['slaap-en-cyclus', 'opvliegers-nachtzweten']).toContain(treffers[0].artikel.id)
  })

  // Bekend zwak geval, in beide talen hetzelfde. Het artikel over de breedte
  // van overgangsklachten raakt zowel slaap als perimenopauze en wint daardoor
  // van het slaapartikel. Het juiste artikel staat wel in de top drie.
  it('geeft bij slecht slapen in de overgang het slaapartikel in de top drie', () => {
    for (const vraag of [
      'Waarom slaap ik slecht tijdens de perimenopauze?',
      'Why am I sleeping badly during perimenopause?',
    ]) {
      const top3 = zoek(ARTIKELEN, vraag).treffers.slice(0, 3).map((t) => t.artikel.id)
      expect(top3, vraag).toContain('slaap-en-cyclus')
    }
  })

  it('geeft niets terug bij een Engelse vraag buiten het onderwerp', () => {
    for (const vraag of [
      'What is a good mortgage?',
      'Best pizza recipe',
      'How do I fix my bicycle?',
      'Which laptop should I buy?',
    ]) {
      expect(zoek(ARTIKELEN, vraag).totaal, vraag).toBe(0)
    }
  })

  it('houdt de Engelse resultaten boven de drempel', () => {
    for (const vraag of [
      'Why am I sleeping badly during perimenopause?',
      'Can heavy periods during perimenopause cause low iron?',
      'How can I protect my bones during perimenopause?',
    ]) {
      for (const treffer of zoek(ARTIKELEN, vraag).treffers) {
        expect(treffer.score, `${vraag} / ${treffer.artikel.id}`).toBeGreaterThanOrEqual(DREMPEL)
      }
    }
  })
})
