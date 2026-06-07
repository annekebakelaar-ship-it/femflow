import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function BedanktStep() {
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.setItem('youcaps_paid', 'true')
    localStorage.setItem('youcaps_first_visit', 'true')
    if (typeof window.gtag === 'function') {
      const price = parseFloat(localStorage.getItem('youcaps_price') || '19')
      window.gtag('event', 'purchase', { value: price, currency: 'EUR' })
    }
    const t = setTimeout(() => navigate('/dashboard', { replace: true }), 2500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--container-padding)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64,
        borderRadius: '50%',
        background: 'rgba(46,125,50,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto var(--space-lg)',
        fontSize: '1.8rem',
        animation: 'scale-in 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        animationDelay: '100ms',
      }}>
        âœ“
      </div>

      <h1 style={{
        fontSize: ''26px'',
        fontWeight: '600',
        letterSpacing: '-1px', lineHeight: 1.1,
        marginBottom: 'var(--space-sm)',
        animation: 'fade-slide-up 300ms ease both',
        animationDelay: '300ms',
      }}>
        Welkom! Je bent officieel lid.
      </h1>

      <p style={{
        fontSize: ''15px'',
        color: 'var(--ink-2)',
        lineHeight: 1.6,
        maxWidth: 380,
        marginBottom: 'var(--space-lg)',
      }}>
        âœ“ Bevestigingsmail is onderweg<br/>
        {localStorage.getItem('youcaps_price') === '19.00'
          ? <>âœ“ Je pakket gaat de deur uit zodra alle 100 plekken vol zijn</>
          : <>âœ“ Je formule wordt volgende week samengesteld</>
        }<br/>
        âœ“ Je ontvangt een mail zodra het verstuurd wordt
      </p>

      <div style={{
        padding: 'var(--space-md)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        marginBottom: 'var(--space-lg)',
        fontSize: ''13px'',
        color: 'var(--ink-2)',
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>Volgende stappen:</p>
        <ol style={{ margin: 0, paddingLeft: '20px', textAlign: 'left' }}>
          <li>Controleer je inbox voor bevestiging</li>
          <li>Je formule is klaar zodra we je data hebben verwerkt (1-2 dagen)</li>
          <li>Je ontvangt een tracking-link zodra het verstuurd wordt</li>
        </ol>
      </div>

      <p style={{
        fontSize: ''13px'',
        color: 'var(--ink-3)',
        maxWidth: 380,
      }}>
        Vragen? Stuur een WhatsApp naar <br/>
        <strong>+31 6 1726 1463</strong>
      </p>
    </div>
  )
}

