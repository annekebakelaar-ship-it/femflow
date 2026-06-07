const DEFAULT_steps = ['Welkom', 'Wearable', 'Toestemming', 'Advies', 'Betaling']

export default function OnboardingShell({ step, steps = DEFAULT_steps, children }) {
  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--container-padding) var(--space-xxl)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 'var(--space-xxl)' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: '15px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ink)',
        }}>
          YOUCAPS
        </span>
      </div>

      {/* Stap indicator */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--space-xl)' }}>
        {steps.map((_, i) => (
          <div key={i} style={{
            height: '2px',
            flex: 1,
            borderRadius: '2px',
            background: i < step ? 'var(--ink)' : i === step - 1 ? 'var(--ink)' : 'var(--border)',
            transition: 'background 250ms ease-out',
          }} />
        ))}
      </div>

      <div style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: 400,
        color: 'var(--ink-2)',
        marginBottom: 'var(--space-xl)',
      }}>
        Stap {step} van {steps.length} — {steps[step - 1]}
      </div>

      {/* Inhoud */}
      <div style={{ flex: 1, animation: 'fade-slide-up 240ms ease both' }}>
        {children}
      </div>
    </div>
  )
}
