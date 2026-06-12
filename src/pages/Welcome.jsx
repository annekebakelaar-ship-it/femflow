import { useNavigate } from 'react-router-dom'
import hero from '../assets/hero4.png'

// Landing: waarde eerst, drempels weg. Geen e-mailveld meer — het adres
// komt vanzelf bij accountaanmaak, ná de quiz-uitslag. Elke privacyclaim
// hieronder is herleidbaar naar de code (dagboek/symptomen: secureStorage,
// nooit naar de server; wearable: consent-modal; verwijderen: GDPR-delete).
export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--container-padding) var(--space-xxl)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fade-slide-up 240ms ease both',
      backgroundImage: `url(${hero})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>

      <div style={{ maxWidth: '600px', textAlign: 'center' }}>

        <h1 style={{
          fontSize: 'clamp(2rem, 8vw, 3rem)',
          fontFamily: 'var(--font-display)',
          fontWeight: '500',
          letterSpacing: '-0.5px',
          lineHeight: 1.2,
          marginBottom: 'var(--space-md)',
          color: 'white',
          textShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}>
          Is het de perimenopauze? Breng het in kaart.
        </h1>

        <p style={{
          fontSize: 'var(--font-size-body)',
          color: 'white',
          textShadow: '0 1px 4px rgba(0,0,0,0.3)',
          lineHeight: 1.6,
          marginBottom: 'var(--space-xl)',
        }}>
          Volg je cyclus en symptomen, zie je patroon, en neem een objectief
          rapport mee naar je huisarts. Gratis.
        </p>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <button
            onClick={() => navigate('/quiz', { state: { email: null } })}
            style={{
              width: '100%',
              padding: 'var(--space-sm) var(--space-lg)',
              background: 'var(--ink)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-body)',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '.04em',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Doe de check (2 minuten)
          </button>

          <button
            onClick={() => navigate('/dashboard/learning')}
            style={{
              width: '100%',
              marginTop: 'var(--space-sm)',
              padding: 'var(--space-sm) var(--space-lg)',
              background: 'rgba(255, 255, 255, 0.92)',
              color: 'var(--ink)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-body)',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.background = 'white'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.92)'}
          >
            Of lees eerst de kennisbank
          </button>
        </div>

        <p style={{
          fontSize: 'var(--font-size-small)',
          color: 'rgba(255, 255, 255, 0.85)',
          textShadow: '0 1px 4px rgba(0,0,0,0.3)',
          lineHeight: 1.6,
          marginBottom: 'var(--space-lg)',
        }}>
          Je dagboek en symptomen verlaten je telefoon niet · wearable-data
          alleen met jouw toestemming · alles in één klik te verwijderen
        </p>

        <p style={{
          fontSize: 'var(--font-size-small)',
          color: 'rgba(255, 255, 255, 0.85)',
          textShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}>
          Al een account?{' '}
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              fontSize: 'inherit',
              fontWeight: '600',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            Log in
          </button>
        </p>

      </div>

    </div>
  )
}
