import { describe, it, expect } from 'vitest'
import { dagenUit, startsUit, afgeleide, toggleDag } from './kalender'

describe('dagenUit (migratie oude datavorm)', () => {
  it('leidt de reeks af uit startDate + bleedingDays + FAB-entries', () => {
    const md = {
      startDate: '2026-06-01', bleedingDays: 3,
      entries: [{ bleeding: true, date: '2026-05-04' }, { note: 'x' }],
    }
    expect(dagenUit(md)).toEqual(['2026-05-04', '2026-06-01', '2026-06-02', '2026-06-03'])
  })

  it('nieuwe vorm wint: dagen[] wordt direct gebruikt', () => {
    expect(dagenUit({ dagen: ['2026-07-02', '2026-07-01'] })).toEqual(['2026-07-01', '2026-07-02'])
  })

  it('leeg zonder data', () => {
    expect(dagenUit(null)).toEqual([])
  })
})

describe('startsUit', () => {
  it('herkent starts over reeksgrenzen heen', () => {
    const dagen = ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-29', '2026-06-30', '2026-07-01']
    expect(startsUit(dagen)).toEqual(['2026-06-01', '2026-06-29'])
  })
})

describe('afgeleide', () => {
  it('mediaan-cyclus bij onregelmatige gaten (26, 30, 34 -> 30)', () => {
    const dagen = ['2026-03-01', '2026-03-27', '2026-04-26', '2026-05-30']
    const a = afgeleide(dagen, {})
    expect(a.cycleLength).toBe(30)
    expect(a.startDate).toBe('2026-05-30')
  })

  it('menstruatieduur = mediaan van reekslengtes', () => {
    const dagen = [
      '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05',
      '2026-05-29', '2026-05-30', '2026-05-31',
    ]
    const a = afgeleide(dagen, {})
    expect(a.bleedingDays).toBe(3)
  })

  it('eerdere starts worden historie-entries; laatste start = startDate', () => {
    const dagen = ['2026-05-01', '2026-05-29']
    const a = afgeleide(dagen, { entries: [{ note: 'bewaar mij' }] })
    expect(a.startDate).toBe('2026-05-29')
    expect(a.entries).toEqual([{ note: 'bewaar mij' }, { bleeding: true, date: '2026-05-01' }])
  })

  it('een enkele start: geen cyclus verzinnen, fallback op huidig/28', () => {
    const a = afgeleide(['2026-07-01'], {})
    expect(a.cycleLength).toBe(28)
  })
})

describe('toggleDag', () => {
  it('tikt aan en weer uit, met herberekende afgeleiden', () => {
    let md = { startDate: '2026-06-01', bleedingDays: 2, cycleLength: 28 }
    md = toggleDag(md, '2026-06-29')
    expect(md.dagen).toContain('2026-06-29')
    expect(md.startDate).toBe('2026-06-29')
    md = toggleDag(md, '2026-06-29')
    expect(md.dagen).not.toContain('2026-06-29')
    expect(md.startDate).toBe('2026-06-01')
  })
})
