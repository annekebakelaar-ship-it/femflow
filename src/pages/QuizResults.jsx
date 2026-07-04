import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Moon, Smile, AlertCircle, Zap, RotateCw, CheckCircle } from 'react-feather'
import { saveWelcomeSignup } from '../api/client'
import { openExternal } from '../utils/openExternal'

export default function QuizResults() {
  const navigate = useNavigate()
  const location = useLocation()
  const { constellation, email } = location.state || {}
  const [nieuwsbriefEmail, setNieuwsbriefEmail] = useState('')
  const [nieuwsbriefStatus, setNieuwsbriefStatus] = useState(null) // null | 'bezig' | 'gelukt' | 'fout'

  async function handleNieuwsbrief() {
    if (!nieuwsbriefEmail.includes('@')) return
    setNieuwsbriefStatus('bezig')
    try {
      // Expliciete opt-in: adres invullen + klikken is de toestemming
      await saveWelcomeSignup(nieuwsbriefEmail)
      setNieuwsbriefStatus('gelukt')
    } catch {
      setNieuwsbriefStatus('fout')
    }
  }

  if (!constellation) {
    navigate('/quiz')
    return null
  }

  // Count active signals
  const activeSignals = Object.entries(constellation || {})
    .filter(([_, v]) => v)
    .map(([k, _]) => k)

  const signalLabels = {
    sleep: 'slaap',
    mood: 'stemming',
    stress: 'stressherstel',
    energy: 'energie',
    cycle: 'cyclus',
  }

  const signalText = activeSignals
    .map(s => signalLabels[s])
    .slice(0, 2)
    .join(' en ')

  const signalIcons = {
    sleep: <Moon size={32} strokeWidth={1.5} />,
    mood: <Smile size={32} strokeWidth={1.5} />,
    stress: <AlertCircle size={32} strokeWidth={1.5} />,
    energy: <Zap size={32} strokeWidth={1.5} />,
    cycle: <RotateCw size={32} strokeWidth={1.5} />,
  }

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      padding: 'var(--space-lg) var(--space-sm) var(--space-xxl)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fade-slide-up 240ms ease both',
      background: 'var(--d-page)',
      
      
      
    }}>

      <div style={{ maxWidth: '650px', width: '100%' }}>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xxl)' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 8vw, 36px)',
            fontWeight: '500',
            color: 'var(--d-ink)',
            marginBottom: 'var(--space-lg)',
            lineHeight: 1.2,
          }}>
            Dit is jouw patroon
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '16px',
            color: 'var(--d-ink-2)',
            lineHeight: 1.6,
            fontFamily: 'var(--font-sans)',
            maxWidth: '500px',
            margin: '0 auto',
          }}>
            Je {signalText} {activeSignals.length > 1 ? 'verschuiven samen' : 'verschuift'}. Dit patroon zien veel vrouwen.
          </p>
        </div>

        {/* Constellation Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xxl)',
        }}>
          {Object.entries(constellation).map(([signal, isActive]) => (
            <div
              key={signal}
              style={{
                padding: 'var(--space-lg)',
                background: isActive
                  ? 'rgba(199, 154, 110, 0.25)'
                  : 'rgba(199, 154, 110, 0.08)',
                border: isActive
                  ? '2px solid rgba(199, 154, 110, 0.5)'
                  : '1px solid rgba(199, 154, 110, 0.2)',
                borderRadius: '12px',
                textAlign: 'center',
                transition: 'all 200ms ease',
                cursor: 'default',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                if (isActive) {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                marginBottom: '12px',
                opacity: isActive ? 1 : 0.3,
                transition: 'opacity 200ms ease',
                color: isActive ? 'var(--d-accent)' : 'var(--d-ink-3)',
              }}>
                {signalIcons[signal]}
              </div>
              <p style={{
                fontSize: '12px',
                fontWeight: '600',
                color: isActive ? 'var(--d-ink)' : 'var(--d-ink-3)',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontFamily: 'var(--font-sans)',
              }}>
                {signalLabels[signal]}
              </p>
              {isActive && (
                <div style={{
                  fontSize: '16px',
                  marginTop: '8px',
                  color: 'var(--d-accent)',
                }}>
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-md)',
          flexDirection: 'column',
          marginTop: 'var(--space-xl)',
        }}>
          <button
            onClick={() => navigate('/login', { state: { email, constellation } })}
            style={{
              padding: '14px 32px',
              background: 'var(--d-ink)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontFamily: 'var(--font-sans)',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'all 200ms ease',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)'
            }}
          >
            Bewaar je patroon →
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '14px 32px',
              background: 'rgba(199, 154, 110, 0.1)',
              color: 'var(--d-ink)',
              border: '2px solid rgba(199, 154, 110, 0.3)',
              borderRadius: '10px',
              fontSize: '16px',
              fontFamily: 'var(--font-sans)',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(199, 154, 110, 0.2)'
              e.target.style.borderColor = 'rgba(199, 154, 110, 0.5)'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(199, 154, 110, 0.1)'
              e.target.style.borderColor = 'rgba(199, 154, 110, 0.3)'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            Later
          </button>
        </div>

        {/* Nieuwsbrief opt-in: expliciet en los van het account (AVG) */}
        <div style={{
          marginTop: 'var(--space-xl)',
          background: 'rgba(255, 255, 255, 0.92)',
          borderRadius: '12px',
          padding: 'var(--space-lg)',
          textAlign: 'left',
        }}>
          {nieuwsbriefStatus === 'gelukt' ? (
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: 'var(--success)',
              margin: 0,
              fontWeight: '500',
            }}>
              Je staat op de lijst — er ligt een bevestiging in je inbox.
            </p>
          ) : (
            <>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--d-ink)',
                margin: '0 0 4px 0',
              }}>
                Op de hoogte blijven?
              </p>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--d-ink-2)',
                margin: '0 0 12px 0',
                lineHeight: 1.5,
              }}>
                Maximaal één mail per week over perimenopauze en Ovari.
                Uitschrijven kan altijd met één klik.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  placeholder="Je e-mailadres"
                  value={nieuwsbriefEmail}
                  onChange={e => setNieuwsbriefEmail(e.target.value)}
                  style={{
                    flex: '1 1 180px',
                    padding: '10px 12px',
                    border: '1px solid var(--d-border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
                <button
                  onClick={handleNieuwsbrief}
                  disabled={nieuwsbriefStatus === 'bezig' || !nieuwsbriefEmail.includes('@')}
                  style={{
                    padding: '10px 16px',
                    background: 'var(--d-ink)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: '600',
                    cursor: nieuwsbriefEmail.includes('@') ? 'pointer' : 'not-allowed',
                    opacity: nieuwsbriefStatus === 'bezig' ? 0.7 : 1,
                  }}
                >
                  {nieuwsbriefStatus === 'bezig' ? 'Even...' : 'Houd me op de hoogte'}
                </button>
              </div>
              {nieuwsbriefStatus === 'fout' && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--error)', margin: '8px 0 0 0' }}>
                  Aanmelden lukte niet — probeer het later opnieuw.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Legal footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(180deg, transparent 0%, var(--d-bg) 60%)',
        padding: '40px 16px 16px',
        textAlign: 'center',
        fontSize: '11px',
        fontFamily: 'var(--font-sans)',
        color: 'var(--d-ink-3)',
      }}>
        <p style={{ margin: 0, marginBottom: '8px' }}>
          Door in te loggen ga je akkoord met onze{' '}
          <a href="https://ovari.youcaps.app/terms" onClick={(e) => { e.preventDefault(); openExternal('https://ovari.youcaps.app/terms') }} rel="noopener noreferrer" style={{ color: 'var(--d-accent)', textDecoration: 'none', textDecorationLine: 'underline', textUnderlineOffset: 2 }}>
            voorwaarden
          </a>
          {' '}en{' '}
          <a href="https://ovari.youcaps.app/privacy" onClick={(e) => { e.preventDefault(); openExternal('https://ovari.youcaps.app/privacy') }} rel="noopener noreferrer" style={{ color: 'var(--d-accent)', textDecoration: 'none', textDecorationLine: 'underline', textUnderlineOffset: 2 }}>
            privacybeleid
          </a>
        </p>
      </div>

    </div>
  )
}
