import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Label from '../../components/Label'
import Button from '../../components/Button'

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
const ADVICE_KEY = 'youcaps_advice'

const PRIORITY_COLOR = {
  hoog:   { bg: 'rgba(79, 140, 90, 0.08)',  border: 'rgba(79, 140, 90, 0.2)',  dot: 'var(--success)' },
  middel: { bg: 'rgba(91, 124, 153, 0.08)', border: 'rgba(91, 124, 153, 0.2)', dot: 'var(--info)' },
  laag:   { bg: 'rgba(168, 158, 149, 0.06)', border: 'rgba(168, 158, 149, 0.08)',    dot: 'var(--ink-3)' },
}

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

export default function Advice() {
  const navigate = useNavigate()
  const [ouraData, setOuraData] = useState(null)
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('oura_pulled_data')
      if (raw) setOuraData(JSON.parse(raw))
    } catch {}
    try {
      const saved = localStorage.getItem(ADVICE_KEY)
      if (saved) setResult(JSON.parse(saved))
    } catch {}
  }, [])

  async function generate() {
    if (!ouraData?.data) return
    setLoading(true)
    setError(null)
    try {
      const body = buildRequest(ouraData.data)
      const res = await fetch(`${BASE}/api/advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }
      const data = await res.json()
      localStorage.setItem(ADVICE_KEY, JSON.stringify(data))
      setResult(data)
    } catch (e) {
      setError(e.message || 'Advies ophalen mislukt. Probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 'var(--space-lg) var(--container-padding)' }}>
      <Label>GEPERSONALISEERD ADVIES</Label>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '26px',
        fontWeight: 500,
        lineHeight: 1.25,
        letterSpacing: '-1px',
        margin: 'var(--space-md) 0 var(--space-xl)',
        color: 'var(--ink)',
      }}>
        Jouw supplement&shy;aanbeveling
      </h1>

      {!ouraData ? (
        <div>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 400,
            color: 'var(--ink-2)',
            marginBottom: 'var(--space-md)',
          }}>
            Geen wearable data beschikbaar. Haal eerst je Oura data op.
          </p>
          <Button onClick={() => navigate('/connect')}>Ga naar Oura koppeling →</Button>
        </div>
      ) : !result ? (
        <div>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 400,
            color: 'var(--ink-2)',
            marginBottom: 'var(--space-lg)',
          }}>
            Klik op de knop om Claude je biometrische data te laten analyseren en een persoonlijk supplement plan te genereren.
          </p>
          <Button onClick={generate} disabled={loading}>
            {loading ? 'Analyseren...' : 'Genereer mijn advies'}
          </Button>
          {error && (
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 400,
              marginTop: 'var(--space-sm)',
              color: 'var(--error)',
            }}>
              {error}
            </p>
          )}
        </div>
      ) : (
        <div>
          {/* Samenvatting */}
          <section style={{ marginBottom: 'var(--space-xl)' }}>
            <Label>ANALYSE</Label>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              fontWeight: 400,
              marginTop: 'var(--space-sm)',
              color: 'var(--ink-2)',
              lineHeight: 1.6,
            }}>
              {result.summary}
            </p>
          </section>

          {/* Supplement kaarten */}
          <section style={{ marginBottom: 'var(--space-xl)' }}>
            <Label>AANBEVOLEN SUPPLEMENTEN</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'var(--space-sm)' }}>
              {result.supplements.map((s, i) => {
                const c = PRIORITY_COLOR[s.priority] || PRIORITY_COLOR.laag
                return (
                  <div key={i} style={{
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                      <span style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        fontSize: '15px',
                        color: 'var(--ink)',
                      }}>
                        {s.name}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: 'var(--ink-2)',
                      }}>
                        {s.dose}
                      </span>
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      fontWeight: 400,
                      margin: 0,
                      color: 'var(--ink-2)',
                      lineHeight: 1.5,
                    }}>
                      {s.reason}
                    </p>
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
                      <span style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: c.dot,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}>
                        {s.priority} prioriteit
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 400,
            color: 'var(--ink-3)',
            lineHeight: 1.5,
            marginBottom: 'var(--space-xl)',
          }}>
            Dit is geen medisch advies. Raadpleeg een arts of apotheker bij twijfel.
          </p>

          {result.generated_at && (
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 400,
              color: 'var(--ink-3)',
              marginBottom: 'var(--space-sm)',
            }}>
              Gegenereerd op {new Date(result.generated_at).toLocaleString('nl-NL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          <Button onClick={() => { localStorage.removeItem(ADVICE_KEY); setResult(null) }}>Opnieuw genereren</Button>
        </div>
      )}
    </div>
  )
}
