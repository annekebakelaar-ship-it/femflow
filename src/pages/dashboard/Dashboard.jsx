import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer,
  Tooltip, ReferenceLine,
} from 'recharts'
import { getReadings, pullOuraData, getOuraStatus, requestOuraConnect, clearToken, seedSynthData, checkConsent, giveConsent } from '../../api/client'
import TrendsSection from '../../components/TrendsSection'
import SupplementsSection from '../../components/SupplementsSection'
import ConsentModal from '../../components/ConsentModal'

const METRICS = [
  { metricKey: 'hrv_ms',         label: 'HRV',        unit: 'ms',  color: 'var(--d-ink)', goodHigh: true  },
  { metricKey: 'rhr_bpm',        label: 'Resting HR',  unit: 'bpm', color: 'var(--error)', goodHigh: false },
  { metricKey: 'deep_sleep_min', label: 'Deep Sleep',  unit: 'min', color: 'var(--success)', goodHigh: true  },
]

function shortDate(iso) {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

function MiniChart({ data, metricKey, label, unit, color }) {
  const rawValues = data.map(d => d[metricKey])
  const values = rawValues.filter(v => v != null && v !== undefined && !isNaN(v))
  if (!values.length) return (
    <div style={{
      marginBottom: 'var(--space-lg)',
      padding: 'var(--space-md)',
      background: 'var(--d-card)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
      border: 'none',
      borderRadius: '22px',
    }}>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '11px',
        fontWeight: 500,
        color: 'var(--d-ink)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}>{label}</p>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: 400,
        color: 'var(--d-ink)',
      }}>
        No data yet {data.length > 0 ? `(${data.length} readings, filtered=${values.length})` : '(0 readings)'}
      </p>
    </div>
  )

  const avg  = values.reduce((s, v) => s + v, 0) / values.length
  const last = values[values.length - 1]

  return (
    <div style={{
      marginBottom: 'var(--space-lg)',
      padding: 'var(--space-md)',
      background: 'var(--d-card)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09), inset 0 0 30px rgba(199, 154, 110, 0.08)',
      border: 'none',
      borderRadius: '22px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--d-ink)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {label}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '20px',
            fontWeight: 600,
            color,
            fontFeatureSettings: "'tnum'",
          }}>
            {Math.round(last)}
          </span>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            color: 'var(--d-ink-3)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>{unit}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -20 }}>
          <XAxis dataKey="date" tickFormatter={shortDate} tick={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fill: 'var(--d-ink-3)',
            fontWeight: 500,
            letterSpacing: '0.08em',
          }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
          <YAxis domain={['auto', 'auto']} tick={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fill: 'var(--d-ink-3)',
            fontWeight: 500,
          }} width={40} />
          <Tooltip
            contentStyle={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              border: 'none',
              borderRadius: '12px',
              background: 'var(--d-card)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09), inset 0 0 20px rgba(199, 154, 110, 0.08)',
              color: 'var(--d-ink)',
            }}
            labelFormatter={shortDate}
            formatter={v => [`${Math.round(v)} ${unit}`, label]}
          />
          <ReferenceLine y={avg} stroke="var(--border-subtle)" strokeDasharray="3 3" />
          <Line
            type="monotone" dataKey={metricKey}
            stroke={color} strokeWidth={2.5}
            dot={false} connectNulls={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '11px',
        fontWeight: 500,
        color: 'var(--d-ink-3)',
        marginTop: 6,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        Avg {Math.round(avg)} {unit} · {values.length} days
      </p>
    </div>
  )
}

