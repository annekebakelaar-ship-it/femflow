import { describe, it, expect } from 'vitest'
import { berekenTrend, gemiddelde } from './trendHelper'

describe('berekenTrend', () => {
  it('herkent een stijgende reeks', () => {
    const { richting, pctVerschil } = berekenTrend([50, 50, 60, 60])
    expect(richting).toBe('stijgend')
    expect(pctVerschil).toBe(20)
  })

  it('herkent een dalende reeks', () => {
    expect(berekenTrend([60, 60, 50, 50]).richting).toBe('dalend')
  })

  it('kleine schommelingen zijn stabiel', () => {
    expect(berekenTrend([50, 51, 50, 51]).richting).toBe('stabiel')
  })

  it('geeft onvoldoende data bij minder dan 4 waarden', () => {
    expect(berekenTrend([50, 60]).richting).toBe('onvoldoende data')
    expect(berekenTrend([]).richting).toBe('onvoldoende data')
  })

  it('negeert null-waarden', () => {
    const { richting } = berekenTrend([50, null, 50, 60, null, 60])
    expect(richting).toBe('stijgend')
  })
})

describe('gemiddelde', () => {
  it('rekenkundig gemiddelde', () => {
    expect(gemiddelde([2, 4, 6])).toBe(4)
  })
  it('null bij lege input', () => {
    expect(gemiddelde([])).toBeNull()
    expect(gemiddelde(null)).toBeNull()
  })
})
