#!/usr/bin/env node
// Stap 1 en 2 uit agent/NEON-TESTBRANCH.md: het schema opbouwen op de
// testbranch en daarna controleren wat er staat.
//
// Dit script doet UITSLUITEND het DDL uit femflow-backend/schema.sql. Het
// voert geen seed uit, geen cascadeproef, geen mutatie en geen migratie op
// een andere database. Het drukt nooit credentials af.
//
// Voor er ook maar iets wordt uitgevoerd wordt de identiteit van de database
// vergeleken met de waarden die in stap 0 zijn vastgesteld. Komt er een waarde
// niet overeen, dan stopt het script voor het DDL.
//
// Gebruik:  node agent/scripts/neon-migrate.mjs
//           node agent/scripts/neon-migrate.mjs --alleen-controle   (stap 2)

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const HIER = dirname(fileURLToPath(import.meta.url))
const SCHEMA_PAD = join(HIER, '..', '..', 'schema.sql')
const STANDAARD_BESTAND = 'C:\\Users\\danib\\femflow-keys\\neon-agent-test.url'

// Vastgezet in stap 0 (19 okt 2026). Wijkt er iets af, dan is het een andere
// database en gebeurt er niets.
const VERWACHT = {
  database: 'ovari_agent_test',
  'neon.project_id': 'icy-cherry-08998868',
  'neon.branch_id': 'br-bitter-math-alxiq4yx',
  'neon.endpoint_id': 'ep-wandering-recipe-al9ohsh3',
}

const VERWACHTE_TABELLEN = [
  'femflow_agent_audit', 'femflow_agent_consent', 'femflow_agent_oauth_codes',
  'femflow_agent_oauth_refresh', 'femflow_biometric_readings', 'femflow_feedback',
  'femflow_menstruation_data', 'femflow_otp_codes', 'femflow_quiz_results',
  'femflow_users', 'femflow_wearable_connections', 'femflow_welcome_signups',
]

const alleenControle = process.argv.includes('--alleen-controle')

function leesGeheim() {
  if (process.env.AGENT_TEST_DATABASE_URL) return process.env.AGENT_TEST_DATABASE_URL.trim()
  const pad = process.env.AGENT_TEST_DATABASE_URL_FILE || STANDAARD_BESTAND
  if (!existsSync(pad)) {
    console.error(`Geen connectiestring gevonden op ${pad}.`)
    process.exit(2)
  }
  return readFileSync(pad, 'utf8').trim()
}

const url = leesGeheim()
const databaseInUrl = new URL(url).pathname.replace(/^\//, '').split('?')[0]
if (databaseInUrl !== VERWACHT.database) {
  console.error(`De connectiestring wijst naar ${databaseInUrl}, niet naar ${VERWACHT.database}. Er wordt niet verbonden.`)
  process.exit(1)
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: true } })
await client.connect()

