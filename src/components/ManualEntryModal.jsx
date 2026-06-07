import { useState } from 'react'

const SYMPTOMS = [
  'Bloeding',
  'Kramp',
  'Buikpijn',
  'Ruggenpijn',
  'Hoofdpijn',
  'Vermoeidheid',
  'Gevoelige borsten',
  'Prikkelbaarheid',
  'Angst',
  'Depressie',
  'Concentratieproblemen',
  'Waterbinding',
  'Acne',
]

export default function ManualEntryModal({ isOpen, onClose, onSave, selectedDate = null }) {
  const today = selectedDate ? new Date(selectedDate) : new Date()
  const [date, setDate] = useState(today.toISOString().split('T')[0])
  const [selectedSymptoms, setSelectedSymptoms] = useState({})
  const [bleedingType, setBleedingType] = useState('none')
  const [notes, setNotes] = useState('')

  const handleSymptomChange = (symptom, intensity) => {
    setSelectedSymptoms((prev) => ({
      ...prev,
      [symptom]: intensity === 0 ? undefined : intensity,
    }))
  }

  const handleSave = () => {
    onSave({
      date,
      symptoms: selectedSymptoms,
      bleeding: bleedingType,
      notes,
    })
    setSelectedSymptoms({})
    setBleedingType('none')
    setNotes('')
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      zIndex: 1000,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'white',
        borderRadius: '16px 16px 0 0',
        padding: 'var(--space-lg)',
        maxHeight: '80vh',
        overflowY: 'auto',
        animation: 'slide-up 240ms ease both',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-md)',
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-heading)',
            fontWeight: 'var(--font-weight-semibold)',
            margin: 0,
          }}>
            Nieuwe Inzending
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <label style={{
            fontSize: 'var(--font-size-small)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-label)',
            display: 'block',
            marginBottom: '8px',
          }}>
            Datum
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-sm)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: 'var(--font-size-body)',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <label style={{
            fontSize: 'var(--font-size-small)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-label)',
            display: 'block',
            marginBottom: '8px',
          }}>
            Bloeding
          </label>
          <select
            value={bleedingType}
            onChange={(e) => setBleedingType(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-sm)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: 'var(--font-size-body)',
              fontFamily: 'inherit',
            }}
          >
            <option value="none">Geen</option>
            <option value="light">Licht</option>
            <option value="moderate">Matig</option>
            <option value="heavy">Zwaar</option>
          </select>
        </div>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <label style={{
            fontSize: 'var(--font-size-small)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-label)',
            display: 'block',
            marginBottom: '12px',
          }}>
            Symptomen
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-sm)',
          }}>
            {SYMPTOMS.map((symptom) => (
              <div key={symptom}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-small)',
                  padding: '8px',
                  borderRadius: '8px',
                  background: selectedSymptoms[symptom] ? '#F5F5F5' : 'transparent',
                }}>
                  <input
                    type="checkbox"
                    checked={!!selectedSymptoms[symptom]}
                    onChange={(e) => handleSymptomChange(symptom, e.target.checked ? 3 : 0)}
                    style={{ cursor: 'pointer' }}
                  />
                  {symptom}
                </label>

                {selectedSymptoms[symptom] && (
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={selectedSymptoms[symptom]}
                    onChange={(e) => handleSymptomChange(symptom, parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      cursor: 'pointer',
                      marginTop: '4px',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <label style={{
            fontSize: 'var(--font-size-small)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-label)',
            display: 'block',
            marginBottom: '8px',
          }}>
            Opmerkingen
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Voeg aanvullende opmerkingen toe..."
            style={{
              width: '100%',
              padding: 'var(--space-sm)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: 'var(--font-size-body)',
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: '80px',
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-lg)',
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 'var(--space-md)',
              border: '1px solid var(--color-border)',
              background: 'white',
              borderRadius: '8px',
              fontSize: 'var(--font-size-body)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: 'var(--space-md)',
              border: 'none',
              background: '#000',
              color: 'white',
              borderRadius: '8px',
              fontSize: 'var(--font-size-body)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            Opslaan
          </button>
        </div>

        <style>{`
          @keyframes slide-up {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  )
}
