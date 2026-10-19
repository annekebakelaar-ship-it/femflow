// Opslag voor autorisatiecodes en refreshtokens.
//
// Twee implementaties met dezelfde vorm: een geheugenversie (hier, voor tests
// en voor lokaal draaien) en een Postgres-versie (contract hieronder, tabellen
// staan in schema.sql en zijn NIET uitgevoerd).
//
// GEHEIMEN WORDEN GEHASHT OPGESLAGEN. Een code of refreshtoken is een
// wachtwoord: wie de tabel leest mag er niets mee kunnen. We bewaren dus
// sha256 van de waarde en vergelijken op hash. De waarde zelf bestaat alleen
// in het antwoord aan de client.

import { createHash } from 'crypto'

export function hashGeheim(waarde) {
  return createHash('sha256').update(String(waarde)).digest('hex')
}

/**
 * Geheugenopslag. Verliest alles bij een herstart, wat voor codes (60 seconden
 * geldig) niet uitmaakt en voor refreshtokens betekent dat de gebruiker
 * opnieuw moet koppelen.
 */
export function geheugenOpslag() {
  const codes = new Map()
  const refresh = new Map()

  return {
    async bewaarCode(hash, gegevens) {
      codes.set(hash, { ...gegevens, gebruikt: false })
    },
    async leesCode(hash) {
      return codes.get(hash) || null
    },
    async markeerCodeGebruikt(hash) {
      const rij = codes.get(hash)
      if (rij) codes.set(hash, { ...rij, gebruikt: true })
    },
    async bewaarRefresh(hash, gegevens) {
      refresh.set(hash, { ...gegevens, ingetrokken: false })
    },
    async leesRefresh(hash) {
      return refresh.get(hash) || null
    },
    async trekRefreshIn(hash) {
      const rij = refresh.get(hash)
      if (rij) refresh.set(hash, { ...rij, ingetrokken: true })
    },
    async trekAllesInVoorGebruiker(userId) {
      let aantal = 0
      for (const [hash, rij] of refresh) {
        if (rij.userId === userId && !rij.ingetrokken) {
          refresh.set(hash, { ...rij, ingetrokken: true })
          aantal++
        }
      }
      return aantal
    },
    async lijstKoppelingen(userId) {
      const perClient = new Map()
      for (const [hash, rij] of refresh) {
        if (rij.userId !== userId || rij.ingetrokken) continue
        const bestaand = perClient.get(rij.clientId)
        if (!bestaand || bestaand.vervaltOp < rij.vervaltOp) {
          perClient.set(rij.clientId, { clientId: rij.clientId, scope: rij.scope, vervaltOp: rij.vervaltOp, hash })
        }
      }
      // Nooit het token zelf, alleen waar de gebruiker iets aan heeft.
      return [...perClient.values()].map(({ clientId, scope, vervaltOp }) => ({ clientId, scope, vervaltOp }))
    },
    async trekKoppelingIn(userId, clientId) {
      let aantal = 0
      for (const [hash, rij] of refresh) {
        if (rij.userId === userId && rij.clientId === clientId && !rij.ingetrokken) {
          refresh.set(hash, { ...rij, ingetrokken: true })
          aantal++
        }
      }
      return aantal
    },
    // Alleen voor tests en voor een beheerdersoverzicht: nooit een geheim.
    _telRefresh() {
      return [...refresh.values()].filter((r) => !r.ingetrokken).length
    },
  }
}

/**
 * Postgres-variant. Zelfde vorm, zelfde beloftes. Niet in gebruik zolang de
 * tabellen niet bestaan; zie schema.sql.
 */
export function postgresOpslag(pool) {
  return {
    async bewaarCode(hash, g) {
      await pool.query(
        `INSERT INTO femflow_agent_oauth_codes
         (code_hash, user_id, client_id, redirect_uri, scope, code_challenge, consent_versie, verloopt_op)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [hash, g.userId, g.clientId, g.redirectUri, g.scope, g.codeChallenge, g.consentVersie, new Date(g.vervaltOp)]
      )
    },
    async leesCode(hash) {
      const r = await pool.query(
        `SELECT user_id, client_id, redirect_uri, scope, code_challenge, consent_versie, verloopt_op, gebruikt
         FROM femflow_agent_oauth_codes WHERE code_hash = $1`,
        [hash]
      )
      const rij = r.rows[0]
      if (!rij) return null
      return {
        userId: rij.user_id,
        clientId: rij.client_id,
        redirectUri: rij.redirect_uri,
        scope: rij.scope,
        codeChallenge: rij.code_challenge,
        consentVersie: rij.consent_versie,
        vervaltOp: new Date(rij.verloopt_op).getTime(),
        gebruikt: rij.gebruikt,
      }
    },
    async markeerCodeGebruikt(hash) {
      await pool.query('UPDATE femflow_agent_oauth_codes SET gebruikt = TRUE WHERE code_hash = $1', [hash])
    },
    async bewaarRefresh(hash, g) {
      await pool.query(
        `INSERT INTO femflow_agent_oauth_refresh
         (token_hash, user_id, client_id, scope, consent_versie, verloopt_op)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [hash, g.userId, g.clientId, g.scope, g.consentVersie, new Date(g.vervaltOp)]
      )
    },
    async leesRefresh(hash) {
      const r = await pool.query(
        `SELECT user_id, client_id, scope, consent_versie, verloopt_op, ingetrokken
         FROM femflow_agent_oauth_refresh WHERE token_hash = $1`,
        [hash]
      )
      const rij = r.rows[0]
      if (!rij) return null
      return {
        userId: rij.user_id,
        clientId: rij.client_id,
        scope: rij.scope,
        consentVersie: rij.consent_versie,
        vervaltOp: new Date(rij.verloopt_op).getTime(),
        ingetrokken: rij.ingetrokken,
      }
    },
    async trekRefreshIn(hash) {
      await pool.query('UPDATE femflow_agent_oauth_refresh SET ingetrokken = TRUE WHERE token_hash = $1', [hash])
    },
    async trekAllesInVoorGebruiker(userId) {
      const r = await pool.query(
        'UPDATE femflow_agent_oauth_refresh SET ingetrokken = TRUE WHERE user_id = $1 AND ingetrokken = FALSE',
        [userId]
      )
      return r.rowCount
    },
    async lijstKoppelingen(userId) {
      const r = await pool.query(
        `SELECT client_id, scope, MAX(verloopt_op) AS verloopt_op
         FROM femflow_agent_oauth_refresh
         WHERE user_id = $1 AND ingetrokken = FALSE AND verloopt_op > NOW()
         GROUP BY client_id, scope`,
        [userId]
      )
      return r.rows.map((rij) => ({ clientId: rij.client_id, scope: rij.scope, vervaltOp: new Date(rij.verloopt_op).getTime() }))
    },
    async trekKoppelingIn(userId, clientId) {
      const r = await pool.query(
        'UPDATE femflow_agent_oauth_refresh SET ingetrokken = TRUE WHERE user_id = $1 AND client_id = $2 AND ingetrokken = FALSE',
        [userId, clientId]
      )
      return r.rowCount
    },
  }
}
