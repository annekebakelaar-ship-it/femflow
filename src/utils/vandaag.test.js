import { describe, it, expect } from 'vitest'
import { begroeting, herstelTekst, slaapTekst, temperatuurTekst, energieTekst, voornaamUit, adviesTekst, ADVIES_TEKST } from './vandaag'

describe('begroeting', () => {
  it('kiest het dagdeel op de grenzen', () => {
    expect(begroeting(0)).toBe('Goedenacht')
    expect(begroeting(4)).toBe('Goedenacht')
    expect(begroeting(5)).toBe('Goedemorgen')
    expect(begroeting(11)).toBe('Goedemorgen')
    expect(begroeting(12)).toBe('Goedemiddag')
    expect(begroeting(17)).toBe('Goedemiddag')
    expect(begroeting(18)).toBe('Goedenavond')
    expect(begroeting(23)).toBe('Goedenavond')
  })
})

describe('tegelwaarden', () => {
  it('herstel in hele ms', () => {
    expect(herstelTekst(61.6)).toBe('62 ms')
    expect(herstelTekst(null)).toBe('—')
    expect(herstelTekst(undefined)).toBe('—')
  })

  it('slaap als uren en minuten, eerst afgerond', () => {
    expect(slaapTekst(462)).toBe('7u 42m')
    expect(slaapTekst(59.6)).toBe('1u 0m')
    expect(slaapTekst(0)).toBe('0u 0m')
    expect(slaapTekst(null)).toBe('—')
    expect(slaapTekst('geen')).toBe('—')
  })

  it('temperatuur met komma en graden', () => {
    expect(temperatuurTekst(36.6)).toBe('36,6°')
    expect(temperatuurTekst(37)).toBe('37,0°')
    expect(temperatuurTekst('36.4')).toBe('36,4°')
    expect(temperatuurTekst(null)).toBe('—')
  })

  it('energie op 100', () => {
    expect(energieTekst(78)).toBe('78/100')
    expect(energieTekst(77.5)).toBe('78/100')
    expect(energieTekst(undefined)).toBe('—')
  })
})

describe('voornaamUit', () => {
  it('pakt het eerste woord', () => {
    expect(voornaamUit('  Anna de Vries ')).toBe('Anna')
    expect(voornaamUit('')).toBe('')
    expect(voornaamUit(null)).toBe('')
  })
})

describe('adviesTekst', () => {
  it('geeft de regel bij het advies en valt terug op kracht-basis', () => {
    expect(adviesTekst('meditatie')).toBe('Plan vandaag ruimte voor herstel en luister naar je energie.')
    expect(adviesTekst('onbekend')).toBe(ADVIES_TEKST['kracht-basis'])
    expect(adviesTekst(undefined)).toBe(ADVIES_TEKST['kracht-basis'])
  })

  it('elke regel past in twee regels op de kaart', () => {
    for (const tekst of Object.values(ADVIES_TEKST)) expect(tekst.length).toBeLessThanOrEqual(64)
  })
})
