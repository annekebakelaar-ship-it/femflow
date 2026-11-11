// Mail versturen via Resend.
//
// WAAROM DIT BESTAAT: de inlogcodes gingen via SendGrid. Toen de gratis
// proefperiode daar op 7 augustus 2026 afliep, gaf SendGrid 401 en kon geen
// enkele nieuwe gebruiker meer inloggen. Resend draait al voor YouCaps, met
// youcaps.app als geverifieerd domein. Een gewone fetch volstaat; daar hoeft
// geen SDK voor bij.
//
// Een mislukte verzending GOOIT altijd. Stil doorgaan zou de gebruiker naar
// het code-scherm sturen voor een mail die nooit komt.

export const RESEND_URL = 'https://api.resend.com/emails'
export const STANDAARD_AFZENDER = 'Ovari <noreply@youcaps.app>'

export async function verstuurMail({ to, subject, html, text }, { env = process.env, fetchFn = fetch } = {}) {
  const sleutel = env.RESEND_API_KEY
  if (!sleutel) throw new Error('RESEND_API_KEY ontbreekt: er kan geen mail verstuurd worden')

  const res = await fetchFn(RESEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${sleutel}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM || STANDAARD_AFZENDER,
      to: [to],
      subject,
      html,
      ...(text ? { text } : {}),
    }),
  })

  if (!res.ok) {
    // Alleen status en Resends eigen foutnaam; nooit de sleutel of de inhoud.
    const fout = await res.json().catch(() => ({}))
    throw new Error(`Resend weigerde de mail: ${res.status} ${fout.name || ''} ${fout.message || ''}`.trim())
  }
  return res.json()
}
