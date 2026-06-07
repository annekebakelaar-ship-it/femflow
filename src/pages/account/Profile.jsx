import { useState, useEffect } from 'react'
import Label from '../../components/Label'
import { withdrawConsent } from '../../api/client'
import hero from '../../assets/hero1.png'

const PRIORITY_DOT = { hoog: '#2e7d32', middel: '#e67e22', laag: '#aaa' }

function nextDelivery() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return first.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
}

function Section({ label, children, style }) {
  return (
    <section style={{ marginBottom: 'var(--space-xl)', ...style }}>
      <Label>{label}</Label>
      <div style={{ marginTop: 'var(--space-sm)' }}>{children}</div>
    </section>
  )
}

export default function Profile({ user, onBack, onLogout }) {
  const [advice, setAdvice] = useState(null)
  const [wearableConnected, setWearableConnected] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [consentStatus, setConsentStatus] = useState(null)
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  const email = user?.email || ''

  function loadConsentStatus() {
    const token = localStorage.getItem('wab_jwt')
    console.log('loadConsentStatus called, token:', !!token)
    if (!token) {
      console.warn('No token in localStorage')
      return
    }
    fetch('https://wearable-age-api.onrender.com/consent/status?consent_version=1.0', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(r => {
        console.log('Consent fetch response:', r.status)
        return r.json()
      })
      .then(data => {
        console.log('Consent data:', data)
        setConsentStatus(data)
      })
      .catch(e => console.error('Consent load error:', e))
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem('youcaps_advice')
      if (raw) setAdvice(JSON.parse(raw))
    } catch {}
    setWearableConnected(!!sessionStorage.getItem('oura_pulled_data'))

    loadConsentStatus()
    const interval = setInterval(loadConsentStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  function handleLogout() {
    ['youcaps_paid', 'youcaps_email', 'youcaps_advice', 'youcaps_quiz',
     'youcaps_first_visit', 'youcaps_prefs', 'youcaps_token'].forEach(k => localStorage.removeItem(k))
    sessionStorage.clear()
    onLogout?.()
  }

  async function handleWithdrawConsent() {
    setWithdrawing(true)
    try {
      await withdrawConsent('1.0', true)
      setConsentStatus(null)
      setConfirmWithdraw(false)
    } catch (e) {
      console.error('Withdrawal failed:', e)
    } finally {
      setWithdrawing(false)
    }
  }

  const row = (label, value) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '13px 0',
      borderBottom: '1px solid var(--color-border-subtle)',
    }}>
      <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)' }}>{label}</span>
      <span style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-medium)' }}>{value}</span>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--container-padding) var(--space-xxl)',
      animation: 'fade-slide-up 240ms ease both',
      backgroundImage: `url(${hero})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)', color: 'var(--color-label)', letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer' }}>
          ← Back
        </button>
        <span style={{ fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-body)', letterSpacing: '.04em' }}>ACCOUNT</span>
        <div style={{ width: 40 }} />
      </nav>

      <h1 style={{
        fontSize: 'var(--font-size-display)',
        fontWeight: 'var(--font-weight-semibold)',
        letterSpacing: '-1px',
        marginBottom: 'var(--space-xl)',
        animation: 'fade-slide-up 220ms ease both',
      }}>
        Account
      </h1>

      {/* Formule */}
      {advice?.supplements?.length > 0 && (
        <Section label="Jouw formule">
          <div style={{ border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            {advice.supplements.map((s, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '13px var(--space-md)',
                borderBottom: i < advice.supplements.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                animation: 'fade-slide-up 280ms ease both',
                animationDelay: `${i * 60}ms`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_DOT[s.priority] || '#aaa', flexShrink: 0 }} />
                  <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-body)' }}>{s.name}</span>
                </div>
                <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)' }}>{s.dose}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Abonnement */}
      <Section label="Abonnement">
        <div style={{ border: '1px solid var(--color-border)', overflow: 'hidden' }}>
          {row('Status', 'Actief')}
          {row('Volgende levering', nextDelivery())}
          {row('Prijs', '€29 / maand')}
          <div style={{ padding: '13px var(--space-md)', display: 'flex', gap: '12px' }}>
            <button
              style={{
                flex: 1, padding: '11px 0',
                background: 'none',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-mono)', fontSize: '10px',
                fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase',
                cursor: 'pointer', color: 'var(--color-secondary)',
              }}
              onClick={() => {}}
            >
              Pauzeer
            </button>
            <button
              style={{
                flex: 1, padding: '11px 0',
                background: 'none',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-mono)', fontSize: '10px',
                fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase',
                cursor: 'pointer', color: '#c62828',
              }}
              onClick={() => {}}
            >
              Opzeggen
            </button>
          </div>
        </div>
      </Section>

      {/* Wearable */}
      <Section label="Wearable">
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px var(--space-md)',
          border: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: wearableConnected ? '#2e7d32' : '#aaa',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 'var(--font-size-body)' }}>
              {wearableConnected ? 'Oura gekoppeld' : 'Geen wearable gekoppeld'}
            </span>
          </div>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', padding: 0,
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              letterSpacing: '.14em', textTransform: 'uppercase',
              color: 'var(--color-secondary)', cursor: 'pointer',
            }}
          >
            Terug →
          </button>
        </div>
      </Section>

      {/* Gegevensbescherming (Consent) */}
      {consentStatus?.has_active_consent && (
        <Section label="Gegevensbescherming">
          <div style={{ border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <div style={{
              padding: '13px var(--space-md)',
              borderBottom: '1px solid var(--color-border-subtle)',
            }}>
              <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)', marginBottom: 6 }}>
                Toestemming gegeven voor:
              </div>
              <div style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-medium)' }}>
                {consentStatus.purposes?.map(p => {
                  const labels = { store: 'Opslaan', reformulate: 'Trends & hersamenstelling', improve_algo: 'Algoritme-verbetering' }
                  return labels[p] || p
                }).join(', ')}
              </div>
            </div>
            {consentStatus.granted_at && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '13px var(--space-md)',
                borderBottom: '1px solid var(--color-border-subtle)',
              }}>
                <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)' }}>Gegeven op</span>
                <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)' }}>
                  {new Date(consentStatus.granted_at).toLocaleDateString('nl-NL')}
                </span>
              </div>
            )}
            {!confirmWithdraw ? (
              <button
                onClick={() => setConfirmWithdraw(true)}
                style={{
                  width: '100%', padding: '14px var(--space-md)',
                  background: 'none', border: 'none',
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase',
                  color: '#c62828', cursor: 'pointer', textAlign: 'left',
                }}
              >
                Intrekken & gegevens verwijderen
              </button>
            ) : (
              <div style={{ padding: '14px var(--space-md)', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)', flex: '1 1 100%', marginBottom: 8 }}>
                  Dit zal al je Oura-gegevens verwijderen. Weet je het zeker?
                </span>
                <button
                  onClick={handleWithdrawConsent}
                  disabled={withdrawing}
                  style={{
                    background: 'none', border: 'none',
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    letterSpacing: '.14em', textTransform: 'uppercase',
                    color: '#c62828', cursor: withdrawing ? 'not-allowed' : 'pointer',
                    opacity: withdrawing ? 0.5 : 1,
                  }}
                >
                  {withdrawing ? 'Bezig...' : 'Ja, intrekken'}
                </button>
                <button
                  onClick={() => setConfirmWithdraw(false)}
                  disabled={withdrawing}
                  style={{
                    background: 'none', border: 'none',
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    letterSpacing: '.14em', textTransform: 'uppercase',
                    color: 'var(--color-secondary)', cursor: 'pointer',
                  }}
                >
                  Annuleer
                </button>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Account */}
      <Section label="Account">
        <div style={{ border: '1px solid var(--color-border)', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '13px var(--space-md)',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}>
            <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)' }}>E-mail</span>
            <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)' }}>{email}</span>
          </div>
          {!confirmLogout ? (
            <button
              onClick={() => setConfirmLogout(true)}
              style={{
                width: '100%', padding: '14px var(--space-md)',
                background: 'none', border: 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: 'var(--font-mono)', fontSize: '10px',
                fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase',
                color: 'var(--color-secondary)', cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              Uitloggen <span>→</span>
            </button>
          ) : (
            <div style={{ padding: '14px var(--space-md)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)', flex: 1 }}>
                Weet je het zeker?
              </span>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#c62828', cursor: 'pointer' }}>
                Ja
              </button>
              <button onClick={() => setConfirmLogout(false)} style={{ background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-secondary)', cursor: 'pointer' }}>
                Nee
              </button>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}
