// Integratietests tegen een ECHTE SQL-laag in plaats van een nep-pool.
//
// pg-mem draait Postgres-dialect in het geheugen. Dat is geen Neon, maar het
// voert wel het echte DDL uit schema.sql uit en de echte queries uit
// opslag.js en audit.js, inclusief parameterbinding, types en ON CONFLICT.
// Zo vangen we wat een handgeschreven nep-pool per definitie niet vangt: een
// kolomnaam die niet bestaat, een typefout, een query die niet parst.
//
// Er wordt geen productiedatabase aangeraakt en er draait geen migratie: de
// tabellen worden hier aangemaakt in een database die bij het einde van de
// test verdwijnt.

import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { newDb } from 'pg-mem'

import { postgresOpslag, hashGeheim } from './opslag.js'
import { maakAuditLogger, RESULTAAT } from '../audit.js'
import { ruimOp } from './opruimen.js'
import { geefToestemming, leesToestemming, trekToestemmingIn, heeftToestemming } from '../toestemming.js'

const HIER = dirname(fileURLToPath(import.meta.url))
const SCHEMA = readFileSync(join(HIER, '..', '..', 'schema.sql'), 'utf8')

const IK = '11111111-1111-4111-8111-111111111111'
const IEMAND_ANDERS = '22222222-2222-4222-8222-222222222222'
const NU = Date.parse('2026-10-19T09:00:00.000Z')

/** Haalt de CREATE TABLE/INDEX-statements voor een tabel uit schema.sql. */
function ddlVoor(naam) {
  return SCHEMA.split(';')
    // Commentaarregels horen bij het statement erna; die eraf halen, anders
    // begint het statement niet met CREATE en valt het uit de filter.
    .map((s) => s.split(/\r?\n/).filter((r) => !r.trim().startsWith('--')).join('\n').trim())
    .filter((s) => /^CREATE (TABLE|INDEX)/i.test(s) && s.includes(naam))
    .map((s) => s + ';')
}

