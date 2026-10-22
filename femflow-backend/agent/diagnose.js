// Tijdelijke diagnostiek voor de OAuth-koppeling met ChatGPT.
//
// WAAROM DIT BESTAAT: het auditlog schrijft alleen bij tool- en
// toestemmingsgebeurtenissen. Of een client de ontdekkingsdocumenten ophaalt
// en of hij daarna /authorize aanroept, staat nergens. Zonder dat verschil is
// niet te zeggen of ChatGPT blijft steken op de 401, op de metadata, of op
// onze eigen weigering in /authorize.
//
// WAT ER WEL IN DE REGEL KOMT: tijdstip, methode, een routelabel uit een
// VASTE lijst, statuscode, duur, en soms een foutcategorie uit een vaste
// lijst.
//
// WAT ER NOOIT IN KOMT: de ruwe URL, querystrings, headers, cookies, tokens,
// autorisatiecodes, state, IP-adressen, user-agents of enige inhoud. Dat is
// geen belofte maar een eigenschap van de code: de regel wordt opgebouwd uit
// precies zes velden, en het routelabel komt uit een lijst die hier in het
// bestand staat. Een pad dat er niet in staat heet 'overig'.
//
// De diagnostiek schakelt zichzelf na maximaal een uur uit en schrijft
// uitsluitend naar stdout. Er is geen uitleesadres en geen geheim.

export const PREFIX = 'OVARI-DIAGNOSE'
const MAX_MINUTEN = 60

/** Vaste routelabels. Alles wat hier niet in staat, heet 'overig'. */
const EXACTE_ROUTES = new Map([
  ['/api/v1/health', 'health'],
  ['/.well-known/oauth-authorization-server', 'wellknown-as'],
  ['/.well-known/oauth-protected-resource', 'wellknown-prm'],
  ['/api/v1/agent/oauth/jwks.json', 'jwks'],
  ['/api/v1/agent/oauth/metadata', 'as-metadata'],
  ['/api/v1/agent/oauth/protected-resource', 'prm-alias'],
  ['/api/v1/agent/oauth/authorize', 'authorize'],
  ['/api/v1/agent/oauth/authorize/decision', 'authorize-beslissing'],
  ['/api/v1/agent/oauth/verzoek', 'verzoek'],
  ['/api/v1/agent/oauth/token', 'token'],
  ['/api/v1/agent/oauth/revoke', 'revoke'],
  ['/api/v1/agent/oauth/mcp', 'mcp'],
  ['/api/v1/agent/oauth/mcp/tools', 'mcp-toollijst'],
  ['/api/v1/agent/oauth/koppelingen', 'koppelingen'],
  ['/api/v1/agent/oauth/koppelingen/intrekken', 'koppelingen-intrekken'],
  ['/api/v1/agent/status', 'agent-status'],
  ['/api/v1/agent/tools', 'agent-toollijst'],
  ['/api/v1/agent/consent', 'agent-toestemming'],
])

const PREFIX_ROUTES = [
  ['/.well-known/oauth-protected-resource/', 'wellknown-prm-pad'],
  ['/api/v1/agent/oauth/mcp/tools/', 'mcp-tool'],
  ['/api/v1/agent/tools/', 'agent-tool'],
]

/** Foutcategorieen die gelogd mogen worden. Al het andere valt weg. */
export const FOUTCATEGORIEEN = new Set([
  'invalid_request',
  'invalid_client',
  'invalid_grant',
  'invalid_scope',
  'invalid_target',
  'unsupported_grant_type',
  'access_denied',
  'server_error',
])

/** Puur: pad naar label. Krijgt nooit een querystring te zien. */
export function routeLabel(pad) {
  if (typeof pad !== 'string' || pad === '') return 'overig'
  const schoon = pad.split('?')[0].replace(/\/+$/, '') || '/'
  if (EXACTE_ROUTES.has(schoon)) return EXACTE_ROUTES.get(schoon)
  for (const [begin, label] of PREFIX_ROUTES) {
    if (schoon.startsWith(begin)) return label
  }
  return 'overig'
}

/**
 * Leest de configuratie. Fail-closed: bij een ontbrekende of onzinnige
 * waarde staat de diagnostiek uit.
 * @returns {{aan: boolean, minuten: number, reden?: string}}
 */
export function diagnoseConfiguratie(env = process.env) {
  if (String(env.AGENT_DIAGNOSE ?? '').trim().toLowerCase() !== 'true') {
    return { aan: false, minuten: 0, reden: 'vlag staat niet op true' }
  }
  const ruw = String(env.AGENT_DIAGNOSE_MINUTEN ?? '').trim()
  if (ruw === '') return { aan: true, minuten: MAX_MINUTEN }
  if (!/^\d{1,3}$/.test(ruw)) {
    return { aan: false, minuten: 0, reden: 'AGENT_DIAGNOSE_MINUTEN is geen getal' }
  }
  const minuten = Number(ruw)
  if (minuten < 1 || minuten > MAX_MINUTEN) {
    return { aan: false, minuten: 0, reden: `AGENT_DIAGNOSE_MINUTEN moet tussen 1 en ${MAX_MINUTEN} liggen` }
  }
  return { aan: true, minuten }
}

export function diagnoseIngeschakeld(env = process.env) {
  return diagnoseConfiguratie(env).aan
}

/**
 * @param {{minuten?: number, nu?: () => number, schrijf?: (regel: string) => void}} opties
 */
export function maakDiagnose({ minuten = MAX_MINUTEN, nu = () => Date.now(), schrijf = console.log } = {}) {
  const begrensd = Math.min(Math.max(Math.floor(minuten) || 1, 1), MAX_MINUTEN)
  const vervalt = nu() + begrensd * 60_000
  let afgesloten = false

  function verlopen() {
    if (nu() < vervalt) return false
    if (!afgesloten) {
      afgesloten = true
      schrijf(`${PREFIX} gestopt: de ingestelde ${begrensd} minuten zijn voorbij`)
    }
    return true
  }

  function middleware(req, res, next) {
    if (verlopen()) return next()
    const start = nu()
    // req.path bevat nooit de querystring; die wordt hier ook nergens gelezen.
    const label = routeLabel(req.path)
    const methode = typeof req.method === 'string' ? req.method.toUpperCase().slice(0, 7) : 'ONBEKEND'

    res.on('finish', () => {
      if (verlopen()) return
      const duur = Math.max(0, nu() - start)
      const reden = res.locals && FOUTCATEGORIEEN.has(res.locals.diagnoseReden) ? res.locals.diagnoseReden : null
      // Zes velden, in deze volgorde, en niets anders.
      schrijf(
        `${PREFIX} ${new Date(nu()).toISOString()} ${methode} ${label} ${res.statusCode} ${duur}ms` +
          (reden ? ` reden=${reden}` : '')
      )
    })

    next()
  }

  return {
    middleware,
    actief: () => !verlopen(),
    vervaltOp: vervalt,
    minuten: begrensd,
  }
}
