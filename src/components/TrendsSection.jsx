import { useState, useEffect } from 'react'

async function getTrends(userId) {
  const BASE = 'https://wearable-age-api.onrender.com'
  const token = localStorage.getItem('femflow_jwt')
  const res = await fetch(`${BASE}/api/trends/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch trends')
  return res.json()
}

const statusColors = {
  stable: '#2e7d32',      // green
  mild: '#f57c00',        // orange
  strong: '#c0392b',      // red
  learning_baseline: '#999',
}

const statusLabels = {
  stable: 'Stable',
  mild: 'Mild ↗',
  strong: 'Strong ↗',
  learning_baseline: 'Learning',
}

export default function TrendsSection({ userId }) {
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getTrends(userId)
      .then(data => setTrends(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  // WAB-erfenis: dit endpoint bestaat niet in de FemFlow-backend. Tot er een
  // eigen trends-bron is faalt deze sectie stil in plaats van met een rode
  // foutmelding voor elke gebruiker.
  if (loading || error) return null
  if (!trends?.results) return null

  return (
    <div style={{ marginTop: 'var(--space-xxl)' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)', color: 'var(--color-label)', letterSpacing: '.4px', textTransform: 'uppercase', marginBottom: 'var(--space-sm)' }}>
        Trend Analysis
      </p>
      <h3 style={{ fontSize: 'var(--font-size-heading)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: '-0.5px', marginBottom: 'var(--space-lg)' }}>
        Biomarker Trends
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
        {trends.results.map(t => (
          <div
            key={t.biomarker}
            style={{
              padding: 'var(--space-md)',
              border: `1px solid ${statusColors[t.status] || '#ccc'}`,
              borderRadius: 4,
              background: 'var(--color-bg-subtle)',
            }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)', color: 'var(--color-label)', marginBottom: 4 }}>
              {t.biomarker}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-sm)' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  background: statusColors[t.status],
                  color: 'white',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-size-micro)',
                  fontWeight: 'bold',
                  letterSpacing: '.08em',
                }}
              >
                {statusLabels[t.status]}
              </span>
            </div>

            {t.status !== 'learning_baseline' && (
              <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)' }}>
                <p>{t.human_summary}</p>
                {t.pct_change !== null && (
                  <p style={{ marginTop: 4, fontWeight: 'bold' }}>
                    {t.pct_change > 0 ? '↑' : '↓'} {Math.abs(t.pct_change).toFixed(1)}%
                  </p>
                )}
              </div>
            )}

            {t.status === 'learning_baseline' && (
              <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-label)' }}>
                {t.human_summary}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
