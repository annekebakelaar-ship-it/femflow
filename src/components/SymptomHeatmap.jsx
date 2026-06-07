import { useState } from 'react'

const SYMPTOM_NAMES = [
  'Bloeding',
  'Kramp',
  'Buikpijn',
  'Ruggenpijn',
  'Hoofdpijn',
  'Vermoeidheid',
  'Gevoelige borsten',
  'Prikkelbaarheid',
]

export default function SymptomHeatmap({ menstrualData }) {
  const [hoveredCell, setHoveredCell] = useState(null)

  if (!menstrualData?.entries || menstrualData.entries.length === 0) {
    return (
      <div style={{
        width: '100%',
        padding: 'var(--space-lg)',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 12px 40px rgba(42, 33, 28, 0.15), 0 4px 12px rgba(42, 33, 28, 0.08)',
        textAlign: 'center',
        color: 'var(--color-label)',
      }}>
        <p>Nog geen gegevens. Begin met het loggen van je symptomen!</p>
      </div>
    )
  }

  // Aggregate symptoms across last 90 days
  const cycleLength = menstrualData.cycleLength || 28
  const symptomByDay = {}

  SYMPTOM_NAMES.forEach((symptom) => {
    symptomByDay[symptom] = {}
    for (let day = 1; day <= cycleLength; day++) {
      symptomByDay[symptom][day] = []
    }
  })

  // Get start date and today
  const startDate = new Date(menstrualData.startDate)
  const today = new Date()
  const totalDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))

  // Populate symptom data
  menstrualData.entries.forEach((entry) => {
    const entryDate = new Date(entry.date)
    const daysFromStart = Math.floor((entryDate - startDate) / (1000 * 60 * 60 * 24))
    const dayInCycle = (daysFromStart % cycleLength) + 1

    if (entry.symptoms) {
      Object.entries(entry.symptoms).forEach(([symptom, intensity]) => {
        if (SYMPTOM_NAMES.includes(symptom) && intensity > 0) {
          if (!symptomByDay[symptom][dayInCycle]) {
            symptomByDay[symptom][dayInCycle] = []
          }
          symptomByDay[symptom][dayInCycle].push(intensity)
        }
      })
    }
  })

  // Calculate average intensity
  const getIntensity = (symptom, day) => {
    const values = symptomByDay[symptom][day]
    if (values.length === 0) return 0
    return Math.round(values.reduce((a, b) => a + b) / values.length)
  }

  const getColor = (intensity) => {
    if (intensity === 0) return '#FFFFFF'
    return `hsl(0, 100%, ${100 - intensity * 10}%)`
  }

  return (
    <div style={{
      width: '100%',
      padding: 'var(--space-lg)',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 12px 40px rgba(42, 33, 28, 0.15), 0 4px 12px rgba(42, 33, 28, 0.08)',
      overflowX: 'auto',
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
        Symptom Patroon — {cycleLength} Dagen
      </h3>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 'var(--font-size-micro)',
        minWidth: '600px',
      }}>
        <thead>
          <tr>
            <th style={{
              textAlign: 'left',
              padding: '8px',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-label)',
              borderBottom: '1px solid #E0E0E0',
            }}>
              Symptoom
            </th>
            {Array.from({ length: cycleLength }, (_, i) => (
              <th
                key={i + 1}
                style={{
                  padding: '8px 4px',
                  fontWeight: 'var(--font-weight-regular)',
                  color: 'var(--color-label)',
                  borderBottom: '1px solid #E0E0E0',
                  width: '24px',
                  textAlign: 'center',
                }}
              >
                {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SYMPTOM_NAMES.map((symptom) => (
            <tr key={symptom}>
              <td style={{
                padding: '8px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text)',
                borderBottom: '1px solid #F0F0F0',
                minWidth: '100px',
              }}>
                {symptom}
              </td>
              {Array.from({ length: cycleLength }, (_, i) => {
                const day = i + 1
                const intensity = getIntensity(symptom, day)
                const isHovered = hoveredCell?.symptom === symptom && hoveredCell?.day === day

                return (
                  <td
                    key={day}
                    onMouseEnter={() => setHoveredCell({ symptom, day, intensity })}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{
                      padding: '4px',
                      background: getColor(intensity),
                      border: isHovered ? '2px solid #000' : '1px solid #E0E0E0',
                      cursor: 'pointer',
                      transition: 'all 100ms ease',
                      textAlign: 'center',
                      fontSize: '10px',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: intensity > 3 ? 'white' : 'transparent',
                    }}
                  >
                    {intensity > 0 ? intensity : ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {hoveredCell && (
        <div style={{
          marginTop: 'var(--space-md)',
          padding: 'var(--space-sm)',
          background: '#F5F5F5',
          borderRadius: '8px',
          fontSize: 'var(--font-size-small)',
          color: 'var(--color-text)',
        }}>
          <strong>{hoveredCell.symptom}</strong> op dag {hoveredCell.day}: intensiteit {hoveredCell.intensity}/5
        </div>
      )}

      <div style={{
        marginTop: 'var(--space-md)',
        display: 'flex',
        gap: 'var(--space-md)',
        fontSize: 'var(--font-size-micro)',
        color: 'var(--color-label)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '16px', height: '16px', background: '#FFFFFF', border: '1px solid #E0E0E0' }} />
          Geen
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '16px', height: '16px', background: '#FFE5E5' }} />
          Licht
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '16px', height: '16px', background: '#FFCCCC' }} />
          Matig
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '16px', height: '16px', background: '#FF9999' }} />
          Ernstig
        </div>
      </div>
    </div>
  )
}