let afgebroken = false
try {
  // ---- Poort: identiteit ---------------------------------------------------
  const identiteit = await client.query(`
    SELECT current_database() AS database,
           current_setting('neon.project_id', true)  AS project_id,
           current_setting('neon.branch_id', true)   AS branch_id,
           current_setting('neon.endpoint_id', true) AS endpoint_id,
           current_setting('server_version') AS versie
  `)
  const r = identiteit.rows[0]
  const gemeten = {
    database: r.database,
    'neon.project_id': r.project_id,
    'neon.branch_id': r.branch_id,
    'neon.endpoint_id': r.endpoint_id,
  }

  console.log('Identiteitscontrole voor het DDL')
  let mismatch = false
  for (const [sleutel, verwacht] of Object.entries(VERWACHT)) {
    const goed = gemeten[sleutel] === verwacht
    if (!goed) mismatch = true
    console.log(`  ${goed ? 'ok  ' : 'FOUT'}  ${sleutel.padEnd(18)} ${gemeten[sleutel] ?? '(niet beschikbaar)'}`)
  }
  console.log(`  info  PostgreSQL ${r.versie}`)

  if (mismatch) {
    console.error('\nAfwijking in de identiteit. Er wordt GEEN DDL uitgevoerd.')
    afgebroken = true
    process.exitCode = 1
  } else if (!alleenControle) {
    // ---- Stap 1: het schema --------------------------------------------------
    const voor = await client.query(`
      SELECT COUNT(*)::int AS n FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    `)
    console.log(`\nStap 1: schema.sql uitvoeren (${voor.rows[0].n} tabellen aanwezig voor de start)`)

    // In één query: de simple-query-modus voert de hele string uit als één
    // transactie, dus het is alles of niets. En het lost meteen het comment
    // met een puntkomma op, dat een splitser zou laten struikelen.
    const sql = readFileSync(SCHEMA_PAD, 'utf8')
    const statements = (sql.match(/CREATE TABLE IF NOT EXISTS/gi) || []).length + (sql.match(/CREATE INDEX IF NOT EXISTS/gi) || []).length
    await client.query(sql)
    console.log(`  ok    ${statements} statements uitgevoerd zonder fouten`)
  }

  if (!afgebroken) {
    // ---- Stap 2: controleren -------------------------------------------------
    console.log('\nStap 2: controle')

    const tabellen = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name
    `)
    const namen = tabellen.rows.map((t) => t.table_name)
    const ontbreekt = VERWACHTE_TABELLEN.filter((t) => !namen.includes(t))
    const teveel = namen.filter((t) => !VERWACHTE_TABELLEN.includes(t))
    console.log(`  ${namen.length === 12 && ontbreekt.length === 0 ? 'ok  ' : 'FOUT'}  tabellen: ${namen.length} van 12`)
    if (ontbreekt.length) console.log(`        ontbreekt: ${ontbreekt.join(', ')}`)
    if (teveel.length) console.log(`        onverwacht: ${teveel.join(', ')}`)
    for (const n of namen) console.log(`        ${n}`)

    const indexen = await client.query(`
      SELECT indexname, tablename FROM pg_indexes
      WHERE schemaname = 'public' AND indexname LIKE 'idx_%' ORDER BY indexname
    `)
    console.log(`\n  ${indexen.rows.length === 13 ? 'ok  ' : 'FOUT'}  indexen (idx_*): ${indexen.rows.length} van 13`)
    for (const i of indexen.rows) console.log(`        ${i.indexname}  op  ${i.tablename}`)

    const fks = await client.query(`
      SELECT c.conname,
             c.conrelid::regclass::text  AS tabel,
             c.confrelid::regclass::text AS verwijst_naar,
             CASE c.confdeltype WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL'
                                WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT'
                                ELSE c.confdeltype::text END AS bij_verwijderen
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE c.contype = 'f' AND n.nspname = 'public'
      ORDER BY tabel
    `)
    console.log(`\n  ${fks.rows.length === 8 ? 'ok  ' : 'FOUT'}  foreign keys: ${fks.rows.length} van 8`)
    for (const f of fks.rows) {
      console.log(`        ${f.tabel.padEnd(30)} -> ${f.verwijst_naar.padEnd(16)} ON DELETE ${f.bij_verwijderen}`)
    }

    const rijen = await client.query(`
      SELECT (SELECT COUNT(*) FROM femflow_users)::int AS users,
             (SELECT COUNT(*) FROM femflow_agent_consent)::int AS consent,
             (SELECT COUNT(*) FROM femflow_agent_audit)::int AS audit,
             (SELECT COUNT(*) FROM femflow_agent_oauth_refresh)::int AS refresh
    `)
    const t = rijen.rows[0]
    const leeg = t.users === 0 && t.consent === 0 && t.audit === 0 && t.refresh === 0
    console.log(`\n  ${leeg ? 'ok  ' : 'FOUT'}  nog geen rijen: users ${t.users}, consent ${t.consent}, audit ${t.audit}, refresh ${t.refresh}`)
  }
} finally {
  await client.end()
}
