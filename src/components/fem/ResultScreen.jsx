export default function ResultScreen({ result, onRestart, onClose }) {
  const activeSignals = Object.entries(result.constellation || {})
    .filter(([_, v]) => v)
    .map(([k, _]) => k)

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: 'var(--font-size-heading)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-lg)', lineHeight: 1.3 }}>
        Dit is wat we zien.
      </h2>

      <div style={{ background: '#F9F9F9', padding: 'var(--space-lg)', borderRadius: 4, marginBottom: 'var(--space-xl)' }}>
        <p style={{ fontSize: 'var(--font-size-body)', color: '#0A0A0A', lineHeight: 1.7 }}>
          {result.explanation}
        </p>
      </div>

      <div style={{ background: '#FFF3E0', padding: 'var(--space-lg)', borderRadius: 4, marginBottom: 'var(--space-xl)', borderLeft: '4px solid #F57C00' }}>
        <p style={{ fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-md)', color: '#0A0A0A' }}>
          Dit is geen diagnose
        </p>
        <p style={{ fontSize: 'var(--font-size-small)', lineHeight: 1.7, color: '#0A0A0A' }}>
          Er is geen kant-en-klaar antwoord voor deze fase. Voor vragen over je gezondheid of de overgang: praat met je huisarts.
        </p>
      </div>

      <div style={{ background: '#E8F5E9', padding: 'var(--space-lg)', borderRadius: 4, marginBottom: 'var(--space-xl)', borderLeft: '4px solid #2E7D32' }}>
        <p style={{ fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-md)', color: '#0A0A0A' }}>
          Wat we WEL doen
        </p>
        <p style={{ fontSize: 'var(--font-size-small)', lineHeight: 1.7, color: '#0A0A0A' }}>
          We volgen je patronen over tijd en stellen je strip maandelijks bij op wat we zien — met uitleg. Ondersteuning, geen behandeling.
        </p>
      </div>

      <div style={{ background: '#E3F2FD', padding: 'var(--space-lg)', borderRadius: 4, marginBottom: 'var(--space-xl)', borderLeft: '4px solid #1976D2' }}>
        <p style={{ fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-md)', color: '#0A0A0A' }}>
          Je privacy
        </p>
        <p style={{ fontSize: 'var(--font-size-small)', lineHeight: 1.7, color: '#0A0A0A' }}>
          Je data blijft van jou. We bewaren alleen afgeleide inzichten, en verkopen nooit.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
        <button
          onClick={onRestart}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          ← Opnieuw beginnen
        </button>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'var(--color-text)',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Sluit
        </button>
      </div>
    </div>
  )
}
