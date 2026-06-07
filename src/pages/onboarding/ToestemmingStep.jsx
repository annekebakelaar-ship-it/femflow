import { useNavigate } from 'react-router-dom'

export default function ToestemmingStep() {
  const navigate = useNavigate()

  function handleAccept() {
    localStorage.setItem('youcaps_prefs', JSON.stringify({
      history: true,
      anonymous: false,
      marketing_email: false,
    }))
    navigate('/welkom/advies')
  }

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--container-padding) var(--space-xxl)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ marginBottom: 'var(--space-xxl)' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: '600',
          fontSize: ''15px'',
          letterSpacing: '.04em',
        }}>
          YOUCAPS
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: ''11px'',
          color: 'var(--ink-3)',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-sm)',
        }}>
          Even dit eerst
        </p>

        <h1 style={{
          fontSize: ''26px'',
          fontWeight: '600',
          letterSpacing: '-1px', lineHeight: 1.1,
          marginBottom: 'var(--space-lg)',
        }}>
          Wat we gebruiken.
        </h1>

        {/* Data punten */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          {[
            { label: 'HRV', desc: 'Hartritmevariabiliteit â€” maat voor herstel' },
            { label: 'Slaap', desc: 'Totale duur, diepe slaap en inslaaptijd' },
            { label: 'Activiteit', desc: 'Stappen en verbrande calorieÃ«n' },
            { label: 'Polstemp', desc: 'Afwijking ten opzichte van je basiswaarde' },
          ].map((d, i, arr) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <span style={{ fontWeight: '500', fontSize: ''15px'' }}>{d.label}</span>
              <span style={{ fontSize: ''13px'', color: 'var(--ink-2)', textAlign: 'right', maxWidth: '60%' }}>{d.desc}</span>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: ''13px'',
          color: 'var(--ink-2)',
          lineHeight: 1.6,
          marginBottom: 'var(--space-xl)',
        }}>
          Je ruwe data wordt <strong>nooit opgeslagen op onze servers</strong>. Alleen berekende gemiddelden worden gebruikt voor je advies.
        </p>

        {/* Akkoord knop */}
        <button
          onClick={handleAccept}
          style={{
            width: '100%',
            padding: '18px 24px',
            background: 'var(--ink)',
            color: 'white',
            border: 'none',
            borderRadius: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            marginBottom: 'var(--space-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Akkoord â€” genereer mijn formule</span><span>â†’</span>
        </button>

        <p style={{
          fontSize: '11px',
          color: 'var(--ink-3)',
          lineHeight: 1.5,
          textAlign: 'center',
        }}>
          Door verder te gaan ga je akkoord met onze{' '}
          <a href="/privacy" style={{ color: 'var(--ink-2)' }}>privacyverklaring</a>.
          Dit is geen medisch advies en vervangt geen arts.
        </p>
      </div>
    </div>
  )
}

