import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import express from 'express'

import { maakAgentRouter } from './index.js'
import { agentIngeschakeld } from './vlag.js'
import { TOESTEMMING_REDENEN } from './toestemming.js'
import { maakAuditLogger } from './audit.js'

// Twee verzonnen gebruikers. Alleen de eerste logt in; de tweede bestaat om
// te bewijzen dat je via de API niet bij andermans gegevens kunt.
const IK = '11111111-1111-4111-8111-111111111111'
const IEMAND_ANDERS = '22222222-2222-4222-8222-222222222222'
const NU = new Date('2026-10-19T09:00:00.000Z')

/** Nep-pool: herkent de queries aan een stukje SQL en onthoudt alle aanroepen. */
function maakNepPool() {
  const toestemmingRijen = new Map()
  const aanroepen = []
  return {
    aanroepen,
    toestemmingRijen,
    async query(sql, params = []) {
      aanroepen.push({ sql: sql.replace(/\s+/g, ' ').trim(), params })
      if (sql.includes('FROM femflow_agent_consent')) {
        return { rows: toestemmingRijen.has(params[0]) ? [toestemmingRijen.get(params[0])] : [] }
      }
      if (sql.includes('INSERT INTO femflow_agent_consent')) {
        const rij = { granted_at: NU.toISOString(), revoked_at: null, versie: params[1] }
        toestemmingRijen.set(params[0], rij)
        return { rows: [rij] }
      }
      if (sql.includes('UPDATE femflow_agent_consent')) {
        const bestaand = toestemmingRijen.get(params[0])
        if (!bestaand) return { rows: [] }
        const rij = { ...bestaand, revoked_at: NU.toISOString() }
        toestemmingRijen.set(params[0], rij)
        return { rows: [rij] }
      }
      if (sql.includes('FROM femflow_menstruation_data')) {
        return params[0] === IK
          ? { rows: [{ start_date: '2026-10-05', cycle_length: 28, bleeding_days: 5, updated_at: '2026-10-05' }] }
          : { rows: [{ start_date: '2026-01-01', cycle_length: 30, bleeding_days: 9, updated_at: '2026-01-01' }] }
      }
      if (sql.includes('FROM femflow_wearable_connections')) return { rows: [] }
      if (sql.includes('FROM femflow_biometric_readings')) return { rows: [] }
      if (sql.includes('FROM femflow_users')) return { rows: [{ birth_date: '1979-06-01', created_at: '2026-04-01' }] }
      if (sql.includes('FROM femflow_quiz_results')) return { rows: [] }
      throw new Error('onverwachte query in de test: ' + sql)
    },
  }
}

let server
let basis
let pool
let auditRegels

beforeEach(async () => {
  pool = maakNepPool()
  auditRegels = []
  const app = express()
  app.use(express.json())
  // Vervangt de echte JWT-middleware: de identiteit komt hier uit een header,
  // maar net als in productie NOOIT uit de body of de query.
  const authenticateToken = (req, res, next) => {
    const id = req.headers['x-test-user']
    if (!id) return res.status(401).json({ error: 'No token provided' })
    req.userId = id
    next()
  }
  const audit = maakAuditLogger({ zout: 'test-zout', nu: () => NU, sink: (r) => auditRegels.push(r) })
  app.use('/api/v1/agent', maakAgentRouter({ pool, authenticateToken, nu: () => NU, audit }))
  await new Promise((klaar) => { server = app.listen(0, klaar) })
  basis = 'http://127.0.0.1:' + server.address().port + '/api/v1/agent'
})

afterEach(async () => {
  await new Promise((klaar) => server.close(klaar))
})

const alsIk = (pad, opties = {}) =>
  fetch(basis + pad, {
    ...opties,
    headers: { 'content-type': 'application/json', 'x-test-user': IK, ...(opties.headers || {}) },
  })

describe('vlag', () => {
  it('staat standaard uit', () => {
    expect(agentIngeschakeld({})).toBe(false)
    expect(agentIngeschakeld({ AGENT_ENABLED: 'false' })).toBe(false)
    expect(agentIngeschakeld({ AGENT_ENABLED: '1' })).toBe(false)
    expect(agentIngeschakeld({ AGENT_ENABLED: 'true' })).toBe(true)
    expect(agentIngeschakeld({ AGENT_ENABLED: ' TRUE ' })).toBe(true)
  })
})

