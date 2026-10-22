// Vergelijken van redirect-URI's.
//
// De regel is streng: een gevraagde redirect-URI moet LETTERLIJK gelijk zijn
// aan een geregistreerde. Daar is precies één uitzondering op, en die staat in
// RFC 8252 (OAuth voor native apps): een client die op een loopback-adres
// luistert kiest bij elke start een vrije poort, en de authorization server
// hoort daarom bij loopback elke poort toe te staan. Alles behalve de poort
// moet dan nog steeds exact kloppen.
//
// Wat hier NIET gebeurt: een gevraagde URI vertrouwen omdat hij er
// betrouwbaar uitziet. Er wordt altijd vergeleken met wat er bij de
// geregistreerde client stond, en die registratie komt uit een CIMD-document
// van een host die in de allowlist staat.

/** Loopback volgens RFC 8252: het IP-adres, en localhost als toegift. */
const LOOPBACK_HOSTS = new Set(['127.0.0.1', '[::1]', 'localhost'])

function ontleed(waarde) {
  if (typeof waarde !== 'string' || waarde === '') return null
  try {
    return new URL(waarde)
  } catch {
    return null
  }
}

/** Een URI met een fragment of inloggegevens erin doet hier nooit mee. */
function vormIsGoed(u) {
  return Boolean(u) && u.hash === '' && u.username === '' && u.password === ''
}

/**
 * @returns {boolean} true als dit een loopback-URI is volgens RFC 8252.
 * Let op: `0.0.0.0` en andere adressen horen hier NIET bij.
 */
export function isLoopback(waarde) {
  const u = typeof waarde === 'string' ? ontleed(waarde) : waarde
  if (!vormIsGoed(u)) return false
  return u.protocol === 'http:' && LOOPBACK_HOSTS.has(u.hostname)
}

/**
 * Past een gevraagde redirect-URI bij een geregistreerde?
 *
 * Exact gelijk is altijd goed. Daarnaast: allebei loopback, zelfde schema,
 * zelfde host, zelfde pad en dezelfde (meestal lege) query, met een
 * willekeurige poort. Verder niets.
 */
export function redirectPast(geregistreerd, gevraagd) {
  const lijst = Array.isArray(geregistreerd) ? geregistreerd : [geregistreerd]
  if (typeof gevraagd !== 'string' || gevraagd === '') return false

  const g = ontleed(gevraagd)
  if (!vormIsGoed(g)) return false

  for (const kandidaat of lijst) {
    if (typeof kandidaat !== 'string') continue
    if (kandidaat === gevraagd) return true

    const k = ontleed(kandidaat)
    if (!vormIsGoed(k)) continue
    if (!isLoopback(k) || !isLoopback(g)) continue
    if (k.protocol !== g.protocol) continue
    if (k.hostname !== g.hostname) continue // localhost en 127.0.0.1 zijn niet hetzelfde
    if (k.pathname !== g.pathname) continue
    if (k.search !== g.search) continue
    return true
  }
  return false
}
