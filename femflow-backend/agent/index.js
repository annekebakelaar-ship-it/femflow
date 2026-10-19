// Router voor de persoonlijke agent. Wordt in server.js alleen gemonteerd als
// AGENT_ENABLED=true; staat de vlag uit, dan bestaan deze endpoints niet.
//
// De router krijgt zijn afhankelijkheden mee (pool, authenticateToken, klok,
// auditlogger) in plaats van ze te importeren. Dat houdt server.js ongemoeid
// en maakt de hele keten testbaar met een nep-pool en fictieve gegevens.

import express from 'express'
import rateLimit from 'express-rate-limit'

import { toolManifest, vindTool, TOOLNAMEN } from './tools.js'
import { maakAuditLogger, RESULTAAT, GEEN_TOOL } from './audit.js'
import {
  TOESTEMMING_VERSIE,
  TOESTEMMING_REDENEN,
  heeftToestemming,
  leesToestemming,
  geefToestemming,
  trekToestemmingIn,
} from './toestemming.js'

export const AGENT_VERSIE = '0.2.0'

const UITLEG = {
  [TOESTEMMING_REDENEN.NOOIT_GEGEVEN]:
    'The user has not given this assistant permission to read her Ovari data. Ask her to turn it on in the app; do not guess any values.',
  [TOESTEMMING_REDENEN.INGETROKKEN]:
    'The user withdrew permission for this assistant. Do not use anything you read earlier.',
  [TOESTEMMING_REDENEN.OUDE_VERSIE]:
    'The user agreed to an older version of the permission text and has to agree again before her data can be read.',
  onbekende_tool: 'That tool does not exist in this module.',
}

/** Weigergrond uit toestemming.js naar de resultaatcode van het auditlog. */
const AUDITCODE = {
  [TOESTEMMING_REDENEN.NOOIT_GEGEVEN]: RESULTAAT.GEWEIGERD_GEEN_TOESTEMMING,
  [TOESTEMMING_REDENEN.INGETROKKEN]: RESULTAAT.GEWEIGERD_INGETROKKEN,
  [TOESTEMMING_REDENEN.OUDE_VERSIE]: RESULTAAT.GEWEIGERD_OUDE_VERSIE,
  onbekende_tool: RESULTAAT.GEWEIGERD_ONBEKENDE_TOOL,
}

