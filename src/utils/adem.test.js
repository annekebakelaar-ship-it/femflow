import { describe, it, expect } from 'vitest'
import { ademStap, rondesIn } from './adem'

describe('ademStap (4 in, 6 uit)', () => {
  it('seconde 0-3 is inademen, tel 1-4', () => {
    expect(ademStap(0)).toEqual({ fase: 'in', tel: 1, ronde: 1 })
    expect(ademStap(3)).toEqual({ fase: 'in', tel: 4, ronde: 1 })
  })

  it('seconde 4-9 is uitademen, tel 1-6', () => {
    expect(ademStap(4)).toEqual({ fase: 'uit', tel: 1, ronde: 1 })
    expect(ademStap(9)).toEqual({ fase: 'uit', tel: 6, ronde: 1 })
  })

  it('seconde 10 begint ronde 2 met inademen', () => {
    expect(ademStap(10)).toEqual({ fase: 'in', tel: 1, ronde: 2 })
  })

  it('werkt met afwijkend ritme (bijv. 5-5)', () => {
    expect(ademStap(5, 5, 5)).toEqual({ fase: 'uit', tel: 1, ronde: 1 })
  })
})

describe('rondesIn', () => {
  it('3 minuten bij 10s per ronde = 18 rondes', () => {
    expect(rondesIn(3)).toBe(18)
  })
})
