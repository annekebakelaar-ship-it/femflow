import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingShell from './OnboardingShell'
import Button from '../../components/Button'
import Input from '../../components/Input'

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
const PRICE_MONTHLY = '19,00'
const PRICE_REGULAR = '29,00'
const EARLY_BIRD_LIMIT = 100
const PRIORITY_DOT = { hoog: 'var(--success)', middel: 'var(--accent)', laag: 'var(--ink-3)' }

export default function BetaalStep() {
  const navigate = useNavigate()
  const [advice, setAdvice] = useState(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [street, setStreet] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('youcaps_advice')
      if (raw) setAdvice(JSON.parse(raw))
    } catch {}
    setFirstName(localStorage.getItem('youcaps_first_name') || '')
    setLastName(localStorage.getItem('youcaps_last_name') || '')
    setEmail(localStorage.getItem('youcaps_email') || '')
    setStreet(localStorage.getItem('youcaps_street') || '')
    setPostalCode(localStorage.getItem('youcaps_postal') || '')
    setCity(localStorage.getItem('youcaps_city') || '')
  }, [])

  async function handleCheckout() {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Vul je voor- en achternaam in.')
      return
    }
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Vul een geldig e-mailadres in.')
      return
    }
    if (!street.trim() || !postalCode.trim() || !city.trim()) {
      setError('Vul je bezorgadres in.')
      return
    }
    localStorage.setItem('youcaps_first_name', firstName.trim())
    localStorage.setItem('youcaps_last_name', lastName.trim())
    localStorage.setItem('youcaps_email', trimmed)
    localStorage.setItem('youcaps_street', street.trim())
    localStorage.setItem('youcaps_postal', postalCode.trim())
    localStorage.setItem('youcaps_city', city.trim())
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'checkout_start')
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BASE}/api/payment/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          name: `${firstName.trim()} ${lastName.trim()}`,
          street: street.trim(),
          postal_code: postalCode.trim(),
          city: city.trim(),
          country: 'Nederland',
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      localStorage.setItem('youcaps_price', PRICE_MONTHLY.replace(',', '.'))
      window.location.href = data.checkout_url
    } catch {
      setError('Betaling starten mislukt. Probeer het opnieuw.')
      setLoading(false)
    }
  }

  return (
    <OnboardingShell step={5}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '26px',
        fontWeight: '500',
        letterSpacing: '-1px',
        lineHeight: 1.1,
        marginBottom: 'var(--space-sm)',
        color: 'var(--ink)',
      }}>
        Start je abonnement.
      </h1>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '15px',
        fontWeight: '400',
        color: 'var(--ink-2)',
        lineHeight: 1.6,
        marginBottom: 'var(--space-xl)',
      }}>
        Jouw formule, elke maand vers samengesteld en bezorgd.
      </p>

      {/* Price Box */}
      <div style={{
        padding: 'var(--space-lg)',
        border: '2px solid var(--ink)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--space-lg)',
        textAlign: 'center',
        backgroundColor: 'var(--surface-warm)',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: '500',
          color: 'var(--ink-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: 0,
          marginBottom: 'var(--space-sm)',
        }}>
          Founding Member Prijs
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
          fontWeight: '600',
          fontFeatureSettings: "'tnum'",
          margin: 0,
          marginBottom: '4px',
          color: 'var(--ink)',
        }}>
          €{PRICE_MONTHLY}
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: '400',
          color: 'var(--ink-2)',
          margin: 0,
          marginBottom: 'var(--space-md)',
        }}>
          per maand – vergrendeld voor altijd
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: '400',
          color: 'var(--ink-3)',
          margin: 0,
        }}>
          → Post-launch: €{PRICE_REGULAR}/maand
        </p>
      </div>

      {/* Guarantee Box */}
      <div style={{
        padding: 'var(--space-lg)',
        border: '1px solid var(--success)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--space-lg)',
        backgroundColor: 'rgba(79, 140, 90, 0.05)',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--success)',
          margin: 0,
          marginBottom: 'var(--space-sm)',
        }}>
          ✓ 60 DAGEN TERUGGELD GARANTIE
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: '400',
          color: 'var(--ink-2)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          Niet tevreden? Mail naar info@youcaps.app en wij storten terug. Geen vragen.
        </p>
      </div>

      {/* Formule samenvatting */}
      {advice?.supplements?.length > 0 && (
        <div style={{
          padding: 'var(--space-md)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-lg)',
        }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: '500',
            color: 'var(--ink-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-sm)',
          }}>
            Jouw formule
          </p>
          {advice.supplements.map((s, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < advice.supplements.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              gap: 'var(--space-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: PRIORITY_DOT[s.priority] || 'var(--ink-3)',
                  flexShrink: 0,
                }} />
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: '500', fontSize: '15px', color: 'var(--ink)' }}>
                  {s.name}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: '400', color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
                {s.dose}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Prijs */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: 'var(--space-md)',
        background: 'var(--surface-warm)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--space-xl)',
      }}>
        <div>
          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '15px', marginBottom: '2px', color: 'var(--ink)' }}>
            YOUCAPS Maandabonnement
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: '400', color: 'var(--ink-2)' }}>
            Gepersonaliseerd · Elke maand · Opzegbaar
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontFeatureSettings: "'tnum'", fontSize: '1.4rem', letterSpacing: '-0.5px', color: 'var(--ink)' }}>
                €{PRICE_MONTHLY}
              </span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: '400', color: 'var(--ink-2)' }}>/mnd</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: '400', textDecoration: 'line-through', color: 'var(--ink-3)' }}>
                €{PRICE_REGULAR}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: '500', color: 'var(--success)', marginTop: '2px' }}>
              Early bird – introductieprijs voor de eerste {EARLY_BIRD_LIMIT} klanten
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
        <Input
          label="Voornaam"
          placeholder="Anna"
          value={firstName}
          onChange={e => { setFirstName(e.target.value); setError('') }}
        />
        <Input
          label="Achternaam"
          placeholder="Jansen"
          value={lastName}
          onChange={e => { setLastName(e.target.value); setError('') }}
        />
      </div>

      <div style={{ marginBottom: 'var(--space-md)' }}>
        <Input
          label="Je e-mailadres"
          type="email"
          placeholder="jij@voorbeeld.nl"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
        />
      </div>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '11px',
        fontWeight: '500',
        color: 'var(--ink-3)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 'var(--space-sm)',
        marginTop: 'var(--space-lg)',
      }}>
        Bezorgadres
      </p>

      <div style={{ marginBottom: 'var(--space-sm)' }}>
        <Input
          label="Straat + huisnummer"
          placeholder="Keizersgracht 123"
          value={street}
          onChange={e => { setStreet(e.target.value); setError('') }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        <Input
          label="Postcode"
          placeholder="1234 AB"
          value={postalCode}
          onChange={e => { setPostalCode(e.target.value); setError('') }}
        />
        <Input
          label="Stad"
          placeholder="Amsterdam"
          value={city}
          onChange={e => { setCity(e.target.value); setError('') }}
        />
      </div>

      <Button onClick={handleCheckout} disabled={loading}>
        {loading ? 'Even geduld...' : 'Betaal en start →'}
      </Button>

      {error && (
        <p style={{ marginTop: 'var(--space-sm)', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: '400', color: 'var(--error)' }}>
          {error}
        </p>
      )}

      <p style={{
        marginTop: 'var(--space-md)',
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: '400',
        color: 'var(--ink-3)',
        lineHeight: 1.5,
      }}>
        Veilig betalen via iDEAL, creditcard of SEPA. Je kunt op elk moment opzeggen.
      </p>

      <button
        onClick={() => navigate('/welkom/advies')}
        style={{
          marginTop: 'var(--space-sm)',
          fontFamily: 'var(--font-sans)',
          background: 'none',
          border: 'none',
          padding: '8px 0',
          fontSize: '13px',
          fontWeight: '400',
          color: 'var(--ink-2)',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        ← Terug naar advies
      </button>
    </OnboardingShell>
  )
}
