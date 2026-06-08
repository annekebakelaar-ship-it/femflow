import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import WearableConsentModal from '../../components/WearableConsentModal'
import hero from '../../assets/hero1.png'

export default function WearablePage() {
  const navigate = useNavigate()
  const [consentGiven, setConsentGiven] = useState(false)
  const [consentType, setConsentType] = useState(null)

  useEffect(() => {
    const consent = localStorage.getItem('wearable_consent')
    if (consent) {
      setConsentGiven(true)
      setConsentType(consent)
    }
  }, [])

  function handleConsentGiven(choice) {
    setConsentType(choice)
    setConsentGiven(true)
  }

  if (!consentGiven) {
    return <WearableConsentModal onConsent={handleConsentGiven} />
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'var(--space-lg)',
      background: '#F5EFEB',
      backgroundImage: `url(${hero})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            marginBottom: 'var(--space-lg)',
            color: 'var(--ink)',
          }}
        >
          ←
        </button>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: '500',
          marginBottom: 'var(--space-lg)',
          color: 'var(--ink)',
        }}>
          Wearable
        </h1>

        {consentType === 'real' && (
          <div style={{
            background: 'white',
            padding: 'var(--space-lg)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: 'var(--space-md)',
              color: 'var(--ink)',
            }}>
              Oura Ring verbinden
            </h2>
            <p style={{
              fontSize: '15px',
              color: 'var(--ink-2)',
              lineHeight: 1.6,
              marginBottom: 'var(--space-lg)',
            }}>
              Klik om je Oura Ring te verbinden via OAuth.
            </p>
            <button
              style={{
                padding: '12px 24px',
                background: 'var(--ink)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Verbind Oura
            </button>
          </div>
        )}

        {consentType === 'test' && (
          <div style={{
            background: 'rgba(199, 154, 110, 0.1)',
            padding: 'var(--space-lg)',
            borderRadius: '12px',
            border: '2px solid rgba(199, 154, 110, 0.3)',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: 'var(--space-md)',
              color: 'var(--ink)',
            }}>
              🧪 Testdata Mode
            </h2>
            <p style={{
              fontSize: '15px',
              color: 'var(--ink-2)',
              lineHeight: 1.6,
              marginBottom: 'var(--space-lg)',
            }}>
              Je gebruikt gesimuleerde wearable data. Dit helpt je FemFlow uit te testen zonder echte Oura device.
            </p>
            <p style={{
              fontSize: '13px',
              color: 'var(--ink-3)',
              marginBottom: 'var(--space-lg)',
            }}>
              Later kun je naar Oura Ring overschakelen.
            </p>
            <button
              style={{
                padding: '12px 24px',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Genereer Testdata
            </button>
          </div>
        )}

        <button
          onClick={() => {
            localStorage.removeItem('wearable_consent')
            setConsentGiven(false)
          }}
          style={{
            marginTop: 'var(--space-xl)',
            padding: '10px 16px',
            background: 'transparent',
            color: 'var(--ink-3)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            textDecoration: 'underline',
          }}
        >
          Consent intrekken
        </button>
      </div>
    </div>
  )
}
