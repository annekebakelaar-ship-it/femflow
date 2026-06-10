import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function QuizResultsOverview() {
  const navigate = useNavigate()
  const [quizResult, setQuizResult] = useState(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('femflow_last_result')
      if (stored) {
        setQuizResult(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to load quiz result:', e)
    }
  }, [])

  if (!quizResult) {
    return null
  }

  const { constellation } = quizResult

  const signalLabels = {
    sleep: { label: 'Slaap', emoji: '😴', color: '#4F46E5' },
    mood: { label: 'Stemming', emoji: '🎭', color: '#EC4899' },
    stress: { label: 'Stress', emoji: '😰', color: '#F97316' },
    energy: { label: 'Energie', emoji: '⚡', color: '#FBBF24' },
    cycle: { label: 'Cyclus', emoji: '🩸', color: '#EF4444' },
  }

  const activeSignals = Object.entries(constellation || {})
    .filter(([_, v]) => v)
    .map(([key]) => key)

  return (
    <div style={{
      width: '100%',
      padding: '0 var(--space-lg) var(--space-lg) var(--space-lg)',
      marginTop: 'var(--space-xl)',
      opacity: 0.4,
    }}>
      <div
        onClick={() => navigate('/quiz-results', { state: { result: quizResult } })}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-lg)',
          boxShadow: 'var(--shadow-sm)',
          cursor: 'pointer',
          transition: 'all 200ms ease',
        }}
      >
        <p style={{
          fontSize: 'var(--font-size-body)',
          color: 'var(--color-text)',
          fontWeight: 'var(--font-weight-semibold)',
          margin: '0 0 var(--space-md) 0',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        }}>
          Je hebt aangegeven dat je aandacht hebt voor:
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-md)',
        }}>
          {activeSignals.length > 0 ? (
            activeSignals.map((signal) => {
              const info = signalLabels[signal]
              return (
                <div
                  key={signal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: 'var(--space-sm) var(--space-md)',
                    background: `${info.color}15`,
                    border: `1px solid ${info.color}30`,
                    borderRadius: '20px',
                    fontSize: 'var(--font-size-small)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: info.color,
                  }}
                >
                  <span>{info.emoji}</span>
                  {info.label}
                </div>
              )
            })
          ) : (
            <p style={{ color: 'var(--color-label)', fontSize: 'var(--font-size-small)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>
              Geen gegevens beschikbaar
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate('/quiz-results', { state: { result: quizResult } })
          }}
          style={{
            padding: '8px 16px',
            background: '#F5F5F5',
            color: 'var(--color-text)',
            border: 'none',
            borderRadius: '6px',
            fontSize: 'var(--font-size-small)',
            fontWeight: 'var(--font-weight-semibold)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
        >
          Bekijk Details →
        </button>
      </div>
    </div>
  )
}
