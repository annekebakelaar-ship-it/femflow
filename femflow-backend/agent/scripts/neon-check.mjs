#!/usr/bin/env node
// Identiteitscontrole van de Neon-TESTdatabase. Leest alleen, schrijft nooit.
//
// Waarom dit bestaat: een migratie op de verkeerde database is niet terug te
// draaien met een excuus. Dit script weigert te zeggen "ga je gang" zolang
// niet vaststaat dat de verbinding naar ovari_agent_test op de branch
// agent-test gaat, en het drukt NOOIT de connectiestring, het wachtwoord of
// de gebruikersnaam af.
//
// De connectiestring komt uit (in deze volgorde):
//   1. omgevingsvariabele AGENT_TEST_DATABASE_URL
//   2. het bestand in AGENT_TEST_DATABASE_URL_FILE
//   3. C:\Users\danib\femflow-keys\neon-agent-test.url
//
// Gebruik:  node agent/scripts/neon-check.mjs
// Exitcode 0 = de juiste database en hij is leeg; 1 = niet doen.

import { readFileSync, existsSync } from 'node:fs'
import pg from 'pg'

const VERWACHTE_DATABASE = 'ovari_agent_test'
const VERBODEN_DATABASES = ['neondb', 'femflow', 'postgres']
const STANDAARD_BESTAND = 'C:\\Users\\danib\\femflow-keys\\neon-agent-test.url'

function leesGeheim() {
  if (process.env.AGENT_TEST_DATABASE_URL) return { bron: 'omgevingsvariabele', url: process.env.AGENT_TEST_DATABASE_URL.trim() }
  // Windows plakt bij opslaan vanuit Kladblok een .txt achter de naam, dus
  // beide varianten proberen. Dit liep eerder uiteen met lib/neon-poort.mjs.
  const kandidaten = [process.env.AGENT_TEST_DATABASE_URL_FILE, STANDAARD_BESTAND, STANDAARD_BESTAND + '.txt'].filter(Boolean)
  for (const pad of kandidaten) {
    if (existsSync(pad)) return { bron: `bestand ${pad}`, url: readFileSync(pad, 'utf8').trim() }
  }
  return null
}

const geheim = leesGeheim()
if (!geheim) {
  console.error('Geen connectiestring gevonden.')
  console.error(`Zet hem in ${STANDAARD_BESTAND} of in AGENT_TEST_DATABASE_URL.`)
  console.error('Het bestand hoort BUITEN de repository te staan; femflow-keys is daar de plek voor.')
  process.exit(2)
}

let url
try {
  url = new URL(geheim.url)
} catch {
  console.error('De connectiestring is geen geldige URL. (De inhoud wordt niet afgedrukt.)')
  process.exit(2)
}

