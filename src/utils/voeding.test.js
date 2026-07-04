import { describe, it, expect } from 'vitest'
import { duidProduct, voedingstabel, isBarcode } from './voeding'

describe('duidProduct', () => {
  it('herkent een eiwitrijk product', () => {
    const { regels, eiwitrijk } = duidProduct({ proteins_100g: 11 })
    expect(eiwitrijk).toBe(true)
    expect(regels[0].toon).toBe('goed')
    expect(regels[0].tekst).toContain('Eiwitrijk')
  })

  it('waarschuwt beschrijvend bij veel suiker', () => {
    const { regels } = duidProduct({ sugars_100g: 30 })
    const suiker = regels.find(r => r.tekst.includes('suiker'))
    expect(suiker.toon).toBe('let-op')
    expect(suiker.tekst).toContain('30')
  })

  it('vezelbron vanaf 6 g per 100 g', () => {
    const { regels } = duidProduct({ fiber_100g: 7.5 })
    expect(regels[0].toon).toBe('goed')
    expect(regels[0].tekst).toContain('7,5')
  })

  it('geen data: eerlijke neutrale regel, geen verzonnen oordeel', () => {
    const { regels, eiwitrijk } = duidProduct({})
    expect(eiwitrijk).toBe(false)
    expect(regels).toHaveLength(1)
    expect(regels[0].toon).toBe('neutraal')
  })

  it('combineert goed en let-op zonder elkaar te overschrijven', () => {
    const { regels } = duidProduct({ proteins_100g: 12, salt_100g: 2.1 })
    expect(regels.some(r => r.toon === 'goed')).toBe(true)
    expect(regels.some(r => r.toon === 'let-op')).toBe(true)
  })
})

describe('voedingstabel', () => {
  it('vaste volgorde, onbekend = null', () => {
    const t = voedingstabel({ 'energy-kcal_100g': 250, proteins_100g: 9 })
    expect(t[0]).toEqual({ label: 'Energie', waarde: 250, eenheid: 'kcal' })
    expect(t[1].waarde).toBe(9)
    expect(t[2].waarde).toBeNull()
  })
})

describe('isBarcode', () => {
  it('accepteert EAN-8 en EAN-13', () => {
    expect(isBarcode('87654321')).toBe(true)
    expect(isBarcode('8712345678906')).toBe(true)
  })
  it('weigert rommel', () => {
    expect(isBarcode('abc')).toBe(false)
    expect(isBarcode('123')).toBe(false)
    expect(isBarcode('')).toBe(false)
  })
})
