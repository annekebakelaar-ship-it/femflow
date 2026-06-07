export default function MicroResult({ data, onConsent, onBack, loading }) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-lg)' }}>
        Op basis van wat je deelt...
      </h2>
      <div style={{ background: '#F9F9F9', padding: 'var(--space-lg)', borderRadius: 4, marginBottom: 'var(--space-xl)' }}>
        <p style={{ fontSize: 'var(--font-size-body)', color: '#0A0A0A', lineHeight: 1.7 }}>
          ...lijkt er iets te verschuiven in je ritme en je herstel.
        </p>
        <p style={{ fontSize: 'var(--font-size-body)', color: '#0A0A0A', lineHeight: 1.7, marginTop: 'var(--space-lg)' }}>
          Je bent niet de enige die dit zo ervaart.
        </p>
      </div>

      <div style={{ background: '#F0F7FF', padding: 'var(--space-lg)', borderRadius: 4, marginBottom: 'var(--space-xl)', borderLeft: '4px solid #1976d2' }}>
        <p style={{ fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-md)', color: '#0A0A0A' }}>
          Je toestemming wordt gevraagd
        </p>
        <p style={{ fontSize: 'var(--font-size-small)', lineHeight: 1.7, color: '#0A0A0A' }}>
          Om je antwoorden op te slaan en je lichaam op te volgen, hebben we je expliciete toestemming nodig. Dit is verplicht onder de AVG. Je kunt dit op elk moment intrekken.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
        <button
          onClick={onBack}
          disabled={loading}
          style={{ flex: 1, padding: '10px 16px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 4, cursor: 'pointer' }}
        >
          ← Terug
        </button>
        <button
          onClick={onConsent}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'var(--color-text)',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'Even geduld...' : 'Ik geef toestemming →'}
        </button>
      </div>
    </div>
  )
}
