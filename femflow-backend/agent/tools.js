// De drie persoonlijke tools. Een tool is hier een gewoon object met een
// naam, een modelgerichte beschrijving, een invoerschema en een handler.
// Dat formaat is bewust neutraal: het past zowel op een MCP-server (zoals
// youcaps-pt-mcp-private) als op een Claude-toolrun of een eigen endpoint.
//
// Drie harde regels, overgenomen uit de private PT MCP:
// 1. Identiteit komt UITSLUITEND uit het gevalideerde token. Geen enkele tool
//    heeft een parameter waarmee een andere gebruiker gekozen kan worden.
// 2. Alles is alleen-lezen. Er is geen tool die schrijft, logt of verwijdert.
// 3. Niets beschikbaar is een expliciete reden, nooit een lege uitkomst die
//    een model met gemiddelden kan invullen.

import { vatCyclusSamen, vatHerstelSamen, vatProfielSamen } from './gegevens.js'

const ALLEEN_LEZEN = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }

async function haalCyclusRij(pool, userId) {
  const r = await pool.query(
    `SELECT start_date, cycle_length, bleeding_days, updated_at
     FROM femflow_menstruation_data WHERE user_id = $1`,
    [userId]
  )
  return r.rows[0] || null
}

async function haalVerbindingen(pool, userId) {
  const r = await pool.query(
    `SELECT wearable_type, last_sync_at FROM femflow_wearable_connections WHERE user_id = $1`,
    [userId]
  )
  return r.rows
}

export const TOOLS = [
  {
    naam: 'get_my_cycle_overview',
    titel: 'Mijn cyclusoverzicht',
    beschrijving:
      "Returns the signed-in Ovari user's own cycle situation: the last logged period start, the cycle length she entered herself, which cycle day that puts her on today, and the arithmetically expected next start. The 'basis' field says plainly that this is one self-reported cycle length, not a measured series, so never present it as a prediction or a medical statement. When nothing has been logged recently the result says so with a reason instead of a number. Read-only.",
    invoerSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotaties: ALLEEN_LEZEN,
    async handler({ pool, userId, nu }) {
      return vatCyclusSamen({ rij: await haalCyclusRij(pool, userId), nu })
    },
  },
  {
    naam: 'get_my_recovery_trend',
    titel: 'Mijn hersteltrend',
    beschrijving:
      "Returns the signed-in user's own wearable measurements over the last 28 days: averages for sleep duration, deep sleep, HRV, resting heart rate and recovery index over the last 7 nights compared with the 21 nights before that, plus the direction of each. Only nights that were actually measured count. If no wearable is connected, too few nights were worn, or the newest night is more than ten days old, the result carries an explicit reason and no numbers: say that plainly and never substitute averages or example values. Read-only.",
    invoerSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotaties: ALLEEN_LEZEN,
    async handler({ pool, userId, nu }) {
      const metingen = await pool.query(
        `SELECT reading_date, sleep_duration_min, deep_sleep_min, hrv_ms, resting_heart_rate, recovery_index
         FROM femflow_biometric_readings
         WHERE user_id = $1 AND reading_date >= $2
         ORDER BY reading_date DESC`,
        [userId, new Date(nu.getTime() - 28 * 86400000)]
      )
      return vatHerstelSamen({
        metingen: metingen.rows,
        verbindingen: await haalVerbindingen(pool, userId),
        nu,
      })
    },
  },
  {
    naam: 'get_my_profile_context',
    titel: 'Mijn profielcontext',
    beschrijving:
      "Returns context about the signed-in user herself: her age, how long she has used Ovari, the outcome of the perimenopause quiz if she took it, which wearables are connected, and which of her data sets are filled in. Never returns her name or email address, because an assistant does not need them to talk about her data. Daily symptom check-ins are deliberately absent: they stay encrypted on her device and are not readable by the server. Read-only.",
    invoerSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotaties: ALLEEN_LEZEN,
    async handler({ pool, userId, nu }) {
      const [gebruiker, quiz, verbindingen, cyclusRij] = await Promise.all([
        pool.query('SELECT birth_date, created_at FROM femflow_users WHERE id = $1', [userId]).then((r) => r.rows[0] || null),
        pool
          .query('SELECT constellation, created_at FROM femflow_quiz_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId])
          .then((r) => r.rows[0] || null),
        haalVerbindingen(pool, userId),
        haalCyclusRij(pool, userId),
      ])
      return vatProfielSamen({ gebruiker, quiz, verbindingen, cyclusRij, nu })
    },
  },
]

export const TOOLNAMEN = TOOLS.map((t) => t.naam)

export function vindTool(naam) {
  return TOOLS.find((t) => t.naam === naam) || null
}

/** Manifest voor een model of een MCP-server: beschrijvingen, nooit gegevens. */
export function toolManifest() {
  return TOOLS.map(({ naam, titel, beschrijving, invoerSchema, annotaties }) => ({
    naam,
    titel,
    beschrijving,
    invoerSchema,
    annotaties,
  }))
}
