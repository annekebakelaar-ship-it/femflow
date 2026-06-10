import { useState, useEffect } from 'react'
import { ArrowRight } from 'react-feather'
import { getSecure } from '../utils/secureStorage'
import { getWearableReadings } from '../api/client'
import { berekenTrend } from '../utils/trendHelper'
import { bouwSupplementSuggesties } from '../utils/supplementAdvies'

const YOUCAPS_URL = 'https://youcaps.app'

// FemFlow -> YouCaps funnel (fase 1). Verschijnt alleen wanneer eigen data
// een suggestie onderbouwt; observaties worden client-side berekend en
// verlaten het apparaat niet. Alleen EFSA-goedgekeurde claims.
export default function SupplementSuggestie({ cyclusFase = null }) {
  const [suggesties, setSuggesties] = useState([])

  useEffect(() => {
    async function bouw() {
      // Symptoomfrequenties uit de lokale log (laatste ~6 maanden)
      const symptomen = {}
      const vanaf = new Date()
      vanaf.setMonth(vanaf.getMonth() - 6)
      for (const entry of getSecure('symptom_log') || []) {
        if (!entry.date || new Date(entry.date) < vanaf) continue
        symptomen[entry.symptom] = (symptomen[entry.symptom] || 0) + 1
      }

      // Wearable-observaties (optioneel)
      let slaapGemUur = null
      let hrvRichting = null
      try {
        const result = await getWearableReadings(90)
        const slaap = (result.data || []).map(r => r.sleep_duration_min).filter(v => v != null)
        if (slaap.length >= 7) {
          slaapGemUur = Math.round((slaap.reduce((a, b) => a + b, 0) / slaap.length / 60) * 10) / 10
        }
        const hrv = (result.data || []).map(r => r.hrv_ms).filter(v => v != null)
        if (hrv.length >= 4) hrvRichting = berekenTrend(hrv).richting
      } catch {
        // geen wearable of niet ingelogd: alleen cyclus/symptomen gebruiken
      }

      setSuggesties(bouwSupplementSuggesties({ slaapGemUur, hrvRichting, fase: cyclusFase, symptomen }))
    }
    bouw()
  }, [cyclusFase])

  if (suggesties.length === 0) return null

  function handleCta() {
    // Conversie-event, alleen verstuurd als analytics-consent gegeven is
    // (gtag is anders een no-op richting een nooit-geladen script).
    // Bevat bewust geen gezondheidsdata.
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'youcaps_cta_click', { source: 'femflow_supplement_suggestie' })
    }
    window.open(YOUCAPS_URL, '_blank', 'noopener')
  }

  return (
    <div style={{ width: '100%', padding: '0 var(--space-lg)', boxSizing: 'border-box', marginTop: 'var(--space-xl)' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '20px',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          margin: '0 0 4px 0',
        }}>
          Op basis van jouw gegevens
        </p>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '18px',
          fontWeight: '500',
          color: 'var(--ink)',
          margin: '0 0 14px 0',
        }}>
          Suggestie voor deze maand
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          {suggesties.map(s => (
            <div key={s.id} style={{
              borderLeft: '2px solid var(--accent)',
              paddingLeft: '12px',
            }}>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--ink)',
                margin: 0,
              }}>
                {s.naam}
              </p>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--ink-2)',
                margin: '2px 0 0 0',
                lineHeight: 1.5,
              }}>
                {s.reden}. {s.naam} {s.claim}.
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={handleCta}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'var(--ink)',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          Bekijk je formule bij YouCaps
          <ArrowRight size={14} strokeWidth={2} />
        </button>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          color: 'var(--ink-3)',
          margin: '12px 0 0 0',
          lineHeight: 1.5,
        }}>
          Suggestie op basis van je eigen gegevens, berekend op dit apparaat.
          Geen medisch advies; raadpleeg bij klachten je huisarts.
        </p>
      </div>
    </div>
  )
}
