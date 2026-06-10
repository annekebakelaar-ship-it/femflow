import { useState } from 'react'

const CONSENT_KEY = 'femflow_analytics_consent'

function readConsent() {
  try { return localStorage.getItem(CONSENT_KEY) } catch { return null }
}

// GDPR: GA4 wordt pas geladen na expliciet akkoord (window.initAnalytics
// staat in index.html). Bij weigeren wordt er niets geladen en vragen we
// het niet opnieuw.
export default function AnalyticsConsentBanner() {
  const [consent, setConsent] = useState(readConsent)

  if (consent) return null

  function decide(value) {
    try { localStorage.setItem(CONSENT_KEY, value) } catch {}
    if (value === 'granted' && window.initAnalytics) window.initAnalytics()
    setConsent(value)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '16px',
      right: '16px',
      maxWidth: '440px',
      margin: '0 auto',
      background: 'var(--surface, #FFFFFF)',
      border: '1px solid var(--border, #E8E0D8)',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 8px 24px rgba(42, 33, 28, 0.15)',
      zIndex: 9000,
      fontFamily: 'var(--font-sans)',
    }}>
      <p style={{
        margin: '0 0 12px 0',
        fontSize: '13px',
        lineHeight: 1.5,
        color: 'var(--ink-2, #6E635B)',
      }}>
        We gebruiken anonieme statistieken om FemFlow te verbeteren.
        Geen advertenties, geen doorverkoop. Vind je dat goed?
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => decide('granted')}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'var(--ink, #2A211C)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          Prima
        </button>
        <button
          onClick={() => decide('denied')}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'transparent',
            color: 'var(--ink-2, #6E635B)',
            border: '1px solid var(--border, #E8E0D8)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          Liever niet
        </button>
      </div>
    </div>
  )
}
