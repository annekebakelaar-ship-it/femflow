import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import express from 'express'

import { maakDiagnose, diagnoseConfiguratie, diagnoseIngeschakeld, routeLabel, PREFIX, FOUTCATEGORIEEN } from './diagnose.js'

const NU = Date.parse('2026-10-22T08:00:00.000Z')

describe('activering, fail-closed', () => {
  it('staat uit zonder vlag', () => {
    expect(diagnoseIngeschakeld({})).toBe(false)
    expect(diagnoseIngeschakeld({ AGENT_DIAGNOSE: 'false' })).toBe(false)
    expect(diagnoseIngeschakeld({ AGENT_DIAGNOSE: '1' })).toBe(false)
    expect(diagnoseIngeschakeld({ AGENT_DIAGNOSE: 'ja' })).toBe(false)
  })

  it('staat aan met de vlag, standaard zestig minuten', () => {
    expect(diagnoseConfiguratie({ AGENT_DIAGNOSE: 'true' })).toEqual({ aan: true, minuten: 60 })
    expect(diagnoseConfiguratie({ AGENT_DIAGNOSE: ' TRUE ' })).toEqual({ aan: true, minuten: 60 })
  })

  it('accepteert een geldige duur', () => {
    expect(diagnoseConfiguratie({ AGENT_DIAGNOSE: 'true', AGENT_DIAGNOSE_MINUTEN: '15' })).toEqual({ aan: true, minuten: 15 })
  })

  it('blijft uit bij een onzinnige duur, in plaats van iets te verzinnen', () => {
    for (const waarde of ['nul', '-5', '0', '61', '600', '15m', '1.5', '']) {
      const c = diagnoseConfiguratie({ AGENT_DIAGNOSE: 'true', AGENT_DIAGNOSE_MINUTEN: waarde })
      if (waarde === '') {
        expect(c.aan).toBe(true) // leeg = niet opgegeven = standaard
      } else {
        expect(c.aan, `waarde ${waarde}`).toBe(false)
        expect(c.reden).toBeTruthy()
      }
    }
  })

  it('begrenst de duur ook als iemand de functie rechtstreeks aanroept', () => {
    expect(maakDiagnose({ minuten: 9999, nu: () => NU }).minuten).toBe(60)
    expect(maakDiagnose({ minuten: 0, nu: () => NU }).minuten).toBe(1)
  })
})

describe('routelabels', () => {
  it('kent de routes die ertoe doen', () => {
    expect(routeLabel('/.well-known/oauth-authorization-server')).toBe('wellknown-as')
    expect(routeLabel('/.well-known/oauth-protected-resource')).toBe('wellknown-prm')
    expect(routeLabel('/.well-known/oauth-protected-resource/api/v1/agent/oauth/mcp')).toBe('wellknown-prm-pad')
    expect(routeLabel('/api/v1/agent/oauth/authorize')).toBe('authorize')
    expect(routeLabel('/api/v1/agent/oauth/token')).toBe('token')
    expect(routeLabel('/api/v1/agent/oauth/mcp')).toBe('mcp')
    expect(routeLabel('/api/v1/agent/oauth/mcp/tools/get_my_cycle_overview')).toBe('mcp-tool')
  })

  it('noemt alles wat niet in de lijst staat overig, en neemt het pad niet over', () => {
    expect(routeLabel('/wp-admin.php')).toBe('overig')
    expect(routeLabel('/api/v1/users/me')).toBe('overig')
    expect(routeLabel('/iets/met/een/geheim-in-het-pad')).toBe('overig')
    expect(routeLabel(undefined)).toBe('overig')
  })
})

