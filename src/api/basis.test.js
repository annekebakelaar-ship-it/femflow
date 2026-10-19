import { describe, it, expect, vi, afterEach } from 'vitest'

// basis.js leest import.meta.env bij het laden, dus elke variant vraagt om
// een verse import met een andere omgeving.
async function laad({ api, omgeving }) {
  vi.resetModules()
  vi.stubEnv('VITE_API_URL', api)
  vi.stubEnv('VITE_OMGEVING', omgeving)
  return import('./basis.js')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('API-basis', () => {
  it('gebruikt het opgegeven adres', async () => {
    const m = await laad({ api: 'https://femflow-9yp9.onrender.com', omgeving: 'test' })
    expect(m.API_BASIS).toBe('https://femflow-9yp9.onrender.com')
    expect(m.IS_TESTOMGEVING).toBe(true)
  })

  it('knipt een slash op het eind weg, zodat paden niet dubbel worden', async () => {
    const m = await laad({ api: 'https://femflow-9yp9.onrender.com/', omgeving: 'test' })
    expect(m.API_BASIS).toBe('https://femflow-9yp9.onrender.com')
  })

  it('weigert een testbouw zonder adres, want die zou tegen productie praten', async () => {
    await expect(laad({ api: '', omgeving: 'test' })).rejects.toThrow(/VITE_API_URL ontbreekt/)
  })

  it('weigert een testbouw die naar de productie-API wijst', async () => {
    await expect(laad({ api: 'https://femflow-api.onrender.com', omgeving: 'test' }))
      .rejects.toThrow(/productie-API/)
  })

  it('laat een gewone bouw terugvallen op productie, zoals altijd', async () => {
    const m = await laad({ api: '', omgeving: '' })
    expect(m.API_BASIS).toBe('https://femflow-api.onrender.com')
    expect(m.IS_TESTOMGEVING).toBe(false)
  })
})
