import { describe, it, expect } from 'vitest'
import { normaliseer, termenUit, matcht, scoorArtikel, zoek, fragment } from './zoek.js'
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
  it('laat stopwoorden vallen', () => {
    expect(termenUit('waarom slaap ik slecht in de overgang')).toEqual([
      'waarom', 'slaap', 'slecht', 'overgang',
    ])
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
