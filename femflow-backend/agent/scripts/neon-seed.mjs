#!/usr/bin/env node
// Stap 3 en 4 uit agent/NEON-TESTBRANCH.md: de fictieve seed zetten en
// controleren. Draait alleen op de testdatabase, achter de identiteitspoort.
//
// Idempotent: staan de rijen er al, dan doet dit script niets opnieuw.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { verbindMetTestdatabase } from './lib/neon-poort.mjs'

const HIER = dirname(fileURLToPath(import.meta.url))
const SEED_PAD = join(HIER, '..', 'testdata', 'seed-agent-test.sql')

const EEN = '11111111-1111-4111-8111-111111111111'
const TWEE = '22222222-2222-4222-8222-222222222222'

const client = await verbindMetTestdatabase()
let fouten = 0
const meld = (goed, tekst) => { if (!goed) fouten++; console.log(`  ${goed ? 'ok  ' : 'FOUT'}  ${tekst}`) }

try {
  const voor = (await client.query('SELECT COUNT(*)::int AS n FROM femflow_users')).rows[0].n
  if (voor > 0) {
    console.log(`\nSeed overgeslagen: er staan al ${voor} gebruikers. Alleen controleren.`)
  } else {
    console.log('\nStap 3: fictieve seed uitvoeren')
    await client.query(readFileSync(SEED_PAD, 'utf8'))
    console.log('  ok    seed uitgevoerd in een transactie')
  }

  console.log('\nStap 4: controle')
  const t = (
    await client.query(`
      SELECT (SELECT COUNT(*) FROM femflow_users)::int                AS users,
             (SELECT COUNT(*) FROM femflow_menstruation_data)::int    AS cyclus,
             (SELECT COUNT(*) FROM femflow_wearable_connections)::int AS wearable,
             (SELECT COUNT(*) FROM femflow_biometric_readings)::int   AS metingen,
             (SELECT COUNT(*) FROM femflow_quiz_results)::int         AS quiz,
             (SELECT COUNT(*) FROM femflow_agent_consent)::int        AS consent,
             (SELECT COUNT(*) FROM femflow_agent_audit)::int          AS audit
    `)
  ).rows[0]

  meld(t.users === 2, `gebruikers: ${t.users} van 2`)
  meld(t.cyclus === 2, `cyclusrijen: ${t.cyclus} van 2`)
  meld(t.wearable === 1, `wearable-koppelingen: ${t.wearable} van 1`)
  meld(t.metingen === 21, `nachten: ${t.metingen} van 21`)
  meld(t.quiz === 1, `quizuitkomsten: ${t.quiz} van 1`)
  const totaal = t.users + t.cyclus + t.wearable + t.metingen + t.quiz
  meld(totaal === 27, `totaal aantal rijen: ${totaal} van 27`)
  meld(t.consent === 0, `toestemming nog niet gegeven: ${t.consent}`)

  // Isolatie: alles van Twee moet leeg zijn behalve haar eigen cyclusrij.
  const twee = (
    await client.query(
      `SELECT (SELECT COUNT(*) FROM femflow_biometric_readings WHERE user_id = $1)::int   AS metingen,
              (SELECT COUNT(*) FROM femflow_wearable_connections WHERE user_id = $1)::int AS wearable,
              (SELECT COUNT(*) FROM femflow_quiz_results WHERE user_id = $1)::int         AS quiz,
              (SELECT cycle_length FROM femflow_menstruation_data WHERE user_id = $1)     AS cycluslengte`,
      [TWEE]
    )
  ).rows[0]
  meld(twee.metingen === 0 && twee.wearable === 0 && twee.quiz === 0, 'Testgebruiker Twee heeft geen metingen, wearable of quiz')
  meld(Number(twee.cycluslengte) === 31, `cycluslengte van Twee is 31 (die van Een is 28): ${twee.cycluslengte}`)

  const een = (
    await client.query(
      `SELECT (SELECT COUNT(*) FROM femflow_biometric_readings WHERE user_id = $1)::int AS metingen,
              (SELECT cycle_length FROM femflow_menstruation_data WHERE user_id = $1)   AS cycluslengte,
              (SELECT CURRENT_DATE - start_date FROM femflow_menstruation_data WHERE user_id = $1)::int AS dagen_sinds_start`,
      [EEN]
    )
  ).rows[0]
  meld(een.metingen === 21, `Testgebruiker Een heeft 21 nachten: ${een.metingen}`)
  meld(Number(een.cycluslengte) === 28 && een.dagen_sinds_start === 14, `Een staat op cyclusdag 15 (dag ${een.dagen_sinds_start + 1})`)

  // Geen echte persoonsgegevens: alle adressen moeten op .invalid eindigen.
  const adressen = (await client.query("SELECT COUNT(*)::int AS n FROM femflow_users WHERE email NOT LIKE '%.invalid'")).rows[0].n
  meld(adressen === 0, `alle e-mailadressen zijn fictief (.invalid): ${adressen} afwijkingen`)

  // Trend: de laatste zeven nachten horen een hogere HRV te hebben.
  const trend = (
    await client.query(
      `SELECT ROUND(AVG(hrv_ms) FILTER (WHERE reading_date > CURRENT_DATE - 7)::numeric, 1) AS recent,
              ROUND(AVG(hrv_ms) FILTER (WHERE reading_date <= CURRENT_DATE - 7)::numeric, 1) AS ervoor
       FROM femflow_biometric_readings WHERE user_id = $1`,
      [EEN]
    )
  ).rows[0]
  meld(Number(trend.recent) > Number(trend.ervoor), `HRV loopt op: ${trend.recent} tegen ${trend.ervoor}`)
} finally {
  await client.end()
}

console.log(`\n${fouten} fout(en).`)
process.exit(fouten > 0 ? 1 : 0)
