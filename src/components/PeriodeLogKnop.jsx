import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplet, Check } from 'react-feather'
import { saveSecure, getSecure } from '../utils/secureStorage'
import { logOpties, voegPeriodeStartToe, laatsteStart } from '../utils/periodeLog'

// Menstruatiestart loggen via een zwevende druppelknop (FAB) met bottom
// sheet, zoals gangbaar in cyclus-apps. Drie dagen terug logbaar voor wie
// het even uitstelde. Data blijft client-side in secureStorage.
export default function PeriodeLogKnop({ onGelogd }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState(null) // { tekst, type: 'ok' | 'info' }

  const menstrualData = getSecure('menstruation_data')
  const laatste = laatsteStart(menstrualData)

  function handleLog(datum, label) {
    const huidig = getSecure('menstruation_data')
    const { status, data } = voegPeriodeStartToe(huidig, datum)

    if (status === 'duplicaat') {
      setToast({ tekst: 'Deze dag is al gelogd', type: 'info' })
    } else {
      saveSecure('menstruation_data', data)
      setToast({ tekst: `Gelogd: ${label.toLowerCase()}`, type: 'ok' })
      if (onGelogd) onGelogd()
    }

    setOpen(false)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <>
      {/* Zwevende druppelknop, boven de feedback-knop (bottom 120px) */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Menstruatiestart loggen"
        style={{
          position: 'fixed',
          bottom: '188px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--phase-menstrual, #D96A7A)',
          border: 'none',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 90,
        }}
      >
        <Droplet size={24} color="white" strokeWidth={1.8} />
      </button>

      {/* Toast na loggen */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '252px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(36, 19, 7, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: toast.type === 'ok' ? 'var(--success)' : 'var(--d-ink-2)',
          padding: '10px 14px',
          borderRadius: '999px',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
          zIndex: 95,
        }}>
          {toast.type === 'ok' && <Check size={14} strokeWidth={2} />}
          {toast.tekst}
        </div>
      )}

      {/* Bottom sheet */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 8, 3, 0.55)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 200,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              background: 'rgba(36, 19, 7, 0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: '22px 22px 0 0',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
              padding: '12px 20px calc(20px + env(safe-area-inset-bottom, 0px)) 20px',
              boxSizing: 'border-box',
              animation: 'fade-slide-up 200ms ease both',
            }}
          >
            {/* Sleepgreepje */}
            <div style={{
              width: '36px',
              height: '4px',
              borderRadius: '999px',
              background: 'rgba(244, 236, 227, 0.25)',
              margin: '0 auto 16px auto',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <Droplet size={18} color="var(--phase-menstrual, #D96A7A)" strokeWidth={1.5} />
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: '500',
                color: 'var(--d-ink)',
                margin: 0,
              }}>
                Menstruatie gestart?
              </h3>
            </div>

            {laatste && (
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--d-ink-3)',
                margin: '0 0 16px 28px',
              }}>
                Laatste start: {laatste.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}
                {' · '}
                <button
                  onClick={() => { setOpen(false); navigate('/health/menstruation/history') }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--d-accent)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    textDecoration: 'underline',
                    textUnderlineOffset: 2,
                  }}
                >
                  historie
                </button>
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', marginTop: laatste ? 0 : '16px' }}>
              {logOpties().map((optie, i) => (
                <button
                  key={optie.datum}
                  onClick={() => handleLog(optie.datum, optie.label)}
                  style={{
                    width: '100%',
                    padding: '15px 4px',
                    background: 'transparent',
                    color: 'var(--d-ink)',
                    border: 'none',
                    borderTop: i === 0 ? 'none' : '1px solid var(--d-border)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '15px',
                    fontWeight: '500',
                    textAlign: 'left',
                  }}
                >
                  {optie.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setOpen(false)}
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '13px',
                background: 'var(--d-card)',
                color: 'var(--d-ink-2)',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Annuleer
            </button>
          </div>
        </div>
      )}
    </>
  )
}
