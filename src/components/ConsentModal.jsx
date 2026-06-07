import { useState } from 'react'

export default function ConsentModal({ onAccept, onReject }) {
  const [checked, setChecked] = useState({
    health_data: false,
    ai_recommendations: false,
    terms: false,
  })

  const allChecked = Object.values(checked).every(v => v === true)

  function handleAccept() {
    if (allChecked) {
      onAccept()
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--space-lg)',
    }}>
      <div style={{
        maxWidth: '500px',
        background: 'white',
        borderRadius: '4px',
        padding: 'var(--space-xl)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>
          Welkom bij YouCaps
        </h2>
        <p style={{ color: 'var(--color-secondary)', marginBottom: 'var(--space-lg)' }}>
          Voordat je begint, hebben we je toestemming nodig voor:
        </p>

        <label style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)', cursor: 'pointer', padding: 'var(--space-md)', background: '#F9F7F3', borderRadius: '2px' }}>
          <input type="checkbox" checked={checked.health_data} onChange={e => setChecked({ ...checked, health_data: e.target.checked })} style={{ accentColor: 'var(--color-accent)' }} />
          <div>
            <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>Gezondheidsgegevens</p>
            <p style={{ margin: 0, fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)' }}>Menstruatiecyclus, symptomen, slaap en hartslag</p>
          </div>
        </label>

        <label style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', cursor: 'pointer', padding: 'var(--space-md)', background: '#F9F7F3', borderRadius: '2px' }}>
          <input type="checkbox" checked={checked.ai_recommendations} onChange={e => setChecked({ ...checked, ai_recommendations: e.target.checked })} style={{ accentColor: 'var(--color-accent)' }} />
          <div>
            <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>AI Aanbevelingen</p>
            <p style={{ margin: 0, fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)' }}>Gepersonaliseerde artikelen gebaseerd op jouw cyclus</p>
          </div>
        </label>

        <label style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', cursor: 'pointer', padding: 'var(--space-md)', background: '#F9F7F3', borderRadius: '2px' }}>
          <input type="checkbox" checked={checked.terms} onChange={e => setChecked({ ...checked, terms: e.target.checked })} style={{ accentColor: 'var(--color-accent)' }} />
          <div>
            <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>Voorwaarden & Privacy</p>
            <p style={{ margin: 0, fontSize: 'var(--font-size-small)', color: 'var(--color-secondary)' }}>Ik ga akkoord met Gebruikersvoorwaarden en Privacybeleid</p>
          </div>
        </label>

        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <button onClick={onReject} style={{ flex: 1, padding: 'var(--space-md)', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '2px', cursor: 'pointer' }}>
            Afwijzen
          </button>
          <button onClick={handleAccept} disabled={!allChecked} style={{ flex: 1, padding: 'var(--space-md)', background: allChecked ? 'var(--color-accent)' : 'var(--color-border)', border: 'none', borderRadius: '2px', color: allChecked ? 'white' : 'var(--color-label)', cursor: allChecked ? 'pointer' : 'not-allowed' }}>
            Akkoord & Doorgaan
          </button>
        </div>
      </div>
    </div>
  )
}
