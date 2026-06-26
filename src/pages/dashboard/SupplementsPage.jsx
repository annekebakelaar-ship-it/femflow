import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SupplementsPage() {
  const navigate = useNavigate()
  const [subscribed, setSubscribed] = useState(localStorage.getItem('supplements_subscribed') === 'true')

  const handleSubscribe = () => {
    setSubscribed(true)
    localStorage.setItem('supplements_subscribed', 'true')
  }

  const supplements = [
    { name: 'Magnesium', benefit: 'Slaapkwaliteit & Stress', dosage: '400mg dagelijks', timing: 'Avond' },
    { name: 'B-Vitamines', benefit: 'Energie & Concentratie', dosage: 'Dagelijks', timing: 'Morgen' },
    { name: 'Omega-3', benefit: 'Hersengezondheid', dosage: '2x dagelijks', timing: 'Bij maaltijden' },
    { name: 'Adaptogenen', benefit: 'Stressresistentie', dosage: '1x dagelijks', timing: 'Morgen' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--space-lg) 140px var(--space-lg)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'fade-slide-up 240ms ease both',
      background: 'var(--d-page)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: '500',
            color: 'var(--d-ink)',
          }}>FemFlow</span>
        </button>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>←</button>
      </div>

      <h1 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, color: 'var(--d-ink)', margin: '0 0 var(--space-lg) 0' }}>
        Jouw Supplementen Plan
      </h1>

      {!subscribed ? (
        <>
          <p style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5, color: 'var(--d-ink-2)', margin: '0 0 var(--space-xl) 0' }}>
            Gebaseerd op jouw gegevens hebben we een gepersonaliseerd plan samengesteld.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
            {supplements.map((supp, idx) => (
              <div key={idx} style={{ background: 'var(--d-card)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: 'none', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)', borderRadius: '22px', padding: 'var(--space-lg)' }}>
                <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', margin: '0 0 var(--space-sm) 0' }}>{supp.name}</h3>
                <p style={{ fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400', color: 'var(--d-ink-2)', margin: '0 0 var(--space-md) 0' }}>{supp.benefit}</p>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '400', color: 'var(--d-ink-3)', lineHeight: '1.6' }}>
                  <p style={{ margin: '4px 0' }}><strong>Dosage:</strong> {supp.dosage}</p>
                  <p style={{ margin: '4px 0' }}><strong>Timing:</strong> {supp.timing}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--d-accent-soft)', border: '1px solid var(--d-accent)', borderRadius: '16px', padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', margin: '0 0 var(--space-sm) 0' }}>€29 per maand</h3>
            <p style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5, color: 'var(--d-ink)', margin: '0 0 var(--space-md) 0' }}>Maandelijkse aanpassingen op basis van je voortgang</p>
            <button onClick={handleSubscribe} style={{ padding: 'var(--space-md) var(--space-lg)', background: 'var(--d-ink)', color: 'var(--d-card)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontFamily: 'var(--font-sans)', fontSize: '15px' }}>
              Start abonnement (eerste maand gratis)
            </button>
          </div>
        </>
      ) : (
        <div style={{ background: 'var(--d-card-solid)', border: '1px solid var(--d-border)', borderRadius: '16px', padding: 'var(--space-xl)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, color: 'var(--d-ink)', margin: '0 0 var(--space-sm) 0' }}>✓ Abonnement Actief!</h2>
          <p style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5, color: 'var(--d-ink-2)', margin: '0 0 var(--space-lg) 0' }}>Je hebt je supplements plan geactiveerd.</p>
          <button onClick={() => navigate('/dashboard')} style={{ padding: 'var(--space-md) var(--space-lg)', background: 'var(--d-ink)', color: 'var(--d-card)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontFamily: 'var(--font-sans)', fontSize: '15px' }}>
            Terug naar dashboard
          </button>
        </div>
      )}
    </div>
  )
}
