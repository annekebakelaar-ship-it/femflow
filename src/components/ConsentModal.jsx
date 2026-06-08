import { useState } from 'react'

export default function ConsentModal({ onAccept, onReject }) {
  const [agreed, setAgreed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleAccept = () => {
    if (!agreed) return
    localStorage.setItem('consent_given_at', new Date().toISOString())
    localStorage.setItem('consent_version', '1.0')
    onAccept()
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(42, 33, 28, 0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      zIndex: 9999,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: '100%',
        maxHeight: '90vh',
        background: 'white',
        borderRadius: '16px 16px 0 0',
        padding: '24px',
        boxSizing: 'border-box',
        overflow: 'auto',
        boxShadow: '0 -12px 32px rgba(42, 33, 28, 0.2)',
        animation: 'slide-up 300ms ease',
      }}>
        <style>{`
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          fontWeight: '600',
          color: 'var(--ink)',
          margin: '0 0 16px 0',
        }}>
          Jouw privacy en gegevens
        </h2>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          color: 'var(--ink-2)',
          margin: '0 0 20px 0',
          lineHeight: '1.6',
        }}>
          FemFlow verwerkt gevoelige gezondheidsgegevens. We willen transparant zijn over hoe we je data gebruiken.
        </p>

        {/* Summary */}
        <div style={{
          background: 'rgba(199, 154, 110, 0.08)',
          border: '1px solid rgba(199, 154, 110, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--ink)',
            margin: '0 0 8px 0',
            fontWeight: '500',
          }}>
            We verzamelen en verwerken:
          </p>
          <ul style={{
            margin: '0',
            paddingLeft: '20px',
            fontSize: '13px',
            color: 'var(--ink-2)',
          }}>
            <li>Menstruatiecyclus gegevens (startdatum, cyclusduur, symptomen)</li>
            <li>Je voornaam en geboortedatum</li>
            <li>Gezondheid & lifestyle data (optioneel: Oura ring)</li>
          </ul>
        </div>

        {/* Expandable Details */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            padding: 0,
            marginBottom: '12px',
            textDecoration: 'underline',
          }}
        >
          {expanded ? '▼ Minder details' : '▶ Meer details'}
        </button>

        {expanded && (
          <div style={{
            background: '#F5EFEB',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            fontSize: '12px',
            color: 'var(--ink-2)',
            lineHeight: '1.6',
          }}>
            <strong>Rechtsbasis:</strong> Expliciete toestemming (artikel 6.1.a AVG)
            <br /><br />
            <strong>Doel:</strong> Menstruatiecyclus tracking, gezondheid inzichten, gepersonaliseerde aanbevelingen
            <br /><br />
            <strong>Duur:</strong> Tot u uw account verwijdert
            <br /><br />
            <strong>Jouw rechten:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Inzage in je gegevens aanvragen</li>
              <li>Gegevens verwijderen (WURGF)</li>
              <li>Gegevens exporteren (portabiliteit)</li>
              <li>Toestemming op elk moment intrekken</li>
            </ul>
            <br />
            Lees het volledige <a href="/privacy" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>privacybeleid</a> voor meer info.
          </div>
        )}

        {/* Checkbox */}
        <label style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '20px',
          cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{
              marginTop: '4px',
              cursor: 'pointer',
              accentColor: 'var(--accent)',
              width: '20px',
              height: '20px',
            }}
          />
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--ink)',
            lineHeight: '1.5',
          }}>
            Ik ga akkoord met het verwerken van mijn gezondheidsgegevens en heb het privacybeleid gelezen
          </span>
        </label>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={onReject}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'transparent',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--ink-2)',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F5EFEB'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Afslaan
          </button>
          <button
            onClick={handleAccept}
            disabled={!agreed}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: agreed ? 'var(--accent)' : '#E0E0E0',
              border: 'none',
              borderRadius: '8px',
              cursor: agreed ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              if (agreed) e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={(e) => {
              if (agreed) e.currentTarget.style.opacity = '1'
            }}
          >
            Akkoord & verder
          </button>
        </div>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          color: 'var(--ink-3)',
          margin: '16px 0 0 0',
          textAlign: 'center',
          lineHeight: '1.6',
        }}>
          Vragen? Neem contact op: <a href="mailto:privacy@youcaps.app" style={{ color: 'var(--accent)', textDecoration: 'none' }}>privacy@youcaps.app</a>
        </p>
      </div>
    </div>
  )
}
