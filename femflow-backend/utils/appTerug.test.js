import { describe, it, expect } from 'vitest'
import { appTerugUrl, appTerugPagina } from './appTerug.js'

describe('appTerugUrl', () => {
  it('bouwt de app-link voor de vaste uitkomsten', () => {
    expect(appTerugUrl('oura_connected=true')).toBe('app.youcaps.ovari://wearable?oura_connected=true')
    expect(appTerugUrl('fitbit_error=true')).toBe('app.youcaps.ovari://wearable?fitbit_error=true')
  })

  it('weigert al het andere, zodat er geen open redirect ontstaat', () => {
    expect(() => appTerugUrl('https://kwaadaardig.example')).toThrow()
    expect(() => appTerugUrl('oura_connected=true&x=1')).toThrow()
    expect(() => appTerugUrl('')).toThrow()
  })
})

describe('appTerugPagina', () => {
  it('stuurt direct door en heeft een terugvalknop', () => {
    const html = appTerugPagina('oura_connected=true')
    expect(html).toContain('location.replace("app.youcaps.ovari://wearable?oura_connected=true")')
    expect(html).toContain('href="app.youcaps.ovari://wearable?oura_connected=true"')
    expect(html).toContain('Verbonden')
  })

  it('toont een foutmelding bij een mislukte koppeling', () => {
    expect(appTerugPagina('fitbit_error=true')).toContain('Verbinden mislukt')
  })
})
