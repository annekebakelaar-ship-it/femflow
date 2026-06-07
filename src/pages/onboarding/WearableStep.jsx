import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingShell from './OnboardingShell'

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

const WEARABLES = [
  { id: 'oura',   name: 'Oura Ring', desc: 'HRV Â· Slaap Â· Temperatuur', connectUrl: `${BASE}/api/oura/connect`,  pullUrl: `${BASE}/api/oura/pull` },
  { id: 'whoop',  name: 'Whoop',     desc: 'HRV Â· Herstel Â· Slaap',     connectUrl: `${BASE}/api/whoop/connect`, pullUrl: `${BASE}/api/whoop/pull` },
  { id: 'garmin', name: 'Garmin',    desc: 'Slaap Â· Activiteit Â· HRV',  connectUrl: `${BASE}/api/garmin/connect`,pullUrl: `${BASE}/api/garmin/pull` },
  { id: 'fitbit', name: 'Fitbit',    desc: 'Slaap Â· Hartslag Â· Stappen',connectUrl: `${BASE}/api/fitbit/connect`,pullUrl: `${BASE}/api/fitbit/pull` },
]

export default function WearableStep() {
  const navigate = useNavigate()
  const [statuses, setStatuses] = useState({})
  const [pulling, setPulling] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // Als er al data is, direct doorgaan
    if (sessionStorage.getItem('oura_pulled_data')) {
      navigate('/welkom/toestemming', { replace: true })
      return
    }
    fetch(`${BASE}/api/wearable/status`)
      .then(r => r.json())
      .then(data => {
        const map = {}
        data.wearables?.forEach(w => { map[w.id] = w.connected })
        setStatuses(map)
      })
      .catch(() => {})
  }, [])

  async function handleConnect(wearable) {
    setPulling(wearable.id)
    setError('')
    try {
      const res = await fetch(wearable.pullUrl, { method: 'POST' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      sessionStorage.setItem('oura_pulled_data', JSON.stringify(data))
      localStorage.removeItem('youcaps_advice')
      navigate('/welkom/toestemming')
    } catch {
      setError('Verbinding mislukt. Probeer het opnieuw.')
      setPulling(null)
    }
  }

  return (
    <OnboardingShell step={2}>
      <h1 style={{
        fontSize: ''26px'',
        fontWeight: '600',
        letterSpacing: '-1px', lineHeight: 1.1,
        marginBottom: 'var(--space-sm)',
      }}>
        Koppel je wearable.
      </h1>
      <p style={{
        fontSize: ''15px'',
        color: 'var(--ink-2)',
        lineHeight: 1.6,
        marginBottom: 'var(--space-xl)',
      }}>
        We lezen je slaap, HRV en activiteit om je formule samen te stellen.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: 'var(--space-lg)' }}>
        {WEARABLES.map(w => {
          const isLoading = pulling === w.id
          const connected = statuses[w.id]
          return (
            <button
              key={w.id}
              onClick={() => handleConnect(w)}
              disabled={!!pulling}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px var(--space-md)',
                border: `1px solid ${connected ? 'rgba(46,125,50,0.4)' : 'var(--border)'}`,
                borderRadius: '14px',
                background: connected ? 'rgba(46,125,50,0.04)' : 'white',
                cursor: pulling ? 'default' : 'pointer',
                textAlign: 'left',
                opacity: pulling && !isLoading ? 0.5 : 1,
              }}
            >
              <div>
                <div style={{ fontWeight: '500', fontSize: ''15px'', marginBottom: '2px' }}>
                  {w.name}
                </div>
                <div style={{ fontSize: ''13px'', color: 'var(--ink-2)' }}>
                  {w.desc}
                </div>
              </div>
              <span style={{
                fontSize: ''13px'',
                color: isLoading ? 'var(--ink-2)' : connected ? '#2e7d32' : 'var(--ink)',
                flexShrink: 0,
                marginLeft: '12px',
              }}>
                {isLoading ? 'Laden...' : connected ? 'Verbonden â†’' : 'Verbind â†’'}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <p style={{ fontSize: ''13px'', color: '#c62828', marginBottom: 'var(--space-sm)' }}>
          {error}
        </p>
      )}

      <button
        onClick={() => navigate('/welkom/toestemming')}
        disabled={!!pulling}
        style={{
          background: 'none', border: 'none', padding: '8px 0',
          fontSize: ''13px'', color: 'var(--ink-3)',
          cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px',
        }}
      >
        Ik heb nog geen wearable â€” doorgaan zonder
      </button>
    </OnboardingShell>
  )
}

