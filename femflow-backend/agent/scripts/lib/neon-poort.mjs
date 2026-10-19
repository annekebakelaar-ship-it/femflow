// Gedeelde poort naar de Neon-TESTdatabase.
//
// Elk script dat iets op de testdatabase doet gaat hier doorheen. De poort
// leest het geheim buiten de repository, weigert te verbinden als de
// databasenaam niet klopt, en controleert na het verbinden de vier
// identiteitswaarden die in stap 0 zijn vastgesteld. Komt er iets niet
// overeen, dan gooit hij en gebeurt er niets.
//
// Credentials worden nooit afgedrukt of teruggegeven.

import { readFileSync, existsSync } from 'node:fs'
import pg from 'pg'

export const VERWACHT = {
  database: 'ovari_agent_test',
  project_id: 'icy-cherry-08998868',
  branch_id: 'br-bitter-math-alxiq4yx',
  endpoint_id: 'ep-wandering-recipe-al9ohsh3',
}

const STANDAARD_BESTANDEN = [
  'C:\\Users\\danib\\femflow-keys\\neon-agent-test.url',
  'C:\\Users\\danib\\femflow-keys\\neon-agent-test.url.txt',
]

export function leesTestConnectiestring() {
  if (process.env.AGENT_TEST_DATABASE_URL) return process.env.AGENT_TEST_DATABASE_URL.trim()
  const kandidaten = [process.env.AGENT_TEST_DATABASE_URL_FILE, ...STANDAARD_BESTANDEN].filter(Boolean)
  for (const pad of kandidaten) {
    if (existsSync(pad)) return readFileSync(pad, 'utf8').trim()
  }
  throw new Error(`Geen connectiestring gevonden (gezocht in: ${kandidaten.join(', ')})`)
}

/** Verbindt en controleert de identiteit. Gooit bij elke afwijking. */
export async function verbindMetTestdatabase({ stil = false } = {}) {
  const url = leesTestConnectiestring()
  const databaseInUrl = new URL(url).pathname.replace(/^\//, '').split('?')[0]
  if (databaseInUrl !== VERWACHT.database) {
    throw new Error(`De connectiestring wijst naar ${databaseInUrl}, niet naar ${VERWACHT.database}. Er wordt niet verbonden.`)
  }

  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: true } })
  await client.connect()

  const r = (
    await client.query(`
      SELECT current_database() AS database,
             current_setting('neon.project_id', true)  AS project_id,
             current_setting('neon.branch_id', true)   AS branch_id,
             current_setting('neon.endpoint_id', true) AS endpoint_id
    `)
  ).rows[0]

  const afwijkingen = Object.entries(VERWACHT).filter(([k, v]) => r[k] !== v)
  if (afwijkingen.length) {
    await client.end()
    throw new Error(`Identiteit wijkt af: ${afwijkingen.map(([k, v]) => `${k} is ${r[k]}, verwacht ${v}`).join('; ')}`)
  }
  if (!stil) {
    console.log(`verbonden met ${r.database} op branch ${r.branch_id} (endpoint ${r.endpoint_id})`)
  }
  return client
}

/** Alleen voor de API-processen in de e2e-test: de string zonder hem te tonen. */
export function testDatabaseUrl() {
  return leesTestConnectiestring()
}
