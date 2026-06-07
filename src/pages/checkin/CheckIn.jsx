import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Button from '../../components/Button'
import Input from '../../components/Input'

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

const Q = [
  { id: 'energy', q: 'Hoe is je energie vergeleken met vorige maand?', opts: ['slechter', 'gelijk', 'beter'] },
  { id: 'sleep', q: 'Hoe slaap je?', opts: ['slecht', 'matig', 'goed'] },
  { id: 'stress', q: 'Hoe is je stressniveau?', opts: ['hoog', 'gemiddeld', 'laag'] },
  { id: 'sideEffects', q: 'Heb je bijwerkingen ervaren?', opts: ['ja', 'nee'] },
  { id: 'changeGoal', q: 'Wil je je doel aanpassen?', opts: ['ja', 'nee'] },
]

function OptionPicker({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0' }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} style={{
          background: 'none', border: 'none', borderBottom: value === opt ? `2px solid var(--ink)` : '2px solid transparent',
          padding: '8px 16px', fontSize: '15px', fontFamily: 'var(--font-sans)',
          fontWeight: value === opt ? '600' : '400',
          color: value === opt ? 'var(--ink)' : 'var(--ink-2)', cursor: 'pointer',
        }}>
          {opt}
        </button>
      ))}
    </div>
  )
}

export default function CheckIn() {
  const [answers, setAnswers] = useState({})
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { dispatch } = useApp()
  const navigate = useNavigate()

  const allAnswered = Q.every(q => answers[q.id])

  async function handleSubmit() {
    if (!allAnswered) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BASE}/api/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answers, details }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      dispatch({ type: 'SET_CHECKIN', payload: new Date().toISOString() })
      navigate('/dashboard')
    } catch {
      setError('Versturen mislukt. Probeer het opnieuw.')
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, letterSpacing: '-0.5px', marginBottom: 'var(--space-xl)' }}>Hoe ging het deze maand?</h1>
      {Q.map(q => (
        <div key={q.id} style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5, marginBottom: '8px' }}>{q.q}</div>
          <OptionPicker options={q.opts} value={answers[q.id]} onChange={v => setAnswers(a => ({ ...a, [q.id]: v }))} />
        </div>
      ))}
      {answers.sideEffects === 'ja' && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <Input textarea placeholder="Beschrijf je bijwerkingen" value={details} onChange={e => setDetails(e.target.value)} />
        </div>
      )}
      <Button onClick={handleSubmit} disabled={!allAnswered || loading}>{loading ? 'Versturen...' : 'Verstuur check-in'}</Button>
      {error && <p style={{ marginTop: 'var(--space-sm)', color: 'var(--error)', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400' }}>{error}</p>}
    </div>
  )
}
