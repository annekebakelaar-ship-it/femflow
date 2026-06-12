import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'react-feather'
import { getSecure, saveSecure } from '../../utils/secureStorage'
import { alleStarts, verwijderPeriodeStart, symptomenTussen } from '../../utils/periodeLog'

// Echte cyclushistorie in de donkere huisstijl (Oura-gevoel, warm bruin):
// volle-breedte kaarten met subtiele gradient en schaduw, crème typografie.
export default function MenstruationHistory() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [bevestigDatum, setBevestigDatum] = useState(null)
  const [melding, setMelding] = useState('')

  useEffect(() => {
    setData(getSecure('menstruation_data'))
  }, [])

  function handleVerwijder(datum) {
    const { status, data: nieuw } = verwijderPeriodeStart(data, datum)
    if (status === 'verwijderd') {
      saveSecure('menstruation_data', nieuw)
      setData(nieuw)
      setMelding('')
    } else if (status === 'laatste') {
      setMelding('De laatste start kan niet verwijderd worden. Pas de datum aan via Mijn Gegevens.')
    }
    setBevestigDatum(null)
  }

  const starts = alleStarts(data)
  const symptomLog = getSecure('symptom_log') || []

  // Nieuwste eerst; lengte = dagen tot de vólgende start
  const rijen = starts.map((start, i) => {
    const volgende = starts[i + 1] || null
    const lengte = volgende ? Math.round((volgende - start) / 86400000) : null
    const vorigeLengte = i > 0 && starts[i - 1]
      ? Math.round((start - starts[i - 1]) / 86400000) : null
    return {
      datum: start,
      iso: start.toISOString().split('T')[0],
      lengte,
      sprongMarker: lengte != null && vorigeLengte != null && Math.abs(lengte - vorigeLengte) >= 7,
      langeCyclusMarker: lengte != null && lengte >= 60,
      symptomen: symptomenTussen(symptomLog, start, volgende),
    }
  }).reverse()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--d-page)',
      padding: '20px 16px 120px 16px',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--d-ink-2)',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            padding: 0,
            marginBottom: '24px',
          }}
        >
          <ArrowLeft size={16} strokeWidth={1.5} /> Dashboard
        </button>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          fontWeight: '500',
          margin: '0 0 4px 0',
          color: 'var(--d-ink)',
        }}>
          Cyclushistorie
        </h1>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--d-ink-3)',
          margin: '0 0 24px 0',
          lineHeight: 1.5,
        }}>
          Je gelogde menstruatiestarts. Een foutje? Verwijder de start en log opnieuw.
        </p>

        {melding && (
          <div style={{
            background: 'var(--d-card-solid)',
            border: '1px solid var(--d-border)',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '16px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--d-ink-2)',
          }}>
            {melding}
          </div>
        )}

        {rijen.length === 0 ? (
          <p style={{ color: 'var(--d-ink-2)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
            Nog geen starts gelogd. Gebruik de logknop op het dashboard om je eerste
            menstruatiestart vast te leggen.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rijen.map(rij => (
              <div
                key={rij.iso}
                style={{
                  background: 'var(--d-card)',
                  border: 'none',
                  borderRadius: '22px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  padding: '18px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '11px',
                    fontWeight: '600',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--d-ink-3)',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    {rij.lengte != null ? `Cyclus · ${rij.lengte} dagen` : 'Lopende cyclus'}
                  </p>
                  <p style={{
                    margin: '6px 0 0 0',
                    fontSize: '17px',
                    fontWeight: '600',
                    color: 'var(--d-ink)',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    {rij.datum.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {(rij.sprongMarker || rij.langeCyclusMarker) && (
                    <p style={{
                      margin: '6px 0 0 0',
                      fontSize: '12px',
                      color: 'var(--d-accent)',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {[rij.sprongMarker && '±7 dagen t.o.v. vorige', rij.langeCyclusMarker && '60+ dagen']
                        .filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {rij.symptomen.length > 0 && (
                    <p style={{
                      margin: '8px 0 0 0',
                      fontSize: '12px',
                      color: 'var(--d-ink-2)',
                      fontFamily: 'var(--font-sans)',
                      lineHeight: 1.5,
                    }}>
                      {rij.symptomen.slice(0, 3).map(s => `${s.label} ×${s.aantal}`).join(' · ')}
                      {rij.symptomen.length > 3 && ` · +${rij.symptomen.length - 3} meer`}
                    </p>
                  )}
                </div>

                {bevestigDatum === rij.iso ? (
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleVerwijder(rij.iso)}
                      style={{
                        padding: '9px 14px',
                        background: 'var(--error)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      Verwijder
                    </button>
                    <button
                      onClick={() => setBevestigDatum(null)}
                      style={{
                        padding: '9px 14px',
                        background: 'transparent',
                        color: 'var(--d-ink-2)',
                        border: '1px solid var(--d-border)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                      }}
                    >
                      Houd
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setBevestigDatum(rij.iso)}
                    title="Verwijder deze start"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--d-ink-3)',
                      padding: '8px',
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {data?.startDate && (
          <div style={{
            marginTop: '24px',
            padding: '16px 20px',
            background: 'var(--d-card-solid)',
            border: '1px solid var(--d-border)',
            borderRadius: '14px',
            fontSize: '13px',
            color: 'var(--d-ink-2)',
            lineHeight: 1.7,
            fontFamily: 'var(--font-sans)',
          }}>
            <span style={{ color: 'var(--d-ink-3)' }}>Ingestelde cycluslengte</span>{' '}
            {data.cycleLength} dagen
            <span style={{ color: 'var(--d-ink-3)', marginLeft: '16px' }}>Menstruatieduur</span>{' '}
            {data.bleedingDays} dagen
          </div>
        )}
      </div>
    </div>
  )
}