describe('privacy van de logregel', () => {
  let app, server, basis, regels

  beforeEach(async () => {
    regels = []
    const diagnose = maakDiagnose({ minuten: 60, nu: () => Date.now(), schrijf: (r) => regels.push(r) })
    app = express()
    app.use(express.json())
    app.use(diagnose.middleware)
    app.get('/api/v1/agent/oauth/authorize', (req, res) => {
      res.locals.diagnoseReden = 'invalid_scope'
      res.redirect(302, 'https://chatgpt.com/connector_platform_oauth_redirect?error=invalid_scope&state=geheime-state')
    })
    app.post('/api/v1/agent/oauth/token', (req, res) => res.status(400).json({ error: 'invalid_grant' }))
    app.get('/api/v1/users/me', (req, res) => res.json({ ok: true }))
    await new Promise((k) => { server = app.listen(0, k) })
    basis = `http://127.0.0.1:${server.address().port}`
  })

  afterEach(async () => { await new Promise((k) => server.close(k)) })

  it('logt geen querystring, header, cookie of token', async () => {
    await fetch(
      `${basis}/api/v1/agent/oauth/authorize?client_id=https%3A%2F%2Fchatgpt.com%2Foauth%2Fclient.json&state=geheime-state&code_challenge=GEHEIME-CHALLENGE&scope=ovari%3Acycle`,
      {
        redirect: 'manual',
        headers: {
          authorization: 'Bearer eyJhbGciOiJSUzI1NiJ9.GEHEIM.TOKEN',
          cookie: 'sessie=geheim',
          'user-agent': 'ChatGPT-User/1.0',
          'x-forwarded-for': '203.0.113.9',
        },
      }
    )

    expect(regels).toHaveLength(1)
    const regel = regels[0]
    for (const verboden of [
      'geheime-state', 'GEHEIME-CHALLENGE', 'client_id', 'scope=', 'eyJhbGciOiJSUzI1NiJ9',
      'Bearer', 'sessie', 'ChatGPT-User', '203.0.113.9', 'chatgpt.com', '?',
    ]) {
      expect(regel, `bevat ${verboden}`).not.toContain(verboden)
    }
  })

  it('bevat precies de zes toegestane velden', async () => {
    await fetch(`${basis}/api/v1/agent/oauth/authorize?state=x`, { redirect: 'manual' })
    const regel = regels[0]
    // PREFIX tijdstip METHODE label status duur [reden=...]
    const delen = regel.split(' ')
    expect(delen[0]).toBe(PREFIX)
    expect(delen[1]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    expect(delen[2]).toBe('GET')
    expect(delen[3]).toBe('authorize')
    expect(delen[4]).toBe('302')
    expect(delen[5]).toMatch(/^\d+ms$/)
    expect(delen[6]).toBe('reden=invalid_scope')
    expect(delen).toHaveLength(7)
  })

  it('neemt alleen foutcategorieen uit de vaste lijst over', async () => {
    const extra = []
    const diagnose = maakDiagnose({ schrijf: (r) => extra.push(r) })
    const app2 = express()
    app2.use(diagnose.middleware)
    app2.get('/api/v1/agent/oauth/token', (req, res) => {
      res.locals.diagnoseReden = 'e-mailadres van de gebruiker'
      res.status(400).end()
    })
    const s2 = await new Promise((k) => { const s = app2.listen(0, () => k(s)) })
    await fetch(`http://127.0.0.1:${s2.address().port}/api/v1/agent/oauth/token`)
    await new Promise((k) => s2.close(k))

    expect(extra[0]).not.toContain('e-mailadres')
    expect(extra[0].endsWith('ms')).toBe(true)
    expect([...FOUTCATEGORIEEN]).not.toContain('e-mailadres van de gebruiker')
  })

  it('logt een onbekend pad als overig', async () => {
    await fetch(`${basis}/api/v1/users/me`)
    expect(regels[0]).toContain(' overig 200')
    expect(regels[0]).not.toContain('users')
  })
})

describe('automatisch uitschakelen', () => {
  it('stopt na de ingestelde tijd en meldt dat een keer', async () => {
    const regels = []
    let klok = NU
    const diagnose = maakDiagnose({ minuten: 15, nu: () => klok, schrijf: (r) => regels.push(r) })

    const app = express()
    app.use(diagnose.middleware)
    app.get('/api/v1/health', (req, res) => res.json({ status: 'healthy' }))
    const server = await new Promise((k) => { const s = app.listen(0, () => k(s)) })
    const basis = `http://127.0.0.1:${server.address().port}`

    await fetch(`${basis}/api/v1/health`)
    expect(regels).toHaveLength(1)
    expect(diagnose.actief()).toBe(true)

    klok += 16 * 60_000 // voorbij de vijftien minuten

    await fetch(`${basis}/api/v1/health`)
    await fetch(`${basis}/api/v1/health`)
    await new Promise((k) => server.close(k))

    expect(diagnose.actief()).toBe(false)
    const stopregels = regels.filter((r) => r.includes('gestopt'))
    expect(stopregels).toHaveLength(1)
    expect(regels.filter((r) => r.includes('health'))).toHaveLength(1)
  })
})

describe('het antwoord blijft onveranderd', () => {
  it('raakt status, headers en body niet aan', async () => {
    const metLog = []
    const diagnose = maakDiagnose({ schrijf: (r) => metLog.push(r) })

    async function meet(gebruikMiddleware) {
      const app = express()
      if (gebruikMiddleware) app.use(diagnose.middleware)
      app.get('/api/v1/agent/oauth/authorize', (req, res) => {
        res.set('x-test', 'waarde')
        res.redirect(302, 'https://chatgpt.com/connector_platform_oauth_redirect?error=invalid_scope&state=abc')
      })
      const server = await new Promise((k) => { const s = app.listen(0, () => k(s)) })
      const r = await fetch(`http://127.0.0.1:${server.address().port}/api/v1/agent/oauth/authorize`, { redirect: 'manual' })
      const uit = { status: r.status, locatie: r.headers.get('location'), test: r.headers.get('x-test'), body: await r.text() }
      await new Promise((k) => server.close(k))
      return uit
    }

    const zonder = await meet(false)
    const met = await meet(true)
    expect(met).toEqual(zonder)
    expect(metLog).toHaveLength(1)
  })
})
