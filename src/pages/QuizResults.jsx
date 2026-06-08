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

  const signalEmojis = {
    sleep: '😴',
    mood: '🎭',
    stress: '⚡',
    energy: '💪',
    cycle: '🔄',
  }

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

      <div style={{ maxWidth: '650px', width: '100%' }}>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xxl)' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 8vw, 36px)',
            fontWeight: '500',
            color: 'var(--ink)',
            marginBottom: 'var(--space-lg)',
            lineHeight: 1.2,
          }}>
            Dit is jouw patroon
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '16px',
            color: 'var(--ink-2)',
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
                fontSize: '32px',
                marginBottom: '8px',
                opacity: isActive ? 1 : 0.4,
                transition: 'opacity 200ms ease',
              }}>
                {signalEmojis[signal]}
              </div>
              <p style={{
                fontSize: '12px',
                fontWeight: '600',
                color: isActive ? 'var(--ink)' : 'var(--ink-3)',
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
                  color: 'var(--accent)',
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
              background: 'var(--ink)',
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
              color: 'var(--ink)',
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
      </div>

    </div>
  )
}