export default function Dashboard({ user, onBack, onLogout, onAccount }) {
  const [readings, setReadings]         = useState([])
  const [ouraConnected, setOuraConnected] = useState(false)
  const [pulling, setPulling]           = useState(false)
  const [seeding, setSeeding]           = useState(false)
  const [scenario, setScenario]         = useState('stable')
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [showConsentModal, setShowConsentModal] = useState(false)

  useEffect(() => {
    Promise.all([
      getReadings(90).then(setReadings).catch(e => setError(`Readings error: ${e.message}`)),
      getOuraStatus().then(s => setOuraConnected(s.connected)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  async function handleConnectOura() {
    try {
      // Check if user has consent first
      const hasConsent = await checkConsent('1.0', ['store', 'reformulate']).catch(() => false)
      if (!hasConsent) {
        setShowConsentModal(true)
        return
      }

      // User has consent, proceed with OAuth
      const { connect_url } = await requestOuraConnect()
      window.location.href = connect_url
    } catch {
      setError('Could not start Oura connection.')
    }
  }

  async function onConsentGiven() {
    // Consent eerst vastleggen, anders blijft checkConsent false en
    // verschijnt de modal in een oneindige lus
    await giveConsent('1.0', ['store', 'reformulate'])
    setShowConsentModal(false)
    handleConnectOura()  // Now proceed with OAuth
  }

  async function handlePull() {
    setPulling(true)
    setError('')
    try {
      await pullOuraData()
      const fresh = await getReadings(90)
      setReadings(fresh)
    } catch {
      setError('Could not fetch Oura data.')
    } finally {
      setPulling(false)
    }
  }

  async function handleSeed() {
    setSeeding(true)
    setError('')
    try {
      await seedSynthData(90, scenario)
      // Wait a moment for DB to flush, then fetch fresh data
      await new Promise(r => setTimeout(r, 500))
      const fresh = await getReadings(90)
      setReadings([...fresh])  // Force re-render with new array reference
    } catch (e) {
      setError(`Could not generate demo data: ${e.message}`)
    } finally {
      setSeeding(false)
    }
  }

  function handleLogout() {
    clearToken()
    onLogout?.()
  }

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--container-padding) var(--space-xxl)',
      animation: 'fade-slide-up 240ms ease both',
      background: 'var(--d-page)',
    }}>

      {/* Consent Modal */}
      {showConsentModal && (
        <ConsentModal
          onAccept={onConsentGiven}
          onReject={() => setShowConsentModal(false)}
        />
      )}

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <button onClick={onBack} style={{
          background: 'none',
          border: 'none',
          padding: 0,
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--d-ink-3)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}>
          ← Back
        </button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: '15px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--d-ink)',
        }}>YOUCAPS</span>
        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          <button onClick={onAccount} style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--d-ink-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
            Account
          </button>
          <button onClick={handleLogout} style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--d-ink-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
            Sign out
          </button>
        </div>
      </nav>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '11px',
        fontWeight: 500,
        color: 'var(--d-ink-3)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 'var(--space-sm)',
      }}>
        Biomarker History
      </p>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '20px',
        fontWeight: 500,
        lineHeight: 1.25,
        letterSpacing: '-0.5px',
        marginBottom: 'var(--space-xs)',
        color: 'var(--d-ink)',
      }}>
        {user?.email || 'Your data'}
      </h2>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: 400,
        color: 'var(--d-ink-2)',
        marginBottom: 'var(--space-xl)',
      }}>
        Last 90 days · {readings.length} readings stored
      </p>

      {/* Oura connection */}
      <div style={{
        marginBottom: 'var(--space-xl)',
        padding: 'var(--space-md)',
        background: 'var(--d-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09), inset 0 0 30px rgba(199, 154, 110, 0.08)',
        border: 'none',
        borderRadius: '22px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: 2,
              color: 'var(--d-ink)',
            }}>Oura Ring</p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              color: ouraConnected ? 'var(--success)' : 'var(--d-ink-3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {ouraConnected ? '✓ Connected' : 'Not connected'}
            </p>
          </div>
          {ouraConnected ? (
            <button
              onClick={handlePull}
              disabled={pulling}
              style={{
                padding: '10px 20px',
                background: 'rgba(199, 154, 110, 0.15)',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--d-accent)',
                borderRadius: '22px',
                cursor: pulling ? 'not-allowed' : 'pointer',
                opacity: pulling ? 0.5 : 1,
              }}
            >
              {pulling ? 'Syncing…' : 'Sync now'}
            </button>
          ) : (
            <button
              onClick={handleConnectOura}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'var(--d-ink)',
                color: 'var(--d-card)',
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderRadius: '22px',
                cursor: 'pointer',
              }}
            >
              Connect →
            </button>
          )}
        </div>
      </div>

      {/* Synthetic data */}
      <div style={{
        marginBottom: 'var(--space-xl)',
        padding: 'var(--space-md)',
        background: 'var(--d-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09), inset 0 0 30px rgba(199, 154, 110, 0.08)',
        border: 'none',
        borderRadius: '22px',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 500,
          marginBottom: 4,
          color: 'var(--d-ink)',
        }}>Demo data</p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 400,
          color: 'var(--d-ink-3)',
          marginBottom: 'var(--space-sm)',
          lineHeight: 1.5,
        }}>
          Generate 90 days of realistic synthetic data — no Oura required.
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={scenario}
            onChange={e => setScenario(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              background: 'var(--d-card)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 400,
              color: 'var(--d-ink)',
              letterSpacing: '0.08em',
              outline: 'none',
              borderRadius: '22px',
            }}
          >
            <option value="stable">Stable</option>
            <option value="declining">Declining</option>
            <option value="recovering">Recovering</option>
            <option value="dip">Dip (illness/stress)</option>
          </select>
          <button
            onClick={handleSeed}
            disabled={seeding}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'var(--d-ink)',
              color: 'var(--d-card)',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderRadius: '22px',
              cursor: seeding ? 'not-allowed' : 'pointer',
              opacity: seeding ? 0.5 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {seeding ? 'Generating…' : 'Generate →'}
          </button>
        </div>
      </div>

      {error && (
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 400,
          color: 'var(--error)',
          marginBottom: 'var(--space-md)',
        }}>{error}</p>
      )}

      {loading ? (
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 400,
          color: 'var(--d-ink-3)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>Loading…</p>
      ) : readings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-xxl) 0' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 400,
            color: 'var(--d-ink-2)',
            marginBottom: 'var(--space-sm)',
          }}>No readings yet.</p>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 400,
            color: 'var(--d-ink-3)',
            lineHeight: 1.5,
          }}>
            Connect your Oura Ring or use the calculator to generate your first reading.
          </p>
        </div>
      ) : (
        <div>
          {METRICS.map(m => (
            <MiniChart key={m.key} data={readings} {...m} />
          ))}
          <TrendsSection />
          <SupplementsSection />
        </div>
      )}
    </div>
  )
}
