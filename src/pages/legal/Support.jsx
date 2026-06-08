export default function Support() {
  return (
    <div style={{
      maxWidth: '100%',
      width: '100%',
      margin: '0 auto',
      padding: '16px',
      fontFamily: 'var(--font-sans)',
      lineHeight: '1.7',
      color: 'var(--ink)',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, marginBottom: 'var(--space-lg)' }}>
          Support & Contact
        </h1>

        <section style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, marginBottom: 'var(--space-md)' }}>
            Heb je een vraag?
          </h2>
          <p>
            We zijn hier om te helpen! Neem contact met ons op via een van de onderstaande kanalen.
          </p>
        </section>

        <section style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, marginBottom: 'var(--space-md)' }}>
            Contact
          </h2>
          <p>
            <strong>Email:</strong> info@youcaps.app<br />
            <strong>WhatsApp:</strong> <a href="https://wa.me/31617261463" style={{ color: 'var(--accent)', textDecoration: 'none' }}>+31 6 17 26 14 63</a>
          </p>
        </section>

        <section style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, marginBottom: 'var(--space-md)' }}>
            Veelgestelde vragen
          </h2>
          <ul style={{ marginBottom: 'var(--space-md)' }}>
            <li><strong>Hoe verwijder ik mijn account?</strong> Ga naar je instellingen en selecteer "Account verwijderen". Dit verwijdert al je gegevens permanent.</li>
            <li><strong>Kan ik mijn gegevens exporteren?</strong> Ja, je kunt je volledige dataset als JSON exporteren via je account instellingen.</li>
            <li><strong>Hoe verbind ik mijn Oura-ring?</strong> In de app, ga naar Instellingen → Wearables en volg de verbindingsstappen.</li>
            <li><strong>Wat is de readiness-score?</strong> Een dagelijkse score gebaseerd op je slaap, HRV, hartslag en cyclus-fase.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, marginBottom: 'var(--space-md)' }}>
            Feedback
          </h2>
          <p>
            We horen graag van je! Stuur ons je feedback, bugs, of feature requests naar info@youcaps.app
          </p>
        </section>

        <p style={{ marginTop: 'var(--space-xxl)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-lg)', color: 'var(--ink-3)', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400' }}>
          YouCaps Support Team
        </p>
      </div>
    </div>
  )
}
