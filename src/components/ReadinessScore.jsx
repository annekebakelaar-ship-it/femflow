import { useState, useEffect } from 'react'
import { Moon, Heart, Zap, Activity } from 'react-feather'
import ScoreCard from './ScoreCard'

const getReadinessIcon = (type) => {
  const icons = {
    sleep: <Moon size={14} strokeWidth={1.5} />,
    hrv: <Heart size={14} strokeWidth={1.5} />,
    rhr: <Zap size={14} strokeWidth={1.5} />,
  }
  return icons[type] || null
}

function calculateReadinessLocal(wearable, cycle) {
  const deepSleep = wearable.deep_sleep_percentage || 25
  const hrvDev = wearable.hrv_trend_deviation || 0
  const rhrDelta = wearable.resting_heart_rate_delta || 0
  const phase = cycle.cycle_phase || 'irregular'

  let phaseMultiplier = 1.0
  if (phase === 'luteal') {
    phaseMultiplier = cycle.current_day >= 25 ? 1.4 : 1.2
  } else if (phase === 'follicular') {
    phaseMultiplier = 0.9
  } else if (phase === 'ovulatory') {
    phaseMultiplier = 0.85
  } else {
    phaseMultiplier = 1.5
  }

  const sleepScore = Math.max(20, Math.min(100, deepSleep * 0.8))
  const hrvScore = Math.max(20, 100 + (hrvDev * 500))
  const rhrScore = Math.max(20, 100 - (rhrDelta * 8))

  const rawScore = sleepScore * 0.3 + hrvScore * 0.35 + rhrScore * 0.35
  const score = Math.max(1, Math.min(100, Math.floor(rawScore / phaseMultiplier)))

  return {
    score,
    status: score >= 70 ? 'Optimaal' : score >= 45 ? 'Adaptief' : 'Gevoelig',
    breakdown: { sleep_score: Math.floor(sleepScore), hrv_score: Math.floor(hrvScore), rhr_score: Math.floor(rhrScore) }
  }
}

export default function ReadinessScore({ wearableData, cycleData }) {
  const [readiness, setReadiness] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!wearableData || !cycleData) return

    setLoading(true)

    fetch('https://wearable-age-api.onrender.com/api/readiness/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('wab_jwt')}`
      },
      body: JSON.stringify({
        wearable_data: wearableData,
        cycle_data: cycleData,
      }),
    })
      .then(r => r.json())
      .then(data => {
        setReadiness(data)
        setLoading(false)
      })
      .catch(() => {
        const local = calculateReadinessLocal(wearableData, cycleData)
        setReadiness(local)
        setLoading(false)
      })
  }, [wearableData, cycleData])

  if (loading || !readiness) return null

  const { score, status, breakdown } = readiness

  return (
    <div style={{ padding: '0 var(--space-lg)', marginBottom: 'var(--space-lg)', opacity: 0.4 }}>
      {/* Main score card using ScoreCard component */}
      <ScoreCard
        icon={Activity}
        title="Belastbaarheid"
        status={status}
        score={score}
        category="accent"
        state="empty"
      />

      {/* Breakdown tiles below the main card */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
        {[
          { label: 'Slaap', value: breakdown.sleep_score, type: 'sleep' },
          { label: 'HRV', value: breakdown.hrv_score, type: 'hrv' },
          { label: 'RHR', value: breakdown.rhr_score, type: 'rhr' },
        ].map((item, i) => (
          <div key={i} style={{ flex: 1, background: 'white', padding: 'var(--space-sm)', borderRadius: '2px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-label)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>
              {getReadinessIcon(item.type)}
              <span>{item.label}</span>
            </div>
            <p style={{ fontSize: '18px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)', margin: 0, textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
