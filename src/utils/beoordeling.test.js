import { describe, it, expect } from 'vitest'
import { magVragen, genoegCheckins } from './beoordeling'

const NU = new Date('2026-10-19T12:00:00Z')

describe('magVragen', () => {
  it('vraagt nooit op het web, want het Play-venster bestaat daar niet', () => {
    expect(magVragen({ native: false, gevraagdOp: null, nu: NU })).toBe(false)
  })

  it('vraagt in de app als er nog nooit gevraagd is', () => {
    expect(magVragen({ native: true, gevraagdOp: null, nu: NU })).toBe(true)
  })

  it('vraagt niet opnieuw binnen 120 dagen', () => {
    expect(magVragen({ native: true, gevraagdOp: '2026-09-01T12:00:00Z', nu: NU })).toBe(false)
  })

  it('vraagt weer na 120 dagen', () => {
    expect(magVragen({ native: true, gevraagdOp: '2026-05-01T12:00:00Z', nu: NU })).toBe(true)
  })

  it('behandelt een onleesbare opgeslagen datum als nooit gevraagd', () => {
    expect(magVragen({ native: true, gevraagdOp: 'kapot', nu: NU })).toBe(true)
  })
})

describe('genoegCheckins', () => {
  const dag = (d) => ({ symptom: 'hot_flash', date: `2026-10-${d}T08:00:00.000Z` })

  it('telt dagen, niet losse tikken', () => {
    const log = [dag('01'), dag('01'), dag('01'), dag('01'), dag('01')]
    expect(genoegCheckins(log)).toBe(false)
  })

  it('is waar bij vijf verschillende dagen', () => {
    expect(genoegCheckins([dag('01'), dag('02'), dag('03'), dag('04'), dag('05')])).toBe(true)
  })

  it('is onwaar bij vier dagen', () => {
    expect(genoegCheckins([dag('01'), dag('02'), dag('03'), dag('04')])).toBe(false)
  })

  it('overleeft rommel in het log', () => {
    expect(genoegCheckins([null, {}, { date: 5 }, dag('01')])).toBe(false)
    expect(genoegCheckins(null)).toBe(false)
  })
})
