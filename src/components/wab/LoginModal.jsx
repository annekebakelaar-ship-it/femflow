import { useState } from 'react'
import { requestMagicLink } from '../../api/client'

export default function LoginModal({ onClose, onSuccess }) {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await requestMagicLink(email.trim())
      setSent(true)
      // Dev mode: backend returns dev_link directly — auto-verify
      if (res?.dev_link) {
        const url = new URL(res.dev_link)
        const token = url.searchParams.get('token')
        if (token) {
          const { verifyMagicLink } = await import('../../api/client')
          await verifyMagicLink(token)
          onSuccess?.()
          onClose?.()
        }
      }
    } catch {
      setError('Could not send link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      <div style={{
        position: 'relative', width: '100%',
        maxWidth: 'var(--container-max)',
        background: 'var(--color-bg)',
        padding: 'var(--space-lg) var(--container-padding)',
        paddingBottom: 'calc(var(--space-xl) + env(safe-area-inset-bottom, 0px))',
        borderTop: '1px solid var(--color-border)',
        animation: 'fade-slide-up 240ms ease both',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)', color: 'var(--color-label)', letterSpacing: '.4px', textTransform: 'uppercase', marginBottom: 6 }}>
              Save your results
            </p>
            <h2 style={{ fontSize: 'var(--font-size-heading)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: '-0.5px' }}>
              Sign in
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-label)', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.55 }}>
              Enter your email — we'll send a one-click sign-in link. No password needed.
            </p>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="you@example.com"
              autoFocus
              style={{
                width: '100%', border: 'none',
                borderBottom: '1px solid var(--color-border)',
                padding: '10px 0', fontSize: 'var(--font-size-body)',
                color: 'var(--color-text)', background: 'transparent',
                outline: 'none', marginBottom: 'var(--space-md)',
                boxSizing: 'border-box',
              }}
            />
            {error && (
              <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-negative)', marginBottom: 'var(--space-sm)' }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={{
                width: '100%', padding: '18px 24px',
                background: 'var(--color-text)', color: 'white',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                fontWeight: 500, letterSpacing: '.18em', textTransform: 'uppercase',
                opacity: loading || !email.trim() ? 0.5 : 1,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              {loading ? 'Sending…' : 'Send sign-in link'} <span style={{ fontSize: 14 }}>→</span>
            </button>
          </form>
        ) : (
          <div>
            <p style={{ fontSize: 'var(--font-size-body)', marginBottom: 'var(--space-sm)' }}>
              Check your inbox at <strong>{email}</strong>.
            </p>
            <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)' }}>
              Click the link in the email to sign in. The link expires in 15 minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
