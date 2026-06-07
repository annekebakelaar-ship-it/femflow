import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { signup, getMe } from '../../api/client'

export default function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { email: initialEmail = '', constellation = null } = location.state || {}

  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email en wachtwoord zijn verplicht')
      return
    }

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return
    }

    if (password.length < 8) {
      setError('Wachtwoord moet minstens 8 tekens zijn')
      return
    }

    setLoading(true)
    try {
      // Register new user
      await signup({ email, password })

      // Auto-login (getMe will use token from signup response)
      const user = await getMe()

      // Check if user has menstruation data
      const menstruationData = localStorage.getItem('menstruation_data')

      // Redirect to tracker if no menstruation data, otherwise dashboard
      if (!menstruationData) {
        navigate('/health/menstruation', { state: { fromSignup: true, constellation } })
      } else {
        navigate('/dashboard', { state: { constellation } })
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Try another email?')
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
          Je account
        </h1>

        <p style={{
          fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5,
          color: 'var(--ink-2)',
          marginBottom: 'var(--space-xl)',
          textAlign: 'center',
        }}>
          Bewaar je patroon en krijg toegang tot je volledige dashboard.
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

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

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
              disabled={!!initialEmail}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400',
                boxSizing: 'border-box',
                background: initialEmail ? 'var(--surface-warm)' : 'transparent',
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
              placeholder="Minstens 8 tekens"
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
              Herhaal wachtwoord
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
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
            {loading ? 'Bezig...' : 'Account aanmaken →'}
          </button>

        </form>

        <p style={{
          fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
          color: 'var(--ink-3)',
          textAlign: 'center',
          marginTop: 'var(--space-xl)',
        }}>
          Al een account?{' '}
          <button
            onClick={() => navigate('/login')}
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
            Log in
          </button>
        </p>

      </div>

    </div>
  )
}
