// Het ondertekende autorisatieverzoek: de brug tussen /authorize en het
// toestemmingsscherm in de app.
//
// WAAROM DIT BESTAAT:
// 1. CSRF. De app praat met een bearer token in een header, niet met een
//    cookie, dus een klassieke CSRF-aanval kan niet: een vreemde pagina kan
//    dat token niet meesturen. Wat wel kan is een "verwarde afgevaardigde":
//    iemand stuurt de gebruiker een /authorize-link met zijn eigen client en
//    hoopt dat zij op akkoord drukt. Daartegen helpt alleen dat zij precies
//    ziet wie wat vraagt, en dat wat ze ziet hetzelfde is als wat ondertekend
//    wordt.
// 2. Knoeien tussen tonen en beslissen. Het scherm toont de gevraagde scopes;
//    de beslissing stuurt alleen dit ondertekende pakketje terug. De client_id,
//    redirect_uri, scope, state en code_challenge komen dus NOOIT los uit de
//    body van de beslissing, maar altijd uit wat de server zelf heeft gekeurd
//    en ondertekend. Een aanvaller kan de redirect dus niet omzetten nadat de
//    gebruiker het scherm heeft gezien.
//
// Het geheim wordt afgeleid uit de prive-OAuth-sleutel, zodat er geen extra
// omgevingsvariabele bij komt die vergeten kan worden.

import { createHmac, createHash, timingSafeEqual } from 'crypto'

const GELDIG_MS = 10 * 60_000

export function afgeleidGeheim(priveSleutelPem) {
  return createHash('sha256').update(String(priveSleutelPem)).update('ovari-agent-verzoek-v1').digest()
}

function onderteken(inhoudB64, geheim) {
  return createHmac('sha256', geheim).update(inhoudB64).digest('base64url')
}

/** @returns {string} compact token: base64url(payload).handtekening */
export function maakVerzoekToken(verzoek, geheim, nu = () => Date.now()) {
  const inhoud = {
    client_id: verzoek.client.id,
    client_naam: verzoek.client.naam,
    redirect_uri: verzoek.redirectUri,
    scope: verzoek.scope,
    state: verzoek.state,
    code_challenge: verzoek.codeChallenge,
    vervalt: nu() + GELDIG_MS,
  }
  const b64 = Buffer.from(JSON.stringify(inhoud)).toString('base64url')
  return `${b64}.${onderteken(b64, geheim)}`
}

/** @returns {{ok: true, verzoek: object} | {ok: false, reden: string}} */
export function leesVerzoekToken(token, geheim, nu = () => Date.now()) {
  if (typeof token !== 'string' || !token.includes('.')) return { ok: false, reden: 'geen_verzoek' }
  const [b64, handtekening] = token.split('.')
  if (!b64 || !handtekening) return { ok: false, reden: 'geen_verzoek' }

  const verwacht = Buffer.from(onderteken(b64, geheim))
  const gegeven = Buffer.from(handtekening)
  if (verwacht.length !== gegeven.length || !timingSafeEqual(verwacht, gegeven)) {
    return { ok: false, reden: 'handtekening_klopt_niet' }
  }

  let inhoud
  try {
    inhoud = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'))
  } catch {
    return { ok: false, reden: 'geen_verzoek' }
  }
  if (!inhoud || typeof inhoud !== 'object') return { ok: false, reden: 'geen_verzoek' }
  if (typeof inhoud.vervalt !== 'number' || inhoud.vervalt <= nu()) return { ok: false, reden: 'verlopen' }

  return { ok: true, verzoek: inhoud }
}
