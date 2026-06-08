import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { requestMagicLink, verifyMagicLink, getMe, saveToken } from '../../api/client'
import { handleGoogleSignIn } from '../../utils/oauthHandler'
import hero from '../../assets/hero1.png'

export default function SigninPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { constellation = null } = location.state || {}

  const [step, setStep] = useState('email') // 'email' or 'verify'
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [devLink, setDevLink] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleDevLogin() {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      setError('Dev mode not available')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('https://wearable-age-api.onrender.com/auth/dev-token')
      if (!res.ok) throw new Error('Dev token not available')
      const data = await res.json()
      saveToken(data.access_token)
      await getMe()

      const menstruationData = localStorage.getItem('menstruation_data')
      if (!menstruationData) {
        navigate('/health/menstruation', { state: { fromSignin: true, constellation } })
      } else {
        navigate('/dashboard', { state: { constellation } })
      }
    } catch (err) {
      setError('Dev mode not available')
    } finally {
      setLoading(false)
    }
  }

  async function handleRequestLink(e) {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Geldig email adres is verplicht')
      return
    }

    setLoading(true)
    try {
      const result = await requestMagicLink(email)
      if (result.dev_link) {
        setDevLink(result.dev_link)
      }
      setStep('verify')
    } catch (err) {
      console.error('Magic link request failed:', err)
      setError(err.message || 'Kon magic link niet versturen. Probeer later opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyToken(e) {
    e.preventDefault()
    setError('')

    if (!token || token.trim().length === 0) {
      setError('Token is verplicht')
      return
    }

    setLoading(true)
    try {
      // Verify magic link
      await verifyMagicLink(token)

      // Get user info
      await getMe()

      const menstruationData = localStorage.getItem('menstruation_data')
      setTimeout(() => {
        if (!menstruationData) {
          navigate('/health/menstruation', { state: { fromSignin: true, constellation } })
        } else {
          navigate('/dashboard', { state: { constellation } })
        }
      }, 300)
    } catch (err) {
      console.error('Token verification failed:', err)
      setError(err.message || 'Token ongeldig of verlopen. Vraag een nieuwe link aan.')
    } finally {
      setLoading(false)
    }
  }

  function handleUseMagicLink() {
    const urlParams = new URLSearchParams(devLink.split('?')[1])
    const t = urlParams.get('token')
    if (t) setToken(t)
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'var(--space-lg) var(--space-sm) var(--space-xxl)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fade-slide-up 240ms ease both',
      backgroundImage: `url(${hero})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>

      <div style={{ maxWidth: '500px', width: '100%' }}>

        {step === 'email' ? (
          <>
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
              Kies hoe je wil inloggen
            </p>

            {/* Google Sign In */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 'var(--space-lg)',
            }}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setLoading(true)
                  try {
                    const result = await handleGoogleSignIn(credentialResponse)
                    if (result.success) {
                      saveToken(result.accessToken)
                      const menstruationData = localStorage.getItem('menstruation_data')
                      setTimeout(() => {
                        navigate(menstruationData ? '/dashboard' : '/health/menstruation')
                      }, 300)
                    } else {
                      setError(result.error || 'Google sign-in failed')
                    }
                  } catch (err) {
                    setError(err.message || 'Google sign-in error')
                  } finally {
                    setLoading(false)
                  }
                }}
                onError={() => {
                  setError('Google sign-in failed. Probeer later opnieuw.')
                }}
                text="signin_with"
                theme="outline"
                size="large"
              />
            </div>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: 'var(--space-lg) 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{
                fontSize: '12px',
                color: 'var(--ink-3)',
                fontFamily: 'var(--font-sans)',
              }}>
                of login met email
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

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

            <form onSubmit={handleRequestLink} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
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
                  placeholder="je@email.com"
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
                {loading ? 'Verzenden...' : 'Magic link sturen →'}
              </button>

              <button
                type="button"
                onClick={handleDevLogin}
                disabled={loading}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  color: 'var(--ink)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: 'var(--space-sm)',
                  width: '100%',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                [DEV] Quick login
              </button>
            </form>

            <p style={{
              fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
              color: 'var(--ink-3)',
              textAlign: 'center',
              marginTop: 'var(--space-xl)',
            }}>
              Terug naar{' '}
              <button
                onClick={() => navigate('/')}
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
                start
              </button>
            </p>
          </>
        ) : (
          <>
            <h1 style={{
              fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, letterSpacing: '-0.5px',
              marginBottom: 'var(--space-lg)',
              textAlign: 'center',
            }}>
              Verifieer je email
            </h1>

            <p style={{
              fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5,
              color: 'var(--ink-2)',
              marginBottom: 'var(--space-xl)',
              textAlign: 'center',
            }}>
              Controleer je email voor de magic link. Plak de code hier.
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

            {process.env.NODE_ENV === 'development' && devLink && (
              <div style={{
                background: '#E8F5E9',
                border: '1px solid var(--success)',
                padding: 'var(--space-md)',
                borderRadius: '8px',
                marginBottom: 'var(--space-lg)',
                color: 'var(--success)',
                fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
              }}>
                <p style={{ marginBottom: 'var(--space-sm)' }}>Dev mode: Magic link klaar</p>
                <code style={{ fontSize: 12, wordBreak: 'break-all', display: 'block', marginBottom: 'var(--space-sm)', background: 'rgba(0,0,0,0.05)', padding: '8px', borderRadius: '4px' }}>
                  {devLink}
                </code>
                <button
                  onClick={handleUseMagicLink}
                  style={{
                    background: 'var(--success)',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', fontWeight: '600',
                  }}
                >
                  Gebruik link →
                </button>
              </div>
            )}

            <form onSubmit={handleVerifyToken} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
                  marginBottom: '4px',
                  color: 'var(--ink-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                }}>
                  Verificatie Token
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400',
                    boxSizing: 'border-box',
                  }}
                  placeholder="token hier plakken"
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
                {loading ? 'Verifiëren...' : 'Verifieer & log in →'}
              </button>
            </form>

            <p style={{
              fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
              color: 'var(--ink-3)',
              textAlign: 'center',
              marginTop: 'var(--space-xl)',
            }}>
              <button
                onClick={() => { setStep('email'); setError(''); setToken(''); }}
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
                Terug
              </button>
            </p>
          </>
        )}

      </div>

    </div>
  )
}
