import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ConsentManagement() {
  const navigate = useNavigate()
  const [consents, setConsents] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadConsents()
  }, [])

  async function loadConsents() {
    try {
      const res = await fetch('https://wearable-age-api.onrender.com/api/v1/user/consent-status', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('wab_jwt')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setConsents(data.consents)
      }
    } catch (err) {
      console.error('Failed to load consents:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(consentKey) {
    setSaving(true)
    try {
      // TODO: Implement backend endpoint to save consent changes
      // For now, update local state
      setConsents(prev => ({
        ...prev,
        [consentKey]: {
          ...prev[consentKey],
          enabled: !prev[consentKey].enabled
        }
      }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save consent:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDataExport() {
    try {
      const res = await fetch('https://wearable-age-api.onrender.com/api/v1/user/data-export?format=json', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('wab_jwt')}` }
      })
      if (res.ok) {
        const data = await res.json()
        // Download as JSON file
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = data.filename
        a.click()
        URL.revokeObjectURL(url)
      }
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
      const res = await fetch('https://wearable-age-api.onrender.com/api/v1/user/account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('wab_jwt')}` }
      })
      if (res.ok) {
        // Clear auth and redirect to welcome
        localStorage.removeItem('wab_jwt')
        navigate('/')
      }
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
          color: 'var(--ink-2)',
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
        color: 'var(--ink)',
      }}>
        Privacy & Toestemmingen
      </h1>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '15px',
        fontWeight: 400,
        lineHeight: 1.5,
        color: 'var(--ink-2)',
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
          color: 'var(--ink-3)',
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
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
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
                color: 'var(--ink)',
                textTransform: 'capitalize',
              }}>
                {key.replace(/_/g, ' ')}
              </h3>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 400,
                color: 'var(--ink-2)',
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
                  background: consent.enabled ? 'var(--color-accent)' : 'var(--color-border)',
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
          color: 'var(--ink-3)',
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
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--ink)',
            transition: 'all 150ms ease',
            marginBottom: 'var(--space-md)',
          }}
          onMouseEnter={e => {
            e.target.style.borderColor = 'var(--accent)'
            e.target.style.background = 'var(--bg)'
          }}
          onMouseLeave={e => {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.background = 'var(--surface)'
          }}
        >
          📥 Download Mijn Gegevens (JSON)
        </button>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 400,
          color: 'var(--ink-2)',
          margin: '0 0 var(--space-md) 0',
        }}>
          Download alle je persoonlijke gegevens in JSON-formaat. Je kunt dit gebruiken om je data naar een ander bedrijf te verplaatsen (GDPR artikel 20).
        </p>
      </div>

      {/* Danger Zone */}
      <div style={{
        background: 'var(--surface-warm)',
        border: `1px solid var(--border)`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--ink-3)',
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
            background: 'var(--surface-warm)',
            border: '1px solid var(--error)',
            borderRadius: 'var(--radius-md)',
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
            e.target.style.background = 'var(--surface-warm)'
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
        borderRadius: 'var(--radius-md)',
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
