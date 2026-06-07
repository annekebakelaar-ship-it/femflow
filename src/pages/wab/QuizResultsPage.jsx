import { useNavigate, useLocation } from 'react-router-dom'
import { Activity, AlertCircle, Book, Heart, Zap } from 'react-feather'
import QuizChatBot from '../../components/QuizChatBot'
import logo from '../../assets/YouCapsLogo.png.png'

export default function QuizResultsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { result } = location.state || {}

  // Fallback to localStorage if no state provided
  const quizResult = result || (() => {
    try {
      const stored = localStorage.getItem('wab_last_result')
      return stored ? JSON.parse(stored) : null
    } catch (e) {
      return null
    }
  })()

  // Default constellation if no data
  const defaultConstellation = {
    sleep: true,
    mood: true,
    stress: true,
    energy: false,
    cycle: true,
  }

  const { constellation = defaultConstellation } = quizResult || {}

  const signalInfo = {
    sleep: {
      label: 'Slaap',
      emoji: '😴',
      color: 'var(--info)',
      icon: Activity,
      description: 'Jouw slaapkwaliteit en -duur hebben invloed op je welzijn',
      benefits: [
        '7-9 uur slaap per nacht',
        'Consistent slaapschema',
        'Slaapomgeving optimaliseren',
        'Minder schermen voor bed',
      ],
      cta: 'Volg je slaap →',
      action: () => navigate('/dashboard/wearable'),
    },
    mood: {
      label: 'Stemming',
      emoji: '🎭',
      color: 'var(--accent)',
      icon: Heart,
      description: 'Je emotioneel welzijn verandert door verschillende factoren',
      benefits: [
        'Stress management technieken',
        'Regelmatige beweging',
        'Sociale connectie',
        'Mindfulness praktijken',
      ],
      cta: 'Gezondheidstools →',
      action: () => navigate('/dashboard'),
    },
    stress: {
      label: 'Stress',
      emoji: '😰',
      color: 'var(--error)',
      icon: AlertCircle,
      description: 'Stressrecuperatie is essentieel voor je gezondheid',
      benefits: [
        'Rust en herstel prioriteren',
        'Stressreductie activiteiten',
        'Fysieke ontlading',
        'Adequate slaap en voeding',
      ],
      cta: 'Monitor triggers →',
      action: () => navigate('/health/lifestyle-check'),
    },
    energy: {
      label: 'Energie',
      emoji: '⚡',
      color: 'var(--accent)',
      icon: Zap,
      description: 'Je energieniveaus fluctueren door voeding en activiteit',
      benefits: [
        'Regelmatige beweging',
        'Gezonde voeding',
        'Voldoende hydratatie',
        'Goede slaap routine',
      ],
      cta: 'Trainingsaanbevelingen →',
      action: () => navigate('/dashboard'),
    },
    cycle: {
      label: 'Cyclus',
      emoji: '🩸',
      color: 'var(--error)',
      icon: Zap,
      description: 'Je menstruatiecyclus beïnvloedt veel aspecten van je gezondheid',
      benefits: [
        'Cyclus fase tracking',
        'Hormoonbewustzijn',
        'Gefaseerde trainingsplannen',
        'Voedings aanpassingen',
      ],
      cta: 'Track je cyclus →',
      action: () => navigate('/health/menstruation'),
    },
  }

  const activeSignals = Object.entries(constellation || {})
    .filter(([_, v]) => v)
    .map(([key]) => key)

  const displayDay = selectedDay || currentDayInCycle

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--space-lg) 140px var(--space-lg)',
      background: 'var(--bg)',
      animation: 'fade-slide-up 240ms ease both',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-lg)',
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: '20px',
          }}
        >
          ←
        </button>
        <img src={logo} alt="YouCaps" style={{ height: '32px', width: 'auto' }} />
        <div style={{ width: '20px' }} />
      </div>

      {/* Page Title */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '26px',
        fontWeight: 500,
        lineHeight: 1.25,
        color: 'var(--ink)',
        margin: '0 0 var(--space-sm) 0',
      }}>
        Je Quiz Resultaten
      </h1>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '15px',
        fontWeight: 400,
        color: 'var(--ink-2)',
        margin: '0 0 var(--space-xl) 0',
      }}>
        Dit zijn de gebieden waar je aandacht op richt
      </p>

      {/* Active Signals Overview */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        marginBottom: 'var(--space-xl)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--ink-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 var(--space-md) 0',
        }}>
          Jouw Focus
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-sm)',
        }}>
          {activeSignals.length > 0 ? (
            activeSignals.map((signal) => {
              const info = signalInfo[signal]
              return (
                <div
                  key={signal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: 'var(--space-sm) var(--space-md)',
                    background: `rgba(199, 154, 110, 0.08)`,
                    border: `1px solid var(--border)`,
                    borderRadius: 'var(--radius-pill)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--ink)',
                  }}
                >
                  <span>{info.emoji}</span>
                  {info.label}
                </div>
              )
            })
          ) : (
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 400,
              color: 'var(--ink-3)',
            }}>Geen gegevens</p>
          )}
        </div>
      </div>

      {/* Detailed Cards */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-xl)',
      }}>
        {activeSignals.map((signal) => {
          const info = signalInfo[signal]
          const Icon = info.icon

          return (
            <div
              key={signal}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: 'var(--accent)',
                  padding: 'var(--space-lg)',
                  color: 'var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                }}
              >
                <span style={{ fontSize: '28px' }}>{info.emoji}</span>
                <div>
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 500,
                    margin: 0,
                    color: 'var(--ink)',
                  }}>
                    {info.label}
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: 'var(--space-lg)' }}>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  fontWeight: 400,
                  color: 'var(--ink)',
                  lineHeight: '1.6',
                  margin: '0 0 var(--space-md) 0',
                }}>
                  {info.description}
                </p>

                <div style={{
                  background: 'var(--surface-warm)',
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-md)',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--ink-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    margin: '0 0 var(--space-sm) 0',
                  }}>
                    Aanbevelingen
                  </p>
                  <ul style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 400,
                    margin: 0,
                    paddingLeft: 'var(--space-md)',
                  }}>
                    {info.benefits.map((benefit, idx) => (
                      <li
                        key={idx}
                        style={{
                          color: 'var(--ink)',
                          margin: '4px 0',
                        }}
                      >
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={info.action}
                  style={{
                    width: '100%',
                    padding: 'var(--space-md)',
                    background: 'var(--ink)',
                    color: 'var(--surface)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1'
                  }}
                >
                  {info.cta}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chat Bot */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--ink-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 var(--space-md) 0',
        }}>
          Meer Vragen?
        </h3>
        <QuizChatBot activeSignals={activeSignals} />
      </div>

      {/* CTA */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        textAlign: 'center',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--ink)',
          margin: '0 0 var(--space-sm) 0',
        }}>
          Klaar om je patroon te volgen?
        </h3>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 400,
          color: 'var(--ink-2)',
          margin: '0 0 var(--space-md) 0',
        }}>
          Alle tools zijn gratis beschikbaar op je dashboard
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--ink)',
            color: 'var(--surface)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Ga naar Dashboard →
        </button>
      </div>

      <style>{`
        @keyframes fade-slide-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
