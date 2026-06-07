import { useState } from 'react'

const BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/^﻿/, '').replace(/\/$/, '')
  : 'https://wearable-age-api.onrender.com'

const PROVIDERS = [
  { id: 'oura',   name: 'Oura Ring', desc: 'HRV · Sleep · Readiness' },
  { id: 'garmin', name: 'Garmin',    desc: 'HRV · Resting HR · Activity' },
  { id: 'fitbit', name: 'Fitbit',    desc: 'Sleep · Heart Rate · Steps' },
  { id: 'phone',  name: 'Phone health app', desc: 'Apple Health · Google Fit — coming soon', disabled: true },
]

const PROFILES = [
  { id: 'average', label: 'Average' },
  { id: 'optimal', label: 'Optimal' },
  { id: 'poor',    label: 'Poor' },
]

export default function ConnectModal({ onData, onManual, onClose }) {
  const [loading, setLoading] = useState(null)
  const [error, setError]     = useState('')
  const [profile, setProfile] = useState('average')

  async function handleConnect(provider) {
    setLoading(provider)
    setError('')
    try {
      const res = await fetch(`${BASE}/api/age/mock/${provider}?profile=${profile}`)
      if (!res.ok) throw new Error()
      onData(await res.json())
    } catch {
      setError('Could not fetch data. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 'var(--container-max)',
        background: 'var(--color-bg)',
        padding: 'var(--space-lg) var(--container-padding)',
        paddingBottom: 'calc(var(--space-xl) + env(safe-area-inset-bottom, 0px))',
        animation: 'fade-slide-up 240ms ease both',
        borderTop: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)',
              color: 'var(--color-label)', letterSpacing: '.4px',
              textTransform: 'uppercase', marginBottom: 6,
            }}>
              Step 1 of 2
            </p>
            <h2 style={{ fontSize: 'var(--font-size-heading)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: '-0.5px' }}>
              Connect your wearable
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--color-label)', fontSize: 18, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Demo profile selector */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-label)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Demo profile
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {PROFILES.map(p => (
              <button
                key={p.id}
                onClick={() => setProfile(p.id)}
                style={{
                  flex: 1, padding: '8px 4px',
                  border: profile === p.id ? '1px solid var(--color-text)' : '1px solid var(--color-border)',
                  background: profile === p.id ? 'var(--color-text)' : 'transparent',
                  color: profile === p.id ? 'white' : 'var(--color-secondary)',
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  letterSpacing: '.1em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all var(--transition-fast)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => !p.disabled && handleConnect(p.id)}
              disabled={!!loading || p.disabled}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 0',
                background: 'none', border: 'none',
                borderBottom: '1px solid var(--color-border-subtle)',
                cursor: p.disabled ? 'default' : loading ? 'not-allowed' : 'pointer',
                opacity: p.disabled ? 0.35 : loading && loading !== p.id ? 0.4 : 1,
                transition: 'opacity var(--transition-fast)',
                width: '100%',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-medium)', marginBottom: 2 }}>{p.name}</p>
                <p style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)', letterSpacing: '.1em' }}>{p.desc}</p>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)', color: 'var(--color-label)' }}>
                {p.disabled ? 'soon' : loading === p.id ? 'Syncing…' : '→'}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-negative)', marginBottom: 'var(--space-sm)' }}>{error}</p>
        )}

        <button
          onClick={onManual}
          style={{
            background: 'none', border: 'none', padding: 0,
            fontSize: 'var(--font-size-small)', color: 'var(--color-label)',
            cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px',
          }}
        >
          No wearable? Answer 5 quick questions →
        </button>
      </div>
    </div>
  )
}
