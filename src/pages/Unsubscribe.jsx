import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { unsubscribeEmail } from '../api/client'

export default function Unsubscribe() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get('email')
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function handleUnsubscribe() {
      if (!email) {
        setStatus('error')
        setMessage('Email niet gevonden in link')
        return
      }

      try {
        await unsubscribeEmail(email)
        setStatus('success')
        setMessage(`Je bent uitgeschreven van updates. (${email})`)
      } catch (err) {
        setStatus('error')
        setMessage('Kon niet uitschrijven. Probeer later opnieuw.')
        console.error('Unsubscribe failed:', err)
      }
    }

    handleUnsubscribe()
  }, [email])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-lg)',
      background: 'var(--d-page)',
    }}>
      <div style={{
        maxWidth: '500px',
        textAlign: 'center',
        background: 'var(--d-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: 'var(--space-xl)',
        borderRadius: '22px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
      }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: '12px', color: '#888' }}>Moment...</div>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: '500',
              marginBottom: 'var(--space-md)',
              color: 'var(--d-ink)',
            }}>
              Uitgeschreven ✓
            </h2>
            <p style={{
              color: 'var(--d-ink-2)',
              fontSize: '15px',
              lineHeight: 1.6,
              marginBottom: 'var(--space-lg)',
            }}>
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: '500',
              marginBottom: 'var(--space-md)',
              color: 'var(--d-ink)',
            }}>
              Oops
            </h2>
            <p style={{
              color: 'var(--d-ink-2)',
              fontSize: '15px',
              lineHeight: 1.6,
              marginBottom: 'var(--space-lg)',
            }}>
              {message}
            </p>
          </>
        )}

        <button
          onClick={() => navigate('/')}
          style={{
            padding: 'var(--space-sm) var(--space-lg)',
            background: 'var(--d-ink)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '15px',
          }}
        >
          Terug naar home
        </button>
      </div>
    </div>
  )
}
