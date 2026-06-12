import { useNavigate } from 'react-router-dom'

export default function QuizOverviewCard() {
  const navigate = useNavigate()

  const handleClick = () => {
    console.log('Quiz button clicked')
    console.log('Navigating to /quiz-results')
    console.log('navigate function:', typeof navigate)
    navigate('/quiz-results')
  }

  return (
    <div style={{
      width: '100%',
      padding: '0 0 var(--space-lg) 0',
      marginTop: 'var(--space-xl)',
      opacity: 0.4,
    }}>
      <div
        style={{
          position: 'relative',
          background: 'var(--d-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: 'none',
          borderRadius: '22px',
          padding: 'var(--space-lg)',
          minHeight: '140px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-md)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09), inset 0 0 30px rgba(199, 154, 110, 0.08)',
          transition: 'all 200ms ease',
          textAlign: 'center',
        }}
      >
        <div>
          <p style={{
            fontSize: '11px',
            fontFamily: 'var(--font-sans)',
            fontWeight: '500',
            textTransform: 'uppercase',
            margin: '0 0 8px 0',
            color: 'var(--d-ink-3)',
            letterSpacing: '0.08em',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Je Quiz Resultaten
          </p>
          <p style={{
            fontSize: '18px',
            fontFamily: 'var(--font-sans)',
            fontWeight: '600',
            margin: '0 0 4px 0',
            color: 'var(--d-ink)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Personaliseerde Insights
          </p>
          <p style={{
            fontSize: '15px',
            fontFamily: 'var(--font-sans)',
            margin: 0,
            color: 'var(--d-ink-2)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Zie je voortgang en aanbevelingen
          </p>
        </div>

        <button
          onClick={handleClick}
          style={{
            marginTop: 'var(--space-sm)',
            padding: 'var(--space-sm) var(--space-md)',
            background: 'var(--d-accent)',
            color: '#1B0F07',
            border: 'none',
            borderRadius: '999px',
            fontSize: '11px',
            fontFamily: 'var(--font-sans)',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            opacity: 0.4,
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.4'}
        >
          Bekijk →
        </button>
      </div>
    </div>
  )
}
