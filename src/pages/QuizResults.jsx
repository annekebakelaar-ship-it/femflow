import { useNavigate, useLocation } from 'react-router-dom'
import hero from '../assets/hero1.png'

export default function QuizResults() {
  const navigate = useNavigate()
  const location = useLocation()
  const { constellation, email } = location.state || {}

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

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'var(--space-lg) var(--space-sm) var(--space-xxl)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fade-slide-up 240ms ease both',
      backgroundImage: `url(${hero})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>

      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          fontWeight: '500',
          color: 'var(--ink)',
          marginBottom: 'var(--space-lg)',
          lineHeight: 1.25,
        }}>
          Dit is wat je deelt:
        </h1>

        {/* Pattern visualization */}
        <div style={{
          background: 'var(--surface)',
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-xl)',
          border: '1px solid var(--border)',
        }}>
          <p style={{
            fontSize: '15px',
            color: 'var(--ink)',
            lineHeight: 1.6,
            marginBottom: 'var(--space-md)',
            fontFamily: 'var(--font-sans)',
          }}>
            Je {signalText} {activeSignals.length > 1 ? 'verschuiven samen' : 'verschuift'}.
          </p>
          <p style={{
            fontSize: '15px',
            color: 'var(--ink-2)',
            lineHeight: 1.6,
            fontFamily: 'var(--font-sans)',
          }}>
            Dit patroon zien veel vrouwen in deze fase.
            <br />
            Je bent niet de enige.
          </p>
        </div>

        {/* Pattern constellation (visual) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
        }}>
          {['sleep', 'mood', 'energy'].map(signal => (
            <div key={signal} style={{
              padding: 'var(--space-md)',
              border: constellation[signal] ? '2px solid var(--success)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: constellation[signal] ? 'var(--accent-soft)' : 'var(--surface)',
              fontFamily: 'var(--font-sans)',
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: '500',
                color: constellation[signal] ? 'var(--success)' : 'var(--ink-3)',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                {signalLabels[signal]}
              </p>
              <p style={{
                fontSize: '20px',
                marginTop: '8px',
                color: constellation[signal] ? 'var(--success)' : 'var(--border)',
                margin: 0,
              }}>
                {constellation[signal] ? '✓' : '○'}
              </p>
            </div>
          ))}
        </div>

        {/* Signup CTA */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-md)',
          flexDirection: 'column',
          marginTop: 'var(--space-xl)',
        }}>
          <button
            onClick={() => navigate('/signup', { state: { email, constellation } })}
            style={{
              padding: 'var(--space-sm) var(--space-lg)',
              background: 'var(--ink)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontFamily: 'var(--font-sans)',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Bewaar je patroon →
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: 'var(--space-sm) var(--space-lg)',
              background: 'transparent',
              color: 'var(--ink)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontFamily: 'var(--font-sans)',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--surface-warm)'
              e.target.style.borderColor = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.borderColor = 'var(--border)'
            }}
          >
            Later
          </button>
        </div>

      </div>

    </div>
  )
}
