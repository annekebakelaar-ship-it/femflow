import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Label from '../../components/Label'

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

const WEARABLES = [
  {
    id: 'oura',
    name: 'Oura Ring',
    desc: 'HRV, slaap, temperatuur',
    connectUrl: `${BASE}/api/oura/connect`,
    pullUrl: `${BASE}/api/oura/pull`,
  },
  {
    id: 'whoop',
    name: 'Whoop',
    desc: 'HRV, herstel, slaap',
    connectUrl: `${BASE}/api/whoop/connect`,
    pullUrl: `${BASE}/api/whoop/pull`,
  },
  {
    id: 'garmin',
    name: 'Garmin',
    desc: 'Slaap, activiteit, HRV',
    connectUrl: `${BASE}/api/garmin/connect`,
    pullUrl: `${BASE}/api/garmin/pull`,
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    desc: 'Slaap, hartslag, activiteit',
    connectUrl: `${BASE}/api/fitbit/connect`,
    pullUrl: `${BASE}/api/fitbit/pull`,
  },
  {
    id: 'apple',
    name: 'Apple Health',
    desc: 'Binnenkort beschikbaar',
    comingSoon: true,
  },
]

export default function Connect() {
  const navigate = useNavigate()
  const [statuses, setStatuses] = useState({})
  const [pulling, setPulling] = useState(null)
  const [pulled, setPulled] = useState(null)   // id van wearable die net gepulled is
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('status') === 'success') {
      window.history.replaceState({}, '', '/connect')
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

  async function handlePull(w) {
    setPulling(w.id)
    setError('')
    try {
      const res = await fetch(w.pullUrl, { method: 'POST' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      sessionStorage.setItem('oura_pulled_data', JSON.stringify(data))
      setPulled(w.id)
    } catch {
      setError('Data ophalen mislukt. Probeer het opnieuw.')
    } finally {
      setPulling(null)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 'var(--space-lg) var(--container-padding)' }}>
      <h1 style={{
        fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, letterSpacing: '-0.5px',
        margin: '0 0 var(--space-sm)',
      }}>
        Wearables
      </h1>
      <p style={{
        fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5,
        color: 'var(--ink-2)',
        marginBottom: 'var(--space-xl)',
      }}>
        Koppel je wearable om je supplement advies up-to-date te houden.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {WEARABLES.map(w => {
          const connected = statuses[w.id]
          const isLoading = pulling === w.id
          const justPulled = pulled === w.id

          return (
            <div key={w.id} style={{
              padding: 'var(--space-md)',
              border: `1px solid ${connected ? 'rgba(79, 140, 90, 0.4)' : 'var(--border)'}`,
              borderRadius: '16px',
              background: connected ? 'rgba(79, 140, 90, 0.04)' : 'transparent',
              opacity: w.comingSoon ? 0.45 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: w.comingSoon ? 0 : '10px' }}>
                <div>
                  <span style={{ fontWeight: '600', fontFamily: 'var(--font-sans)', fontSize: '15px' }}>{w.name}</span>
                  <span style={{ marginLeft: '8px', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400', color: 'var(--ink-2)' }}>
                    {w.desc}
                  </span>
                </div>
                <span style={{
                  fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: w.comingSoon ? 'var(--ink-2)' : connected ? 'var(--success)' : 'var(--ink-2)',
                }}>
                  {w.comingSoon ? 'Binnenkort' : connected ? 'Verbonden' : 'Niet verbonden'}
                </span>
              </div>

              {!w.comingSoon && (
                <>
                  {justPulled && (
                    <p style={{ fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400', color: 'var(--success)', marginBottom: '8px' }}>
                      Data opgehaald — advies wordt bijgewerkt.
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!connected && (
                      <a href={w.connectUrl} style={{
                        flex: 1, display: 'block', textAlign: 'center',
                        padding: '9px', background: 'var(--ink)', color: 'var(--surface)',
                        borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '600',
                        textDecoration: 'none',
                      }}>
                        Koppel {w.name} →
                      </a>
                    )}
                    <button
                      onClick={() => handlePull(w)}
                      disabled={isLoading}
                      style={{
                        flex: 1, width: '100%', textAlign: 'center',
                        padding: '9px', background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '600',
                        cursor: isLoading ? 'default' : 'pointer',
                        color: 'var(--ink)',
                      }}
                    >
                      {isLoading ? 'Ophalen...' : 'Haal data op'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <p style={{ marginTop: 'var(--space-sm)', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400', color: 'var(--error)' }}>
          {error}
        </p>
      )}

      {pulled && (
        <button
          onClick={() => navigate('/advies')}
          style={{
            marginTop: 'var(--space-lg)',
            background: 'none', border: 'none', padding: 0,
            fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400', color: 'var(--ink)',
            cursor: 'pointer', textDecoration: 'underline',
          }}
        >
          Bekijk bijgewerkt supplement advies →
        </button>
      )}
    </div>
  )
}
