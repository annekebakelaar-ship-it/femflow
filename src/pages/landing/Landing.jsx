import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--container-padding)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'fade-slide-up 240ms ease both',
    }}>

      {/* Logo */}
      <div style={{ marginBottom: 'auto' }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: '600',
          fontSize: '15px',
          letterSpacing: '.04em',
        }}>
          YOUCAPS
        </span>
      </div>

      {/* Scarcity banner */}
      <div style={{
        marginBottom: 'var(--space-lg)',
        padding: 'var(--space-sm) var(--space-md)',
        border: `1px solid var(--border)`,
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--surface-warm)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
          fontWeight: '600',
          color: 'var(--ink)',
          margin: 0,
          marginBottom: '4px',
        }}>
          🔴 FOUNDING 100: 47 PLEKKEN OVER
        </p>
        <p style={{
          fontSize: '11px',
          fontFamily: 'var(--font-sans)',
          fontWeight: '400',
          color: 'var(--ink-2)',
          margin: 0,
        }}>
          €19/maand — van nu af aan vast (post-launch: €29)
        </p>
      </div>

      {/* Midden */}
      <div style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-xxl)' }}>
        <p style={{
          fontSize: '11px',
          color: 'var(--ink-3)',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-sm)',
          fontFamily: 'var(--font-sans)',
          fontWeight: '500',
        }}>
          Persoonlijke supplementen
        </p>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 8vw, 3.2rem)',
          fontFamily: 'var(--font-display)',
          fontWeight: '500',
          letterSpacing: '-2px',
          lineHeight: 1.25,
          marginBottom: 'var(--space-lg)',
        }}>
          Supplementen die echt iets veranderen.
        </h1>

        <p style={{
          fontSize: '15px',
          fontFamily: 'var(--font-sans)',
          fontWeight: '400',
          color: 'var(--ink-2)',
          lineHeight: 1.5,
          maxWidth: 320,
          marginBottom: 'var(--space-lg)',
        }}>
          Je wearable meet 3 signalen: slaap, herstel en activiteit. Wij stellen daar elke maand een formule bij samen.
        </p>

        <p style={{
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
          fontWeight: '400',
          color: 'var(--ink-3)',
          marginBottom: 'var(--space-xxl)',
        }}>
          ✓ 53 leden • 6 wearables ondersteund • 60-dag terugbetaald garantie
        </p>

        <button
          onClick={() => navigate('/welkom/start')}
          style={{
            width: '100%',
            padding: '18px 24px',
            background: 'var(--ink)',
            color: 'var(--surface)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            marginBottom: 'var(--space-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Aan de slag <span style={{ fontSize: '14px' }}>→</span>
        </button>

        <button
          onClick={() => navigate('/signin')}
          style={{
            width: '100%',
            padding: '18px 24px',
            background: 'var(--surface)',
            color: 'var(--ink)',
            border: `1px solid var(--border)`,
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Inloggen <span style={{ fontSize: '14px' }}>→</span>
        </button>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--space-lg)',
      }}>
        <button
          onClick={() => navigate('/waarom')}
          style={{
            background: 'none', border: 'none', padding: 0,
            fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
            color: 'var(--ink-3)',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Waarom YOUCAPS →
        </button>
        <a
          href="/privacy"
          style={{
            fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
            color: 'var(--ink-3)',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Privacy
        </a>
      </div>
    </div>
  )
}
