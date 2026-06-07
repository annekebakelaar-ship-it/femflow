import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHormoneLevel } from '../utils/hormoneCalculator'
import { getPhaseByDay, PHASE_GRADIENTS, PHASE_EMOJI, getPhaseName } from '../utils/cycleUtils'
import hormonalBg from '../assets/hormonaloverview.png'

function getHormoneStatus(day) {
  if (day < 5) return 'Laag'
  if (day < 11) return 'Oestrogeen stijgt ↗'
  if (day < 16) return 'LH piekt 🔝'
  return 'Progesteron dalend ↘'
}

export default function HormoneOverview() {
  const navigate = useNavigate()
  const [menstrualData, setMenstrualData] = useState(null)
  const [currentDay, setCurrentDay] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('menstruation_data')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setMenstrualData(data)

        const today = new Date()
        const start = new Date(data.startDate)
        const daysFromStart = Math.floor((today - start) / (1000 * 60 * 60 * 24))
        const dayInCycle = (daysFromStart % data.cycleLength) + 1
        setCurrentDay(dayInCycle)
      } catch (e) {
        console.error('Failed to load menstruation data:', e)
      }
    }
  }, [])

  // If no data, show default view
  if (!menstrualData || !currentDay) {
    return (
      <div style={{
        width: '100%',
        padding: '0 var(--space-lg) var(--space-lg) var(--space-lg)',
        marginTop: 'var(--space-xl)',
        opacity: 0.4,
      }}>
        <div
          onClick={() => navigate('/health/menstruation')}
          style={{
            position: 'relative',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-lg)',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-md)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            textAlign: 'center',
          }}
        >

          <p style={{
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            color: 'var(--ink-2)',
            margin: '0',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Volg je cyclus
          </p>
        </div>
      </div>
    )
  }

  const phase = getPhaseByDay(currentDay, menstrualData.cycleLength)
  const phaseEmoji = PHASE_EMOJI[phase]
  const gradient = PHASE_GRADIENTS[phase]
  const hormoneStatus = getHormoneStatus(currentDay)

  return (
    <div style={{
      width: '100%',
      padding: '0 var(--space-lg) var(--space-lg) var(--space-lg)',
      marginTop: 'var(--space-xl)',
    }}>
      <div
        onClick={() => navigate('/health/menstruation')}
        style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-lg)',
          minHeight: '140px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-md)',
          boxShadow: 'var(--shadow-sm)',
          cursor: 'pointer',
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
            color: 'var(--ink-3)',
            letterSpacing: '0.08em',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
          </p>
          <p style={{
            fontSize: '18px',
            fontFamily: 'var(--font-sans)',
            fontWeight: '600',
            margin: '0 0 4px 0',
            color: 'var(--ink)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Dag {currentDay}/{menstrualData.cycleLength}
          </p>
          <p style={{
            fontSize: '15px',
            fontFamily: 'var(--font-sans)',
            margin: 0,
            color: 'var(--ink-2)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            {hormoneStatus}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate('/health/menstruation')
          }}
          style={{
            marginTop: 'var(--space-sm)',
            padding: 'var(--space-sm) var(--space-md)',
            background: 'var(--ink)',
            color: 'var(--surface)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '11px',
            fontFamily: 'var(--font-sans)',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            opacity: 0.8,
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.8'}
        >
          Bekijk →
        </button>
      </div>
    </div>
  )
}
