import { describe, it, expect } from 'vitest'
import { buildCyclusOverzicht, buildWearablePerMaand, buildSymptoomFrequenties } from './rapportData'

const NU = new Date('2026-06-10')

describe('buildCyclusOverzicht', () => {
  const data = {
    startDate: '2025-12-05',
    entries: [
      { bleeding: true, date: '2026-01-03' }, // 29
      { bleeding: true, date: '2026-02-01' }, // 29
      { bleeding: true, date: '2026-03-10' }, // 37
    ],
  }

  it('berekent baseline als mediaan van de eigen cycli', () => {
    const { baseline } = buildCyclusOverzicht(data, NU)
    expect(baseline).toBe(29)
  })

  it('geeft afwijking t.o.v. baseline per cyclus', () => {
    const { rijen } = buildCyclusOverzicht(data, NU)
    expect(rijen.map(r => r.afwijking)).toEqual([0, 0, 8])
  })

  it('zet STRAW-markers op sprongen van 7+ dagen en lange cycli', () => {
    const lang = {
      startDate: '2026-01-01',
      entries: [
        { bleeding: true, date: '2026-01-29' }, // 28
        { bleeding: true, date: '2026-04-01' }, // 62 -> lange cyclus + sprong
      ],
    }
    const { rijen } = buildCyclusOverzicht(lang, NU)
    expect(rijen[1].sprongMarker).toBe(true)
    expect(rijen[1].langeCyclusMarker).toBe(true)
  })

  it('filtert cycli ouder dan zes maanden weg', () => {
    const oud = {
      startDate: '2024-01-01',
      entries: [{ bleeding: true, date: '2024-01-29' }],
    }
    const { rijen, voldoendeData } = buildCyclusOverzicht(oud, NU)
    expect(rijen).toHaveLength(0)
    expect(voldoendeData).toBe(false)
  })

  it('voldoendeData vanaf twee cycli', () => {
    expect(buildCyclusOverzicht(data, NU).voldoendeData).toBe(true)
    expect(buildCyclusOverzicht(null, NU).voldoendeData).toBe(false)
  })
})

describe('buildWearablePerMaand', () => {
  it('geeft null zonder readings', () => {
    expect(buildWearablePerMaand(null, NU)).toBeNull()
    expect(buildWearablePerMaand([], NU)).toBeNull()
  })

  it('aggregeert per maand en berekent HRV-trend', () => {
    const readings = []
    for (let i = 0; i < 120; i++) {
      const d = new Date('2026-02-01')
      d.setDate(d.getDate() + i)
      readings.push({
        reading_date: d.toISOString().split('T')[0],
        sleep_duration_min: 420,
        hrv_ms: 50 - Math.floor(i / 30) * 2, // daalt per maand
      })
    }
    const result = buildWearablePerMaand(readings, NU)
    expect(result.maanden.length).toBeGreaterThanOrEqual(4)
    expect(result.maanden[0].slaapuurGem).toBe(7)
    expect(result.hrvTrend).toBeLessThan(0)
  })

  it('negeert readings buiten de rapportperiode', () => {
    const result = buildWearablePerMaand([
      { reading_date: '2025-01-01', sleep_duration_min: 400, hrv_ms: 50 },
    ], NU)
    expect(result).toBeNull()
  })
})

describe('buildSymptoomFrequenties', () => {
  it('telt per symptoom en sorteert aflopend', () => {
    const log = [
      { symptom: 'hot_flash', label: 'Opvlieger', date: '2026-05-01' },
      { symptom: 'hot_flash', label: 'Opvlieger', date: '2026-05-08' },
      { symptom: 'brain_fog', label: 'Brain fog', date: '2026-05-02' },
    ]
    expect(buildSymptoomFrequenties(log, NU)).toEqual([
      { label: 'Opvlieger', aantal: 2 },
      { label: 'Brain fog', aantal: 1 },
    ])
  })

  it('negeert oude entries en lege logs', () => {
    expect(buildSymptoomFrequenties([{ symptom: 'x', label: 'X', date: '2025-01-01' }], NU)).toEqual([])
    expect(buildSymptoomFrequenties(null, NU)).toEqual([])
  })
})
