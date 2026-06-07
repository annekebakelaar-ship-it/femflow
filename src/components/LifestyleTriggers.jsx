import { useState, useEffect } from 'react'

const TRIGGERS = [
  { id: 'alcohol', label: 'Alcohol', emoji: '🍷' },
  { id: 'sugar_late_meal', label: 'Late maaltijd', emoji: '🍰' },
  { id: 'high_stress', label: 'Stress', emoji: '⚡' },
]

export default function LifestyleTriggers() {
  const [triggers, setTriggers] = useState({
    alcohol: false,
    sugar_late_meal: false,
    high_stress: false,
  })
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setDate(today)
  }, [])

  async function saveTriggers(newTriggers) {
    setSaving(true)
    try {
      const res = await fetch('https://wearable-age-api.onrender.com/api/v1/logs/triggers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('wab_jwt')}`
        },
        body: JSON.stringify({ date, triggers: newTriggers }),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 1200)
      }
    } catch (err) {
      console.error('Failed to save triggers:', err)
    } finally {
      setSaving(false)
    }
  }

  function handleToggle(triggerId) {
    const newTriggers = { ...triggers, [triggerId]: !triggers[triggerId] }
    setTriggers(newTriggers)
    saveTriggers(newTriggers)
  }

  return (
    <div style={{ padding: '0 var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-md)' }}>
        <p style={{
          fontSize: 'var(--font-size-micro)',
          color: 'var(--color-label)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 'var(--font-weight-semibold)',
          margin: 0,
        }}>
          Avond Check
        </p>
        {saved && (
          <p style={{
            fontSize: 'var(--font-size-micro)',
            color: '#2e7d32',
            fontWeight: '500',
            margin: 0,
          }}>
            ✓
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        {TRIGGERS.map(trigger => {
          const isActive = triggers[trigger.id]

          return (
            <button
              key={trigger.id}
              onClick={() => handleToggle(trigger.id)}
              disabled={saving}
              style={{
                flex: '1 1 auto',
                minWidth: '120px',
                padding: 'var(--space-md)',
                background: isActive ? 'var(--color-accent)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: '2px',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 150ms ease',
                opacity: saving ? 0.7 : 1,
              }}
              onMouseEnter={e => {
                if (!saving && !isActive) {
                  e.currentTarget.style.borderColor = 'var(--color-accent)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }
              }}
            >
              <p style={{ fontSize: '16px', margin: '0 0 4px 0' }}>{trigger.emoji}</p>
              <p style={{
                fontSize: 'var(--font-size-small)',
                fontWeight: isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                color: isActive ? '#FFFFFF' : 'var(--color-text)',
                margin: 0,
              }}>
                {trigger.label}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
