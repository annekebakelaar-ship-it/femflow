#!/usr/bin/env node
// Stap 5 uit agent/NEON-TESTBRANCH.md: bewijzen dat het verwijderen van een
// account alles meeneemt wat van haar is, en dat het auditspoor blijft staan.
//
// Werkt met een DERDE, tijdelijke fictieve gebruiker. De twee testgebruikers
// uit de seed worden niet aangeraakt; dat wordt achteraf gecontroleerd.

import { verbindMetTestdatabase } from './lib/neon-poort.mjs'

const DRIE = '33333333-3333-4333-8333-333333333333'
const client = await verbindMetTestdatabase()
let fouten = 0
const meld = (goed, tekst) => { if (!goed) fouten++; console.log(`  ${goed ? 'ok  ' : 'FOUT'}  ${tekst}`) }

async function tel(sql, params = []) {
  return (await client.query(sql, params)).rows[0].n
}

try {
  const voor = {
    users: await tel('SELECT COUNT(*)::int AS n FROM femflow_users'),
    metingen: await tel('SELECT COUNT(*)::int AS n FROM femflow_biometric_readings'),
    audit: await tel('SELECT COUNT(*)::int AS n FROM femflow_agent_audit'),
  }
  console.log(`\nVoor de proef: ${voor.users} gebruikers, ${voor.metingen} metingen, ${voor.audit} auditregels`)

  console.log('\nTijdelijke derde gebruiker aanmaken met een rij in elke kindtabel')
  await client.query('BEGIN')
  await client.query(
    `INSERT INTO femflow_users (id, email, name, birth_date) VALUES ($1, 'ovari-test-3-wegwerp@voorbeeld.invalid', 'Wegwerpgebruiker Drie', '1990-01-01')`,
    [DRIE]
  )
  await client.query(
    `INSERT INTO femflow_menstruation_data (id, user_id, start_date, cycle_length, bleeding_days)
     VALUES (gen_random_uuid(), $1, CURRENT_DATE - 7, 27, 4)`, [DRIE]
  )
  await client.query(
    `INSERT INTO femflow_wearable_connections (id, user_id, wearable_type, access_token)
     VALUES (gen_random_uuid(), $1, 'fitbit', 'NEP-TOKEN-wegwerp')`, [DRIE]
  )
  await client.query(
    `INSERT INTO femflow_biometric_readings (id, user_id, reading_date, sleep_duration_min, hrv_ms)
     VALUES (gen_random_uuid(), $1, CURRENT_DATE - 1, 400, 45)`, [DRIE]
  )
  await client.query(
    `INSERT INTO femflow_quiz_results (id, user_id, email, constellation)
     VALUES (gen_random_uuid(), $1, 'ovari-test-3-wegwerp@voorbeeld.invalid', '{"bron":"cascadeproef"}'::jsonb)`, [DRIE]
  )
  await client.query(
    `INSERT INTO femflow_feedback (id, user_id, message) VALUES (gen_random_uuid(), $1, 'cascadeproef')`, [DRIE]
  )
  await client.query(
    `INSERT INTO femflow_agent_consent (user_id, granted_at, versie) VALUES ($1, NOW(), '1.0')`, [DRIE]
  )
  await client.query(
    `INSERT INTO femflow_agent_oauth_codes (code_hash, user_id, client_id, redirect_uri, scope, code_challenge, consent_versie, verloopt_op)
     VALUES (repeat('a', 64), $1, 'cascade-test', 'https://voorbeeld.invalid/cb', 'ovari:cycle', repeat('b', 43), '1.0', NOW() + INTERVAL '1 minute')`, [DRIE]
  )
  await client.query(
    `INSERT INTO femflow_agent_oauth_refresh (token_hash, user_id, client_id, scope, consent_versie, verloopt_op)
     VALUES (repeat('c', 64), $1, 'cascade-test', 'ovari:cycle', '1.0', NOW() + INTERVAL '30 days')`, [DRIE]
  )
  // Het auditspoor hoort NIET aan de gebruiker te hangen: geen foreign key.
  await client.query(
    `INSERT INTO femflow_agent_audit (tijdstip, gebruiker, tool, toestemming, resultaat)
     VALUES (NOW(), 'cascadeproef1234', 'get_my_cycle_overview', true, 'ok')`
  )
  await client.query('COMMIT')

  const kinderen = async () => ({
    cyclus: await tel('SELECT COUNT(*)::int AS n FROM femflow_menstruation_data WHERE user_id = $1', [DRIE]),
    wearable: await tel('SELECT COUNT(*)::int AS n FROM femflow_wearable_connections WHERE user_id = $1', [DRIE]),
    metingen: await tel('SELECT COUNT(*)::int AS n FROM femflow_biometric_readings WHERE user_id = $1', [DRIE]),
    quiz: await tel('SELECT COUNT(*)::int AS n FROM femflow_quiz_results WHERE user_id = $1', [DRIE]),
    consent: await tel('SELECT COUNT(*)::int AS n FROM femflow_agent_consent WHERE user_id = $1', [DRIE]),
    codes: await tel('SELECT COUNT(*)::int AS n FROM femflow_agent_oauth_codes WHERE user_id = $1', [DRIE]),
    refresh: await tel('SELECT COUNT(*)::int AS n FROM femflow_agent_oauth_refresh WHERE user_id = $1', [DRIE]),
    feedback: await tel('SELECT COUNT(*)::int AS n FROM femflow_feedback WHERE user_id = $1', [DRIE]),
  })

  const na_aanmaak = await kinderen()
  meld(Object.values(na_aanmaak).every((n) => n === 1), `elke kindtabel heeft een rij: ${JSON.stringify(na_aanmaak)}`)

  console.log('\nAccount verwijderen')
  const verwijderd = await client.query('DELETE FROM femflow_users WHERE id = $1', [DRIE])
  meld(verwijderd.rowCount === 1, 'een gebruiker verwijderd')

  const na = await kinderen()
  meld(na.cyclus === 0 && na.wearable === 0 && na.metingen === 0 && na.quiz === 0, 'cyclus, wearable, metingen en quiz zijn mee verwijderd')
  meld(na.consent === 0 && na.codes === 0 && na.refresh === 0, 'toestemming, autorisatiecode en refreshtoken zijn mee verwijderd')

  // feedback heeft ON DELETE SET NULL: de rij blijft, zonder gebruiker.
  const feedbackLos = await tel("SELECT COUNT(*)::int AS n FROM femflow_feedback WHERE user_id IS NULL AND message = 'cascadeproef'")
  meld(na.feedback === 0 && feedbackLos === 1, 'feedback blijft staan maar raakt los van de gebruiker (SET NULL)')

  const auditNa = await tel('SELECT COUNT(*)::int AS n FROM femflow_agent_audit')
  meld(auditNa === voor.audit + 1, `auditregel blijft staan na het verwijderen: ${auditNa} regels`)
  const auditRegel = (await client.query("SELECT gebruiker, tool, resultaat FROM femflow_agent_audit WHERE gebruiker = 'cascadeproef1234'")).rows[0]
  meld(Boolean(auditRegel), `de regel zelf is er nog: ${auditRegel ? `${auditRegel.tool} / ${auditRegel.resultaat}` : 'weg'}`)

  const naTotaal = {
    users: await tel('SELECT COUNT(*)::int AS n FROM femflow_users'),
    metingen: await tel('SELECT COUNT(*)::int AS n FROM femflow_biometric_readings'),
  }
  meld(naTotaal.users === voor.users && naTotaal.metingen === voor.metingen, `de twee testgebruikers zijn ongemoeid: ${naTotaal.users} gebruikers, ${naTotaal.metingen} metingen`)

  // De proefregel weer opruimen, zodat de audittabel schoon aan de e2e-test begint.
  await client.query("DELETE FROM femflow_agent_audit WHERE gebruiker = 'cascadeproef1234'")
  await client.query("DELETE FROM femflow_feedback WHERE user_id IS NULL AND message = 'cascadeproef'")
  console.log('\n  info  proefsporen opgeruimd (auditregel en losse feedbackrij van de proef)')
} catch (err) {
  await client.query('ROLLBACK').catch(() => {})
  console.error('Cascadeproef mislukt:', err.message)
  fouten++
} finally {
  await client.end()
}

console.log(`\n${fouten} fout(en).`)
process.exit(fouten > 0 ? 1 : 0)
