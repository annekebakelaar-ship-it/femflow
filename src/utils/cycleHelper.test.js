import { describe, it, expect } from 'vitest'
import { getCycleLengths, hasEarlyTransitionMarker, hasLateTransitionMarker } from './cycleHelper'

describe('getCycleLengths', () => {
  it('geeft lege array bij ontbrekende data', () => {
    expect(getCycleLengths(null)).toEqual([])
    expect(getCycleLengths({})).toEqual([])
    expect(getCycleLengths({ startDate: '2026-01-01' })).toEqual([])
  })

  it('berekent cycluslengte tussen twee menstruatiestarts', () => {
    const result = getCycleLengths({
      startDate: '2026-01-01',
      entries: [{ bleeding: true, date: '2026-01-29' }],
    })
    expect(result).toHaveLength(1)
    expect(result[0].length).toBe(28)
  })

  it('sorteert ongeordende starts chronologisch', () => {
    const result = getCycleLengths({
      startDate: '2026-03-01',
      entries: [
        { bleeding: true, date: '2026-01-05' },
        { bleeding: true, date: '2026-02-02' },
      ],
    })
    expect(result.map(c => c.length)).toEqual([28, 27])
  })

  it('telt dezelfde dag niet dubbel als start', () => {
    const result = getCycleLengths({
      startDate: '2026-01-01',
      entries: [
        { bleeding: true, date: '2026-01-01' },
        { bleeding: true, date: '2026-01-29' },
      ],
    })
    expect(result).toHaveLength(1)
  })

  it('negeert onrealistische lengtes (>= 365 dagen)', () => {
    const result = getCycleLengths({
      startDate: '2024-01-01',
      entries: [{ bleeding: true, date: '2026-01-01' }],
    })
    expect(result).toEqual([])
  })

  it('negeert entries zonder bleeding of zonder datum', () => {
    const result = getCycleLengths({
      startDate: '2026-01-01',
      entries: [
        { bleeding: false, date: '2026-01-15' },
        { bleeding: true },
      ],
    })
    expect(result).toEqual([])
  })
})

describe('hasEarlyTransitionMarker (STRAW: >= 7 dagen verschil)', () => {
  const cycles = [{ length: 28 }, { length: 35 }, { length: 34 }]

  it('eerste cyclus heeft nooit een marker', () => {
    expect(hasEarlyTransitionMarker(cycles, 0)).toBe(false)
  })

  it('herkent een sprong van 7+ dagen', () => {
    expect(hasEarlyTransitionMarker(cycles, 1)).toBe(true)
  })

  it('markeert kleine schommelingen niet', () => {
    expect(hasEarlyTransitionMarker(cycles, 2)).toBe(false)
  })
})

describe('hasLateTransitionMarker (STRAW: >= 60 dagen)', () => {
  it('markeert cycli van 60 dagen of langer', () => {
    expect(hasLateTransitionMarker({ length: 60 })).toBe(true)
    expect(hasLateTransitionMarker({ length: 65 })).toBe(true)
  })

  it('markeert normale cycli niet', () => {
    expect(hasLateTransitionMarker({ length: 35 })).toBe(false)
  })
})
