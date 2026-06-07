import { useState } from 'react'

const BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/^﻿/, '').replace(/\/$/, '')
  : 'https://wearable-age-api.onrender.com'

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Mostly desk work, little exercise' },
  { value: 'moderate',  label: 'Moderate',  desc: '2–3 workouts per week' },
  { value: 'active',    label: 'Active',    desc: '4–5 workouts per week' },
  { value: 'athlete',   label: 'Athlete',   desc: 'Daily training or sport' },
]

const inputStyle = {
  width: '100%',
  border: 'none',
  borderBottom: '1px solid var(--color-border)',
  borderRadius: 0,
  outline: 'none',
  padding: '10px 0',
  fontSize: 'var(--font-size-body)',
  color: 'var(--color-text)',
  background: 'transparent',
  transition: 'border-color var(--transition-fast)',
}

export default function QuickForm({ biometrics, onResult, onBack }) {
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('')
  const [activity, setActivity] = useState(biometrics?.activity_level || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCalculate() {
    if (!age || !sex || !activity) { setError('Please complete all fields.'); return }
    const ageNum = parseInt(age)
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 99) { setError('Please enter a valid age (18–99).'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BASE}/api/age/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chronological_age: ageNum,
          sex,
          activity_level: activity,
          hrv_avg:        biometrics.hrv_avg,
          rhr_avg:        biometrics.rhr_avg,
          deep_sleep_avg: biometrics.deep_sleep_avg,
        }),
      })
      if (!res.ok) throw new Error()
      onResult(await res.json())
    } catch {
      setError('Calculation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={onBack}
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
        maxHeight: '92vh',
        overflowY: 'auto',
      }}>
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)',
            color: 'var(--color-label)', letterSpacing: '.4px',
            textTransform: 'uppercase', marginBottom: 6,
          }}>
            Step 2 of 2
          </p>
          <h2 style={{ fontSize: 'var(--font-size-heading)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: '-0.5px' }}>
            About you
          </h2>
          {biometrics?.provider && biometrics.provider !== 'manual' && (
            <p style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-positive)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              ✓ {biometrics.provider.charAt(0).toUpperCase() + biometrics.provider.slice(1)} data synced
            </p>
          )}
        </div>

        {/* Leeftijd */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <label style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)', display: 'block', marginBottom: 4 }}>
            Chronological age
          </label>
          <input
            type="number"
            value={age}
            onChange={e => { setAge(e.target.value); setError('') }}
            placeholder="34"
            min="18" max="99"
            style={inputStyle}
          />
        </div>

        {/* Geslacht */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <label style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)', display: 'block', marginBottom: 8 }}>
            Biological sex
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {['male', 'female', 'other'].map(s => (
              <button
                key={s}
                onClick={() => { setSex(s); setError('') }}
                style={{
                  padding: '12px 8px',
                  border: sex === s ? '1px solid var(--color-text)' : '1px solid var(--color-border)',
                  borderRadius: 0,
                  background: sex === s ? 'var(--color-text)' : 'transparent',
                  color: sex === s ? 'white' : 'var(--color-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-size-micro)',
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {s === 'male' ? 'Male' : s === 'female' ? 'Female' : 'Other'}
              </button>
            ))}
          </div>
        </div>

        {/* Activiteit */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <label style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)', display: 'block', marginBottom: 8 }}>
            Activity level
          </label>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ACTIVITY_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => { setActivity(o.value); setError('') }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 0',
                  background: 'none', border: 'none',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  cursor: 'pointer',
                  transition: 'opacity var(--transition-fast)',
                  opacity: activity && activity !== o.value ? 0.4 : 1,
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 'var(--font-size-small)', fontWeight: activity === o.value ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)' }}>
                    {o.label}
                  </p>
                  <p style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-label)', fontFamily: 'var(--font-mono)' }}>{o.desc}</p>
                </div>
                {activity === o.value && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)', color: 'var(--color-text)' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-negative)', marginBottom: 'var(--space-sm)' }}>{error}</p>
        )}

        <button
          onClick={handleCalculate}
          disabled={loading}
          style={{
            width: '100%', padding: '18px 24px',
            background: 'var(--color-text)', color: 'white',
            border: 'none', borderRadius: 0,
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            fontWeight: 500, letterSpacing: '.18em', textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            marginBottom: 'var(--space-sm)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          {loading ? 'Calculating…' : 'Calculate my wearable age'} <span style={{ fontSize: '14px' }}>→</span>
        </button>

        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', padding: 0,
            fontSize: 'var(--font-size-small)', color: 'var(--color-label)',
            cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px',
          }}
        >
          ← Back
        </button>
      </div>
    </div>
  )
}
