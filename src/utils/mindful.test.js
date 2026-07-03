import { describe, it, expect } from 'vitest'
import { mindfulPrompts, INTRO, SLOT } from './mindful'

describe('mindfulPrompts', () => {
  it('begint met de intro en eindigt met de afronding', () => {
    const p = mindfulPrompts(5)
    expect(p[0].tekst).toBe(INTRO[0].tekst)
    expect(p[p.length - 1].tekst).toBe(SLOT)
  })

  it('alle prompts vallen binnen de sessie en zijn gesorteerd', () => {
    const p = mindfulPrompts(10)
    const secs = p.map(x => x.sec)
    expect(Math.max(...secs)).toBeLessThan(10 * 60)
    expect([...secs].sort((a, b) => a - b)).toEqual(secs)
  })

  it('langere sessie heeft meer stiltes en aanwijzingen', () => {
    expect(mindfulPrompts(10).length).toBeGreaterThan(mindfulPrompts(3).length)
  })

  it('korte sessie van 3 minuten heeft geen prompt in de laatste 30 seconden behalve de afronding', () => {
    const p = mindfulPrompts(3)
    const slot = p[p.length - 1]
    expect(slot.sec).toBe(3 * 60 - 30)
    expect(p.filter(x => x.sec > slot.sec)).toHaveLength(0)
  })
})
