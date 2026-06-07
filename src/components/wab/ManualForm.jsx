import { useState } from 'react'

const fields = [
  { key: 'hrv_avg',        label: 'Heart Rate Variability', unit: 'ms',      placeholder: '45', hint: '14-day average. Found in Oura / Garmin app.', min: 5,  max: 250 },
  { key: 'rhr_avg',        label: 'Resting Heart Rate',     unit: 'bpm',     placeholder: '62', hint: '14-day average resting HR.',                   min: 25, max: 120 },
  { key: 'deep_sleep_avg', label: 'Deep Sleep',             unit: 'min/night',placeholder: '72', hint: 'Average nightly deep sleep over 14 days.',    min: 0,  max: 240 },
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

export default function ManualForm({ onData, onBack }) {
  const [values, setValues] = useState({ hrv_avg: '', rhr_avg: '', deep_sleep_avg: '' })
  const [error, setError] = useState('')

  function set(key, val) {
    setValues(v => ({ ...v, [key]: val }))
    setError('')
  }

  function handleSubmit() {
    for (const f of fields) {
      const n = parseFloat(values[f.key])
      if (isNaN(n) || n < f.min || n > f.max) {
        setError(`Please enter a valid ${f.label}.`)
        return
      }
    }
    onData({
      provider: 'manual',
      hrv_avg:        parseFloat(values.hrv_avg),
      rhr_avg:        parseFloat(values.rhr_avg),
      deep_sleep_avg: parseFloat(values.deep_sleep_avg),
    })
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
        paddingBottom: 'var(--space-xl)',
        animation: 'fade-slide-up 240ms ease both',
        borderTop: '1px solid var(--color-border)',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)',
            color: 'var(--color-label)', letterSpacing: '.4px',
            textTransform: 'uppercase', marginBottom: 6,
          }}>
            Manual entry
          </p>
          <h2 style={{ fontSize: 'var(--font-size-heading)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: '-0.5px' }}>
            Enter your metrics
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          {fields.map(f => (
            <div key={f.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <label style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)' }}>{f.label}</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)', color: 'var(--color-label)' }}>{f.unit}</span>
              </div>
              <input
                type="number"
                value={values[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                style={inputStyle}
              />
              <p style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-label)', marginTop: 4 }}>{f.hint}</p>
            </div>
          ))}
        </div>

        {error && (
          <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-negative)', marginBottom: 'var(--space-sm)' }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          style={{
            width: '100%', padding: '18px 24px',
            background: 'var(--color-text)', color: 'white',
            border: 'none', borderRadius: 0,
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            fontWeight: 500, letterSpacing: '.18em', textTransform: 'uppercase',
            cursor: 'pointer', marginBottom: 'var(--space-sm)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          Continue <span style={{ fontSize: '14px' }}>→</span>
        </button>

        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', padding: 0,
            fontSize: 'var(--font-size-small)', color: 'var(--color-label)',
            cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px',
          }}
        >
          ← Back to wearable connect
        </button>
      </div>
    </div>
  )
}