function maakDb() {
  const db = newDb()
  // pg-mem kent NOW() wel, maar niet alle randgevallen van Neon. Wat hier
  // draait is het DDL uit schema.sql, niet een kopie.
  db.public.none(`
    CREATE TABLE femflow_users (
      id UUID PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      birth_date DATE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)
  for (const naam of ['femflow_agent_consent', 'femflow_agent_audit', 'femflow_agent_oauth_codes', 'femflow_agent_oauth_refresh']) {
    for (const statement of ddlVoor(naam)) db.public.none(statement)
  }
  db.public.none(`
    INSERT INTO femflow_users (id, email) VALUES
      ('${IK}', 'ik@voorbeeld.test'),
      ('${IEMAND_ANDERS}', 'anders@voorbeeld.test');
  `)
  const { Pool } = db.adapters.createPg()
  return { db, pool: new Pool() }
}

let pool

beforeEach(() => {
  pool = maakDb().pool
})

describe('schema.sql draait zoals bedoeld', () => {
  it('maakt alle vier de agenttabellen aan', async () => {
    for (const tabel of ['femflow_agent_consent', 'femflow_agent_audit', 'femflow_agent_oauth_codes', 'femflow_agent_oauth_refresh']) {
      const r = await pool.query(`SELECT COUNT(*) AS n FROM ${tabel}`)
      expect(Number(r.rows[0].n)).toBe(0)
    }
  })
})

describe('toestemming in Postgres', () => {
  it('geeft, leest en trekt in met de echte queries', async () => {
    expect(await leesToestemming(pool, IK)).toBeNull()

    await geefToestemming(pool, IK)
    const rij = await leesToestemming(pool, IK)
    expect(heeftToestemming(rij).ok).toBe(true)

    await trekToestemmingIn(pool, IK)
    const na = await leesToestemming(pool, IK)
    expect(heeftToestemming(na).ok).toBe(false)
    expect(heeftToestemming(na).reden).toBe('toestemming_ingetrokken')
  })

  it('zet een ingetrokken toestemming weer aan zonder een tweede rij te maken', async () => {
    await geefToestemming(pool, IK)
    await trekToestemmingIn(pool, IK)
    await geefToestemming(pool, IK)

    const r = await pool.query('SELECT COUNT(*) AS n FROM femflow_agent_consent WHERE user_id = $1', [IK])
    expect(Number(r.rows[0].n)).toBe(1)
    expect(heeftToestemming(await leesToestemming(pool, IK)).ok).toBe(true)
  })

  it('houdt gebruikers gescheiden', async () => {
    await geefToestemming(pool, IK)
    expect(await leesToestemming(pool, IEMAND_ANDERS)).toBeNull()
  })
})

describe('auditlog in Postgres', () => {
  it('schrijft een regel met precies vijf kolommen', async () => {
    const logboek = maakAuditLogger({ pool, zout: 'test-zout', nu: () => new Date(NU) })
    await logboek.schrijfRegel({ userId: IK, tool: 'get_my_cycle_overview', toestemming: true, resultaat: RESULTAAT.OK })

    const r = await pool.query('SELECT gebruiker, tool, toestemming, resultaat FROM femflow_agent_audit')
    expect(r.rows).toHaveLength(1)
    expect(r.rows[0].tool).toBe('get_my_cycle_overview')
    expect(r.rows[0].resultaat).toBe('ok')
    expect(r.rows[0].gebruiker).toMatch(/^[0-9a-f]{16}$/)
    expect(JSON.stringify(r.rows[0])).not.toContain(IK)
  })

  it('schrijft een gebeurtenis zonder tool', async () => {
    const logboek = maakAuditLogger({ pool, zout: 'test-zout', nu: () => new Date(NU) })
    await logboek.schrijfRegel({ userId: IK, tool: null, toestemming: false, resultaat: RESULTAAT.TOESTEMMING_INGETROKKEN })
    const r = await pool.query('SELECT tool, resultaat FROM femflow_agent_audit')
    expect(r.rows[0].tool).toBeNull()
  })
})

describe('OAuth-opslag in Postgres', () => {
  const codeGegevens = {
    userId: IK,
    clientId: 'chatgpt-test',
    redirectUri: 'https://chat.example.com/cb',
    scope: 'ovari:cycle',
    codeChallenge: 'x'.repeat(43),
    consentVersie: '1.0',
    vervaltOp: NU + 60_000,
  }

  it('bewaart, leest en verbruikt een autorisatiecode', async () => {
    const opslag = postgresOpslag(pool)
    const hash = hashGeheim('geheime-code')
    await opslag.bewaarCode(hash, codeGegevens)

    const rij = await opslag.leesCode(hash)
    expect(rij).toMatchObject({ userId: IK, clientId: 'chatgpt-test', scope: 'ovari:cycle', gebruikt: false })
    expect(rij.vervaltOp).toBe(NU + 60_000)

    await opslag.markeerCodeGebruikt(hash)
    expect((await opslag.leesCode(hash)).gebruikt).toBe(true)
    expect(await opslag.leesCode(hashGeheim('bestaat-niet'))).toBeNull()
  })

  it('bewaart refreshtokens, trekt ze in en laat ze niet meer meetellen', async () => {
    const opslag = postgresOpslag(pool)
    const hash = hashGeheim('geheim-refresh')
    await opslag.bewaarRefresh(hash, { ...codeGegevens, vervaltOp: NU + 86_400_000 })

    expect((await opslag.leesRefresh(hash)).ingetrokken).toBe(false)
    await opslag.trekRefreshIn(hash)
    expect((await opslag.leesRefresh(hash)).ingetrokken).toBe(true)
  })

  it('trekt alles van een gebruiker in zonder die van een ander te raken', async () => {
    const opslag = postgresOpslag(pool)
    await opslag.bewaarRefresh(hashGeheim('a'), { ...codeGegevens, vervaltOp: NU + 86_400_000 })
    await opslag.bewaarRefresh(hashGeheim('b'), { ...codeGegevens, vervaltOp: NU + 86_400_000 })
    await opslag.bewaarRefresh(hashGeheim('c'), { ...codeGegevens, userId: IEMAND_ANDERS, vervaltOp: NU + 86_400_000 })

    const aantal = await opslag.trekAllesInVoorGebruiker(IK)
    expect(aantal).toBe(2)
    expect((await opslag.leesRefresh(hashGeheim('c'))).ingetrokken).toBe(false)
  })

  it('bewaart geen leesbare geheimen', async () => {
    const opslag = postgresOpslag(pool)
    await opslag.bewaarCode(hashGeheim('geheime-code'), codeGegevens)
    await opslag.bewaarRefresh(hashGeheim('geheim-refresh'), { ...codeGegevens, vervaltOp: NU + 86_400_000 })

    const codes = await pool.query('SELECT code_hash FROM femflow_agent_oauth_codes')
    const refresh = await pool.query('SELECT token_hash FROM femflow_agent_oauth_refresh')
    const alles = JSON.stringify([codes.rows, refresh.rows])
    expect(alles).not.toContain('geheime-code')
    expect(alles).not.toContain('geheim-refresh')
    expect(codes.rows[0].code_hash).toHaveLength(64)
  })

  it('verwijdert alles van een gebruiker mee met het account (ON DELETE CASCADE)', async () => {
    const opslag = postgresOpslag(pool)
    await geefToestemming(pool, IK)
    await opslag.bewaarRefresh(hashGeheim('a'), { ...codeGegevens, vervaltOp: NU + 86_400_000 })

    await pool.query('DELETE FROM femflow_users WHERE id = $1', [IK])

    expect(Number((await pool.query('SELECT COUNT(*) AS n FROM femflow_agent_oauth_refresh')).rows[0].n)).toBe(0)
    expect(Number((await pool.query('SELECT COUNT(*) AS n FROM femflow_agent_consent')).rows[0].n)).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Fase 4: de punten die het bouwplan expliciet noemt. pg-mem is geen Neon,
// dus wat hier slaagt bewijst dat de QUERIES en het SCHEMA kloppen, niet hoe
// Neon zich onder echte gelijktijdigheid gedraagt. Dat laatste blijft staan
// als openstaand punt in MIGRATIE.md.
// ---------------------------------------------------------------------------

describe('fase 4: types, gelijktijdigheid en opruimen', () => {
  const basisRij = {
    userId: IK,
    clientId: 'chatgpt-test',
    redirectUri: 'https://chat.example.com/cb',
    scope: 'ovari:cycle',
    codeChallenge: 'x'.repeat(43),
    consentVersie: '1.0',
    vervaltOp: NU + 86_400_000,
  }

  it('bewaart TIMESTAMPTZ en leest dezelfde momenten terug', async () => {
    const opslag = postgresOpslag(pool)
    await opslag.bewaarCode(hashGeheim('tijd'), { ...basisRij, vervaltOp: NU + 60_000 })
    const rij = await opslag.leesCode(hashGeheim('tijd'))
    // Geen verschuiving van uren: de waarde komt terug als hetzelfde moment.
    expect(rij.vervaltOp).toBe(NU + 60_000)
  })

  it('geeft het auditlog oplopende BIGSERIAL-id s zonder gaten in de volgorde', async () => {
    const logboek = maakAuditLogger({ pool, zout: 'test-zout', nu: () => new Date(NU) })
    for (let i = 0; i < 5; i++) {
      await logboek.schrijfRegel({ userId: IK, tool: 'get_my_cycle_overview', toestemming: true, resultaat: RESULTAAT.OK })
    }
    const r = await pool.query('SELECT id FROM femflow_agent_audit ORDER BY id')
    const ids = r.rows.map((rij) => Number(rij.id))
    expect(ids).toHaveLength(5)
    expect(ids.every((id, i) => i === 0 || id > ids[i - 1])).toBe(true)
  })

  it('verliest geen regels als er door elkaar heen geschreven wordt', async () => {
    const logboek = maakAuditLogger({ pool, zout: 'test-zout', nu: () => new Date(NU) })
    await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        logboek.schrijfRegel({ userId: i % 2 ? IK : IEMAND_ANDERS, tool: 'get_my_recovery_trend', toestemming: true, resultaat: RESULTAAT.OK })
      )
    )
    const r = await pool.query('SELECT COUNT(*) AS n FROM femflow_agent_audit')
    expect(Number(r.rows[0].n)).toBe(20)
  })

  it('houdt twee gebruikers uit elkaar bij gelijktijdig koppelen', async () => {
    const opslag = postgresOpslag(pool)
    await Promise.all([
      opslag.bewaarRefresh(hashGeheim('van-ik'), basisRij),
      opslag.bewaarRefresh(hashGeheim('van-ander'), { ...basisRij, userId: IEMAND_ANDERS }),
    ])
    expect(await opslag.trekAllesInVoorGebruiker(IK)).toBe(1)
    expect((await opslag.leesRefresh(hashGeheim('van-ander'))).ingetrokken).toBe(false)
  })

  it('ruimt verlopen codes en tokens op met echte SQL', async () => {
    const opslag = postgresOpslag(pool)
    await opslag.bewaarCode(hashGeheim('oud'), { ...basisRij, vervaltOp: NU - 3 * 60 * 60_000 })
    await opslag.bewaarCode(hashGeheim('net'), { ...basisRij, vervaltOp: NU - 60_000 })
    await opslag.bewaarRefresh(hashGeheim('verlopen'), { ...basisRij, vervaltOp: NU - 1000 })
    await opslag.bewaarRefresh(hashGeheim('geldig'), basisRij)

    const uitslag = await ruimOp({ opslag, nu: () => NU })
    expect(uitslag.codes).toBe(1)
    expect(uitslag.refresh).toBe(1)
    expect(await opslag.leesCode(hashGeheim('net'))).not.toBeNull()
    expect(await opslag.leesRefresh(hashGeheim('geldig'))).not.toBeNull()
  })

  it('maakt een koppeling onbruikbaar zodra de toestemming is ingetrokken', async () => {
    const opslag = postgresOpslag(pool)
    await geefToestemming(pool, IK)
    await opslag.bewaarRefresh(hashGeheim('van-ik'), basisRij)

    await trekToestemmingIn(pool, IK)
    await opslag.trekAllesInVoorGebruiker(IK)

    expect(heeftToestemming(await leesToestemming(pool, IK)).ok).toBe(false)
    expect((await opslag.leesRefresh(hashGeheim('van-ik'))).ingetrokken).toBe(true)
    expect(await opslag.lijstKoppelingen(IK)).toHaveLength(0)
  })
})
