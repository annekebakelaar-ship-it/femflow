import { useState } from 'react'
import { MessageCircle, X } from 'react-feather'
import { sendFeedback } from '../api/client'

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!feedback.trim()) return

    setLoading(true)
    setError('')
    try {
      await sendFeedback(feedback.trim(), email.trim() || null, window.location.href)

      setSubmitted(true)
      setTimeout(() => {
        setFeedback('')
        setEmail('')
        setSubmitted(false)
        setIsOpen(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to submit feedback:', err)
      setError('Versturen mislukt. Probeer het later opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '120px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--accent)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(199, 154, 110, 0.3)',
            zIndex: 50,
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(199, 154, 110, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(199, 154, 110, 0.3)'
          }}
          title="Geef feedback"
        >
          <MessageCircle size={24} color="white" strokeWidth={1.5} />
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(42, 33, 28, 0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 9999,
          backdropFilter: 'blur(4px)',
          animation: 'fade-in 200ms ease',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            background: 'white',
            borderRadius: '16px 16px 0 0',
            padding: '24px',
            boxSizing: 'border-box',
            boxShadow: '0 -12px 32px rgba(42, 33, 28, 0.2)',
            animation: 'slide-up 300ms ease',
          }}>
            <style>{`
              @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes slide-up {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }
            `}</style>

            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--ink)',
                margin: 0,
              }}>
                Geef feedback
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ink-2)',
                  padding: 0,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {submitted ? (
              <div style={{
                background: '#E8F5E9',
                border: '1px solid var(--success)',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                color: 'var(--success)',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: '500',
              }}>
                ✓ Bedankt voor je feedback!
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {error && (
                  <div style={{
                    background: '#FCE4EC',
                    border: '1px solid var(--error)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--error)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                  }}>
                    {error}
                  </div>
                )}
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: 'var(--ink-2)',
                  margin: '0 0 8px 0',
                }}>
                  Help ons FemFlow beter te maken. Wat vind je goed? Wat kan beter?
                </p>

                {/* Feedback textarea */}
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Jouw feedback hier... (min. 10 tekens)"
                  minLength="10"
                  maxLength="500"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    minHeight: '100px',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Email (optional) */}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Je email (optioneel, voor antwoord)"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || feedback.trim().length < 10}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: feedback.trim().length >= 10 ? 'var(--accent)' : '#E0E0E0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: feedback.trim().length >= 10 ? 'pointer' : 'not-allowed',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (feedback.trim().length >= 10) {
                      e.currentTarget.style.opacity = '0.9'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (feedback.trim().length >= 10) {
                      e.currentTarget.style.opacity = '1'
                    }
                  }}
                >
                  {loading ? 'Verzenden...' : 'Verzend feedback'}
                </button>

                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  color: 'var(--ink-3)',
                  margin: 0,
                  textAlign: 'center',
                }}>
                  Je feedback helpt ons direct {' '}
                  <a href="mailto:info@youcaps.app" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                    info@youcaps.app
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
