import { useState } from 'react'
import ConnectModal from '../../components/wab/ConnectModal'
import QuestionnaireForm from '../../components/wab/QuestionnaireForm'
import LoginModal from '../../components/wab/LoginModal'
import QuickForm from './QuickForm'
import hero from '../../assets/hero1.png'

export default function Landing({ onResult, lastResult, onViewLast, user, onLogin, onShowDashboard, onShowFem }) {
  const [step, setStep]         = useState('landing')
  const [biometrics, setBiometrics] = useState(null)
  const [showLogin, setShowLogin]   = useState(false)

  function handleBiometricData(data) {
    setBiometrics(data)
    setStep('form')
  }

  return (
    <>
      {step === 'connect' && (
        <ConnectModal
          onData={handleBiometricData}
          onManual={() => setStep('manual')}
          onClose={() => setStep('landing')}
        />
      )}
      {step === 'manual' && (
        <QuestionnaireForm
          onData={handleBiometricData}
          onBack={() => setStep('landing')}
        />
      )}
      {step === 'form' && (
        <QuickForm
          biometrics={biometrics}
          onResult={onResult}
          onBack={() => setStep('connect')}
        />
      )}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={async () => {
            const { getMe } = await import('../../api/client')
            const me = await getMe().catch(() => null)
            if (me) { onLogin?.(me); setShowLogin(false) }
          }}
        />
      )}

      <div style={{
        minHeight: '100vh',
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        padding: 'var(--space-lg) var(--container-padding)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fade-slide-up 240ms ease both',
        backgroundImage: `url(${hero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        {/* Nav */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'auto' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: '15px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
          }}>
            YOUCAPS
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--ink-3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Wearable Age
            </span>
            {user ? (
              <button
                onClick={onShowDashboard}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--ink)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                My history
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--ink-3)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                Sign in
              </button>
            )}
          </div>
        </nav>

        {/* Hero */}
        <div style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xxl)' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--ink-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-sm)',
          }}>
            Longevity Intelligence
          </p>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.2rem, 8vw, 3rem)',
            fontWeight: 500,
            letterSpacing: '-1.5px',
            lineHeight: 1.05,
            marginBottom: 'var(--space-lg)',
            color: 'var(--ink)',
          }}>
            What is your biological age?
          </h1>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 400,
            color: 'var(--ink-2)',
            lineHeight: 1.6,
            maxWidth: 320,
            marginBottom: 'var(--space-sm)',
          }}>
            Connect your wearable. We calculate your biological age from 14 days of HRV, resting heart rate, and deep sleep data.
          </p>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 400,
            color: 'var(--ink-3)',
            marginBottom: 'var(--space-xxl)',
          }}>
            ✓ Oura · Garmin · Fitbit supported
          </p>

          {lastResult && (
            <button
              onClick={onViewLast}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: 'transparent',
                color: 'var(--ink-2)',
                border: `1px solid var(--border-subtle)`,
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                marginBottom: 'var(--space-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Last result — Wearable Age <strong style={{ color: 'var(--ink)', fontWeight: 600, fontFeatureSettings: "'tnum'" }}>{lastResult.wearable_age}</strong></span>
              <span>→</span>
            </button>
          )}

          <button
            onClick={() => setStep('connect')}
            style={{
              width: '100%',
              padding: '18px 24px',
              background: 'var(--ink)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginBottom: 'var(--space-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            Connect wearable <span style={{ fontSize: '14px' }}>→</span>
          </button>

          <button
            onClick={() => setStep('manual')}
            style={{
              width: '100%',
              padding: '18px 24px',
              background: 'transparent',
              color: 'var(--ink)',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            Enter manually <span style={{ fontSize: '14px' }}>→</span>
          </button>

          <div style={{
            marginTop: 'var(--space-xl)',
            paddingTop: 'var(--space-xl)',
            borderTop: `1px solid var(--border)`,
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 400,
              color: 'var(--ink-3)',
              marginBottom: 'var(--space-md)',
            }}>
              Perimenopauze herkenning
            </p>
            <button
              onClick={onShowFem}
              style={{
                width: '100%',
                padding: '18px 24px',
                background: 'transparent',
                color: 'var(--ink)',
                border: `1px solid var(--border)`,
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              YouCaps FEM <span style={{ fontSize: '14px' }}>→</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
