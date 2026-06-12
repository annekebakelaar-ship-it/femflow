import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'react-feather'
import { getSecure, saveSecure } from '../../utils/secureStorage'
import { alleStarts, verwijderPeriodeStart, symptomenTussen } from '../../utils/periodeLog'

// Echte cyclushistorie: de gelogde menstruatiestarts, met de berekende
// cycluslengtes ertussen en de mogelijkheid een foutje te verwijderen.
// (De oude versie toonde een extrapolatie van de ingestelde cycluslengte
// en presenteerde die voorspelling als geschiedenis.)
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
      padding: 'var(--space-lg)',
      background: 'var(--bg)',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            marginBottom: 'var(--space-lg)',
          }}
        >
          ←
        </button>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', marginBottom: '4px', color: 'var(--ink)' }}>
          Cyclushistorie
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-2)', margin: '0 0 var(--space-lg) 0' }}>
          Je gelogde menstruatiestarts. Een foutje? Verwijder de start en log opnieuw.
        </p>

        {melding && (
          <div style={{
            background: 'var(--surface-warm)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: 'var(--space-md)',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--ink-2)',
          }}>
            {melding}
          </div>
        )}

        {rijen.length === 0 ? (
          <p style={{ color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
            Nog geen starts gelogd. Gebruik de logknop op het dashboard om je eerste
            menstruatiestart vast te leggen.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {rijen.map(rij => (
              <div
                key={rij.iso}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  padding: 'var(--space-md)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--ink)', fontFamily: 'var(--font-sans)' }}>
                    {rij.datum.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--ink-3)', fontFamily: 'var(--font-sans)' }}>
                    {rij.lengte != null ? `Cyclus van ${rij.lengte} dagen` : 'Lopende cyclus'}
                    {rij.sprongMarker && ' · ±7 dagen t.o.v. vorige'}
                    {rij.langeCyclusMarker && ' · 60+ dagen'}
                  </p>
                  {rij.symptomen.length > 0 && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', lineHeight: 1.5 }}>
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
                        padding: '8px 12px',
                        background: 'var(--error)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
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
                        padding: '8px 12px',
                        background: 'transparent',
                        color: 'var(--ink-2)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
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
                      color: 'var(--ink-3)',
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
            marginTop: 'var(--space-xl)',
            padding: 'var(--space-md)',
            background: 'rgba(199, 154, 110, 0.05)',
            borderRadius: '12px',
            fontSize: '13px',
            color: 'var(--ink-2)',
            lineHeight: '1.6',
            fontFamily: 'var(--font-sans)',
          }}>
            <p style={{ margin: '0 0 var(--space-sm) 0' }}>
              <strong>Ingestelde cycluslengte:</strong> {data.cycleLength} dagen
            </p>
            <p style={{ margin: 0 }}>
              <strong>Menstruatieduur:</strong> {data.bleedingDays} dagen
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