// Alleen de delen die geen geheim zijn.
const database = url.pathname.replace(/^\//, '').split('?')[0]
console.log(`bron            ${geheim.bron}`)
console.log(`host            ${url.hostname}`)
console.log(`database (url)  ${database}`)
console.log(`sslmode         ${url.searchParams.get('sslmode') || '(niet opgegeven)'}`)
console.log('')

const bevindingen = []
const eis = (goed, tekst) => { bevindingen.push({ goed, tekst }); return goed }

eis(database === VERWACHTE_DATABASE, `databasenaam in de URL is ${VERWACHTE_DATABASE}`)
eis(!VERBODEN_DATABASES.includes(database), `databasenaam is niet een van ${VERBODEN_DATABASES.join(', ')}`)
eis(url.hostname.endsWith('.neon.tech'), 'host is een Neon-endpoint')
eis(url.protocol === 'postgresql:' || url.protocol === 'postgres:', 'protocol is postgresql')

// Eerst de naamcontrole, DAN pas verbinden. Met een verkeerde database maken
// we niet eens een verbinding: een sessie op productie is al te veel.
if (bevindingen.some((b) => !b.goed)) {
  for (const b of bevindingen) console.log(`${b.goed ? 'ok  ' : 'FOUT'}  ${b.tekst}`)
  console.log('\nEr wordt NIET verbonden. Controleer welke connectiestring er staat.')
  process.exit(1)
}

const client = new pg.Client({ connectionString: geheim.url, ssl: { rejectUnauthorized: true } })
try {
  await client.connect()
} catch (err) {
  console.error(`Verbinden lukte niet: ${err.message}`)
  process.exit(1)
}

try {
  const identiteit = await client.query(`
    SELECT current_database() AS db,
           current_user       AS gebruiker,
           current_schema()   AS schema,
           version()          AS versie,
           inet_server_addr()::text AS server_ip
  `)
  const r = identiteit.rows[0]
  console.log(`current_database  ${r.db}`)
  console.log(`current_user      ${r.gebruiker}`)
  console.log(`current_schema    ${r.schema}`)
  console.log(`server            ${r.versie.split(' on ')[0]}`)
  console.log(`server_ip         ${r.server_ip || '(niet beschikbaar)'}`)

  eis(r.db === VERWACHTE_DATABASE, `current_database() is ${VERWACHTE_DATABASE}`)
  eis(!VERBODEN_DATABASES.includes(r.db), 'current_database() is geen productiedatabase')

  // Neon publiceert branch- en endpointgegevens als instellingen. Welke er
  // zijn verschilt per versie, dus we drukken af wat er is in plaats van er
  // een te eisen.
  const neon = await client.query(`SELECT name, setting FROM pg_settings WHERE name LIKE 'neon%' ORDER BY name`)
  console.log('')
  if (neon.rows.length === 0) {
    console.log('neon-instellingen  (geen; branchidentiteit alleen via host en console)')
  } else {
    for (const rij of neon.rows) console.log(`neon.${rij.name.replace(/^neon\./, '').padEnd(22)} ${rij.setting}`)
  }

  // Leeg?
  const objecten = await client.query(`
    SELECT table_schema, table_name, table_type
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name
  `)
  const sequences = await client.query(`
    SELECT sequence_schema, sequence_name FROM information_schema.sequences
    WHERE sequence_schema NOT IN ('pg_catalog', 'information_schema')
  `)
  console.log('')
  if (objecten.rows.length === 0 && sequences.rows.length === 0) {
    console.log('inhoud            leeg: geen tabellen, views of sequences buiten de systeemschema\'s')
  } else {
    console.log(`inhoud            ${objecten.rows.length} tabel(len)/view(s), ${sequences.rows.length} sequence(s):`)
    for (const rij of objecten.rows) console.log(`                  ${rij.table_schema}.${rij.table_name} (${rij.table_type})`)
  }
  // Leeg hoeft alleen vóór de migratie (stap 0). Daarna is de eis juist dat
  // er NIETS vreemds in staat: alleen onze eigen femflow_-tabellen.
  const eisLeeg = process.argv.includes('--eis-leeg')
  if (eisLeeg) {
    eis(objecten.rows.length === 0 && sequences.rows.length === 0, 'database is leeg')
  } else {
    const vreemd = objecten.rows.filter((r) => !r.table_name.startsWith('femflow_'))
    eis(vreemd.length === 0, `geen vreemde objecten in de database${vreemd.length ? ': ' + vreemd.map((v) => v.table_name).join(', ') : ''}`)
  }

  // Rechten: kunnen we straks uberhaupt tabellen maken?
  const rechten = await client.query(`SELECT has_database_privilege(current_user, current_database(), 'CREATE') AS mag_create`)
  eis(rechten.rows[0].mag_create === true, 'gebruiker mag CREATE in deze database')
} finally {
  await client.end()
}

console.log('')
for (const b of bevindingen) console.log(`${b.goed ? 'ok  ' : 'FOUT'}  ${b.tekst}`)
const fouten = bevindingen.filter((b) => !b.goed).length
console.log(`\n${fouten} fout(en).`)
console.log(fouten === 0 ? 'Deze verbinding wijst naar de lege testdatabase.' : 'NIET uitvoeren op deze verbinding.')
process.exit(fouten > 0 ? 1 : 0)
