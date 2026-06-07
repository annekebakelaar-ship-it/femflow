import { getPhaseByDay, getPhaseName } from '../utils/cycleUtils'
import { Cloud, Zap, Moon, Heart } from 'react-feather'

const getSymptomIcon = (symptom) => {
  const icons = {
    brain_fog: <Cloud size={14} strokeWidth={1.5} />,
    hot_flash: <Zap size={14} strokeWidth={1.5} />,
    extreme_fatigue: <Moon size={14} strokeWidth={1.5} />,
    mood_swing: <Heart size={14} strokeWidth={1.5} />,
  }
  return icons[symptom] || null
}

export default function CycleSummary({ menstrualData, currentDay = 1 }) {
  if (!menstrualData) return null

  const cycleLength = menstrualData.cycleLength || 28
  const startDate = new Date(menstrualData.startDate)
  const today = new Date()

  // Calculate next period
  const totalDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))
  const cyclesCompleted = Math.floor(totalDays / cycleLength)
  const nextPeriodDate = new Date(startDate)
  nextPeriodDate.setDate(nextPeriodDate.getDate() + (cyclesCompleted + 1) * cycleLength)

  const daysUntilPeriod = Math.ceil((nextPeriodDate - today) / (1000 * 60 * 60 * 24))

  // Top symptoms
  const topSymptoms = []
  const symptomCounts = {}

  if (menstrualData.entries) {
    menstrualData.entries.forEach((entry) => {
      if (entry.symptoms) {
        Object.entries(entry.symptoms).forEach(([symptom, value]) => {
          if (value > 0) {
            symptomCounts[symptom] = (symptomCounts[symptom] || 0) + value
          }
        })
      }
    })

    topSymptoms.push(
      ...Object.entries(symptomCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([symptom]) => symptom)
    )
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
  }

  return (
    <div style={{
      width: '100%',
      padding: 'var(--space-lg)',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 12px 40px rgba(42, 33, 28, 0.15), 0 4px 12px rgba(42, 33, 28, 0.08)',
      opacity: 0.7,
    }}>
      <h3 style={{
        fontSize: 'var(--font-size-small)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-label)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        margin: '0 0 var(--space-md) 0',
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      }}>
        Cyclus Samenvatting
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-md)',
      }}>
        <div style={{
          padding: 'var(--space-md)',
          background: '#F5F5F5',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 'var(--font-size-micro)',
            color: 'var(--color-label)',
            textTransform: 'uppercase',
            margin: '0 0 8px 0',
            fontWeight: 'var(--font-weight-semibold)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Cyclus Lengte
          </p>
          <p style={{
            fontSize: '24px',
            fontWeight: 'var(--font-weight-semibold)',
            margin: 0,
            color: 'var(--color-text)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            {cycleLength} dagen
          </p>
        </div>

        <div style={{
          padding: 'var(--space-md)',
          background: '#F5F5F5',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 'var(--font-size-micro)',
            color: 'var(--color-label)',
            textTransform: 'uppercase',
            margin: '0 0 8px 0',
            fontWeight: 'var(--font-weight-semibold)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Volgende Periode
          </p>
          <p style={{
            fontSize: '16px',
            fontWeight: 'var(--font-weight-semibold)',
            margin: '0 0 4px 0',
            color: 'var(--color-text)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            {formatDate(nextPeriodDate)}
          </p>
          <p style={{
            fontSize: 'var(--font-size-micro)',
            color: 'var(--color-label)',
            margin: 0,
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Over {daysUntilPeriod} dagen
          </p>
        </div>
      </div>

      {topSymptoms.length > 0 && (
        <div>
          <p style={{
            fontSize: 'var(--font-size-small)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text)',
            margin: '0 0 var(--space-sm) 0',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Meest Voorkomend Deze Cyclus
          </p>
          <div style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            flexWrap: 'wrap',
          }}>
            {topSymptoms.map((symptom) => (
              <span
                key={symptom}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  background: '#FFE8E8',
                  borderRadius: '20px',
                  fontSize: 'var(--font-size-small)',
                  color: '#C2185B',
                  fontWeight: 'var(--font-weight-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {getSymptomIcon(symptom)}
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
