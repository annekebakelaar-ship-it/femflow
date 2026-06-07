export default function WearableOption({ onSkip, onConnect, loading }) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-lg)' }}>
        Wil je meer inzicht?
      </h2>
      <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-secondary)', marginBottom: 'var(--space-xl)', lineHeight: 1.7 }}>
        Koppel je wearable en we leggen je subjectieve gevoel naast je slaap, herstel en temperatuur over tijd.
      </p>
      <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-label)', marginBottom: 'var(--space-xl)' }}>
        Dit is optioneel. Je krijgt je resultaat toch al.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
        <button
          onClick={onSkip}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Slaan over →
        </button>
        <button
          onClick={onConnect}
          disabled={loading}
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
          Koppel Oura
        </button>
      </div>
    </div>
  )
}
