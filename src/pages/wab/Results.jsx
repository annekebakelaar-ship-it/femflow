import { useState, useEffect } from 'react'

const YOUCAPS_URL = 'https://app.youcaps.app/welkom/start'

const TIPS = {
  hrv: [
    'Reduce alcohol — even one drink measurably suppresses HRV overnight.',
    'Add 10 min of slow nasal breathing or box breathing before sleep.',
    'Prioritise consistent sleep timing — variability hurts HRV more than duration.',
    'Cold exposure (cold shower 2–3×/week) trains autonomic recovery.',
  ],
  rhr: [
    'Zone 2 cardio (3 × 30 min/week) lowers resting HR by 5–10 bpm in 8–12 weeks.',
    'Manage chronic stress — elevated cortisol keeps baseline HR elevated.',
    'Cut caffeine after 2 pm; it raises resting HR for up to 12 hours.',
    'Magnesium glycinate before bed supports parasympathetic tone.',
  ],
  sleep: [
    'Fix your wake time first — a consistent alarm trains your circadian clock faster than any other hack.',
    'Keep your bedroom below 19°C; deep sleep is highly temperature-sensitive.',
    'Avoid screens 60 min before bed or use blue-light blocking glasses.',
    'Resistance training (not cardio) significantly increases deep sleep proportion.',
  ],
}

// ─── Custom 3-D Radar Chart ───────────────────────────────────────────────────

