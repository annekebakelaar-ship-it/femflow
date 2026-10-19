// PKCE volgens RFC 7636, alleen S256.
//
// OAuth 2.1 maakt PKCE verplicht voor elke client, ook voor vertrouwelijke.
// De `plain`-methode bestaat nog in de RFC maar beschermt nergens tegen, dus
// die accepteren we niet. Een client die hem aanbiedt krijgt een weigering in
// plaats van een stille afzwakking.

import { createHash, timingSafeEqual } from 'crypto'

export const METHODE = 'S256'

/** Een code_verifier is 43 tot 128 tekens uit de unreserved set (RFC 7636 par. 4.1). */
export function geldigeVerifier(verifier) {
  return typeof verifier === 'string' && /^[A-Za-z0-9\-._~]{43,128}$/.test(verifier)
}

/** Een challenge is base64url zonder opvulling, 43 tekens voor SHA-256. */
export function geldigeChallenge(challenge) {
  return typeof challenge === 'string' && /^[A-Za-z0-9_-]{43}$/.test(challenge)
}

export function challengeVoor(verifier) {
  return createHash('sha256').update(verifier).digest('base64url')
}

/**
 * Vergelijkt in constante tijd, zodat het antwoord niets verraadt over hoeveel
 * tekens klopten.
 */
export function verifierPast(verifier, challenge, methode = METHODE) {
  if (methode !== METHODE) return false
  if (!geldigeVerifier(verifier) || !geldigeChallenge(challenge)) return false
  const a = Buffer.from(challengeVoor(verifier))
  const b = Buffer.from(challenge)
  return a.length === b.length && timingSafeEqual(a, b)
}
