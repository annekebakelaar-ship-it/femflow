import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, Check, X } from 'react-feather'
import { getToken, leesAgentVerzoek, beslisOverAgentVerzoek } from '../../api/client'

// Toestemmingsscherm voor een externe assistent (OAuth).
//
// Wat hier gebeurt is een beslissing met gevolgen, dus het scherm laat
// precies zien WIE het vraagt en WAT er gedeeld wordt. Geen vinkjes die al
// aan staan, geen kleine lettertjes, en weigeren is net zo bereikbaar als
// akkoord.
//
// VEILIGHEID: alle parameters zitten in het ondertekende verzoek uit de URL.
// Dit scherm stuurt dat pakketje ongewijzigd terug; het verzint zelf geen
// client_id, scope of redirect. De server keurt de handtekening opnieuw.
export default function ToestemmingScherm() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const verzoek = params.get('verzoek')

  const [gegevens, setGegevens] = useState(null)
  const [fout, setFout] = useState('')
  const [bezig, setBezig] = useState(false)

  useEffect(() => {
    if (!getToken()) {
      // Niet ingelogd: eerst inloggen, daarna terug naar dit scherm.
      navigate(`/login?terug=${encodeURIComponent(window.location.pathname + window.location.search)}`)
      return
    }
    if (!verzoek) {
      setFout('Dit verzoek is niet compleet. Start de koppeling opnieuw vanuit de assistent.')
      return
    }
    leesAgentVerzoek(verzoek)
      .then(setGegevens)
      .catch(() => setFout('Dit verzoek is verlopen of niet geldig. Start de koppeling opnieuw vanuit de assistent.'))
  }, [verzoek, navigate])

  async function beslis(akkoord) {
    setBezig(true)
    setFout('')
    try {
      const { redirect } = await beslisOverAgentVerzoek({ verzoek, akkoord })
      window.location.href = redirect
    } catch (err) {
      setFout(
        err.status === 403
          ? 'Zet eerst in je profiel aan dat een assistent je gegevens mag lezen.'
          : 'Dit lukte niet. Probeer het opnieuw.'
      )
      setBezig(false)
    }
  }

  const kaart = {
    background: 'var(--d-card)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '14px',
  }

  return (
    <div style={{ minHeight: '100vh', padding: '28px 20px 48px', maxWidth: '520px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <Shield size={20} color="var(--d-accent)" strokeWidth={1.5} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, color: 'var(--d-ink)', margin: 0 }}>
          Toegang tot je gegevens
        </h1>
      </div>

      {fout && (
        <div style={{ ...kaart, border: '1px solid var(--error)' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--d-ink)', margin: 0 }}>{fout}</p>
        </div>
      )}

      {gegevens && (
        <>
          <div style={kaart}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--d-ink)', lineHeight: 1.6, margin: 0 }}>
              <strong>{gegevens.client.naam}</strong> vraagt toegang tot een deel van je Ovari-gegevens.
              Je geeft deze toegang alleen aan jezelf: de assistent leest jouw gegevens, niemand anders ziet ze.
            </p>
          </div>

          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--d-ink-3)', margin: '18px 0 10px' }}>
            Wat er gedeeld wordt
          </h2>

          {gegevens.scopes.map((s) => (
            <div key={s.scope} style={kaart}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--d-ink)', margin: '0 0 6px' }}>{s.titel}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--d-ink-2)', lineHeight: 1.6, margin: 0 }}>{s.deelt}</p>
            </div>
          ))}

          <div style={{ ...kaart, marginTop: '18px' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--d-ink-2)', lineHeight: 1.6, margin: 0 }}>
              Je dagelijkse check-ins blijven op je telefoon en worden nooit gedeeld. Je naam en e-mailadres ook niet.
              Je kunt deze toegang op elk moment intrekken in je profiel, bij Koppelingen.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              onClick={() => beslis(false)}
              disabled={bezig}
              style={{
                flex: 1, padding: '14px', borderRadius: '10px', cursor: bezig ? 'wait' : 'pointer',
                background: 'transparent', color: 'var(--d-ink)', border: '1px solid var(--d-border)',
                fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <X size={16} strokeWidth={2} /> Weigeren
            </button>
            <button
              onClick={() => beslis(true)}
              disabled={bezig}
              style={{
                flex: 1, padding: '14px', borderRadius: '10px', cursor: bezig ? 'wait' : 'pointer',
                background: 'var(--d-accent)', color: '#211C1A', border: 'none',
                fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <Check size={16} strokeWidth={2} /> {bezig ? 'Bezig...' : 'Toegang geven'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