function BiometricChart({ scoreBreakdown }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 120)
    return () => clearTimeout(t)
  }, [])

  const metrics = Object.values(scoreBreakdown)
  const n       = metrics.length
  const SIZE    = 280
  const cx      = SIZE / 2
  const cy      = SIZE / 2
  const MAX_R   = 90
  const RINGS   = [25, 50, 75, 100]

  // Equal-angle spokes, first metric at top (−90°)
  const angles = metrics.map((_, i) => ((i * 360) / n - 90) * (Math.PI / 180))

  function xy(angle, r) {
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  }

  const avgScore = metrics.reduce((s, m) => s + m.score_pct, 0) / n
  const color    = avgScore >= 65 ? 'var(--success)' : avgScore <= 38 ? 'var(--error)' : 'var(--ink)'
  const colorRGB = avgScore >= 65 ? '79,140,90' : avgScore <= 38 ? '192,73,45' : '42,33,28'

  const scorePoly = metrics.map((m, i) => {
    const r = (Math.min(100, Math.max(2, m.score_pct)) / 100) * MAX_R
    return xy(angles[i], r)
  })

  const ringPolys = RINGS.map(pct => {
    const r = (pct / 100) * MAX_R
    return angles.map(a => xy(a, r)).map(([x, y]) => `${x},${y}`).join(' ')
  })

  return (
    <div style={{ margin: '0 -4px', perspective: '640px', perspectiveOrigin: '50% 15%' }}>
      <div style={{ transform: 'rotateX(16deg)', transformOrigin: 'center 60%' }}>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width="100%"
          style={{ overflow: 'visible', filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.10))' }}
        >
          <defs>
            {/* Subtle surface base */}
            <radialGradient id="chartBg" cx="50%" cy="50%" r="55%">
              <stop offset="0%"   stopColor="var(--surface)" />
              <stop offset="100%" stopColor="var(--bg)" />
            </radialGradient>

            {/* Score fill gradient */}
            <radialGradient id="scoreFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={color} stopOpacity="0.04" />
              <stop offset="55%"  stopColor={color} stopOpacity="0.12" />
              <stop offset="100%" stopColor={color} stopOpacity="0.32" />
            </radialGradient>

            {/* Stroke glow */}
            <filter id="strokeGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Dot glow */}
            <filter id="dotGlow" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 100-ring highlight gradient */}
            <linearGradient id="outerRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#CCCCCC" />
              <stop offset="100%" stopColor="#DDDDDD" />
            </linearGradient>
          </defs>

          {/* ── Background disc ── */}
          <circle
            cx={cx} cy={cy} r={MAX_R + 18}
            fill="url(#chartBg)"
            stroke="var(--border-subtle)"
            strokeWidth={1}
          />

          {/* ── Grid rings ── */}
          {ringPolys.map((pts, i) => (
            <polygon
              key={RINGS[i]}
              points={pts}
              fill="none"
              stroke={RINGS[i] === 100 ? 'var(--border)' : 'var(--border-subtle)'}
              strokeWidth={RINGS[i] === 100 ? 1.5 : 0.7}
              strokeDasharray={RINGS[i] === 100 ? undefined : '3 4'}
              strokeLinejoin="round"
            />
          ))}

          {/* ── Ring labels (25 / 50 / 75) ── */}
          {[25, 50, 75].map(pct => {
            const r   = (pct / 100) * MAX_R
            const [lx, ly] = xy(angles[0], r)
            return (
              <text
                key={pct}
                x={lx + 4} y={ly - 3}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 11,
                  fill: 'var(--ink-3)',
                  letterSpacing: '0.08em',
                  fontWeight: 500,
                }}
              >
                {pct}
              </text>
            )
          })}

          {/* ── Spokes ── */}
          {angles.map((a, i) => {
            const [x, y] = xy(a, MAX_R)
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border-subtle)" strokeWidth={0.7} />
          })}

          {/* ── Score polygon ── */}
          <polygon
            points={scorePoly.map(([x, y]) => `${x},${y}`).join(' ')}
            fill="url(#scoreFill)"
            stroke={color}
            strokeWidth={2.2}
            strokeLinejoin="round"
            filter="url(#strokeGlow)"
            style={{
              opacity: show ? 1 : 0,
              transform: show ? 'scale(1)' : 'scale(0.05)',
              transformOrigin: `${cx}px ${cy}px`,
              transition: 'opacity 0.45s ease, transform 0.95s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />

          {/* ── Vertex halo + dot ── */}
          {scorePoly.map(([x, y], i) => (
            <g
              key={i}
              style={{
                opacity: show ? 1 : 0,
                transition: `opacity 0.4s ease ${0.5 + i * 0.07}s`,
              }}
            >
              <circle cx={x} cy={y} r={11} fill={color} fillOpacity={0.07} />
              <circle cx={x} cy={y} r={5}  fill={color} filter="url(#dotGlow)" />
              <circle cx={x} cy={y} r={2.5} fill="#FFFFFF" />
            </g>
          ))}

          {/* ── Axis labels + score values ── */}
          {metrics.map((m, i) => {
            const LR = MAX_R + 28
            const [lx, ly] = xy(angles[i], LR)
            const anchor   = lx < cx - 10 ? 'end' : lx > cx + 10 ? 'start' : 'middle'
            const short    = m.label === 'Resting Heart Rate' ? 'Resting HR'
                           : m.label === 'Heart Rate Variability' ? 'HRV'
                           : m.label
            return (
              <g
                key={i}
                style={{
                  opacity: show ? 1 : 0,
                  transition: `opacity 0.5s ease ${0.35 + i * 0.07}s`,
                }}
              >
                <text
                  x={lx} y={ly - 4}
                  textAnchor={anchor}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    fill: 'var(--ink-3)',
                    letterSpacing: '0.08em',
                    fontWeight: 500,
                  }}
                >
                  {short.toUpperCase()}
                </text>
                <text
                  x={lx} y={ly + 12}
                  textAnchor={anchor}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 20,
                    fontWeight: 600,
                    fill: color,
                    fontFeatureSettings: "'tnum'",
                  }}
                >
                  {Math.round(m.score_pct)}
                </text>
              </g>
            )
          })}

          {/* ── Center: avg score ── */}
          <circle cx={cx} cy={cy} r={28} fill="var(--surface)" />
          <circle cx={cx} cy={cy} r={28} fill="none" stroke={`rgba(${colorRGB},0.15)`} strokeWidth={1.5} />
          <text
            x={cx} y={cy - 6}
            textAnchor="middle"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fill: 'var(--ink-3)',
              letterSpacing: '0.08em',
              fontWeight: 500,
            }}
          >
            SCORE
          </text>
          <text
            x={cx} y={cy + 13}
            textAnchor="middle"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 20,
              fontWeight: 600,
              fill: color,
              fontFeatureSettings: "'tnum'",
            }}
          >
            {Math.round(avgScore)}
          </text>
        </svg>
      </div>

      {/* Ground shadow for 3-D depth illusion */}
      <div style={{
        height: 12,
        margin: '-6px 20px 0',
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />
    </div>
  )
}

