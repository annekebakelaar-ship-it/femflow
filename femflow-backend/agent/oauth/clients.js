// Geregistreerde clients.
//
// STANDAARD LEEG. Zonder AGENT_OAUTH_CLIENTS is er geen enkele client, dus
// elk autorisatieverzoek eindigt op invalid_client. Dat is de veilige stand:
// de endpoints kunnen aan staan zonder dat iemand kan koppelen.
//
// Dynamische clientregistratie (RFC 7591) en client-id metadata documents,
// die ChatGPT gebruikt, zitten NIET in deze fase. Zie README.md: dat is
// ontwerp, geen code. Nu registreer je een client met de hand, wat voor een
// pilot met een handvol gebruikers prima werkt en veel minder aanvalsvlak
// geeft.

/**
 * @param {Array<{id: string, naam?: string, redirectUris: string[]}>} lijst
 */
export function maakClientRegister(lijst = []) {
  const clients = new Map()
  for (const c of lijst) {
    if (!c || typeof c.id !== 'string' || !Array.isArray(c.redirectUris) || c.redirectUris.length === 0) {
      throw new TypeError('client vereist id en minstens een redirectUri')
    }
    for (const uri of c.redirectUris) {
      // Geen http (behalve localhost voor ontwikkeling), geen fragment, geen
      // wildcard. Een redirect_uri is een exacte string, verder niets.
      const u = new URL(uri)
      const lokaal = u.hostname === 'localhost' || u.hostname === '127.0.0.1'
      if (u.protocol !== 'https:' && !lokaal) throw new TypeError(`redirect_uri moet https zijn: ${uri}`)
      if (u.hash) throw new TypeError(`redirect_uri mag geen fragment hebben: ${uri}`)
      if (uri.includes('*')) throw new TypeError(`redirect_uri mag geen jokerteken hebben: ${uri}`)
    }
    clients.set(c.id, { id: c.id, naam: c.naam || c.id, redirectUris: [...c.redirectUris] })
  }

  return {
    vind(id) {
      if (typeof id !== 'string' || id === '') return null
      return clients.get(id) || null
    },
    aantal() {
      return clients.size
    },
  }
}

/** Leest de lijst uit de omgeving. Fout of leeg betekent: geen clients. */
export function clientsUitOmgeving(env = process.env, waarschuw = console.warn) {
  const ruw = env.AGENT_OAUTH_CLIENTS
  if (!ruw) return maakClientRegister([])
  try {
    const lijst = JSON.parse(ruw)
    if (!Array.isArray(lijst)) throw new TypeError('AGENT_OAUTH_CLIENTS moet een lijst zijn')
    return maakClientRegister(lijst)
  } catch (err) {
    waarschuw(`AGENT_OAUTH_CLIENTS onbruikbaar (${err.message}); er zijn geen clients geregistreerd`)
    return maakClientRegister([])
  }
}
