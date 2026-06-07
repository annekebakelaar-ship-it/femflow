import { useState } from 'react'
import hero from '../../assets/hero1.png'

export default function FemLanding({ onStartQuiz, user }) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--container-padding) var(--space-xxl)',
      animation: 'fade-slide-up 240ms ease both',
      backgroundImage: `url(${hero})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>

      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '15px', letterSpacing: '.04em' }}>
          YOUCAPS FEM
        </span>
        {user && (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--ink-3)', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: '500' }}>
            {user.email}
          </span>
        )}
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: 'var(--space-xxl)' }}>

        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--ink-3)', letterSpacing: '.4px', textTransform: 'uppercase', marginBottom: 'var(--space-sm)', fontWeight: '500' }}>
          Herkenning, geen diagnose
        </p>

        <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: '500', letterSpacing: '-0.5px', marginBottom: 'var(--space-lg)', lineHeight: 1.25 }}>
          De ongrijpbare fase voor de overgang
        </h1>

        <h2 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', color: 'var(--ink-2)', marginBottom: 'var(--space-xl)', lineHeight: 1.5 }}>
          Je slaap, je stemming, je cyclus verschuiven subtiel. En je hoort dat het erbij hoort. Wat als je lichaam je wél iets vertelt?
        </h2>

        <p style={{ fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400', color: 'var(--ink-2)', marginBottom: 'var(--space-xxl)', lineHeight: 1.5 }}>
          Veel vrouwen voelen iets verandert — en krijgen te horen dat het niets is.
          We helpen je het zien, en nemen je serieus.
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xxl)', flexDirection: 'column' }}>
          <button
            onClick={onStartQuiz}
            style={{
              padding: 'var(--space-sm) var(--space-lg)',
              background: 'var(--ink)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-body)',
              fontFamily: 'var(--font-sans)',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '.04em',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Start Quiz
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            style={{
              padding: 'var(--space-sm) var(--space-lg)',
              background: 'transparent',
              color: 'var(--ink)',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-body)',
              fontFamily: 'var(--font-sans)',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '.04em',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--surface-warm)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            Meer informatie
          </button>
        </div>

        {showInfo && (
          <div style={{
            background: 'var(--surface)',
            padding: 'var(--space-lg)',
            borderRadius: '24px',
            marginBottom: 'var(--space-xxl)',
            textAlign: 'left',
            border: `1px solid var(--border)`,
          }}>
            <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-md)' }}>
              Wat je krijgt
            </h3>
            <ul style={{ fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.6, color: 'var(--ink)', marginBottom: 'var(--space-md)' }}>
              <li>📊 Herkenning van je patroon (slaap, stemming, cyclus, energie)</li>
              <li>💡 Inzicht in wat je voelt (geen diagnose, geen aandoening)</li>
              <li>🤝 Je bent niet de enige — veel vrouwen voelen precies dit</li>
              <li>🔒 Je data blijft van jou (we verkopen nooit)</li>
            </ul>

            <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-md)' }}>
              Wat we NIET doen
            </h3>
            <ul style={{ fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.6, color: 'var(--ink)' }}>
              <li>❌ We geven geen diagnose</li>
              <li>❌ We beloven geen oplossing</li>
              <li>❌ We vervangen je arts niet</li>
              <li>❌ Vragen over je gezondheid? Praat met je huisarts.</li>
            </ul>
          </div>
        )}

        <p style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--font-sans)', letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: '500' }}>
          5 minuten. Geen e-mailadres nodig.
        </p>
      </div>

    </div>
  )
}