describe('agent-router', () => {
  it('eist een token voor elk endpoint', async () => {
    const r = await fetch(basis + '/status')
    expect(r.status).toBe(401)
  })

  it('geeft het toolmanifest zonder persoonlijke gegevens', async () => {
    const r = await alsIk('/tools')
    const body = await r.json()
    expect(body.tools.map((t) => t.naam)).toEqual([
      'get_my_cycle_overview',
      'get_my_recovery_trend',
      'get_my_profile_context',
    ])
    expect(body.tools.every((t) => t.annotaties.readOnlyHint)).toBe(true)
    // Geen enkele tool heeft een parameter waarmee je een gebruiker kiest.
    expect(body.tools.every((t) => Object.keys(t.invoerSchema.properties).length === 0)).toBe(true)
  })

  it('weigert een tool zonder toestemming en raakt de gegevens niet aan', async () => {
    const r = await alsIk('/tools/get_my_cycle_overview', { method: 'POST', body: '{}' })
    expect(r.status).toBe(403)
    const body = await r.json()
    expect(body.reden).toBe(TOESTEMMING_REDENEN.NOOIT_GEGEVEN)
    expect(body.uitleg).toMatch(/do not guess/i)
    expect(pool.aanroepen.some((a) => a.sql.includes('femflow_menstruation_data'))).toBe(false)
  })

  it('voert de tool uit zodra toestemming is gegeven', async () => {
    await alsIk('/consent', { method: 'POST', body: '{}' })
    const r = await alsIk('/tools/get_my_cycle_overview', { method: 'POST', body: '{}' })
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(body.resultaat.cyclusdag).toBe(15)
  })

  it('stopt na intrekken van de toestemming', async () => {
    await alsIk('/consent', { method: 'POST', body: '{}' })
    await alsIk('/consent', { method: 'DELETE' })
    const r = await alsIk('/tools/get_my_recovery_trend', { method: 'POST', body: '{}' })
    expect(r.status).toBe(403)
    expect((await r.json()).reden).toBe(TOESTEMMING_REDENEN.INGETROKKEN)
  })

  it('leest alleen de gegevens van de ingelogde gebruiker, wat de body ook beweert', async () => {
    await alsIk('/consent', { method: 'POST', body: '{}' })
    const r = await alsIk('/tools/get_my_cycle_overview', {
      method: 'POST',
      body: JSON.stringify({ user_id: IEMAND_ANDERS, userId: IEMAND_ANDERS }),
    })
    const body = await r.json()
    expect(body.resultaat.opgegeven_cycluslengte).toBe(28) // die van IK, niet 30
    const gegevensQueries = pool.aanroepen.filter((a) => a.sql.includes('femflow_menstruation_data'))
    expect(gegevensQueries.every((a) => a.params[0] === IK)).toBe(true)
    expect(JSON.stringify(pool.aanroepen)).not.toMatch(IEMAND_ANDERS)
  })

  it('kent een onbekende tool niet', async () => {
    await alsIk('/consent', { method: 'POST', body: '{}' })
    const r = await alsIk('/tools/verwijder_alles', { method: 'POST', body: '{}' })
    expect(r.status).toBe(404)
  })

  it('vertelt in status of er toestemming is', async () => {
    const voor = await (await alsIk('/status')).json()
    expect(voor.toestemming).toBe(false)
    expect(voor.tools).toHaveLength(3)
    await alsIk('/consent', { method: 'POST', body: '{}' })
    const na = await (await alsIk('/status')).json()
    expect(na.toestemming).toBe(true)
  })

  it('geeft geen getallen terug als er geen wearable gekoppeld is', async () => {
    await alsIk('/consent', { method: 'POST', body: '{}' })
    const body = await (await alsIk('/tools/get_my_recovery_trend', { method: 'POST', body: '{}' })).json()
    expect(body.resultaat).toEqual({ beschikbaar: false, reden: 'geen_wearable' })
  })
})
describe('auditlog via de router', () => {
  const codes = () => auditRegels.map((r) => r.resultaat)

  it('legt een gelukte tooluitvoering vast zonder enige gezondheidsinhoud', async () => {
    await alsIk('/consent', { method: 'POST', body: '{}' })
    const body = await (await alsIk('/tools/get_my_cycle_overview', { method: 'POST', body: '{}' })).json()
    expect(body.resultaat.cyclusdag).toBe(15)

    const regel = auditRegels.at(-1)
    expect(regel).toMatchObject({ tool: 'get_my_cycle_overview', toestemming: true, resultaat: 'ok' })
    expect(regel.gebruiker).toMatch(/^[0-9a-f]{16}$/)
    const tekst = JSON.stringify(auditRegels)
    expect(tekst).not.toContain(IK)
    expect(tekst).not.toMatch(/cyclusdag|opgegeven_cycluslengte|2026-10-05/)
  })

  it('legt een geweigerde tool zonder toestemming vast', async () => {
    await alsIk('/tools/get_my_cycle_overview', { method: 'POST', body: '{}' })
    expect(codes()).toEqual(['geweigerd_geen_toestemming'])
    expect(auditRegels[0].tool).toBe('get_my_cycle_overview')
  })

  it('legt toestemming geven en intrekken vast, en de weigering daarna', async () => {
    await alsIk('/consent', { method: 'POST', body: '{}' })
    await alsIk('/consent', { method: 'DELETE' })
    await alsIk('/tools/get_my_recovery_trend', { method: 'POST', body: '{}' })
    expect(codes()).toEqual(['toestemming_gegeven', 'toestemming_ingetrokken', 'geweigerd_ingetrokken'])
  })

  it('legt een onbekende tool vast zonder de verzonnen naam over te nemen', async () => {
    await alsIk('/consent', { method: 'POST', body: '{}' })
    await alsIk('/tools/verwijder_alles', { method: 'POST', body: '{}' })
    expect(codes().at(-1)).toBe('geweigerd_onbekende_tool')
    expect(JSON.stringify(auditRegels)).not.toContain('verwijder_alles')
  })

  it('legt een verzoek zonder token vast als onbekende gebruiker', async () => {
    const r = await fetch(basis + '/tools/get_my_profile_context', { method: 'POST' })
    expect(r.status).toBe(401)
    await new Promise((klaar) => setTimeout(klaar, 20)) // res.on('finish')
    expect(auditRegels.at(-1)).toMatchObject({ resultaat: 'geweigerd_geen_token', gebruiker: 'onbekend', toestemming: false })
  })
})
