import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import wearableBg from '../assets/wearableoverview.webp'

export default function WearableOverview({ averageScore = null, onConnect }) {
  const navigate = useNavigate()
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    setConnecting(true)
    window.location.href = 'https://age-sync.youcaps.app/dashboard/tracker'
  }

  return (
    <div
      onClick={() => averageScore && navigate('/dashboard/wearable')}
      style={{
        width: '100%',
        padding: '0 var(--space-lg) var(--space-lg) var(--space-lg)',
        marginTop: 'var(--space-xl)',
        cursor: averageScore ? 'pointer' : 'default',
        opacity: 0.4,
      }}
    >
      <div style={{
        position: 'relative',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-lg)',
        minHeight: '240px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-lg)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 200ms ease',
      }}>
        {!averageScore ? (
          <>
            <div style={{
              textAlign: 'center',
              marginBottom: 'var(--space-md)',
            }}>
              <h3 style={{
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'white',
                margin: '0 0 var(--space-sm) 0',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
              }}>
                Wearable koppelen
              </h3>
              <p style={{
                fontSize: 'var(--font-size-small)',
                color: 'rgba(255,255,255,0.9)',
                margin: 0,
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
              }}>
                Verbind je smartwatch voor realtime gezondheidsgegevens
              </p>
            </div>

            <button
              onClick={handleConnect}
              disabled={true}
              style={{
                padding: 'var(--space-md) var(--space-lg)',
                background: 'var(--ink)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-semibold)',
                cursor: 'not-allowed',
                transition: 'all 200ms ease',
                opacity: 0.4,
              }}
            >
              Koppel Wearable
            </button>
          </>
        ) : (
          <>
            <div style={{
              position: 'relative',
              width: '180px',
              height: '90px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}>
              {/* Semicircle background */}
              <svg
                width="180"
                height="90"
                viewBox="0 0 180 90"
                style={{
                  position: 'absolute',
                  bottom: 0,
                }}
              >
                {/* Background arc */}
                <path
                  d="M 10 80 A 70 70 0 0 1 170 80"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Progress arc */}
                <path
                  d="M 10 80 A 70 70 0 0 1 170 80"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(averageScore / 100) * 160.5} 160.5`}
                  style={{
                    transition: 'stroke-dasharray 500ms ease',
                  }}
                />
              </svg>

              {/* Score text */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 10,
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontSize: '28px',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'white',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                }}>
                  {averageScore}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                }}>
                  Gemiddeld
                </div>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: 'var(--font-size-small)',
                color: 'rgba(255,255,255,0.9)',
                margin: 0,
                fontWeight: 'var(--font-weight-medium)',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
              }}>
                Wearable verbonden
              </p>
              <button
                onClick={handleConnect}
                disabled={true}
                style={{
                  marginTop: 'var(--space-sm)',
                  padding: 'var(--space-sm) var(--space-md)',
                  background: 'var(--ink)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'not-allowed',
                  transition: 'all 200ms ease',
                  opacity: 0.4,
                }}
              >
                Verander device
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
