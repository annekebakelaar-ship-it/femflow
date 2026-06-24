import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { requestMagicLink, verifyMagicLink, getMe, saveToken, saveQuizResults } from '../../api/client'
import { handleGoogleSignIn } from '../../utils/oauthHandler'

export default function SigninPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { constellation = null, email: welcomeEmail = null } = location.state || {}

  const [step, setStep] = useState('email')
  const [email, setEmail] = useState(welcomeEmail || '')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailFromWelcome, setEmailFromWelcome] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendMsg, setResendMsg] = useState('')

  useEffect(() => {
    if (welcomeEmail) {
      setEmail(welcomeEmail)
      setEmailFromWelcome(true)
      localStorage.setItem('welcome_email', welcomeEmail)
    }
  }, [welcomeEmail])

  // Net een code verstuurd? Start een korte cooldown op "opnieuw versturen".
  useEffect(() => { if (step === 'verify') setResendCooldown(30) }, [step])
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  async function handleResend() {
    if (resendCooldown > 0 || loading) return
    setError(''); setResendMsg('')
    try {
      await requestMagicLink(email)
      setResendMsg('Nieuwe code verstuurd — check ook je spam.')
      setResendCooldown(30)
    } catch (err) {
      setError(err.message || 'Kon geen nieuwe code versturen. Probeer later opnieuw.')
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
      await verifyMagicLink(token, email)
      await getMe()

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
      background: 'var(--d-page)',
      padding: '20px 16px 80px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fade-slide-up 240ms ease both',
    }}>

      <div style={{ maxWidth: '500px', width: '100%' }}>

        {step === 'email' ? (
          <>
            <h1 style={{
              fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, letterSpacing: '-0.5px',
              marginBottom: 'var(--space-lg)',
              textAlign: 'center',
              color: 'var(--d-ink)',
            }}>
              Inloggen
            </h1>

            <p style={{
              fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5,
              color: 'var(--d-ink-2)',
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
              <div style={{ flex: 1, height: '1px', background: 'var(--d-border)' }} />
              <span style={{
                fontSize: '12px',
                color: 'var(--d-ink-3)',
                fontFamily: 'var(--font-sans)',
              }}>
                of login met email
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--d-border)' }} />
            </div>

            {error && (
              <div style={{
                background: 'rgba(192, 73, 45, 0.18)',
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
                    color: 'var(--d-ink-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                  }}>
                    Email
                  </label>
                  {emailFromWelcome && (
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '600',
                      color: 'var(--d-accent)',
                      background: 'var(--d-accent-soft)',
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
                    background: 'var(--d-card)',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400',
                    boxSizing: 'border-box',
                    color: 'var(--d-ink)',
                  }}
                  placeholder="je@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px 24px',
                  background: loading ? 'var(--d-border)' : 'var(--d-accent)',
                  color: loading ? 'var(--d-ink-2)' : '#1B0F07',
                  border: 'none',
                  borderRadius: '999px',
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
              color: 'var(--d-ink-2)',
              textAlign: 'center',
              marginTop: 'var(--space-xl)',
            }}>
              Terug naar{' '}
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--d-accent)',
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
              color: 'var(--d-ink)',
            }}>
              Verifieer je email
            </h1>

            <p style={{
              fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5,
              color: 'var(--d-ink-2)',
              marginBottom: 'var(--space-xl)',
              textAlign: 'center',
            }}>
              We hebben een 6-cijferige code gestuurd naar{' '}
              <strong style={{ color: 'var(--d-ink)' }}>{email}</strong>. Check ook je spam-map.
            </p>

            {error && (
              <div style={{
                background: 'rgba(192, 73, 45, 0.18)',
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
                  color: 'var(--d-ink-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                }}>
                  6-Cijferige Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  autoFocus
                  value={token}
                  onChange={e => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--d-card)',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400',
                    boxSizing: 'border-box',
                    letterSpacing: '2px',
                    textAlign: 'center',
                    color: 'var(--d-ink)',
                  }}
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={loading || token.length !== 6}
                style={{
                  padding: '14px 24px',
                  background: (loading || token.length !== 6) ? 'var(--d-border)' : 'var(--d-accent)',
                  color: (loading || token.length !== 6) ? 'var(--d-ink-2)' : '#1B0F07',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600',
                  cursor: (loading || token.length !== 6) ? 'not-allowed' : 'pointer',
                  letterSpacing: '.04em',
                  marginTop: 'var(--space-lg)',
                }}
              >
                {loading ? 'Verifiëren...' : 'Verifieer & log in →'}
              </button>
            </form>

            {resendMsg && (
              <p style={{ fontSize: '13px', fontFamily: 'var(--font-sans)', color: 'var(--d-accent)', textAlign: 'center', marginTop: 'var(--space-lg)' }}>
                {resendMsg}
              </p>
            )}

            <p style={{
              fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
              color: 'var(--d-ink-2)',
              textAlign: 'center',
              marginTop: resendMsg ? 'var(--space-sm)' : 'var(--space-xl)',
            }}>
              Geen code ontvangen?{' '}
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                style={{
                  background: 'none', border: 'none',
                  color: resendCooldown > 0 ? 'var(--d-ink-3)' : 'var(--d-accent)',
                  cursor: resendCooldown > 0 ? 'default' : 'pointer',
                  textDecoration: 'underline', textUnderlineOffset: 3,
                  fontSize: 'inherit', fontWeight: 'inherit',
                }}
              >
                {resendCooldown > 0 ? `Opnieuw versturen (${resendCooldown}s)` : 'Opnieuw versturen'}
              </button>
            </p>

            <p style={{ fontSize: '13px', fontFamily: 'var(--font-sans)', color: 'var(--d-ink-2)', textAlign: 'center', marginTop: 'var(--space-sm)' }}>
              <button
                onClick={() => { setStep('email'); setError(''); setToken(''); setResendMsg('') }}
                style={{
                  background: 'none', border: 'none', color: 'var(--d-accent)', cursor: 'pointer',
                  textDecoration: 'underline', textUnderlineOffset: 3, fontSize: 'inherit', fontWeight: 'inherit',
                }}
              >
                Ander e-mailadres
              </button>
            </p>
          </>
        )}

      </div>

      {/* Legal footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(180deg, transparent 0%, var(--d-bg) 60%)',
        padding: '40px 16px 16px',
        textAlign: 'center',
        fontSize: '11px',
        fontFamily: 'var(--font-sans)',
        color: 'var(--d-ink-3)',
      }}>
        <p style={{ margin: 0, marginBottom: '8px' }}>
          Door in te loggen ga je akkoord met onze{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--d-accent)', textDecoration: 'none', textDecorationLine: 'underline', textUnderlineOffset: 2 }}>
            voorwaarden
          </a>
          {' '}en{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--d-accent)', textDecoration: 'none', textDecorationLine: 'underline', textUnderlineOffset: 2 }}>
            privacybeleid
          </a>
        </p>
      </div>

    </div>
  )
}
