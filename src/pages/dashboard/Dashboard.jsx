import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Label from '../../components/Label'

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

function useSavedAdvice() {
  const [advice, setAdvice] = useState(null)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('youcaps_advice')
      if (raw) setAdvice(JSON.parse(raw))
    } catch {}
  }, [])
  return advice
}

function computeMetrics(data) {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
  const last7  = sorted.slice(-7)
  const prev7  = sorted.slice(-14, -7)
  const avg = (arr, field) => {
    const vals = arr.map(d => d[field]).filter(v => v != null)
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null
  }
  const trend = (curr, prev) => (curr == null || prev == null) ? null : curr - prev
  const hrv   = avg(last7, 'hrv_ms')
  const sleep = avg(last7, 'total_sleep_min')
  const steps = avg(last7, 'steps')
  return {
    hrv:   { value: hrv,   trend: trend(hrv,   avg(prev7, 'hrv_ms'))           },
    sleep: { value: sleep, trend: trend(sleep,  avg(prev7, 'total_sleep_min')) },
    steps: { value: steps, trend: trend(steps,  avg(prev7, 'steps'))           },
  }
}

function computeVitalScore(data) {
  if (!data?.length) return null
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
  const last14 = sorted.slice(-14)
  const last7  = sorted.slice(-7)
  const prev7  = sorted.slice(-14, -7)

  function dayScore(d) {
    let score = 0, weight = 0
    if (d.hrv_ms != null)          { score += Math.min(100, (d.hrv_ms / 70) * 100) * 0.45; weight += 0.45 }
    if (d.total_sleep_min != null) { score += Math.max(0, Math.min(100, 100 - Math.abs(d.total_sleep_min - 480) / 4.8)) * 0.35; weight += 0.35 }
    if (d.steps != null)           { score += Math.min(100, (d.steps / 10000) * 100) * 0.20; weight += 0.20 }
    return weight > 0 ? score / weight : null
  }

  const avgScore = arr => {
    const vals = arr.map(d => dayScore(d)).filter(v => v != null)
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null
  }

  const current  = avgScore(last7)
  const previous = avgScore(prev7)

  return {
    score:   current != null ? Math.round(current) : null,
    trend:   current != null && previous != null ? Math.round(current - previous) : null,
    history: last14.map(d => ({ date: d.date, score: dayScore(d) != null ? Math.round(dayScore(d)) : null })),
  }
}

function vitalStatus(score) {
  if (score >= 80) return 'Uitstekend herstel'
  if (score >= 65) return 'Goed hersteld'
  if (score >= 50) return 'Matig herstel'
  return 'Herstel nodig'
}

function useCountUp(target, duration = 900) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target == null) return
    setCount(0)
    const start = Date.now()
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target])
  return count
}

function useOuraData() {
  const [rawData, setRawData] = useState(null)

  useEffect(() => {
    const cached = sessionStorage.getItem('oura_pulled_data')
    if (cached) {
      try {
        const { data } = JSON.parse(cached)
        if (Array.isArray(data) && data.length > 0) {
          setRawData(data)
          return
        }
      } catch {}
    }

    fetch(`${BASE}/api/oura/pull`, { method: 'POST' })
      .then(r => r.ok ? r.json() : null)
      .then(result => {
        if (!result?.data?.length) return
        sessionStorage.setItem('oura_pulled_data', JSON.stringify(result))
        setRawData(result.data)
      })
      .catch(() => {})
  }, [])

  return { rawData, metrics: rawData ? computeMetrics(rawData) : null }
}

