import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveSecure, getSecure, exportSecureData, deleteAllSecure } from '../../utils/secureStorage'
import { deleteAccount, clearToken } from '../../api/client'

// Toestemmingen leven client-side: de app slaat gezondheidsdata lokaal op
// (secureStorage) en de analytics-keuze staat los in femflow_analytics_consent.
const DEFAULT_CONSENTS = {
  cyclus_tracking: {
    enabled: true,
    can_revoke: false,
    description: 'Cyclusdata lokaal opslaan op dit apparaat. Nodig om de app te gebruiken.',
  },
  wearable_data: {
    enabled: true,
    can_revoke: true,
    description: 'Wearable-data (slaap, HRV) ophalen en tonen wanneer je een wearable koppelt.',
  },
  anonieme_statistieken: {
    enabled: false,
    can_revoke: true,
    description: 'Anonieme gebruiksstatistieken om FemFlow te verbeteren.',
  },
}

export default function ConsentManagement() {
  const navigate = useNavigate()
  const [consents, setConsents] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadConsents()
  }, [])

  function loadConsents() {
    try {
      const opgeslagen = getSecure('consents') || {}
      // Analytics-keuze meenemen uit de consent-banner
      const analytics = localStorage.getItem('femflow_analytics_consent')
      const samengevoegd = { ...DEFAULT_CONSENTS, ...opgeslagen }
      if (analytics) {
        samengevoegd.anonieme_statistieken = {
          ...samengevoegd.anonieme_statistieken,
          enabled: analytics === 'granted',
        }
      }
      setConsents(samengevoegd)
    } catch (err) {
      console.error('Failed to load consents:', err)
      setConsents(DEFAULT_CONSENTS)
    } finally {
      setLoading(false)
    }
  }

  function handleToggle(consentKey) {
    setSaving(true)
    try {
      setConsents(prev => {
        const next = {
          ...prev,
          [consentKey]: {
            ...prev[consentKey],
            enabled: !prev[consentKey].enabled,
          },
        }
        saveSecure('consents', next)
        // Analytics-toggle doorzetten naar de consent-banner-keuze
        if (consentKey === 'anonieme_statistieken') {
          const granted = next[consentKey].enabled
          localStorage.setItem('femflow_analytics_consent', granted ? 'granted' : 'denied')
          if (granted && window.initAnalytics) window.initAnalytics()
        }
        return next
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save consent:', err)
    } finally {
      setSaving(false)
    }
  }

  // Export van alle lokaal opgeslagen gezondheidsdata (AVG-inzagerecht).
  // Client-side: de data staat in secureStorage, niet op een server.
  function handleDataExport() {
    try {
      const data = exportSecureData() || {}
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `femflow-data-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export data:', err)
    }
  }

  async function handleAccountDeletion() {
    const confirmed = window.confirm(
      'Weet je zeker? Dit verwijdert je account en ALLE je gezondheidsgegevens. Dit kan niet ongedaan gemaakt worden.'
    )
    if (!confirmed) return

    try {
      // Serverdata weg via de FemFlow-API (voorheen: niet-bestaand WAB-endpoint,
      // waardoor deze knop stilletjes niets deed), daarna lokale data en token
      await deleteAccount()
      deleteAllSecure()
      clearToken()
      navigate('/')
    } catch (err) {
      console.error('Failed to delete account:', err)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
        Laden...
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: 'var(--space-lg)',
    }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--d-ink-2)',
          cursor: 'pointer',
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
          fontWeight: 400,
          marginBottom: 'var(--space-lg)',
        }}
      >
        ← Terug
      </button>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '26px',
        fontWeight: 500,
        lineHeight: 1.25,
        marginBottom: 'var(--space-md)',
        color: 'var(--d-ink)',
      }}>
        Privacy & Toestemmingen
      </h1>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '15px',
        fontWeight: 400,
        lineHeight: 1.5,
        color: 'var(--d-ink-2)',
        marginBottom: 'var(--space-lg)',
      }}>
        Beheer hoe wij je gegevens gebruiken
      </p>

      {/* Consent Toggles */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--d-ink-3)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-md)',
        }}>
          Gegevensverwerking
        </p>

        {Object.entries(consents).map(([key, consent]) => (
          <div
            key={key}
            style={{
              background: 'var(--d-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
              border: 'none',
              borderRadius: '22px',
              padding: 'var(--space-md)',
              marginBottom: 'var(--space-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 'var(--space-md)',
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                fontWeight: 500,
                margin: '0 0 4px 0',
                color: 'var(--d-ink)',
                textTransform: 'capitalize',
              }}>
                {key.replace(/_/g, ' ')}
              </h3>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 400,
                color: 'var(--d-ink-2)',
                margin: 0,
              }}>
                {consent.description}
              </p>
            </div>

            {consent.can_revoke && (
              <button
                onClick={() => handleToggle(key)}
                disabled={saving}
                style={{
                  width: '50px',
                  height: '28px',
                  background: consent.enabled ? 'var(--d-accent)' : 'var(--d-border)',
                  border: 'none',
                  borderRadius: '14px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                  transition: 'all 200ms ease',
                  position: 'relative',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    width: '24px',
                    height: '24px',
                    background: 'white',
                    borderRadius: '50%',
                    top: '2px',
                    left: consent.enabled ? '24px' : '2px',
                    transition: 'left 200ms ease',
                  }}
                />
              </button>
            )}
          </div>
        ))}

        {saved && (
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--success)',
            marginTop: 'var(--space-md)',
          }}>
            ✓ Opgeslagen
          </p>
        )}
      </div>

      {/* Data Actions */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--d-ink-3)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-md)',
        }}>
          Mijn Gegevens
        </p>

        <button
          onClick={handleDataExport}
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            background: 'var(--d-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
            border: 'none',
            borderRadius: '22px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--d-ink)',
            transition: 'all 150ms ease',
            marginBottom: 'var(--space-md)',
          }}
          onMouseEnter={e => {
            e.target.style.borderColor = 'var(--d-accent)'
            e.target.style.background = 'var(--d-page)'
          }}
          onMouseLeave={e => {
            e.target.style.borderColor = 'var(--d-border)'
            e.target.style.background = 'var(--d-card)'
          }}
        >
          📥 Download Mijn Gegevens (JSON)
        </button>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 400,
          color: 'var(--d-ink-2)',
          margin: '0 0 var(--space-md) 0',
        }}>
          Download alle je persoonlijke gegevens in JSON-formaat. Je kunt dit gebruiken om je data naar een ander bedrijf te verplaatsen (GDPR artikel 20).
        </p>
      </div>

      {/* Danger Zone */}
      <div style={{
        background: 'var(--d-card-solid)',
        border: `1px solid var(--d-border)`,
        borderRadius: '22px',
        padding: 'var(--space-md)',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--d-ink-3)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-md)',
        }}>
          ⚠️ Gevaarlijke Zone
        </p>

        <button
          onClick={handleAccountDeletion}
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            background: 'var(--d-card-solid)',
            border: '1px solid var(--error)',
            borderRadius: '22px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--error)',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => {
            e.target.style.background = 'rgba(192, 73, 45, 0.05)'
          }}
          onMouseLeave={e => {
            e.target.style.background = 'var(--d-card-solid)'
          }}
        >
          🗑️ Account Verwijderen
        </button>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 400,
          color: 'var(--error)',
          margin: 'var(--space-md) 0 0 0',
        }}>
          Dit verwijdert je account en ALLE je gezondheidsgegevens. Dit kan niet ongedaan gemaakt worden.
        </p>
      </div>

      {/* Info Box */}
      <div style={{
        background: 'rgba(79, 140, 90, 0.08)',
        border: `1px solid var(--success)`,
        borderRadius: '22px',
        padding: 'var(--space-md)',
        marginTop: 'var(--space-lg)',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 400,
          color: 'var(--success)',
          margin: 0,
        }}>
          <strong>Je rechten onder de AVG:</strong><br />
          Je hebt het recht op toegang tot je gegevens, rectificatie, verwijdering en portabiliteit.
          Lees onze <a href="/privacy" style={{ color: 'var(--success)', textDecoration: 'underline' }}>Privacyverklaring</a> voor meer info.
        </p>
      </div>
    </div>
  )
}
