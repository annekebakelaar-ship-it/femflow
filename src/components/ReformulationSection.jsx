import { useState, useEffect } from 'react'

async function getReformulation(userId) {
  const BASE = 'https://wearable-age-api.onrender.com'
  const token = localStorage.getItem('wab_jwt')
  const res = await fetch(`${BASE}/api/reformulate/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch reformulation')
  return res.json()
}

const ingredientColors = {
  magnesium: '#8B7355',
  ltheanine: '#4A90E2',
  ashwagandha: '#E8B44E',
  glycine: '#6A994E',
  omega3: '#D4525C',
  bcomplex: '#F4A261',
}

export default function ReformulationSection({ userId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getReformulation(userId)
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)', color: 'var(--color-label)' }}>Analyzing trends…</p>
  if (error) return <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-negative)' }}>{error}</p>
  if (!data) return null

  return (
    <div style={{ marginTop: 'var(--space-xxl)' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)', color: 'var(--color-label)', letterSpacing: '.4px', textTransform: 'uppercase', marginBottom: 'var(--space-sm)' }}>
        Personalized Plan
      </p>
      <h3 style={{ fontSize: 'var(--font-size-heading)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: '-0.5px', marginBottom: 'var(--space-lg)' }}>
        Monthly Supplement Strip
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
        {/* Old strip */}
        <div style={{ padding: 'var(--space-md)', border: '1px solid var(--color-border-subtle)', borderRadius: 4, background: 'var(--color-bg-subtle)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)', color: 'var(--color-label)', marginBottom: 'var(--space-sm)', fontWeight: 'bold' }}>
            Current
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(data.old_strip).map(([key, level]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: ingredientColors[key] || '#ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                >
                  {level}
                </div>
                <span style={{ fontSize: 'var(--font-size-small)', flex: 1 }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* New strip */}
        <div style={{ padding: 'var(--space-md)', border: '2px solid var(--color-positive)', borderRadius: 4, background: 'rgba(46, 125, 50, 0.05)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)', color: 'var(--color-positive)', marginBottom: 'var(--space-sm)', fontWeight: 'bold' }}>
            Recommended
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(data.new_strip).map(([key, level]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: ingredientColors[key] || '#ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                >
                  {level}
                </div>
                <span style={{ fontSize: 'var(--font-size-small)', flex: 1 }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending notes (hysterese) */}
      {data.pending_notes && data.pending_notes.length > 0 && (
        <div style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', border: '1px solid #FFB74D', borderRadius: 4, background: 'rgba(255, 183, 77, 0.05)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)', color: '#F57C00', marginBottom: 'var(--space-sm)', fontWeight: 'bold' }}>
            Trends Being Monitored
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.pending_notes.map((note, i) => (
              <p key={i} style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)', lineHeight: '1.5' }}>
                • {note}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Changes */}
      {data.changes && data.changes.length > 0 && (
        <div style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', border: '1px solid var(--color-border-subtle)', borderRadius: 4 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)', color: 'var(--color-label)', marginBottom: 'var(--space-sm)', fontWeight: 'bold' }}>
            Changes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.changes.map(c => (
              <div key={c.ingredient}>
                <p style={{ fontSize: 'var(--font-size-small)', fontWeight: 'bold', marginBottom: 4 }}>
                  {c.ingredient.charAt(0).toUpperCase() + c.ingredient.slice(1)} — {c.direction_word}
                  <span style={{ marginLeft: 8, color: 'var(--color-label)' }}>
                    {c.old_level} → {c.new_level}
                  </span>
                </p>
                {c.reasons.map((r, i) => (
                  <p key={i} style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-secondary)', marginLeft: 16, marginBottom: 4 }}>
                    • {r}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div style={{ padding: 'var(--space-md)', border: '1px solid var(--color-border)', borderRadius: 4, background: 'var(--color-bg-subtle)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)', color: 'var(--color-label)', marginBottom: 'var(--space-sm)', fontWeight: 'bold' }}>
          Why These Changes
        </p>
        <div style={{ fontSize: 'var(--font-size-small)', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'var(--color-text)' }}>
          {data.explanation}
        </div>
      </div>
    </div>
  )
}
