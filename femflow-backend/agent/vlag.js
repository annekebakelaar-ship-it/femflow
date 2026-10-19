// De agent staat standaard UIT. Niet alleen in de interface: zonder de vlag
// wordt de router helemaal niet gemonteerd, dus de endpoints bestaan niet.
// Zo kan een fout in deze module de live app niet raken.

export function agentIngeschakeld(env = process.env) {
  return String(env.AGENT_ENABLED ?? '').trim().toLowerCase() === 'true'
}
