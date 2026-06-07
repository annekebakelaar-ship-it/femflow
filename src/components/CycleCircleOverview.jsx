import { useState, useEffect } from 'react'

export default function CycleCircleOverview() {
  const [currentDay, setCurrentDay] = useState(1)
  const [cycleLength, setCycleLength] = useState(28)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('menstruation_data')
      if (stored) {
        const data = JSON.parse(stored)
        const today = new Date()
        const start = new Date(data.startDate)
        const daysFromStart = Math.floor((today - start) / (1000 * 60 * 60 * 24))
        const dayInCycle = (daysFromStart % data.cycleLength) + 1
        setCurrentDay(dayInCycle)
        setCycleLength(data.cycleLength)
      }
    } catch (e) {
      console.error('Failed to load cycle data:', e)
    }
  }, [])

  // Determine phase
  const getPhase = (day, length) => {
    const menstruationDays = Math.ceil(length * 0.286) // ~8 days for 28-cycle
    const follicularEnd = Math.ceil(length * 0.464) // ~13 days
    const ovulatoryEnd = Math.ceil(length * 0.607) // ~17 days

    if (day <= menstruationDays) return { name: 'Menstruatie', color: '#E85D75' }
    if (day <= follicularEnd) return { name: 'Folliculair', color: '#7ECF51' }
    if (day <= ovulatoryEnd) return { name: 'Ovulatie', color: '#FFD93D' }
    return { name: 'Luteaal', color: '#A78BFA' }
  }

  const phase = getPhase(currentDay, cycleLength)
  const progress = (currentDay / cycleLength) * 100

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-md)',
    }}>
      {/* Circle */}
      <div style={{
        position: 'relative',
        width: '140px',
        height: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Background Circle */}
        <svg
          width="140"
          height="140"
          style={{
            position: 'absolute',
            transform: 'rotate(-90deg)',
          }}
        >
          <circle
            cx="70"
            cy="70"
            r="65"
            fill="none"
            stroke="#E0E0E0"
            strokeWidth="8"
          />
          <circle
            cx="70"
            cy="70"
            r="65"
            fill="none"
            stroke={phase.color}
            strokeWidth="8"
            strokeDasharray={`${(progress / 100) * 408.4} 408.4`}
            style={{
              transition: 'stroke-dasharray 500ms ease',
            }}
          />
        </svg>

        {/* Center Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}>
          <p style={{
            fontSize: '32px',
            fontWeight: 'var(--font-weight-semibold)',
            margin: 0,
            color: phase.color,
          }}>
            {currentDay}
          </p>
          <p style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-label)',
            margin: '4px 0 0 0',
          }}>
            van {cycleLength}
          </p>
        </div>
      </div>

      {/* Phase Info */}
      <div style={{
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 'var(--font-size-body)',
          fontWeight: 'var(--font-weight-semibold)',
          color: phase.color,
          margin: '0 0 4px 0',
        }}>
          {phase.name}
        </p>
      </div>
    </div>
  )
}
