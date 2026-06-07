import { useState } from 'react'
import { Cloud, Zap, Moon, Heart } from 'react-feather'

const SYMPTOMS = [
  { id: 'brain_fog', label: 'Brain fog', icon: 'cloud' },
  { id: 'hot_flash', label: 'Opvlieger', icon: 'zap' },
  { id: 'extreme_fatigue', label: 'Vermoeidheid', icon: 'moon' },
  { id: 'mood_swing', label: 'Stemming', icon: 'heart' },
]

const getSymptomIcon = (iconName) => {
  const icons = {
    cloud: <Cloud size={20} strokeWidth={1.5} />,
    zap: <Zap size={20} strokeWidth={1.5} />,
    moon: <Moon size={20} strokeWidth={1.5} />,
    alert: <Heart size={20} strokeWidth={1.5} />,
  }
  return icons[iconName] || null
}

export default function SymptomQuicklog() {
  const [selected, setSelected] = useState(null)
  const [confirmed, setConfirmed] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSymptomLog(symptomId) {
    if (loading) return
    setLoading(true)
    setSelected(symptomId)

    try {
      const response = await fetch('https://wearable-age-api.onrender.com/api/v1/logs/symptom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('wab_jwt')}`
        },
        body: JSON.stringify({ symptom_type: symptomId }),
      })

      if (response.ok) {
        setConfirmed(symptomId)
        setTimeout(() => {
          setConfirmed(null)
          setSelected(null)
          setLoading(false)
        }, 1200)
      } else {
        setLoading(false)
        setSelected(null)
      }
    } catch (err) {
      console.error('Failed to log symptom:', err)
      setLoading(false)
      setSelected(null)
    }
  }

  return (
    <div style={{ padding: '0 var(--space-lg)', marginBottom: 'var(--space-lg)', opacity: 0.7 }}>
      <p style={{
        fontSize: 'var(--font-size-micro)',
        color: 'var(--color-label)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: 'var(--space-md)',
        fontWeight: 'var(--font-weight-semibold)',
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      }}>
        Symptomen
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--space-sm)',
        padding: 'var(--space-lg)',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 12px 40px rgba(42, 33, 28, 0.15), 0 4px 12px rgba(42, 33, 28, 0.08)',
      }}>
        {SYMPTOMS.map(symptom => {
          const isSelected = selected === symptom.id
          const isConfirmed = confirmed === symptom.id

          return (
            <button
              key={symptom.id}
              onClick={() => handleSymptomLog(symptom.id)}
              disabled={loading && !isSelected}
              style={{
                position: 'relative',
                padding: 'var(--space-md)',
                background: isConfirmed ? '#E8F5E9' : 'transparent',
                border: isConfirmed
                  ? '1px solid #2e7d32'
                  : isSelected
                  ? '1px solid var(--color-accent)'
                  : '1px solid var(--color-border)',
                borderRadius: '2px',
                cursor: loading && !isSelected ? 'not-allowed' : 'pointer',
                transition: 'all 150ms ease',
                opacity: loading && !isSelected ? 0.6 : 1,
              }}
              onMouseEnter={e => {
                if (!loading && !isConfirmed) {
                  e.target.style.borderColor = 'var(--color-accent)'
                }
              }}
              onMouseLeave={e => {
                if (!isConfirmed) {
                  e.target.style.borderColor = 'var(--color-border)'
                }
              }}
            >
              <div style={{ margin: '0 0 4px 0', color: 'var(--ink-2)' }}>{getSymptomIcon(symptom.icon)}</div>
              <p style={{
                fontSize: 'var(--font-size-small)',
                fontWeight: 'var(--font-weight-regular)',
                color: isConfirmed ? '#2e7d32' : 'var(--color-text)',
                margin: 0,
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
              }}>
                {symptom.label}
              </p>

              {isConfirmed && (
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '16px',
                  height: '16px',
                  background: '#2e7d32',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  ✓
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
