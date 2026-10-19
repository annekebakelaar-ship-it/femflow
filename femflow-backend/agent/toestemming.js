// Toestemming voor de persoonlijke agent. Los van de bestaande consents:
// cookie-toestemming en wearable-toestemming zeggen niets over het laten
// lezen van je gegevens door een assistent, dus dat wordt apart gevraagd.
//
// Twee lagen, net als bij de rest van deze module: een pure beslisregel die
// te testen is zonder database, en een dunne laag die de rij ophaalt.

export const TOESTEMMING_VERSIE = '1.0'

export const TOESTEMMING_REDENEN = {
  NOOIT_GEGEVEN: 'toestemming_nooit_gegeven',
  INGETROKKEN: 'toestemming_ingetrokken',
  OUDE_VERSIE: 'toestemming_oude_versie',
}

/**
 * Pure beslisregel.
 * @param {{granted_at: string|Date|null, revoked_at: string|Date|null, versie: string|null}|null} rij
 */
export function heeftToestemming(rij, versie = TOESTEMMING_VERSIE) {
  if (!rij || !rij.granted_at) return { ok: false, reden: TOESTEMMING_REDENEN.NOOIT_GEGEVEN }
  if (rij.revoked_at) return { ok: false, reden: TOESTEMMING_REDENEN.INGETROKKEN }
  if (rij.versie && rij.versie !== versie) return { ok: false, reden: TOESTEMMING_REDENEN.OUDE_VERSIE }
  return { ok: true, reden: null }
}

export async function leesToestemming(pool, userId) {
  const result = await pool.query(
    'SELECT granted_at, revoked_at, versie FROM femflow_agent_consent WHERE user_id = $1',
    [userId]
  )
  return result.rows[0] || null
}

export async function geefToestemming(pool, userId, versie = TOESTEMMING_VERSIE) {
  const result = await pool.query(
    `INSERT INTO femflow_agent_consent (user_id, granted_at, revoked_at, versie)
     VALUES ($1, NOW(), NULL, $2)
     ON CONFLICT (user_id) DO UPDATE SET granted_at = NOW(), revoked_at = NULL, versie = $2
     RETURNING granted_at, revoked_at, versie`,
    [userId, versie]
  )
  return result.rows[0]
}

export async function trekToestemmingIn(pool, userId) {
  const result = await pool.query(
    `UPDATE femflow_agent_consent SET revoked_at = NOW() WHERE user_id = $1
     RETURNING granted_at, revoked_at, versie`,
    [userId]
  )
  return result.rows[0] || null
}
