// Clientregistratie via een Client ID Metadata Document (CIMD).
//
// WAAROM DIT EN GEEN DCR: dynamische clientregistratie (RFC 7591) laat een
// onbekende partij zichzelf inschrijven. In de MCP-spec is dat inmiddels
// afgeraden ten gunste van CIMD, en voor ons is het ook veiliger: bij CIMD is
// de client_id een https-URL die naar een document wijst dat de client zelf
// publiceert. Wij halen dat op, controleren het, en accepteren alleen hosts
// die vooraf in de configuratie staan. Er is dus geen open registratie.
//
// ChatGPT gebruikt dit: client_id https://chatgpt.com/oauth/client.json met
// redirect https://chatgpt.com/connector_platform_oauth_redirect.
//
// VALKUIL die bij YouCaps een breuk veroorzaakte: dat document noemt
// "token_endpoint_auth_method": "private_key_jwt" als VOORKEUR, met
// "token_endpoint_auth_methods_supported": ["none", "private_key_jwt"]
// ernaast. Wie alleen naar het eerste veld kijkt, wijst ChatGPT af. We
// onderhandelen daarom op de doorsnede met wat wij aankunnen.
//
// STANDAARD DICHT: zonder AGENT_OAUTH_CIMD_HOSTS is geen enkele host
// toegestaan en kan niemand zich registreren.

import { isLoopback } from './redirect.js'

const WIJ_ONDERSTEUNEN = ['none']
const MAX_BYTES = 64 * 1024
const TIMEOUT_MS = 5000
const CACHE_MS = 10 * 60_000

export const CIMD_FOUT = {
  GEEN_URL: 'client_id is geen https-URL',
  HOST_NIET_TOEGESTAAN: 'host staat niet in de allowlist',
  NIET_OPHAALBAAR: 'document niet op te halen',
  GEEN_JSON: 'document is geen JSON',
  TE_GROOT: 'document is te groot',
  CLIENT_ID_KLOPT_NIET: 'client_id in het document wijst niet naar zichzelf',
  GEEN_REDIRECT: 'geen bruikbare redirect_uris',
  VREEMDE_REDIRECT: 'redirect_uri hoort niet bij dezelfde host als het document',
  GEEN_AUTHMETHODE: 'geen gedeelde token_endpoint_auth_method',
}

