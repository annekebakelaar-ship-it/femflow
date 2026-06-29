// Publieke pagina (geen login) die uitlegt hoe je je FemFlow-account en alle
// bijbehorende gegevens verwijdert. Vereist door Google Play en Apple voor
// apps met accounts: een publiek toegankelijke verwijder-instructie/-aanvraag.
export default function AccountDeletion() {
  const h2 = { fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, marginBottom: 'var(--space-md)' }
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
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, marginBottom: 'var(--space-lg)' }}>
          Account en gegevens verwijderen
        </h1>

        <p style={{ marginBottom: 'var(--space-lg)' }}>
          Je kunt je FemFlow-account en alle bijbehorende gegevens op elk moment
          permanent laten verwijderen. Dit kan rechtstreeks in de app, of op verzoek
          per e-mail.
        </p>

        <section style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={h2}>In de app (direct)</h2>
          <p>
            Open FemFlow en ga naar <strong>Menu &gt; Instellingen &gt; Account verwijderen</strong>.
            Bevestig de verwijdering. Je account en gegevens worden dan direct en
            permanent gewist.
          </p>
        </section>

        <section style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={h2}>Geen toegang tot de app?</h2>
          <p>
            Stuur een e-mail naar <strong>info@youcaps.app</strong> vanaf het e-mailadres
            waarmee je account is aangemaakt, met als onderwerp "Account verwijderen".
            We verwijderen je account en alle bijbehorende gegevens binnen 30 dagen en
            bevestigen dat per e-mail.
          </p>
        </section>

        <section style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={h2}>Wat wordt verwijderd</h2>
          <p>Bij verwijdering wissen we permanent:</p>
          <ul style={{ marginTop: 'var(--space-sm)', marginBottom: 'var(--space-md)', paddingLeft: '1.2em' }}>
            <li>je account en e-mailadres;</li>
            <li>je cyclus- en symptoomgegevens;</li>
            <li>je wearable-metingen (slaap, HRV, hartslag) en wearable-koppelingen;</li>
            <li>je quizresultaten en inloggegevens.</li>
          </ul>
          <p>
            Er worden geen gezondheidsgegevens bewaard na verwijdering. We kunnen
            wettelijk verplichte administratie (zoals een betaalbewijs) bewaren waar
            de wet dat vereist, maar dat bevat geen gezondheidsgegevens.
          </p>
        </section>

        <section style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={h2}>Contact</h2>
          <p>
            Vragen over verwijdering of je gegevens? Mail <strong>info@youcaps.app</strong>.
          </p>
        </section>

        <p style={{ marginTop: 'var(--space-xxl)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-lg)', color: 'var(--ink-3)', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400' }}>
          FemFlow, een product van YouCaps (KvK 95822623)
        </p>
      </div>
    </div>
  )
}
