import { describe, it, expect } from 'vitest'
import { bouwSupplementSuggesties } from './supplementAdvies'

describe('bouwSupplementSuggesties', () => {
  it('geeft geen suggesties zonder onderbouwende data', () => {
    expect(bouwSupplementSuggesties({})).toEqual([])
    expect(bouwSupplementSuggesties({ slaapGemUur: 7.5, hrvRichting: 'stabiel', symptomen: {} })).toEqual([])
  })

  it('korte nachten -> melatonine met feitelijke reden', () => {
    const s = bouwSupplementSuggesties({ slaapGemUur: 6.4 })
    expect(s).toHaveLength(1)
    expect(s[0].id).toBe('melatonine')
    expect(s[0].reden).toContain('6,4 uur')
    expect(s[0].claim).toContain('in slaap te vallen')
  })

  it('dalende HRV -> magnesium', () => {
    const s = bouwSupplementSuggesties({ hrvRichting: 'dalend' })
    expect(s[0].id).toBe('magnesium')
  })

  it('dubbele magnesium-triggers leveren een suggestie op', () => {
    const s = bouwSupplementSuggesties({ hrvRichting: 'dalend', symptomen: { extreme_fatigue: 5 } })
    expect(s.filter(x => x.id === 'magnesium')).toHaveLength(1)
  })

  it('stemming heeft voorrang op fase voor B6', () => {
    const s = bouwSupplementSuggesties({ fase: 'Luteaal', symptomen: { mood_swing: 4 } })
    expect(s[0].id).toBe('vitamine_b6')
    expect(s[0].reden).toContain('stemmingswisselingen')
  })

  it('luteale fase zonder stemmingslog -> B6 met fase-reden', () => {
    const s = bouwSupplementSuggesties({ fase: 'Luteaal' })
    expect(s[0].id).toBe('vitamine_b6')
    expect(s[0].reden).toContain('luteale fase')
  })

  it('symptomen onder de drempel (3) tellen niet', () => {
    expect(bouwSupplementSuggesties({ symptomen: { brain_fog: 2, mood_swing: 2, extreme_fatigue: 2 } })).toEqual([])
  })

  it('maximaal drie suggesties', () => {
    const s = bouwSupplementSuggesties({
      slaapGemUur: 6,
      hrvRichting: 'dalend',
      fase: 'Luteaal',
      symptomen: { brain_fog: 5, mood_swing: 5, extreme_fatigue: 5 },
    })
    expect(s.length).toBeLessThanOrEqual(3)
  })

  it('alle claims zijn EFSA-formuleringen (draagt bij tot)', () => {
    const s = bouwSupplementSuggesties({
      slaapGemUur: 6, hrvRichting: 'dalend', fase: 'Luteaal', symptomen: { brain_fog: 5 },
    })
    for (const x of s) expect(x.claim).toMatch(/^draagt bij tot/)
  })
})

describe('nieuwe symptoomregels', () => {
  it('slecht geslapen (>=3) -> melatonine, ook zonder wearable', () => {
    const s = bouwSupplementSuggesties({ symptomen: { sleep_problem: 4 } })
    expect(s[0].id).toBe('melatonine')
    expect(s[0].reden).toContain('4x slecht geslapen')
  })

  it('korte nachten uit wearable winnen van de slaaplog als reden', () => {
    const s = bouwSupplementSuggesties({ slaapGemUur: 6.2, symptomen: { sleep_problem: 5 } })
    expect(s.filter(x => x.id === 'melatonine' || x.naam === 'Melatonine')).toHaveLength(1)
    expect(s[0].reden).toContain('6,2 uur')
  })

  it('krampen (>=3) -> magnesium met spierwerking-claim', () => {
    const s = bouwSupplementSuggesties({ symptomen: { cramps: 3 } })
    expect(s[0].naam).toBe('Magnesium')
    expect(s[0].claim).toContain('spierwerking')
  })

  it('magnesium verschijnt nooit dubbel bij vermoeidheid plus krampen', () => {
    const s = bouwSupplementSuggesties({ symptomen: { extreme_fatigue: 5, cramps: 5 } })
    expect(s.filter(x => x.naam === 'Magnesium')).toHaveLength(1)
  })
})