export function hostsUitOmgeving(env = process.env) {
  return String(env.AGENT_OAUTH_CIMD_HOSTS || '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)
}

/** Kiest de auth-methode op de doorsnede, niet op het voorkeursveld alleen. */
export function kiesAuthMethode(document) {
  const lijst = Array.isArray(document.token_endpoint_auth_methods_supported)
    ? document.token_endpoint_auth_methods_supported
    : document.token_endpoint_auth_method
      ? [document.token_endpoint_auth_method]
      : ['none']
  const voorkeur = document.token_endpoint_auth_method
  if (voorkeur && WIJ_ONDERSTEUNEN.includes(voorkeur)) return voorkeur
  return lijst.find((m) => WIJ_ONDERSTEUNEN.includes(m)) || null
}

/** Keurt het document. Puur: geen netwerk, dus volledig te testen. */
export function keurDocument(clientId, document) {
  if (!document || typeof document !== 'object') return { ok: false, fout: CIMD_FOUT.GEEN_JSON }
  if (document.client_id !== clientId) return { ok: false, fout: CIMD_FOUT.CLIENT_ID_KLOPT_NIET }

  const uris = Array.isArray(document.redirect_uris) ? document.redirect_uris : []
  if (uris.length === 0) return { ok: false, fout: CIMD_FOUT.GEEN_REDIRECT }

  const documentHost = new URL(clientId).host
  // Een native client (RFC 8252) vangt de code op een loopback-adres op de
  // machine van de gebruiker zelf. Dat is geen afwijking maar de
  // voorgeschreven manier; een webclient hoort juist op zijn eigen host terug
  // te komen. Alleen documenten die zichzelf native noemen krijgen die ruimte.
  const native = document.application_type === 'native'
  for (const uri of uris) {
    let u
    try {
      u = new URL(uri)
    } catch {
      return { ok: false, fout: CIMD_FOUT.GEEN_REDIRECT }
    }
    // Nooit een fragment of inloggegevens in een redirect-URI.
    if (u.hash || u.username || u.password) return { ok: false, fout: CIMD_FOUT.VREEMDE_REDIRECT }

    const webredirect = u.protocol === 'https:' && u.host === documentHost
    const nativeredirect = native && isLoopback(u)
    // Dezelfde host als het document zelf, of loopback bij een native client.
    // Dat is de hele bescherming van CIMD: wie het document host, bepaalt waar
    // de code heen mag, en bij loopback blijft de code op het toestel.
    if (!webredirect && !nativeredirect) return { ok: false, fout: CIMD_FOUT.VREEMDE_REDIRECT }
  }

  const methode = kiesAuthMethode(document)
  if (!methode) return { ok: false, fout: CIMD_FOUT.GEEN_AUTHMETHODE }

  return {
    ok: true,
    client: {
      id: clientId,
      naam: typeof document.client_name === 'string' ? document.client_name.slice(0, 120) : new URL(clientId).host,
      redirectUris: [...uris],
      authMethode: methode,
      native,
      bron: 'cimd',
    },
  }
}

/**
 * @param {{ toegestaneHosts?: string[], fetchImpl?: Function, nu?: () => number,
 *           cacheMs?: number, waarschuw?: Function }} opties
 */
export function maakCimdRegister({
  toegestaneHosts = [], fetchImpl = globalThis.fetch, nu = () => Date.now(), cacheMs = CACHE_MS, waarschuw = console.warn,
} = {}) {
  const cache = new Map()
  const hosts = toegestaneHosts.map((h) => h.toLowerCase())

  async function haalOp(clientId) {
    let url
    try {
      url = new URL(clientId)
    } catch {
      return { ok: false, fout: CIMD_FOUT.GEEN_URL }
    }
    if (url.protocol !== 'https:') return { ok: false, fout: CIMD_FOUT.GEEN_URL }
    // Exacte host, geen subdomeinregel, geen jokerteken. Omdat de allowlist
    // alleen echte, publieke hosts bevat (chatgpt.com), is DNS-rebinding hier
    // geen praktisch risico: een aanvaller beheert die DNS niet.
    if (!hosts.includes(url.host.toLowerCase())) return { ok: false, fout: CIMD_FOUT.HOST_NIET_TOEGESTAAN }

    let antwoord
    try {
      antwoord = await fetchImpl(url.toString(), {
        // Geen omleidingen volgen: anders bepaalt de host waar we uitkomen.
        redirect: 'error',
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch (err) {
      waarschuw(`CIMD ophalen mislukt voor ${url.host}: ${err.message}`)
      return { ok: false, fout: CIMD_FOUT.NIET_OPHAALBAAR }
    }
    if (!antwoord.ok) return { ok: false, fout: CIMD_FOUT.NIET_OPHAALBAAR }

    const tekst = await antwoord.text()
    if (tekst.length > MAX_BYTES) return { ok: false, fout: CIMD_FOUT.TE_GROOT }
    let document
    try {
      document = JSON.parse(tekst)
    } catch {
      return { ok: false, fout: CIMD_FOUT.GEEN_JSON }
    }
    return keurDocument(clientId, document)
  }

  return {
    /** @returns {Promise<object|null>} de client, of null als er iets niet deugt. */
    async vind(clientId) {
      if (typeof clientId !== 'string' || !clientId.startsWith('https://')) return null
      const gecachet = cache.get(clientId)
      if (gecachet && gecachet.tot > nu()) return gecachet.client

      const uitslag = await haalOp(clientId)
      if (!uitslag.ok) {
        waarschuw(`CIMD geweigerd voor ${clientId}: ${uitslag.fout}`)
        return null
      }
      cache.set(clientId, { client: uitslag.client, tot: nu() + cacheMs })
      return uitslag.client
    },
    aantal() {
      return cache.size
    },
  }
}

/**
 * Combineert een vaste lijst met CIMD. Een client_id dat met https:// begint
 * gaat naar CIMD, de rest naar de vaste lijst.
 */
export function maakSamengesteldRegister({ statisch, cimd }) {
  return {
    async vind(id) {
      if (typeof id === 'string' && id.startsWith('https://')) {
        return cimd ? cimd.vind(id) : null
      }
      return statisch ? statisch.vind(id) : null
    },
    aantal() {
      return (statisch?.aantal() || 0) + (cimd?.aantal() || 0)
    },
  }
}
