import { describe, it, expect } from 'vitest'
import { leefstijlAdvies, hrvSignaal } from './leefstijlAdvies'

// Hulpje: n readings met gegeven hrv-waarden (laatste = vandaag)
const reeks = (waarden) => waarden.map((v, i) => ({ date: `2026-06-${String(i + 1).padStart(2, '0')}`, hrv_ms: v }))

describe('hrvSignaal', () => {
  it('geeft vandaag + baseline uit eerdere metingen', () => {
    const r = hrvSignaal(reeks([50, 52, 48, 51, 49, 50, 40]))
    expect(r.vandaag).toBe(40)
    expect(r.baseline).toBe(50)
  })

  it('geen baseline bij te weinig historie', () => {
    const r = hrvSignaal(reeks([50, 52, 40]))
    expect(r.vandaag).toBe(40)
    expect(r.baseline).toBeNull()
  })

  it('leeg bij geen data', () => {
    expect(hrvSignaal([])).toEqual({ vandaag: null, baseline: null })
  })
})

describe('leefstijlAdvies', () => {
  const folliculair = { fase: 'Folliculair', dag: 9, cycleLength: 28 }
  const luteaal = { fase: 'Luteaal', dag: 24, cycleLength: 28 }
  const menstruatie = { fase: 'Menstruatie', dag: 2, cycleLength: 28 }

  it('korte nacht wint van alles: slaap-pijler', () => {
    const a = leefstijlAdvies({ faseInfo: folliculair, readings: reeks([50, 50, 50, 50, 50, 50, 60]), slaapUur: 5.2 })
    expect(a.activiteitId).toBe('avondritueel')
    expect(a.reden).toContain('5.2 uur')
  })

  it('HRV 10%+ onder eigen baseline: rustdag met echte cijfers', () => {
    const a = leefstijlAdvies({ faseInfo: folliculair, readings: reeks([50, 52, 48, 51, 49, 50, 40]) })
    expect(a.activiteitId).toBe('ademwerk')
    expect(a.reden).toContain('40 ms')
    expect(a.reden).toContain('50 ms')
  })

  it('menstruatie: zacht bewegen', () => {
    const a = leefstijlAdvies({ faseInfo: menstruatie, readings: [] })
    expect(a.activiteitId).toBe('wandelen')
  })

  it('folliculair met HRV op baseline: zware krachtdag', () => {
    const a = leefstijlAdvies({ faseInfo: folliculair, readings: reeks([50, 50, 50, 50, 50, 50, 52]) })
    expect(a.activiteitId).toBe('kracht-zwaar')
  })

  it('folliculair zonder HRV-data: kracht-basis', () => {
    const a = leefstijlAdvies({ faseInfo: folliculair, readings: [] })
    expect(a.activiteitId).toBe('kracht-basis')
  })

  it('luteaal met herhaalde recente slaapklachten: rustmoment', () => {
    const gisteren = new Date(Date.now() - 864e5).toISOString()
    const vandaag = new Date().toISOString()
    const a = leefstijlAdvies({
      faseInfo: luteaal, readings: [],
      symptomen: [
        { date: gisteren, symptom: 'sleep_problem' },
        { date: vandaag, symptom: 'mood_swing' },
      ],
    })
    expect(a.activiteitId).toBe('meditatie')
  })

  it('een enkele klacht is geen patroon: gewoon basis', () => {
    const vandaag = new Date().toISOString()
    const a = leefstijlAdvies({
      faseInfo: luteaal, readings: [],
      symptomen: [{ date: vandaag, symptom: 'sleep_problem' }],
    })
    expect(a.activiteitId).toBe('kracht-basis')
  })

  it('luteaal zonder klachten: basis draaien', () => {
    const a = leefstijlAdvies({ faseInfo: luteaal, readings: [], symptomen: [] })
    expect(a.activiteitId).toBe('kracht-basis')
  })

  it('geen fase en geen data: kracht als anker', () => {
    const a = leefstijlAdvies({})
    expect(a.activiteitId).toBe('kracht-basis')
    expect(a.kop).toBe('Begin bij kracht')
  })

  it('oude symptomen (>3 dagen) triggeren geen rustadvies', () => {
    const lang_geleden = new Date(Date.now() - 10 * 864e5).toISOString()
    const a = leefstijlAdvies({
      faseInfo: luteaal, readings: [],
      symptomen: [
        { date: lang_geleden, symptom: 'sleep_problem' },
        { date: lang_geleden, symptom: 'mood_swing' },
      ],
    })
    expect(a.activiteitId).toBe('kracht-basis')
  })
})
