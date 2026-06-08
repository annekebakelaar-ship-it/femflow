import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSecure } from '../../utils/secureStorage'

export default function MenstruationHistory() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)

  useEffect(() => {
    try {
      const stored = getSecure('menstruation_data')
      if (stored) {
        setData(stored)
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    }
  }, [])

  if (!data?.startDate) {
    return (
      <div style={{
        minHeight: '100vh',
        padding: 'var(--space-lg)',
        background: 'var(--bg)',
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            marginBottom: 'var(--space-lg)',
          }}
        >
          ←
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', marginBottom: 'var(--space-lg)' }}>
          Menstruatie Geschiedenis
        </h1>
        <p style={{ color: 'var(--ink-2)' }}>Geen menstruatie data gevonden</p>
      </div>
    )
  }

  const start = new Date(data.startDate)
  const today = new Date()
  const cycles = []

  // Generate list of past cycles
  for (let i = 0; i < 6; i++) {
    const cycleStart = new Date(start)
    cycleStart.setDate(cycleStart.getDate() + i * data.cycleLength)

    if (cycleStart > today) break

    const cycleEnd = new Date(cycleStart)
    cycleEnd.setDate(cycleEnd.getDate() + data.bleedingDays - 1)

    cycles.push({
      number: i + 1,
      start: cycleStart,
      bleedingEnd: cycleEnd,
      cycleLength: data.cycleLength,
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'var(--space-lg)',
      background: 'var(--bg)',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            marginBottom: 'var(--space-lg)',
          }}
        >
          ←
        </button>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', marginBottom: 'var(--space-lg)' }}>
          Menstruatie Geschiedenis
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {cycles.map((cycle) => (
            <div
              key={cycle.number}
              style={{
                background: 'var(--surface)',
                padding: 'var(--space-md)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-sm)' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--ink)' }}>
                  Cyclus {cycle.number}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--ink-3)', background: 'var(--accent-soft)', padding: '4px 8px', borderRadius: '6px' }}>
                  {cycle.cycleLength} dagen
                </span>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--ink-2)', lineHeight: '1.6' }}>
                <p style={{ margin: '4px 0' }}>
                  <strong>Menstruatie:</strong> {cycle.start.toLocaleDateString('nl-NL')} - {cycle.bleedingEnd.toLocaleDateString('nl-NL')} ({cycle.bleedingEnd.getDate() - cycle.start.getDate() + 1} dagen)
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Volgende:</strong> {new Date(cycle.start.getTime() + cycle.cycleLength * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 'var(--space-xl)',
          padding: 'var(--space-md)',
          background: 'rgba(199, 154, 110, 0.05)',
          borderRadius: '12px',
          fontSize: '13px',
          color: 'var(--ink-2)',
          lineHeight: '1.6',
        }}>
          <p style={{ margin: '0 0 var(--space-sm) 0' }}>
            <strong>Cyclus lengte:</strong> {data.cycleLength} dagen
          </p>
          <p style={{ margin: '0 0 var(--space-sm) 0' }}>
            <strong>Menstruatie duration:</strong> {data.bleedingDays} dagen
          </p>
          <p style={{ margin: '0' }}>
            <strong>Gestart:</strong> {start.toLocaleDateString('nl-NL')}
          </p>
        </div>
      </div>
    </div>
  )
}
