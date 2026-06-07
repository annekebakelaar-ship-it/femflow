import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingShell from './OnboardingShell'

const WEARABLES = [
  { name: 'Oura',   icon: '⬡' },
  { name: 'Garmin', icon: '⌚' },
  { name: 'Whoop',  icon: '◉' },
]

function PulseButton({ onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 200,
        height: 200,
        margin: '0 auto',
        cursor: 'pointer',
      }}
    >
      {/* Radiating rings */}
      <div style={{
        position: 'absolute',
        width: '100%', height: '100%',
        borderRadius: '50%',
        border: '1px solid rgba(42, 33, 28, 0.08)',
        animation: 'pulse-ring 2.4s ease-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '75%', height: '75%',
        borderRadius: '50%',
        border: '1px solid rgba(42, 33, 28, 0.12)',
        animation: 'pulse-ring 2.4s ease-out infinite 0.6s',
      }} />
      <div style={{
        position: 'absolute',
        width: '52%', height: '52%',
        borderRadius: '50%',
        border: '1px solid rgba(42, 33, 28, 0.16)',
        animation: 'pulse-ring 2.4s ease-out infinite 1.2s',
      }} />

      {/* Center button */}
      <div style={{
        position: 'relative',
        width: 96, height: 96,
        borderRadius: '50%',
        background: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        boxShadow: 'var(--shadow-md)',
      }}>
        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>⌚</span>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '9px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--surface)',
          lineHeight: 1,
        }}>
          Koppel
        </span>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(0.85); opacity: 0.7; }
          70%  { transform: scale(1);    opacity: 0; }
          100% { transform: scale(1);    opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function WelcomeStep() {
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('youcaps_paid') === 'true') {
      navigate('/dashboard', { replace: true })
    }
  }, [])

  return (
    <OnboardingShell step={1}>
      <div style={{ textAlign: 'center', paddingTop: 'var(--space-md)' }}>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--ink-3)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-sm)',
        }}>
          Welkom
        </p>

        <PulseButton onClick={() => navigate('/welkom/wearable')} />

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          fontWeight: 500,
          lineHeight: 1.25,
          letterSpacing: '-1px',
          marginTop: 'var(--space-lg)',
          marginBottom: 'var(--space-sm)',
          color: 'var(--ink)',
        }}>
          Je formule begint hier.
        </h1>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          fontWeight: 400,
          color: 'var(--ink-2)',
          lineHeight: 1.6,
          marginBottom: 'var(--space-lg)',
        }}>
          3 minuten. Geen creditcard nodig.
        </p>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          fontWeight: 400,
          color: 'var(--ink-2)',
          lineHeight: 1.6,
          maxWidth: 300,
          margin: '0 auto var(--space-xl)',
        }}>
          YOUCAPS leest je biometrische data en stelt elke maand een gepersonaliseerde supplement formule samen.
        </p>

        {/* Wearable icons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: 'var(--space-xxl)',
        }}>
          {WEARABLES.map(w => (
            <div key={w.name} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}>
              <div style={{
                width: 44, height: 44,
                borderRadius: 'var(--radius-sm)',
                border: `1px solid var(--border)`,
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
              }}>
                {w.icon}
              </div>
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                fontWeight: 400,
                color: 'var(--ink-3)',
                letterSpacing: '0.08em',
              }}>
                {w.name}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/welkom/quiz')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 400,
            color: 'var(--ink-3)',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Ik heb nog geen wearable — doorgaan zonder
        </button>

      </div>
    </OnboardingShell>
  )
}
