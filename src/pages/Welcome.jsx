import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveWelcomeSignup } from '../api/client'
import hero from '../assets/hero4.png'

export default function Welcome() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [, setSaving] = useState(false)

  async function handleStartQuiz() {
    // Save email if provided
    if (email && email.includes('@')) {
      setSaving(true)
      try {
        await saveWelcomeSignup(email)
      } catch (err) {
        console.error('Failed to save email:', err)
      } finally {
        setSaving(false)
      }
    }
    navigate('/quiz', { state: { email: email || null } })
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
      backgroundImage: `url(${hero})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>

      <div style={{ maxWidth: '600px', textAlign: 'center' }}>

        <h1 style={{
          fontSize: 'clamp(2rem, 8vw, 3rem)',
          fontFamily: 'var(--font-display)',
          fontWeight: '500',
          letterSpacing: '-0.5px',
          lineHeight: 1.2,
          marginBottom: 'var(--space-lg)',
          color: 'white',
          textShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}>
          FemFlow, de perimenopauze app.
        </h1>

        <p style={{
          fontSize: 'var(--font-size-body)',
          color: 'white',
          textShadow: '0 1px 4px rgba(0,0,0,0.3)',
          lineHeight: 1.6,
          marginBottom: 'var(--space-xl)',
        }}>
          5 vragen. 2 minuten. Gratis. Geen betaling.
        </p>

        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <input
            type="email"
            placeholder="Email (optioneel)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-xs) var(--space-sm)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-body)',
              marginBottom: 'var(--space-md)',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />

          <button
            onClick={handleStartQuiz}
            style={{
              width: '100%',
              padding: 'var(--space-sm) var(--space-lg)',
              background: 'var(--ink)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-body)',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '.04em',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Start Quiz →
          </button>
        </div>

        <p style={{
          fontSize: 'var(--font-size-small)',
          color: 'var(--ink-3)',
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
