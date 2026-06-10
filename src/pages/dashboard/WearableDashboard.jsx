import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/YouCapsLogo.png.png'
import SupplementsSection from '../../components/SupplementsSection'
import { getWearableReadings } from '../../api/client'

export default function WearableDashboard() {
  const navigate = useNavigate()
  const [wearableData, setWearableData] = useState(null)

  useEffect(() => {
    // Laatste reading via de FemFlow-API (voorheen: niet-bestaand WAB-endpoint)
    const fetchWearableData = async () => {
      try {
        const result = await getWearableReadings(1)
        if (result.data && result.data.length > 0) {
          const laatste = result.data[result.data.length - 1]
          setWearableData({ ...laatste, rhr_bpm: laatste.resting_heart_rate })
        }
      } catch (err) {
        console.error('Failed to fetch wearable data:', err)
      }
    }

    fetchWearableData()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--space-lg) 140px var(--space-lg)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'fade-slide-up 240ms ease both',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-xl)',
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img
            src={logo}
            alt="YouCaps"
            style={{
              height: '40px',
              width: 'auto',
            }}
          />
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0',
          }}
          title="Terug naar dashboard"
        >
          ←
        </button>
      </div>

      {/* Page Title */}
      <h1 style={{
        fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25,
        color: 'var(--ink)',
        margin: '0 0 var(--space-lg) 0',
      }}>
        Mijn Wearable
      </h1>

      {/* Wearable Status */}
      {wearableData ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-xl)',
        }}>
          {/* Sleep */}
          {wearableData.sleep_duration_min && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: 'var(--space-lg)',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
                color: 'var(--ink-3)',
                margin: '0 0 var(--space-sm) 0',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Slaap
              </p>
              <p style={{
                fontSize: '20px', fontFamily: 'var(--font-sans)', fontWeight: '600',
                color: 'var(--ink)',
                margin: 0,
                fontFeatureSettings: "'tnum'",
              }}>
                {(wearableData.sleep_duration_min / 60).toFixed(1)}u
              </p>
            </div>
          )}

          {/* Deep Sleep */}
          {wearableData.deep_sleep_min && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: 'var(--space-lg)',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
                color: 'var(--ink-3)',
                margin: '0 0 var(--space-sm) 0',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Diepe Slaap
              </p>
              <p style={{
                fontSize: '20px', fontFamily: 'var(--font-sans)', fontWeight: '600',
                color: 'var(--ink)',
                margin: 0,
                fontFeatureSettings: "'tnum'",
              }}>
                {(wearableData.deep_sleep_min / 60).toFixed(1)}u
              </p>
            </div>
          )}

          {/* RHR */}
          {wearableData.rhr_bpm && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: 'var(--space-lg)',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
                color: 'var(--ink-3)',
                margin: '0 0 var(--space-sm) 0',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Resting HR
              </p>
              <p style={{
                fontSize: '20px', fontFamily: 'var(--font-sans)', fontWeight: '600',
                color: 'var(--ink)',
                margin: 0,
                fontFeatureSettings: "'tnum'",
              }}>
                {wearableData.rhr_bpm} bpm
              </p>
            </div>
          )}

          {/* HRV */}
          {wearableData.hrv_ms && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: 'var(--space-lg)',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
                color: 'var(--ink-3)',
                margin: '0 0 var(--space-sm) 0',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                HRV
              </p>
              <p style={{
                fontSize: '20px', fontFamily: 'var(--font-sans)', fontWeight: '600',
                color: 'var(--ink)',
                margin: 0,
                fontFeatureSettings: "'tnum'",
              }}>
                {wearableData.hrv_ms.toFixed(0)} ms
              </p>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: 'var(--space-xl)',
          textAlign: 'center',
          color: 'var(--ink-3)',
          fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400',
        }}>
          <p>Geen wearable gegevens beschikbaar</p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: 'var(--space-md)',
              padding: 'var(--space-md) var(--space-lg)',
              background: 'var(--ink)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600', fontFamily: 'var(--font-sans)', fontSize: '15px',
            }}
          >
            Terug naar dashboard
          </button>
        </div>
      )}

      {/* Supplements Section */}
      <SupplementsSection />
    </div>
  )
}
