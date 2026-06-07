import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, getMe } from '../../api/client'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email en wachtwoord zijn verplicht')
      return
    }

    setLoading(true)
    try {
      // Login
      await login({ email, password })

      // Verify login & get user
      await getMe()

      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--container-padding) var(--space-xxl)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fade-slide-up 240ms ease both',
    }}>

      <div style={{ maxWidth: '500px', width: '100%' }}>

        <h1 style={{
          fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, letterSpacing: '-0.5px',
          marginBottom: 'var(--space-lg)',
          textAlign: 'center',
        }}>
          Inloggen
        </h1>

        <p style={{
          fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5,
          color: 'var(--ink-2)',
          marginBottom: 'var(--space-xl)',
          textAlign: 'center',
        }}>
          Welkom terug! Toegang tot je dashboard.
        </p>

        {error && (
          <div style={{
            background: '#FCE4EC',
            border: '1px solid var(--error)',
            padding: 'var(--space-md)',
            borderRadius: '8px',
            marginBottom: 'var(--space-lg)',
            color: 'var(--error)',
            fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

          <div>
            <label style={{
              display: 'block',
              fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
              marginBottom: '4px',
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '.08em',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
              marginBottom: '4px',
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '.08em',
            }}>
              Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px 24px',
              background: loading ? 'var(--border)' : 'var(--ink)',
              color: loading ? 'var(--ink-2)' : 'var(--surface)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '.04em',
              marginTop: 'var(--space-lg)',
            }}
          >
            {loading ? 'Bezig...' : 'Inloggen →'}
          </button>

        </form>

        <p style={{
          fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
          color: 'var(--ink-3)',
          textAlign: 'center',
          marginTop: 'var(--space-xl)',
        }}>
          Nog geen account?{' '}
          <button
            onClick={() => navigate('/signup')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink)',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              fontSize: 'inherit',
              fontWeight: 'inherit',
            }}
          >
            Maak account
          </button>
        </p>

      </div>

    </div>
  )
}
