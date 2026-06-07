import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { pauseSubscription, cancelSubscription } from '../../api/mockApi'
import Button from '../../components/Button'
import Label from '../../components/Label'

export default function Subscription() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handlePause() {
    setLoading(true)
    await pauseSubscription()
    dispatch({ type: 'SET_SUBSCRIPTION', payload: 'paused' })
    setLoading(false)
  }

  async function handleCancel() {
    setLoading(true)
    await cancelSubscription()
    dispatch({ type: 'LOGOUT' })
    navigate('/signin')
  }

  if (confirming) {
    return (
      <div>
        <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, letterSpacing: '-0.5px', marginBottom: 'var(--space-md)' }}>Weet je het zeker?</h1>
        <p style={{ color: 'var(--ink-2)', fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5, marginBottom: 'var(--space-xl)' }}>Je abonnement wordt per direct stopgezet. Je verliest toegang tot je formule.</p>
        <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
          <Button onClick={handleCancel} disabled={loading}>{loading ? 'Verwerken...' : 'Ja, opzeggen'}</Button>
          <Button onClick={() => setConfirming(false)}>Nee, terug</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, letterSpacing: '-0.5px', marginBottom: 'var(--space-xl)' }}>Abonnement</h1>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <Label>Status</Label>
        <p style={{ marginTop: '4px' }}>{state.subscriptionStatus === 'paused' ? 'Gepauzeerd' : 'Actief'}</p>
      </div>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <Label>Prijs</Label>
        <p style={{ marginTop: '4px' }}>€29 per maand</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div><Button onClick={handlePause} disabled={loading || state.subscriptionStatus === 'paused'}>Pauzeer een maand</Button></div>
        <div><Button onClick={() => setConfirming(true)}>Opzeggen</Button></div>
      </div>
    </div>
  )
}
