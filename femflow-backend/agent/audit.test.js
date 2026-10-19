import { describe, it, expect, vi } from 'vitest'
import { maakAuditLogger, maakRegel, pseudoniem, RESULTAAT, GEEN_TOOL } from './audit.js'

const ZOUT = 'test-zout-niet-geheim'
const IK = '11111111-1111-4111-8111-111111111111'
const IEMAND_ANDERS = '22222222-2222-4222-8222-222222222222'
const NU = new Date('2026-10-19T09:00:00.000Z')

describe('pseudoniem', () => {
  it('is stabiel voor dezelfde gebruiker en hetzelfde zout', () => {
    expect(pseudoniem(IK, ZOUT)).toBe(pseudoniem(IK, ZOUT))
  })

  it('verschilt per gebruiker', () => {
    expect(pseudoniem(IK, ZOUT)).not.toBe(pseudoniem(IEMAND_ANDERS, ZOUT))
  })

  it('verschilt per zout, zodat een gelekt log niet te koppelen is', () => {
    expect(pseudoniem(IK, ZOUT)).not.toBe(pseudoniem(IK, 'ander-zout'))
  })

  it('bevat het echte user_id niet', () => {
    const p = pseudoniem(IK, ZOUT)
    expect(p).toMatch(/^[0-9a-f]{16}$/)
    expect(p).not.toContain('1111')
  })

  it('geeft onbekend als er geen gebruiker is', () => {
    expect(pseudoniem(null, ZOUT)).toBe('onbekend')
  })
})

describe('maakRegel', () => {
  it('bevat precies vijf velden en geen enkel ander', () => {
    const regel = maakRegel({ userId: IK, tool: 'get_my_cycle_overview', toestemming: true, resultaat: RESULTAAT.OK, zout: ZOUT, nu: NU })
    expect(Object.keys(regel).sort()).toEqual(['gebruiker', 'resultaat', 'tijdstip', 'toestemming', 'tool'])
    expect(regel.tijdstip).toBe('2026-10-19T09:00:00.000Z')
  })

  it('weigert een verzonnen resultaatcode', () => {
    expect(() => maakRegel({ userId: IK, tool: null, resultaat: 'iets_anders', zout: ZOUT })).toThrow()
  })

  it('staat een gebeurtenis zonder tool toe', () => {
    const regel = maakRegel({ userId: IK, tool: GEEN_TOOL, toestemming: true, resultaat: RESULTAAT.TOESTEMMING_GEGEVEN, zout: ZOUT, nu: NU })
    expect(regel.tool).toBeNull()
  })
})

describe('maakAuditLogger', () => {
  it('schrijft naar de sink en naar de database', async () => {
    const regels = []
    const queries = []
    const pool = { query: async (sql, params) => { queries.push({ sql, params }); return { rows: [] } } }
    const logboek = maakAuditLogger({ pool, zout: ZOUT, nu: () => NU, sink: (r) => regels.push(r) })

    await logboek.schrijfRegel({ userId: IK, tool: 'get_my_recovery_trend', toestemming: true, resultaat: RESULTAAT.OK })

    expect(regels).toHaveLength(1)
    expect(regels[0]).toEqual({
      tijdstip: '2026-10-19T09:00:00.000Z',
      gebruiker: pseudoniem(IK, ZOUT),
      tool: 'get_my_recovery_trend',
      toestemming: true,
      resultaat: 'ok',
    })
    expect(queries[0].sql).toMatch(/INSERT INTO femflow_agent_audit/)
    expect(queries[0].params).toHaveLength(5)
  })

  it('laat geen gezondheidsinhoud, token of body door: die velden bestaan niet', async () => {
    const regels = []
    const logboek = maakAuditLogger({ zout: ZOUT, nu: () => NU, sink: (r) => regels.push(r) })

    await logboek.schrijfRegel({
      userId: IK,
      tool: 'get_my_cycle_overview',
      toestemming: true,
      resultaat: RESULTAAT.OK,
      // Alles hieronder wordt genegeerd omdat schrijfRegel het niet uitleest.
      resultaatInhoud: { cyclusdag: 15, hrv_ms: 52 },
      token: 'eyJhbGciOiJIUzI1NiJ9.geheim',
      body: { user_id: IEMAND_ANDERS },
      email: 'iemand@example.com',
    })

    const tekst = JSON.stringify(regels[0])
    expect(tekst).not.toMatch(/cyclusdag|hrv_ms|eyJ|example\.com/)
    expect(tekst).not.toContain(IK)
    expect(Object.keys(regels[0])).toHaveLength(5)
  })

  it('laat het verzoek niet klappen als het log stukgaat, en meldt het een keer', async () => {
    const waarschuwingen = []
    const pool = { query: async () => { const e = new Error('relation does not exist'); e.code = '42P01'; throw e } }
    const logboek = maakAuditLogger({ pool, zout: ZOUT, nu: () => NU, waarschuw: (m) => waarschuwingen.push(m) })

    await expect(logboek.schrijfRegel({ userId: IK, tool: 'x', toestemming: true, resultaat: RESULTAAT.OK })).resolves.toBeTruthy()
    await logboek.schrijfRegel({ userId: IK, tool: 'x', toestemming: true, resultaat: RESULTAAT.OK })

    expect(waarschuwingen).toHaveLength(1)
    expect(waarschuwingen[0]).toMatch(/42P01/)
  })

  it('draait zonder zout met een vluchtig zout en waarschuwt daarover', async () => {
    const waarschuw = vi.fn()
    const logboek = maakAuditLogger({ waarschuw })
    expect(logboek.vluchtigZout).toBe(true)
    expect(waarschuw).toHaveBeenCalledWith(expect.stringMatching(/AGENT_AUDIT_SALT/))
  })

  it('kent een resultaatcode voor elke weigering die de router kan geven', () => {
    for (const code of [
      'geweigerd_geen_token',
      'geweigerd_geen_toestemming',
      'geweigerd_ingetrokken',
      'geweigerd_oude_versie',
      'geweigerd_onbekende_tool',
      'geweigerd_scope',
      'geweigerd_limiet',
      'serverfout',
      'toestemming_gegeven',
      'toestemming_ingetrokken',
    ]) {
      expect(Object.values(RESULTAAT)).toContain(code)
    }
  })
})
