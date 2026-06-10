import { describe, it, expect } from 'vitest'
import { logOpties, voegPeriodeStartToe, laatsteStart } from './periodeLog'

const NU = new Date('2026-06-10T12:00:00')

describe('logOpties', () => {
  it('geeft vandaag, gisteren en eergisteren', () => {
    const opties = logOpties(NU)
    expect(opties).toHaveLength(3)
    expect(opties.map(o => o.datum)).toEqual(['2026-06-10', '2026-06-09', '2026-06-08'])
    expect(opties[0].label).toBe('Vandaag')
  })
})

describe('voegPeriodeStartToe', () => {
  it('maakt een nieuw record zonder bestaande data', () => {
    const { status, data } = voegPeriodeStartToe(null, '2026-06-10')
    expect(status).toBe('aangemaakt')
    expect(data.startDate).toBe('2026-06-10')
    expect(data.cycleLength).toBe(28)
    expect(data.entries).toEqual([])
  })

  it('voegt een bleeding-entry toe aan bestaande data', () => {
    const bestaand = { startDate: '2026-05-13', cycleLength: 29, bleedingDays: 5, entries: [] }
    const { status, data } = voegPeriodeStartToe(bestaand, '2026-06-10')
    expect(status).toBe('toegevoegd')
    expect(data.entries).toEqual([{ bleeding: true, date: '2026-06-10' }])
    expect(data.startDate).toBe('2026-05-13')
  })

  it('weigert dubbele datum (entry)', () => {
    const bestaand = {
      startDate: '2026-05-13',
      entries: [{ bleeding: true, date: '2026-06-10' }],
    }
    const { status, data } = voegPeriodeStartToe(bestaand, '2026-06-10')
    expect(status).toBe('duplicaat')
    expect(data.entries).toHaveLength(1)
  })

  it('weigert dubbele datum (startDate zelf)', () => {
    const bestaand = { startDate: '2026-06-10', entries: [] }
    expect(voegPeriodeStartToe(bestaand, '2026-06-10').status).toBe('duplicaat')
  })

  it('muteert de input niet', () => {
    const bestaand = { startDate: '2026-05-13', entries: [] }
    voegPeriodeStartToe(bestaand, '2026-06-10')
    expect(bestaand.entries).toEqual([])
  })
})

describe('laatsteStart', () => {
  it('null zonder data', () => {
    expect(laatsteStart(null)).toBeNull()
  })

  it('pakt de meest recente start uit startDate en entries', () => {
    const data = {
      startDate: '2026-04-15',
      entries: [
        { bleeding: true, date: '2026-05-13' },
        { bleeding: false, date: '2026-05-20' },
      ],
    }
    expect(laatsteStart(data).toISOString().split('T')[0]).toBe('2026-05-13')
  })
})
