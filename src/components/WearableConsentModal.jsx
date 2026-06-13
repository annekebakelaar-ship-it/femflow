import { useState } from 'react'

export default function WearableConsentModal({ onConsent }) {
  const [loading, setLoading] = useState(false)

  function handleConsent(choice) {
    setLoading(true)
    localStorage.setItem('wearable_consent', choice) // 'real' or 'test'
    localStorage.setItem('wearable_consent_given_at', new Date().toISOString())

    setTimeout(() => {
      setLoading(false)
      onConsent(choice)
    }, 300)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--space-lg)',
    }}>
      <div style={{
        background: 'rgba(36, 19, 7, 0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: 'none',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
        borderRadius: '22px',
        padding: 'var(--space-xl)',
        maxWidth: '500px',
        width: '100%',
        animation: 'fade-slide-up 240ms ease both',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '24px',
          fontWeight: '500',
          marginBottom: 'var(--space-lg)',
          color: 'var(--d-ink)',
          lineHeight: 1.3,
        }}>
          Wearable Data
        </h2>

        <p style={{
          fontSize: '15px',
          color: 'var(--d-ink-2)',
          lineHeight: 1.6,
          marginBottom: 'var(--space-md)',
          fontFamily: 'var(--font-sans)',
        }}>
          FemFlow kan je slaap-, hartslag- en hersteldata analyseren voor beter perimenopause inzicht.
        </p>

        <div style={{
          background: 'rgba(199, 154, 110, 0.08)',
          padding: 'var(--space-md)',
          borderRadius: '12px',
          marginBottom: 'var(--space-xl)',
          fontSize: '13px',
          color: 'var(--d-ink-2)',
          lineHeight: 1.6,
        }}>
          <strong>Je data:</strong>
          <ul style={{ margin: 'var(--space-sm) 0 0 20px', paddingLeft: 0 }}>
            <li>Slaappatronen (duur, diepte, REM)</li>
            <li>Hartslagvariabiliteit (HRV)</li>
            <li>Rusthartsslag (RHR)</li>
            <li>Herstelscore</li>
          </ul>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
        }}>
          <button
            onClick={() => handleConsent('real')}
            disabled={loading}
            style={{
              padding: '14px 24px',
              background: 'var(--d-accent)',
              color: '#1B0F07',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 200ms ease',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => !loading && (e.target.style.opacity = '1')}
          >
            Verbind mijn Oura Ring
          </button>

          <button
            onClick={() => handleConsent('test')}
            disabled={loading}
            style={{
              padding: '14px 24px',
              background: 'rgba(199, 154, 110, 0.1)',
              color: 'var(--d-ink)',
              border: '2px solid rgba(199, 154, 110, 0.3)',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 200ms ease',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => !loading && (e.target.style.borderColor = 'rgba(199, 154, 110, 0.5)')}
            onMouseLeave={(e) => !loading && (e.target.style.borderColor = 'rgba(199, 154, 110, 0.3)')}
          >
            Testdata gebruiken (demo)
          </button>
        </div>

        <p style={{
          fontSize: '12px',
          color: 'var(--d-ink-3)',
          marginTop: 'var(--space-lg)',
          textAlign: 'center',
          fontFamily: 'var(--font-sans)',
          lineHeight: 1.5,
        }}>
          Je kunt dit later aanpassen in <strong>Account</strong> → <strong>Privacy</strong>
        </p>
      </div>
    </div>
  )
}
