import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingShell from './OnboardingShell'
import Button from '../../components/Button'

const QUIZ_STEPS = ['Welkom', 'Quiz', 'Advies', 'Betaling']

function Skeleton({ width = '100%', height = 16, style }) {
  return (
    <div style={{
      width, height,
      borderRadius: 8,
      background: 'var(--border)',
      animation: 'skeleton-pulse 1.4s ease infinite',
      ...style,
    }} />
  )
}

function SkeletonAdvies() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <Skeleton height={14} width="80%" />
      <Skeleton height={14} width="60%" style={{ marginBottom: 'var(--space-sm)' }} />
      {[0, 1, 2].map(i => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
            <Skeleton width={6} height={6} style={{ borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Skeleton height={14} width="55%" />
              <Skeleton height={11} width="75%" />
            </div>
          </div>
          <Skeleton height={11} width={40} style={{ flexShrink: 0, marginLeft: '12px' }} />
        </div>
      ))}
    </div>
  )
}

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

function avg(arr, field) {
  const vals = arr.map(d => d[field]).filter(v => v != null)
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null
}

function buildRequest(data) {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
  const last7  = sorted.slice(-7)
  const prev7  = sorted.slice(-14, -7)
  return {
    hrv_avg_7d:        avg(last7, 'hrv_ms'),
    hrv_avg_prev_7d:   avg(prev7, 'hrv_ms'),
    sleep_avg_7d:      avg(last7, 'total_sleep_min'),
    sleep_avg_prev_7d: avg(prev7, 'total_sleep_min'),
    steps_avg_7d:      avg(last7, 'steps'),
    steps_avg_prev_7d: avg(prev7, 'steps'),
    temp_avg_7d:       avg(last7, 'wrist_temp_deviation_c'),
    days_with_data:    sorted.filter(d => d.hrv_ms != null).length,
  }
}

const PRIORITY_DOT = { hoog: '#2e7d32', middel: '#e67e22', laag: '#aaa' }

export default function AdviesStep() {
  const navigate = useNavigate()
  const [advice, setAdvice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isQuizFlow = !!localStorage.getItem('youcaps_quiz') && !sessionStorage.getItem('oura_pulled_data')

  useEffect(() => {
    generate()
  }, [])

  async function generate() {
    setLoading(true)
    setError('')
    try {
      const ouraRaw = sessionStorage.getItem('oura_pulled_data')
      const quizRaw = localStorage.getItem('youcaps_quiz')

      let res
      if (ouraRaw) {
        res = await fetch(`${BASE}/api/advice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildRequest(JSON.parse(ouraRaw).data)),
        })
      } else if (quizRaw) {
        res = await fetch(`${BASE}/api/advice/quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: quizRaw,
        })
      } else {
        res = await fetch(`${BASE}/api/advice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ days_with_data: 0 }),
        })
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data.supplements?.length) throw new Error('Lege response')
      localStorage.setItem('youcaps_advice', JSON.stringify(data))
      setAdvice(data)
    } catch (e) {
      setError(`Advies laden mislukt (${e.message}). Probeer het opnieuw.`)
    } finally {
      setLoading(false)
    }
  }

  const shellStep  = isQuizFlow ? 3 : 4
  const shellSteps = isQuizFlow ? QUIZ_STEPS : undefined

  return (
    <OnboardingShell step={shellStep} steps={shellSteps}>
      <h1 style={{
        fontSize: ''26px'',
        fontWeight: '600',
        letterSpacing: '-1px',
        lineHeight: 1.1,
        marginBottom: 'var(--space-sm)',
      }}>
        Jouw formule.
      </h1>
      <p style={{
        fontSize: ''15px'',
        color: 'var(--ink-2)',
        lineHeight: 1.6,
        marginBottom: 'var(--space-xl)',
      }}>
        {isQuizFlow
          ? 'Op basis van je antwoorden stellen we dit pakket voor.'
          : 'Op basis van je biometrische data stellen we dit pakket voor.'}
      </p>

      {loading && <SkeletonAdvies />}

      {error && (
        <>
          <p style={{ color: '#c62828', fontSize: ''13px'', marginBottom: 'var(--space-sm)' }}>{error}</p>
          <Button onClick={generate}>Opnieuw proberen</Button>
        </>
      )}

      {advice && !loading && (
        <>
          {/* Samenvatting */}
          <p style={{
            fontSize: ''13px'',
            color: 'var(--ink-2)',
            lineHeight: 1.6,
            marginBottom: 'var(--space-lg)',
            padding: 'var(--space-sm)',
            background: 'var(--border-subtle)',
            borderRadius: '12px',
          }}>
            {advice.summary}
          </p>

          {/* Supplement lijst */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            {advice.supplements.map((s, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '14px 0',
                borderBottom: '1px solid var(--border-subtle)',
                gap: 'var(--space-sm)',
                animation: 'fade-slide-up 300ms ease both',
                animationDelay: `${i * 80}ms`,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: PRIORITY_DOT[s.priority] || '#aaa',
                    flexShrink: 0, marginTop: '6px',
                  }} />
                  <div>
                    <div style={{ fontWeight: '500', fontSize: ''15px'' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: ''13px'', color: 'var(--ink-2)', marginTop: '2px' }}>
                      {s.reason.split('.')[0]}.
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: ''13px'',
                  color: 'var(--ink-2)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {s.dose}
                </span>
              </div>
            ))}
          </div>

          <Button onClick={() => navigate('/welkom/betalen')}>
            Dit is mijn formule â†’
          </Button>
        </>
      )}
    </OnboardingShell>
  )
}

