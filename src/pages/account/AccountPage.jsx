import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { saveSecure, getSecure, deleteAllSecure, exportSecureData } from '../../utils/secureStorage'
import { deleteAccount, clearToken } from '../../api/client'
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
  }, [])

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
      background: 'var(--bg)',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Back Button */}
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
          color: 'var(--ink)',
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
            color: 'var(--ink)',
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
              border: '1px solid #E0E0E0',
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
          color: 'var(--ink)',
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
            color: 'var(--ink)',
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
              border: '1px solid #E0E0E0',
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
            color: 'var(--ink)',
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
              border: '1px solid #E0E0E0',
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
            color: 'var(--ink)',
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
              border: '1px solid #E0E0E0',
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
            background: saveStatus.startsWith('✓') ? '#E8F5E9' : '#FFEBEE',
            color: saveStatus.startsWith('✓') ? '#2E7D32' : '#C62828',
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
            background: 'var(--accent)',
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
            color: 'var(--accent)',
            border: '1px solid var(--accent)',
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

        {/* Huisartsrapport */}
        <div style={{ marginBottom: '24px' }}>
          <HuisartsRapport />
        </div>

        {/* Delete Section */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid #E0E0E0',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: '500',
            color: '#C62828',
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
                background: '#FFEBEE',
                color: '#C62828',
                border: '1px solid #FFCDD2',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FFCDD2'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FFEBEE'}
            >
              Verwijder mijn account en gegevens
            </button>
          ) : (
            <div style={{
              background: '#FFEBEE',
              border: '1px solid #FFCDD2',
              borderRadius: '8px',
              padding: '16px',
            }}>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: '#C62828',
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
                    color: '#C62828',
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
