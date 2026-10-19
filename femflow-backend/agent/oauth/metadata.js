// Ontdekkingsdocumenten.
//
// De backend is hier de AUTHORIZATION SERVER (RFC 8414) en de persoonlijke
// MCP-laag is de RESOURCE SERVER (RFC 9728). Een client vindt zo zonder
// handmatige configuratie waar hij moet inloggen en welke scopes bestaan.
//
// De `resource` is de canonieke URI van de MCP-laag en moet LETTERLIJK gelijk
// zijn aan de `aud` in het token. Lopen die uiteen, dan weigert de MCP-laag
// elk token en is dat lastig te herleiden, dus beide kanten lezen dezelfde
// waarde uit configuratie.

export const SCOPES = ['ovari:cycle', 'ovari:recovery', 'ovari:profile']

/** Welke scope welke tool opent. Een tool, een scope, geen bundelscope. */
export const SCOPE_PER_TOOL = {
  get_my_cycle_overview: 'ovari:cycle',
  get_my_recovery_trend: 'ovari:recovery',
  get_my_profile_context: 'ovari:profile',
}

export function authorizationServerMetadata({ issuer }) {
  return {
    issuer,
    authorization_endpoint: `${issuer}/api/v1/agent/oauth/authorize`,
    token_endpoint: `${issuer}/api/v1/agent/oauth/token`,
    revocation_endpoint: `${issuer}/api/v1/agent/oauth/revoke`,
    jwks_uri: `${issuer}/api/v1/agent/oauth/jwks.json`,
    scopes_supported: SCOPES,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    // Geen implicit, geen hybrid, geen password grant. OAuth 2.1.
    response_modes_supported: ['query'],
  }
}

export function protectedResourceMetadata({ resource, issuer }) {
  return {
    resource,
    authorization_servers: [issuer],
    scopes_supported: SCOPES,
    bearer_methods_supported: ['header'],
    resource_documentation: 'https://ovari.youcaps.app',
  }
}

/** WWW-Authenticate bij een 401 (RFC 9728 par. 5.1, RFC 6750 par. 3). */
export function wwwAuthenticate({ metadataUrl, scope, fout, beschrijving }) {
  const params = []
  if (fout) params.push(`error="${fout}"`)
  if (beschrijving) params.push(`error_description="${String(beschrijving).replace(/"/g, "'")}"`)
  if (scope) params.push(`scope="${scope}"`)
  params.push(`resource_metadata="${metadataUrl}"`)
  return `Bearer ${params.join(', ')}`
}