function MetricTile({ label, value, unit, trend, decimals = 0 }) {
  const fmt = v => v == null ? '—' : Number(v).toFixed(decimals)
  const trendPositive = trend != null && trend > 0
  const trendNegative = trend != null && trend < 0

  return (
    <div style={{
      padding: '16px',
      borderRadius: '16px',
      background: 'rgba(255,255,255,0.6)',
      border: '1px solid rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-label)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: '1.6rem', fontWeight: 'var(--font-weight-semibold)', letterSpacing: '-1px', lineHeight: 1 }}>
        {fmt(value)}<span style={{ fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-secondary)', marginLeft: '3px' }}>{unit}</span>
      </span>
      {trend != null && (
        <span style={{ fontSize: 'var(--font-size-micro)', color: trendPositive ? '#2e7d32' : trendNegative ? '#c62828' : 'var(--color-secondary)' }}>
          {trendPositive ? '↑' : trendNegative ? '↓' : '='} {fmt(Math.abs(trend))} {unit} vs vorige week
        </span>
      )}
    </div>
  )
}

function VitalScoreCard({ score, trend, history }) {
  if (score == null) return null
  const status = vitalStatus(score)
  const displayScore = useCountUp(score)

  return (
    <div style={{
      background: 'var(--color-text)',
      color: 'white',
      borderRadius: '20px',
      padding: '24px 24px 20px',
      marginBottom: 'var(--space-xl)',
      animation: 'fade-slide-up 300ms ease both',
    }}>
      <div style={{
        fontSize: 'var(--font-size-micro)',
        color: 'rgba(255,255,255,0.45)',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        marginBottom: '10px',
      }}>
        Vital Score
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', marginBottom: '6px' }}>
        <span style={{
          fontSize: '4.5rem',
          fontWeight: 'var(--font-weight-semibold)',
          letterSpacing: '-4px',
          lineHeight: 1,
        }}>
          {displayScore}
        </span>
        {trend != null && (
          <span style={{
            fontSize: 'var(--font-size-small)',
            color: trend > 0 ? '#81c784' : trend < 0 ? '#ef9a9a' : 'rgba(255,255,255,0.4)',
            marginBottom: '10px',
          }}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '='} {Math.abs(trend)} vs vorige week
          </span>
        )}
      </div>

      <div style={{
        fontSize: 'var(--font-size-body)',
        color: 'rgba(255,255,255,0.65)',
        marginBottom: '22px',
      }}>
        {status}
      </div>

      {history.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '36px' }}>
            {history.map((h, i) => {
              const isToday = i === history.length - 1
              const pct = h.score != null ? h.score / 100 : 0
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${Math.max(3, pct * 36)}px`,
                    borderRadius: '3px',
                    background: isToday ? 'white' : 'rgba(255,255,255,0.22)',
                    animation: 'fade-slide-up 300ms ease both',
                    animationDelay: `${i * 40}ms`,
                  }}
                />
              )
            })}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '7px',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.3)',
          }}>
            <span>14 dagen</span>
            <span>Vandaag</span>
          </div>
        </>
      )}
    </div>
  )
}

const PRIORITY_DOT = { hoog: '#2e7d32', middel: '#e67e22', laag: '#aaa' }

function FirstVisitBanner({ advice, email, onDismiss }) {
  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <h1 style={{
        fontSize: 'var(--font-size-display)',
        fontWeight: 'var(--font-weight-semibold)',
        letterSpacing: '-1px', lineHeight: 1.1,
        marginBottom: 'var(--space-sm)',
      }}>
        Je formule is klaar.
      </h1>
      <p style={{
        fontSize: 'var(--font-size-body)',
        color: 'var(--color-secondary)',
        lineHeight: 1.6,
        marginBottom: 'var(--space-lg)',
      }}>
        Samengesteld op basis van je biometrische data. Eerste levering binnen 5–7 werkdagen.
      </p>

      {advice?.supplements?.length > 0 && (
        <div style={{
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          marginBottom: 'var(--space-lg)',
          overflow: 'hidden',
        }}>
          {advice.supplements.map((s, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px var(--space-md)',
              borderBottom: i < advice.supplements.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
              gap: 'var(--space-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: PRIORITY_DOT[s.priority] || '#aaa',
                }} />
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-body)' }}>{s.name}</div>
                  <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)', marginTop: '1px' }}>
                    {s.reason.split('.')[0]}.
                  </div>
                </div>
              </div>
              <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {s.dose}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 'var(--space-md)',
        background: 'var(--color-border-subtle)',
        borderRadius: '12px',
        marginBottom: 'var(--space-lg)',
      }}>
        <div>
          <p style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-body)', margin: 0 }}>Eerste levering</p>
          <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)', margin: '2px 0 0' }}>
            Bevestiging gestuurd naar {email || 'je e-mail'}
          </p>
        </div>
        <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)', whiteSpace: 'nowrap' }}>
          5–7 werkdagen
        </span>
      </div>

      <button
        onClick={onDismiss}
        style={{
          background: 'none', border: 'none', padding: 0,
          fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)',
          cursor: 'pointer', textDecoration: 'underline',
        }}
      >
        Ga naar mijn dashboard →
      </button>
    </div>
  )
}

function nextDelivery() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return first.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
}

export default function Dashboard() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [showDevMenu, setShowDevMenu] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(
    () => localStorage.getItem('youcaps_first_visit') === 'true'
  )
  const { rawData, metrics: oura } = useOuraData()
  const vitalScore = rawData ? computeVitalScore(rawData) : null
  const advice = useSavedAdvice()
  const email = localStorage.getItem('youcaps_email') || ''

  function dismissFirstVisit() {
    localStorage.removeItem('youcaps_first_visit')
    setIsFirstVisit(false)
  }

  if (isFirstVisit) {
    return (
      <div>
        <FirstVisitBanner advice={advice} email={email} onDismiss={dismissFirstVisit} />
      </div>
    )
  }

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Goedemorgen.'
    if (h < 18) return 'Goedemiddag.'
    return 'Goedenavond.'
  })()

  return (
    <div>
      <h1 style={{
        fontSize: 'var(--font-size-display)',
        fontWeight: 'var(--font-weight-semibold)',
        letterSpacing: '-1px',
        marginBottom: 'var(--space-xl)',
      }}>
        {greeting}
      </h1>

      {/* Vital Score */}
      {vitalScore?.score != null && (
        <VitalScoreCard
          score={vitalScore.score}
          trend={vitalScore.trend}
          history={vitalScore.history}
        />
      )}

      {/* Gezondheid */}
      {oura ? (
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <Label>GEZONDHEID · 7 DAGEN</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: 'var(--space-sm)' }}>
            {[
              { label: 'HRV',     value: oura.hrv.value,   trend: oura.hrv.trend,   unit: 'ms', decimals: 0 },
              { label: 'Slaap',   value: oura.sleep.value != null ? oura.sleep.value / 60 : null, trend: oura.sleep.trend != null ? oura.sleep.trend / 60 : null, unit: 'u', decimals: 1 },
              { label: 'Stappen', value: oura.steps.value, trend: oura.steps.trend, unit: 'st', decimals: 0 },
            ].map((t, i) => (
              <div key={t.label} style={{ animation: 'fade-slide-up 280ms ease both', animationDelay: `${i * 70}ms` }}>
                <MetricTile {...t} />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <button
            onClick={() => navigate('/connect')}
            style={{
              width: '100%', padding: '16px 20px',
              border: '1px dashed var(--color-border)',
              borderRadius: 0, background: 'transparent',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px', fontWeight: 500,
              letterSpacing: '.16em', textTransform: 'uppercase',
              color: 'var(--color-secondary)',
              cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <span>Koppel je wearable voor gepersonaliseerde data</span>
            <span>→</span>
          </button>
        </section>
      )}

      {/* Jouw formule */}
      {advice?.supplements?.length > 0 && (
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <Label>JOUW FORMULE</Label>
          <div style={{ marginTop: 'var(--space-sm)', border: '1px solid var(--color-border)', borderRadius: '14px', overflow: 'hidden' }}>
            {advice.supplements.map((s, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px var(--space-md)',
                borderBottom: i < advice.supplements.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                animation: 'fade-slide-up 280ms ease both',
                animationDelay: `${i * 60}ms`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_DOT[s.priority] || '#aaa', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-body)' }}>{s.name}</div>
                    <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)', marginTop: '1px' }}>{s.dose}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Levering */}
      <section style={{ marginBottom: 'var(--space-xxl)' }}>
        <Label>LEVERING</Label>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 'var(--space-sm)',
          padding: 'var(--space-md)',
          background: 'var(--color-border-subtle)',
          borderRadius: '14px',
        }}>
          <div>
            <p style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-body)', margin: 0 }}>
              Volgende levering
            </p>
            <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)', margin: '2px 0 0' }}>
              Maandelijks · opzegbaar
            </p>
          </div>
          <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-body)', color: 'var(--color-text)' }}>
            {nextDelivery()}
          </span>
        </div>
      </section>

      <section style={{ paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border-subtle)' }}>
        <button
          type="button"
          onClick={() => setShowDevMenu(v => !v)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-label)',
            fontSize: 'var(--font-size-micro)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            padding: 0,
          }}
          aria-expanded={showDevMenu}
          aria-controls="dev-menu"
        >
          {showDevMenu ? '· instellingen verbergen' : '· instellingen'}
        </button>

        {showDevMenu && (
          <div
            id="dev-menu"
            style={{
              marginTop: 'var(--space-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'flex-start',
            }}
          >
            <button
              type="button"
              onClick={() => navigate('/onboarding/goal')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-small)',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              Bekijk Onboarding
            </button>
            <button
              type="button"
              onClick={() => navigate('/onboarding/subscribe')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-small)',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              Bekijk Abonnement-flow
            </button>
            <button
              type="button"
              onClick={() => navigate('/signin')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-small)',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              Bekijk Sign-in scherm
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
