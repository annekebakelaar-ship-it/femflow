import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import StepIndicator from '../../components/StepIndicator'
import Input from '../../components/Input'
import Button from '../../components/Button'

export default function SubscribeStep() {
  const [form, setForm] = useState({ name: '', street: '', number: '', postal: '', city: '' })
  const [loading, setLoading] = useState(false)
  const { dispatch } = useApp()
  const navigate = useNavigate()

  const valid = form.name && form.street && form.number && form.postal && form.city

  function update(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!valid) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    dispatch({ type: 'SET_SUBSCRIPTION', payload: 'active' })
    navigate('/dashboard')
  }

  return (
    <div>
      <StepIndicator current={4} total={4} />
      <h1 style={{ fontSize: ''26px'', fontWeight: '600', letterSpacing: '-1px', marginBottom: 'var(--space-md)' }}>Abonnement starten</h1>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Prijs</span><span style={{ fontWeight: '500' }}>â‚¬29 per maand</span>
        </div>
        <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Levering</span><span style={{ color: 'var(--ink-2)' }}>Binnen 3-5 werkdagen</span>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <Input placeholder="Naam" value={form.name} onChange={update('name')} />
          <Input placeholder="Straat" value={form.street} onChange={update('street')} />
          <Input placeholder="Huisnummer" value={form.number} onChange={update('number')} />
          <Input placeholder="Postcode" value={form.postal} onChange={update('postal')} />
          <Input placeholder="Plaats" value={form.city} onChange={update('city')} />
        </div>
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <Button type="submit" disabled={!valid || loading}>{loading ? 'Verwerken...' : 'Bevestig abonnement'}</Button>
        </div>
      </form>
    </div>
  )
}