// ─── Score row (unchanged) ─────────────────────────────────────────────────────

function ScoreRow({ label, value, benchmark, unit, delta, scorePct }) {
  const positive = delta <= 0
  return (
    <div style={{ paddingBottom: 'var(--space-sm)', paddingTop: 'var(--space-sm)', borderBottom: `1px solid var(--border-subtle)` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 400,
          color: 'var(--ink-2)',
        }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--ink)',
            fontFeatureSettings: "'tnum'",
          }}>{value}</span>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--ink-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>{unit}</span>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            color: positive ? 'var(--success)' : 'var(--error)',
            marginLeft: 4,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            {positive ? '↑ optimal' : '↓ low'}
          </span>
        </div>
      </div>
      <div style={{ height: 2, background: 'var(--border-subtle)', overflow: 'hidden', marginBottom: 6 }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, Math.max(4, scorePct))}%`,
          background: positive ? 'var(--success)' : 'var(--error)',
          transition: 'width 1s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 400,
          color: 'var(--ink-3)',
        }}>low</span>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 400,
          color: 'var(--ink-2)',
        }}>
          Peers avg: {benchmark} {unit}
        </span>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 400,
          color: 'var(--ink-3)',
        }}>optimal</span>
      </div>
    </div>
  )
}

// ─── Results page ──────────────────────────────────────────────────────────────

export default function Results({ result, onReset }) {
  const [email, setEmail] = useState('')

  const {
    wearable_age,
    chronological_age,
    age_delta,
    gap_years,
    percentile_label,
    primary_deficiency,
    score_breakdown,
  } = result

  const older   = age_delta > 0
  const neutral = age_delta === 0

  const TIP_KEY_MAP = { hrv: 'hrv', rhr: 'rhr', sleep: 'sleep' }
  const weakMetrics = Object.entries(score_breakdown)
    .filter(([, m]) => m.score_pct < 65)
    .sort(([, a], [, b]) => a.score_pct - b.score_pct)
    .slice(0, 2)
    .map(([key]) => key)

  const ctaText = neutral
    ? 'Your profile shows room for optimisation. YouCaps adapts your monthly formula to protect these metrics.'
    : older
    ? `Your biological data shows a ${gap_years}-year gap in ${primary_deficiency.split(' ').slice(0, 3).join(' ')}, accelerating cellular ageing. YouCaps adapts your formula live to restore these metrics.`
    : `Your biological profile is ${Math.abs(age_delta)} years ahead. YouCaps keeps you there with a monthly formula tuned to your exact biometrics.`

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--container-padding) var(--space-xxl)',
      animation: 'fade-slide-up 240ms ease both',
    }}>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <button
          onClick={onReset}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--ink-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          ← Recalculate
        </button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: '15px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ink)',
        }}>
          YOUCAPS
        </span>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--ink-3)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          Wearable Age
        </span>
      </nav>

      {/* Label */}
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '11px',
        fontWeight: 500,
        color: 'var(--ink-3)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 'var(--space-lg)',
        textAlign: 'center',
      }}>
        Your biological report
      </p>

      {/* Age comparison */}
      <section style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--ink-3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              Chronological
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(3.5rem, 14vw, 5rem)',
              fontWeight: 600,
              lineHeight: 1,
              color: 'var(--ink-3)',
              fontFeatureSettings: "'tnum'",
            }}>
              {chronological_age}
            </p>
          </div>

          <div style={{
            paddingBottom: 12,
            color: 'var(--border)',
            fontSize: 24,
            fontWeight: 400,
            fontFamily: 'var(--font-sans)',
          }}>vs</div>

          <div>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--ink-3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              Wearable Age
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(3.5rem, 14vw, 5rem)',
              fontWeight: 600,
              lineHeight: 1,
              color: neutral ? 'var(--ink-2)' : older ? 'var(--error)' : 'var(--success)',
              fontFeatureSettings: "'tnum'",
            }}>
              {wearable_age}
            </p>
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          border: `1px solid ${neutral ? 'var(--border)' : older ? 'var(--error)' : 'var(--success)'}`,
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-sm)',
        }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            color: neutral ? 'var(--ink-2)' : older ? 'var(--error)' : 'var(--success)',
            textTransform: 'uppercase',
          }}>
            {neutral ? 'At biological average' : older
              ? `+${age_delta} years biological age`
              : `${Math.abs(age_delta)} years younger biologically`
            }
          </span>
        </div>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 400,
          color: 'var(--ink-3)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {percentile_label}
        </p>
      </section>

      {/* Primary marker */}
      {!neutral && (
        <section style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{
            padding: 'var(--space-md)',
            border: `1px solid ${older ? 'rgba(192, 73, 45, 0.2)' : 'rgba(79, 140, 90, 0.2)'}`,
            background: older ? 'rgba(192, 73, 45, 0.04)' : 'rgba(79, 140, 90, 0.04)',
            borderRadius: 'var(--radius-md)',
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              color: older ? 'var(--error)' : 'var(--success)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              Primary marker
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--ink)',
            }}>
              {primary_deficiency}
            </p>
          </div>
        </section>
      )}

      {/* Score breakdown */}
      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--ink-3)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-md)',
        }}>
          Score Breakdown
        </p>

        <BiometricChart scoreBreakdown={score_breakdown} />

        <div style={{ marginTop: 'var(--space-lg)' }}>
          {Object.values(score_breakdown).map(m => (
            <ScoreRow
              key={m.label}
              label={m.label}
              value={m.value}
              benchmark={m.benchmark}
              unit={m.unit}
              delta={m.delta}
              scorePct={m.score_pct}
            />
          ))}
        </div>
      </section>

      {/* Actionable tips */}
      {weakMetrics.length > 0 && (
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--ink-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-sm)',
          }}>
            What to focus on
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {weakMetrics.map((key, i) => {
              const tips  = TIPS[TIP_KEY_MAP[key]] || []
              const shown = tips.slice(0, i === 0 ? 2 : 1)
              const label = score_breakdown[key]?.label || key
              return shown.map((tip, j) => (
                <div key={`${key}-${j}`} style={{
                  display: 'flex',
                  gap: 12,
                  padding: 'var(--space-sm) 0',
                  borderBottom: `1px solid var(--border-subtle)`,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--ink-3)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    paddingTop: 2,
                    minWidth: 60,
                  }}>
                    {j === 0 ? label : ''}
                  </span>
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: 'var(--ink-2)',
                    lineHeight: 1.55,
                  }}>
                    {tip}
                  </p>
                </div>
              ))
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{
          padding: 'var(--space-lg)',
          background: 'var(--ink)',
          color: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: 'var(--space-sm)',
          }}>
            Your personalised protocol
          </p>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 'var(--space-md)',
          }}>
            {ctaText}
          </p>

          {/* Email capture */}
          <div style={{ marginBottom: 'var(--space-sm)' }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com (optional)"
              style={{
                width: '100%',
                padding: '12px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 400,
                outline: 'none',
              }}
            />
          </div>

          <a
            href={(() => {
              const params = new URLSearchParams({
                wearable_age,
                chrono_age: chronological_age,
                delta: age_delta,
                hrv: score_breakdown.hrv.value,
                rhr: score_breakdown.rhr.value,
                sleep: score_breakdown.sleep.value,
                ...(email ? { email } : {}),
              })
              return `${YOUCAPS_URL}?${params}`
            })()}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              padding: '18px 24px',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              marginBottom: 'var(--space-sm)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            Generate my YouCaps formula <span style={{ fontSize: 14 }}>→</span>
          </a>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
          }}>
            Personalised monthly supplements · From €19/month
          </p>
        </div>
      </section>

      {/* Share */}
      <section style={{ textAlign: 'center' }}>
        <button
          onClick={() => {
            const text = `My Wearable Age is ${wearable_age} (chronological: ${chronological_age}). ${percentile_label}. Calculated via age-sync.youcaps.app`
            if (navigator.share) {
              navigator.share({ text, url: window.location.href })
            } else {
              navigator.clipboard.writeText(text)
              alert('Result copied to clipboard.')
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--ink-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Share result ↗
        </button>
      </section>
    </div>
  )
}
