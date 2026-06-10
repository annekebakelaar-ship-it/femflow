import { useState } from 'react'
import { Droplet, Check } from 'react-feather'
import { saveSecure, getSecure } from '../utils/secureStorage'
import { logOpties, voegPeriodeStartToe, laatsteStart } from '../utils/periodeLog'

// Snelle logknop voor een nieuwe menstruatiestart, met een bereik van drie
// dagen (vandaag/gisteren/eergisteren) voor wie het loggen even uitstelde.
// Data blijft client-side in secureStorage, consistent met de tracker.
export default function PeriodeLogKnop({ onGelogd }) {
  const [open, setOpen] = useState(false)
  const [melding, setMelding] = useState(null) // { tekst, type: 'ok' | 'info' }

  const menstrualData = getSecure('menstruation_data')
  const laatste = laatsteStart(menstrualData)

  function handleLog(datum, label) {
    const huidig = getSecure('menstruation_data')
    const { status, data } = voegPeriodeStartToe(huidig, datum)

    if (status === 'duplicaat') {
      setMelding({ tekst: 'Deze dag is al gelogd', type: 'info' })
    } else {
      saveSecure('menstruation_data', data)
      setMelding({ tekst: `Gelogd: ${label.toLowerCase()}`, type: 'ok' })
      if (onGelogd) onGelogd()
    }

    setOpen(false)
    setTimeout(() => setMelding(null), 2500)
  }

  return (
    <div style={{ width: '100%', padding: '0 var(--space-lg)', boxSizing: 'border-box', marginBottom: 'var(--space-md)' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <Droplet size={18} color="var(--phase-menstrual, #D96A7A)" strokeWidth={1.5} />
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--ink)',
                margin: 0,
              }}>
                Menstruatie gestart?
              </p>
              {laatste && !melding && (
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  color: 'var(--ink-3)',
                  margin: '2px 0 0 0',
                }}>
                  Laatste start: {laatste.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}
                </p>
              )}
              {melding && (
                <p style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  color: melding.type === 'ok' ? 'var(--success)' : 'var(--ink-2)',
                  margin: '2px 0 0 0',
                }}>
                  {melding.type === 'ok' && <Check size={12} strokeWidth={2} />}
                  {melding.tekst}
                </p>
              )}
            </div>
          </div>

          {!open && (
            <button
              onClick={() => setOpen(true)}
              style={{
                padding: '10px 16px',
                background: 'var(--ink)',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Log start
            </button>
          )}
        </div>

        {open && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            {logOpties().map(optie => (
              <button
                key={optie.datum}
                onClick={() => handleLog(optie.datum, optie.label)}
                style={{
                  flex: '1 1 auto',
                  padding: '10px 12px',
                  background: 'var(--accent-soft)',
                  color: 'var(--ink)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                {optie.label}
              </button>
            ))}
            <button
              onClick={() => setOpen(false)}
              style={{
                padding: '10px 12px',
                background: 'transparent',
                color: 'var(--ink-3)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
              }}
            >
              Annuleer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
