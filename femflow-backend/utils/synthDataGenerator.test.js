import { describe, it, expect } from 'vitest'
import { generateSleepRange, SCENARIOS } from './synthDataGenerator.js'

describe('generateSleepRange', () => {
  it('genereert het gevraagde aantal dagen', () => {
    const { data } = generateSleepRange('user-123', 30)
    expect(data).toHaveLength(30)
  })

  it('weigert onbekende scenarios', () => {
    expect(() => generateSleepRange('user-123', 10, 'bestaat-niet')).toThrow(/Scenario/)
  })

  it('accepteert alle gedocumenteerde scenarios', () => {
    for (const scenario of SCENARIOS) {
      expect(() => generateSleepRange('user-123', 5, scenario)).not.toThrow()
    }
  })

  it('is deterministisch voor dezelfde user (zelfde seed)', () => {
    const end = new Date('2026-06-01')
    const a = generateSleepRange('user-123', 10, 'stable', end)
    const b = generateSleepRange('user-123', 10, 'stable', end)
    expect(a.data.map(d => d.average_hrv)).toEqual(b.data.map(d => d.average_hrv))
  })

  it('geeft verschillende data voor verschillende users', () => {
    const end = new Date('2026-06-01')
    const a = generateSleepRange('user-123', 10, 'stable', end)
    const b = generateSleepRange('user-456', 10, 'stable', end)
    expect(a.data.map(d => d.average_hrv)).not.toEqual(b.data.map(d => d.average_hrv))
  })

  it('houdt metrics binnen fysiologische grenzen', () => {
    const { data } = generateSleepRange('user-789', 60, 'dip')
    for (const d of data) {
      expect(d.average_hrv).toBeGreaterThanOrEqual(12)
      expect(d.average_hrv).toBeLessThanOrEqual(140)
      expect(d.lowest_heart_rate).toBeGreaterThanOrEqual(38)
      expect(d.lowest_heart_rate).toBeLessThanOrEqual(90)
      expect(d.readiness_score).toBeGreaterThanOrEqual(1)
      expect(d.readiness_score).toBeLessThanOrEqual(100)
      expect(d.deep_sleep_duration).toBeLessThanOrEqual(d.total_sleep_duration)
    }
  })

  it('levert opeenvolgende dagen eindigend op endDay', () => {
    const end = new Date('2026-06-01')
    const { data } = generateSleepRange('user-123', 3, 'stable', end)
    expect(data.map(d => d.day)).toEqual(['2026-05-30', '2026-05-31', '2026-06-01'])
  })

  it('markeert alles als long_sleep (zoals de Oura sleep-collectie)', () => {
    const { data } = generateSleepRange('user-123', 5)
    expect(data.every(d => d.type === 'long_sleep')).toBe(true)
  })
})
