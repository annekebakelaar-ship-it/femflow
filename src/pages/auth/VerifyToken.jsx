import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

export default function VerifyToken() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { dispatch } = useApp()
  const [error, setError] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) { setError(true); return }

    fetch(`${BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ access_token }) => {
        localStorage.setItem('youcaps_token', access_token)

        // Haal gebruikersinfo op en sla op in app state
        return fetch(`${BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${access_token}` },
        }).then(r => r.json())
      })
      .then(user => {
        dispatch({ type: 'SET_USER', payload: { email: user.email } })
        localStorage.setItem('youcaps_email', user.email)
        localStorage.setItem('youcaps_paid', 'true')
        navigate('/dashboard', { replace: true })
      })
      .catch(() => setError(true))
  }, [])

  if (error) {
    return (
      <div style={{
        maxWidth: '400px', margin: '0 auto',
        padding: 'var(--space-xl) var(--container-padding)',
        minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, letterSpacing: '-0.5px', marginBottom: '8px' }}>
          Link verlopen
        </h1>
        <p style={{ color: 'var(--ink-2)', fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5, marginBottom: 'var(--space-xl)' }}>
          Deze inloglink is verlopen of al gebruikt. Vraag een nieuwe aan.
        </p>
        <button
          onClick={() => navigate('/signin')}
          style={{
            background: 'var(--ink)', color: 'var(--surface)', border: 'none',
            borderRadius: '16px', padding: '14px', fontSize: '15px',
            fontFamily: 'var(--font-sans)', fontWeight: '600', cursor: 'pointer',
          }}
        >
          Nieuwe link aanvragen
        </button>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '400px', margin: '0 auto',
      padding: 'var(--space-xl) var(--container-padding)',
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <p style={{ color: 'var(--ink-2)', fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5 }}>
        Inloggen...
      </p>
    </div>
  )
}
