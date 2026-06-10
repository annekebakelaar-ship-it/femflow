import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { requestMagicLink, verifyMagicLink, getMe, saveToken, saveQuizResults } from '../../api/client'
import { handleGoogleSignIn } from '../../utils/oauthHandler'
import hero from '../../assets/hero4.png'

export default function SigninPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { constellation = null, email: welcomeEmail = null } = location.state || {}

  const [step, setStep] = useState('email') // 'email' or 'verify'
  const [email, setEmail] = useState(welcomeEmail || '')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailFromWelcome, setEmailFromWelcome] = useState(false)

  useEffect(() => {
    if (welcomeEmail) {
      setEmail(welcomeEmail)
      setEmailFromWelcome(true)
      localStorage.setItem('welcome_email', welcomeEmail)
    }
  }, [welcomeEmail])

  async function handleRequestLink(e) {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Geldig email adres is verplicht')
      return
    }

    setLoading(true)
    try {
      await requestMagicLink(email)
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
      setError('Code is verplicht')
      return
    }

    setLoading(true)
    try {
      // Verify OTP code
      await verifyMagicLink(token, email)

      // Get user info
      await getMe()

      // Save pending quiz results if they exist
      const pendingQuiz = localStorage.getItem('pending_quiz_results')
      if (pendingQuiz) {
        try {
          const { email: quizEmail, constellation: quizConstellation } = JSON.parse(pendingQuiz)
          await saveQuizResults(quizEmail, quizConstellation)
          localStorage.removeItem('pending_quiz_results')
        } catch (err) {
          console.error('Failed to save quiz results after login:', err)
        }
      }

      const menstruationData = localStorage.getItem('menstruation_data')
      setTimeout(() => {
        if (!menstruationData) {
          navigate('/health/menstruation', { state: { fromSignin: true, constellation } })
        } else {
          navigate('/dashboard', { state: { constellation } })
        }
      }, 300)
    } catch (err) {
      console.error('Code verification failed:', err)
      setError(err.message || 'Code ongeldig of verlopen. Vraag een nieuwe code aan.')
    } finally {
      setLoading(false)
    }
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
              color: 'white',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}>
              Inloggen
            </h1>

            <p style={{
              fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5,
              color: 'white',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <label style={{
                    fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
                    color: 'var(--ink-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                  }}>
                    Email
                  </label>
                  {emailFromWelcome && (
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '600',
                      color: 'var(--accent)',
                      background: 'rgba(199, 154, 110, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '.05em',
                    }}>
                      Uit Quiz
                    </span>
                  )}
                </div>
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
                {loading ? 'Verzenden...' : 'Code sturen →'}
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
              color: 'white',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}>
              Verifieer je email
            </h1>

            <p style={{
              fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5,
              color: 'white',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
              marginBottom: 'var(--space-xl)',
              textAlign: 'center',
            }}>
              Controleer je email voor je 6-cijferige code.
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

            <form onSubmit={handleVerifyToken} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
                  marginBottom: '4px',
                  color: 'white',
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                }}>
                  6-Cijferige Code
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={e => setToken(e.target.value.slice(0, 6))}
                  maxLength="6"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                    fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400',
                    boxSizing: 'border-box',
                    letterSpacing: '2px',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: 'var(--ink)',
                  }}
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={loading || token.length !== 6}
                style={{
                  padding: '14px 24px',
                  background: (loading || token.length !== 6) ? 'var(--border)' : 'var(--ink)',
                  color: (loading || token.length !== 6) ? 'var(--ink-2)' : 'var(--surface)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600',
                  cursor: (loading || token.length !== 6) ? 'not-allowed' : 'pointer',
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