export function maakAgentRouter({ pool, authenticateToken, nu = () => new Date(), limiter, audit } = {}) {
  if (!pool) throw new TypeError('maakAgentRouter vereist een pool')
  if (typeof authenticateToken !== 'function') throw new TypeError('maakAgentRouter vereist authenticateToken')

  const router = express.Router()
  const logboek = audit || maakAuditLogger({ pool, zout: process.env.AGENT_AUDIT_SALT, nu })

  // Per gebruiker, niet per IP: een agent die doordraait raakt alleen de
  // eigen gebruiker en nooit de hele app.
  const begrenzer =
    limiter ||
    rateLimit({
      windowMs: 60 * 1000,
      max: 30,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => req.userId || 'onbekend',
      handler: (req, res) => {
        logboek.schrijfRegel({
          userId: req.userId,
          tool: req.params?.naam ?? GEEN_TOOL,
          toestemming: true,
          resultaat: RESULTAAT.GEWEIGERD_LIMIET,
        })
        res.status(429).json({ ok: false, reden: 'limiet' })
      },
    })

  function weiger(res, status, reden) {
    return res.status(status).json({ ok: false, reden, uitleg: UITLEG[reden] || null })
  }

  /**
   * Een verzoek zonder geldig token wordt door authenticateToken zelf
   * afgehandeld; die roept next() niet aan. Daarom hangen we het auditspoor
   * aan het einde van het antwoord in plaats van aan de middleware.
   */
  function logGeweigerdeToegang(req, res, next) {
    res.on('finish', () => {
      if (res.statusCode === 401 && !req.userId) {
        logboek.schrijfRegel({
          userId: null,
          tool: req.params?.naam ?? GEEN_TOOL,
          toestemming: false,
          resultaat: RESULTAAT.GEWEIGERD_GEEN_TOKEN,
        })
      }
    })
    next()
  }

  async function metToestemming(req, res, tool, vervolg) {
    const rij = await leesToestemming(pool, req.userId)
    const oordeel = heeftToestemming(rij)
    if (!oordeel.ok) {
      await logboek.schrijfRegel({
        userId: req.userId,
        tool,
        toestemming: false,
        resultaat: AUDITCODE[oordeel.reden] || RESULTAAT.GEWEIGERD_GEEN_TOESTEMMING,
      })
      return weiger(res, 403, oordeel.reden)
    }
    return vervolg()
  }

  // Altijd bereikbaar zodra de module gemonteerd is: vertelt de app wat er kan
  // zonder iets over de gebruiker prijs te geven behalve haar eigen keuze.
  router.get('/status', authenticateToken, async (req, res) => {
    try {
      const rij = await leesToestemming(pool, req.userId)
      const oordeel = heeftToestemming(rij)
      res.json({
        ingeschakeld: true,
        versie: AGENT_VERSIE,
        toestemming_versie: TOESTEMMING_VERSIE,
        toestemming: oordeel.ok,
        toestemming_reden: oordeel.reden,
        tools: TOOLNAMEN,
      })
    } catch (err) {
      console.error('Agent status error:', err)
      res.status(500).json({ ok: false, reden: 'serverfout' })
    }
  })

  router.get('/consent', authenticateToken, async (req, res) => {
    try {
      const rij = await leesToestemming(pool, req.userId)
      const oordeel = heeftToestemming(rij)
      res.json({
        toestemming: oordeel.ok,
        reden: oordeel.reden,
        versie: TOESTEMMING_VERSIE,
        gegeven_op: rij?.granted_at ?? null,
        ingetrokken_op: rij?.revoked_at ?? null,
      })
    } catch (err) {
      console.error('Agent consent read error:', err)
      res.status(500).json({ ok: false, reden: 'serverfout' })
    }
  })

  router.post('/consent', authenticateToken, async (req, res) => {
    try {
      const rij = await geefToestemming(pool, req.userId)
      await logboek.schrijfRegel({
        userId: req.userId,
        tool: GEEN_TOOL,
        toestemming: true,
        resultaat: RESULTAAT.TOESTEMMING_GEGEVEN,
      })
      res.json({ toestemming: true, versie: TOESTEMMING_VERSIE, gegeven_op: rij?.granted_at ?? null })
    } catch (err) {
      console.error('Agent consent grant error:', err)
      res.status(500).json({ ok: false, reden: 'serverfout' })
    }
  })

  router.delete('/consent', authenticateToken, async (req, res) => {
    try {
      await trekToestemmingIn(pool, req.userId)
      await logboek.schrijfRegel({
        userId: req.userId,
        tool: GEEN_TOOL,
        toestemming: false,
        resultaat: RESULTAAT.TOESTEMMING_INGETROKKEN,
      })
      res.json({ toestemming: false, reden: TOESTEMMING_REDENEN.INGETROKKEN })
    } catch (err) {
      console.error('Agent consent revoke error:', err)
      res.status(500).json({ ok: false, reden: 'serverfout' })
    }
  })

  // Ontdekken mag zonder toestemming: het manifest bevat alleen beschrijvingen.
  router.get('/tools', authenticateToken, (req, res) => {
    res.json({ versie: AGENT_VERSIE, tools: toolManifest() })
  })

  // Uitvoeren nooit zonder toestemming.
  router.post('/tools/:naam', logGeweigerdeToegang, authenticateToken, begrenzer, async (req, res) => {
    const tool = vindTool(req.params.naam)
    if (!tool) {
      await logboek.schrijfRegel({
        userId: req.userId,
        tool: GEEN_TOOL,
        toestemming: false,
        resultaat: RESULTAAT.GEWEIGERD_ONBEKENDE_TOOL,
      })
      return weiger(res, 404, 'onbekende_tool')
    }
    try {
      return await metToestemming(req, res, tool.naam, async () => {
        const resultaat = await tool.handler({ pool, userId: req.userId, nu: nu() })
        // FAIL-CLOSED: zonder opgeslagen auditregel gaan er geen gegevens de
        // deur uit. Een onzichtbare uitgifte is erger dan een mislukte.
        const geschreven = await logboek.schrijfRegel({
          userId: req.userId,
          tool: tool.naam,
          toestemming: true,
          resultaat: RESULTAAT.OK,
        })
        if (!geschreven.ok) {
          return res.status(503).json({ ok: false, reden: 'audit_niet_beschikbaar' })
        }
        res.json({ ok: true, naam: tool.naam, resultaat })
      })
    } catch (err) {
      console.error(`Agent tool ${tool.naam} error:`, err)
      await logboek.schrijfRegel({
        userId: req.userId,
        tool: tool.naam,
        toestemming: true,
        resultaat: RESULTAAT.SERVERFOUT,
      })
      res.status(500).json({ ok: false, reden: 'serverfout' })
    }
  })

  return router
}
