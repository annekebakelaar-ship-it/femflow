import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { saveSecure, getSecure, deleteAllSecure, exportSecureData } from '../../utils/secureStorage'
import { deleteAccount, clearToken, getNewsletterStatus, setNewsletterStatus } from '../../api/client'
import HuisartsRapport from '../../components/huisartsrapport/HuisartsRapport'

export default function AccountPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [menstrualData, setMenstrualData] = useState({
    startDate: '',
    cycleLength: 28,
    bleedingDays: '',
  })
  const [saveStatus, setSaveStatus] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  // null = niet ingelogd of nog onbekend -> sectie verborgen
  const [nieuwsbrief, setNieuwsbrief] = useState(null)
  const [nieuwsbriefBezig, setNieuwsbriefBezig] = useState(false)

  useEffect(() => {
    const stored = getSecure('menstruation_data')
    if (stored) {
      setName(stored.name || '')
      setMenstrualData({
        startDate: stored.startDate || '',
        cycleLength: stored.cycleLength || 28,
        bleedingDays: stored.bleedingDays || '',
      })
    }

    getNewsletterStatus()
      .then(res => setNieuwsbrief(res.subscribed))
      .catch(() => setNieuwsbrief(null))
  }, [])

  async function handleNieuwsbriefToggle() {
    setNieuwsbriefBezig(true)
    try {
      const res = await setNewsletterStatus(!nieuwsbrief)
      setNieuwsbrief(res.subscribed)
    } catch (err) {
      console.error('Nieuwsbrief wijzigen mislukt:', err)
    } finally {
      setNieuwsbriefBezig(false)
    }
  }

  const handleSave = () => {
    // Validate
    if (!name || name.trim().length === 0) {
      setSaveStatus('Naam mag niet leeg zijn')
      return
    }
    if (!menstrualData.startDate || menstrualData.startDate.length !== 10) {
      setSaveStatus('Startdatum is verplicht')
      return
    }
    const cycle = parseInt(menstrualData.cycleLength)
    if (isNaN(cycle) || cycle < 10 || cycle > 50) {
      setSaveStatus('Cyclus lengte moet tussen 10 en 50 dagen zijn')
      return
    }
    const bleed = parseInt(menstrualData.bleedingDays)
    if (isNaN(bleed) || bleed < 1 || bleed > 9) {
      setSaveStatus('Periode dagen moet tussen 1 en 9 zijn')
      return
    }

    // Save securely
    const existing = getSecure('menstruation_data') || {}
    saveSecure('menstruation_data', {
      ...existing,
      name: String(name).substring(0, 100),
      startDate: menstrualData.startDate,
      cycleLength: cycle,
      bleedingDays: bleed,
    })

    setSaveStatus('✓ Opgeslagen')
    setTimeout(() => setSaveStatus(''), 3000)
  }

  const handleExport = () => {
    const data = exportSecureData()
    if (!data) {
      setSaveStatus('Kan gegevens niet exporteren')
      return
    }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `femflow-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setSaveStatus('✓ Geëxporteerd')
    setTimeout(() => setSaveStatus(''), 3000)
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      // Delete account on backend
      await deleteAccount()

      // Clear all local data
      deleteAllSecure()
      localStorage.removeItem('consent_given_at')
      localStorage.removeItem('consent_version')
      localStorage.removeItem('menstruation_data')
      clearToken()

      setSaveStatus('✓ Account verwijderd')
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      console.error('Delete account error:', err)
      setSaveStatus('Fout bij verwijderen')
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div style={{
      maxWidth: '100%',
      width: '100%',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'var(--font-sans)',
      boxSizing: 'border-box',
      minHeight: '100vh',
      background: 'var(--d-page)',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Back Button */}
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
            marginBottom: '24px',
            padding: 0,
          }}
        >
          ← Terug
        </button>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          fontWeight: 500,
          lineHeight: 1.25,
          marginBottom: '32px',
          color: 'var(--d-ink)',
        }}>
          Mijn Gegevens
        </h1>

        {/* Name Field */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            color: 'var(--d-ink)',
          }}>
            Naam
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jouw naam"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              border: '1px solid var(--d-border)',
              background: 'var(--d-card-solid)',
              color: 'var(--d-ink)',
              borderRadius: '8px',
              fontFamily: 'var(--font-sans)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Menstruation Section */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '18px',
          fontWeight: '500',
          marginTop: '40px',
          marginBottom: '16px',
          color: 'var(--d-ink)',
        }}>
          Menstruatie
        </h2>

        {/* Start Date Field */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            color: 'var(--d-ink)',
          }}>
            Startdatum
          </label>
          <input
            type="date"
            value={menstrualData.startDate}
            onChange={(e) => setMenstrualData({ ...menstrualData, startDate: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              border: '1px solid var(--d-border)',
              background: 'var(--d-card-solid)',
              color: 'var(--d-ink)',
              borderRadius: '8px',
              fontFamily: 'var(--font-sans)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Cycle Length Field */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            color: 'var(--d-ink)',
          }}>
            Cyclus lengte (dagen)
          </label>
          <input
            type="number"
            value={menstrualData.cycleLength}
            onChange={(e) => setMenstrualData({ ...menstrualData, cycleLength: parseInt(e.target.value) || 28 })}
            min="10"
            max="50"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              border: '1px solid var(--d-border)',
              background: 'var(--d-card-solid)',
              color: 'var(--d-ink)',
              borderRadius: '8px',
              fontFamily: 'var(--font-sans)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Bleeding Days Field */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            color: 'var(--d-ink)',
          }}>
            Periode dagen
          </label>
          <input
            type="number"
            value={menstrualData.bleedingDays}
            onChange={(e) => setMenstrualData({ ...menstrualData, bleedingDays: e.target.value })}
            min="1"
            max="9"
            placeholder="Aantal dagen"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              border: '1px solid var(--d-border)',
              background: 'var(--d-card-solid)',
              color: 'var(--d-ink)',
              borderRadius: '8px',
              fontFamily: 'var(--font-sans)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            background: saveStatus.startsWith('✓') ? 'rgba(79, 140, 90, 0.18)' : 'rgba(192, 73, 45, 0.18)',
            color: saveStatus.startsWith('✓') ? '#8FBF98' : '#E08A8A',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            textAlign: 'center',
          }}>
            {saveStatus}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'var(--d-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '15px',
            transition: 'all 150ms ease',
            marginBottom: '12px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Opslaan
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'transparent',
            color: 'var(--d-accent)',
            border: '1px solid var(--d-accent)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 150ms ease',
            marginBottom: '24px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(199, 154, 110, 0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          Download mijn gegevens (JSON)
        </button>

        {/* Nieuwsbrief (alleen zichtbaar voor ingelogde gebruikers) */}
        {nieuwsbrief !== null && (
          <div style={{
            background: 'var(--d-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
            border: 'none',
            borderRadius: '22px',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: '500',
                color: 'var(--d-ink)',
                margin: '0 0 4px 0',
              }}>
                Nieuwsbrief
              </h3>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--d-ink-2)',
                margin: 0,
                lineHeight: 1.5,
              }}>
                Maximaal één mail per week over perimenopauze en Ovari.
              </p>
            </div>
            <button
              onClick={handleNieuwsbriefToggle}
              disabled={nieuwsbriefBezig}
              aria-label={nieuwsbrief ? 'Nieuwsbrief uitzetten' : 'Nieuwsbrief aanzetten'}
              style={{
                width: '48px',
                height: '28px',
                borderRadius: '999px',
                border: 'none',
                cursor: nieuwsbriefBezig ? 'wait' : 'pointer',
                background: nieuwsbrief ? 'var(--d-accent)' : 'var(--d-border)',
                position: 'relative',
                transition: 'background 200ms ease',
                flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute',
                top: '3px',
                left: nieuwsbrief ? '23px' : '3px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'white',
                transition: 'left 200ms ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
        )}

        {/* Huisartsrapport */}
        <div style={{ marginBottom: '24px' }}>
          <HuisartsRapport />
        </div>

        {/* Delete Section */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid var(--d-border)',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: '500',
            color: '#E08A8A',
            marginBottom: '12px',
          }}>
            Gevaarlijk gebied
          </h3>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(192, 73, 45, 0.18)',
                color: '#E08A8A',
                border: '1px solid #FFCDD2',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(192, 73, 45, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(192, 73, 45, 0.18)'}
            >
              Verwijder mijn account en gegevens
            </button>
          ) : (
            <div style={{
              background: 'rgba(192, 73, 45, 0.18)',
              border: '1px solid #FFCDD2',
              borderRadius: '8px',
              padding: '16px',
            }}>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: '#E08A8A',
                marginBottom: '16px',
                lineHeight: '1.6',
              }}>
                ⚠️ Dit kan <strong>niet ongedaan</strong> gemaakt worden. Alle je gezondheidsgegevens worden permanent verwijderd.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    background: 'white',
                    color: '#E08A8A',
                    border: '1px solid #FFCDD2',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '13px',
                  }}
                >
                  Annuleren
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    background: deleteLoading ? '#E0E0E0' : '#C62828',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: deleteLoading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                  }}
                >
                  {deleteLoading ? 'Bezig...' : 'Ja, verwijderen'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
