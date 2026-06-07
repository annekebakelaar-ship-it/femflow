export default function Opening({ onNext }) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-lg)', lineHeight: 1.3, color: 'var(--ink)' }}>
        Je voelt je anders.
      </h2>
      <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--ink-2)', marginBottom: 'var(--space-xl)', lineHeight: 1.7 }}>
        En je krijgt te horen dat het niets is.
      </p>
      <button
        onClick={onNext}
        style={{
          padding: 'var(--space-sm) var(--space-lg)',
          background: 'var(--ink)',
          color: 'var(--surface)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-body)',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => e.target.style.opacity = '0.9'}
        onMouseLeave={(e) => e.target.style.opacity = '1'}
      >
        Dit herken ik →
      </button>
    </div>
  )
}
