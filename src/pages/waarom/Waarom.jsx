import { useNavigate } from 'react-router-dom'

const REASONS = [
  {
    title: 'Generieke supplementen werken niet voor iedereen',
    body: 'De meeste mensen nemen supplementen op basis van giswerk. Maar jouw lichaam is anders dan dat van een ander. HRV, slaap en activiteit vertellen precies wat jij tekortkomt.',
  },
  {
    title: 'Jouw data, jouw formule',
    body: 'YOUCAPS leest je wearable-data en berekent welke supplementen op dit moment het meeste effect hebben voor jóu. Geen vaste formule — elke maand opnieuw afgestemd.',
  },
  {
    title: 'Eén pakket, precies op maat',
    body: 'Geen losse potjes, geen kast vol pillen. Jouw maandelijkse formule wordt samengesteld en thuisbezorgd. €29 per maand, inclusief herberekening.',
  },
  {
    title: 'Privacy eerst',
    body: 'Je ruwe biometrische data verlaat nooit je apparaat. Alleen berekende gemiddelden worden gebruikt. Geen profilering, geen doorverkoop.',
  },
]

export default function Waarom() {
  const navigate = useNavigate()

  return (
    <div style={{
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-xxl) var(--container-padding)',
      animation: 'fade-slide-up 240ms ease both',
    }}>
      <div style={{ marginBottom: 'var(--space-xxl)' }}>
        <p style={{
          fontSize: 'var(--font-size-micro)',
          color: 'var(--color-label)',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-sm)',
        }}>
          Waarom YOUCAPS
        </p>
        <h1 style={{
          fontSize: 'var(--font-size-display)',
          fontWeight: 'var(--font-weight-semibold)',
          letterSpacing: '-1px',
          lineHeight: 1.1,
          marginBottom: 'var(--space-md)',
        }}>
          Supplementen die passen bij jouw lichaam.
        </h1>
        <p style={{
          fontSize: 'var(--font-size-body)',
          color: 'var(--color-secondary)',
          lineHeight: 1.6,
          maxWidth: 360,
        }}>
          De meeste supplementen zijn ontworpen voor de gemiddelde persoon. Jij bent niet gemiddeld.
        </p>
      </div>

      <div style={{ marginBottom: 'var(--space-xxl)' }}>
        {REASONS.map((r, i) => (
          <div
            key={i}
            style={{
              padding: 'var(--space-lg) 0',
              borderTop: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{
              display: 'flex',
              gap: 'var(--space-md)',
              alignItems: 'flex-start',
            }}>
              <span style={{
                fontSize: 'var(--font-size-micro)',
                color: 'var(--color-label)',
                letterSpacing: '0.5px',
                minWidth: '20px',
                paddingTop: '3px',
              }}>
                0{i + 1}
              </span>
              <div>
                <h2 style={{
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--space-xs)',
                  lineHeight: 1.3,
                }}>
                  {r.title}
                </h2>
                <p style={{
                  fontSize: 'var(--font-size-body)',
                  color: 'var(--color-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {r.body}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--color-border-subtle)' }} />
      </div>

      <div style={{
        background: 'var(--color-text)',
        color: 'white',
        borderRadius: '20px',
        padding: '28px 24px',
        marginBottom: 'var(--space-xl)',
      }}>
        <p style={{
          fontSize: 'var(--font-size-micro)',
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-sm)',
        }}>
          Hoe het werkt
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            'Koppel je wearable (Oura, Garmin of Whoop)',
            'YOUCAPS analyseert je HRV, slaap en activiteit',
            'Je ontvangt een gepersonaliseerde formule',
            'Elke maand opnieuw berekend — voor €29',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{
                fontSize: 'var(--font-size-micro)',
                color: 'rgba(255,255,255,0.4)',
                minWidth: '18px',
                paddingTop: '2px',
              }}>
                {i + 1}.
              </span>
              <span style={{
                fontSize: 'var(--font-size-body)',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.5,
              }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => navigate('/welkom/start')}
        style={{
          width: '100%',
          padding: '18px 24px',
          background: 'var(--color-text)',
          color: 'white',
          border: 'none',
          borderRadius: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Start met jouw formule</span><span>→</span>
      </button>

      <p style={{
        marginTop: 'var(--space-md)',
        fontSize: 'var(--font-size-small)',
        color: 'var(--color-label)',
        textAlign: 'center',
        lineHeight: 1.5,
      }}>
        Geen verplichtingen. Opzegbaar per maand.
      </p>
    </div>
  )
}
