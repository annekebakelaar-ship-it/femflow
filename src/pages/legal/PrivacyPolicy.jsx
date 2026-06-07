export default function PrivacyPolicy() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: 'var(--space-lg)',
      fontFamily: 'var(--font-sans)',
      lineHeight: '1.7',
      color: 'var(--ink)',
    }}>
      <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, marginBottom: 'var(--space-lg)' }}>
        Privacybeleid YouCaps
      </h1>

      <p style={{ fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400', color: 'var(--ink-3)', marginBottom: 'var(--space-lg)' }}>
        Laatst bijgewerkt: 4 juni 2026
      </p>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, marginBottom: 'var(--space-md)' }}>1. Inleiding</h2>
        <p>
          YouCaps ("wij", "ons" of "onze") is verplicht te voldoen aan de Algemene Verordening Gegevensbescherming (AVG/GDPR).
          Dit privacybeleid legt uit hoe wij uw persoonlijke gegevens verzamelen, gebruiken, beschermen en verwijderen.
        </p>
        <p>
          YouCaps is de <strong>verwerkingsverantwoordelijke</strong> (data controller) voor alle gegevens die via deze app worden verzameld.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>2. Welke gegevens verzamelen wij?</h2>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          2.1 Account & Authenticatie
        </h3>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li><strong>E-mailadres:</strong> Gebruikt voor inloggen via magic link</li>
          <li><strong>Gebruikers-ID:</strong> Gegenereerde unieke identifier</li>
          <li><strong>Wachtwoord hash:</strong> Veilig opgeslagen (niet leesbaar)</li>
        </ul>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          2.2 Gezondheidsgegevens (Gevoelige categorie)
        </h3>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li><strong>Menstruatiecyclus:</strong> startdatum, cyclusduur (21-40 dagen)</li>
          <li><strong>Dagelijkse symptomen:</strong> wat u logt in de tracker (bloeding, krampen, buikpijn, etc.)</li>
          <li><strong>Notities:</strong> Vrij in te vullen opmerkingen per dag</li>
          <li><strong>Wearable data:</strong> Slaap, hartslag variabiliteit (HRV), rusthartslagfrequentie (RHR), lichaamstemperatuur (indien u een Oura-ring verbindt)</li>
        </ul>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          2.3 Lifestyle Data
        </h3>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li><strong>Dagelijke triggers:</strong> Of u alcohol heeft gedronken, late zware maaltijd, werkstress</li>
          <li><strong>Symptoomlog:</strong> Exacte timestamp wanneer u symptomen logt</li>
        </ul>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          2.4 Quiz & Consenten
        </h3>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li><strong>Quiz antwoorden:</strong> Uw antwoorden op de 5-vragen onboarding quiz</li>
          <li><strong>Toestemmingsgegevens:</strong> Welke versie van ons privacybeleid u hebt gelezen en akkoord bent gegaan</li>
          <li><strong>Timestamp:</strong> Wanneer u toestemming hebt gegeven</li>
        </ul>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          2.5 Wat verzamelen wij NIET?
        </h3>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li>❌ IP-adres</li>
          <li>❌ Locatiegegevens</li>
          <li>❌ Browser-tracking of fingerprinting</li>
          <li>❌ Cookies (behalve JWT authentication token)</li>
          <li>❌ Apparaat-ID of UDID</li>
        </ul>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>3. Waarom gebruiken wij uw gegevens?</h2>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          Rechtsbasis per gegevenscategorie:
        </h3>

        <table style={{ width: '100%', marginBottom: 'var(--space-md)', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Gegevenscategorie</th>
              <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Rechtsbasis</th>
              <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Doel</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px' }}>Email, wachtwoord</td>
              <td style={{ padding: '8px' }}>Contract</td>
              <td style={{ padding: '8px' }}>Inloggen, account beheer</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px' }}>Gezondheidsgegevens</td>
              <td style={{ padding: '8px' }}>Expliciete toestemming</td>
              <td style={{ padding: '8px' }}>Cyclus berekening, readiness-score, AI-aanbevelingen</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px' }}>Lifestyle triggers</td>
              <td style={{ padding: '8px' }}>Impliciete toestemming</td>
              <td style={{ padding: '8px' }}>Readiness berekening, gepersonaliseerde tips</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px' }}>Oura-data</td>
              <td style={{ padding: '8px' }}>Gebruikerstoestemming</td>
              <td style={{ padding: '8px' }}>Slaap/HRV tracking, readiness scoring</td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}>Consenten</td>
              <td style={{ padding: '8px' }}>Wettelijke verplichting</td>
              <td style={{ padding: '8px' }}>Compliance audit trail</td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          Specifieke toepassingen:
        </h3>
        <ul>
          <li><strong>Gepersonaliseerde aanbevelingen:</strong> Wij gebruiken uw cyclus, symptomen en readiness-status om relevante artikelen aan te bevelen (geen dwangbeslissing).</li>
          <li><strong>Belastbaarheidsscore:</strong> Dagelijks berekend op basis van slaap, HRV, hartslag en cyclus-fase. Dit is alleen ter informatie.</li>
          <li><strong>Digitale tweeling (toekomst):</strong> We zullen uw gegevens gebruiken om persoonlijke AI-modellen te trainen — hiervoor zullen we u uitdrukkelijk vragen om toestemming.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>4. Hoe lang bewaren wij uw gegevens?</h2>

        <table style={{ width: '100%', marginBottom: 'var(--space-md)', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Gegevenstype</th>
              <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Bewaartermijn</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px' }}>Gebruikersaccount</td>
              <td style={{ padding: '8px' }}>Tot u uw account verwijdert</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px' }}>Gezondheidsgegevens (menstruatie, symptomen)</td>
              <td style={{ padding: '8px' }}>Tot u uw account verwijdert</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px' }}>Wearable data (Oura)</td>
              <td style={{ padding: '8px' }}>90 dagen (rollerend venster)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px' }}>Toestemmingslogs</td>
              <td style={{ padding: '8px' }}>3 jaar (wettelijk vereist)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px' }}>Foutlogs, systeemlogboeken</td>
              <td style={{ padding: '8px' }}>14-30 dagen</td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}>Anonimiseerde statistieken</td>
              <td style={{ padding: '8px' }}>Onbeperkt (voor AI-training)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>5. Met wie delen wij uw gegevens?</h2>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          Gegevensverwerkers:
        </h3>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li>
            <strong>Render.com (hosting):</strong> Zij hosten onze backend-server. Wij hebben een Data Processing Agreement (DPA) met hen.
          </li>
          <li>
            <strong>PostgreSQL (database):</strong> Eu-gebaseerd, gebruikt HTTPS en interne netwerken.
          </li>
          <li>
            <strong>Oura Inc. (USA):</strong> Wanneer u een Oura-ring verbindt, delen wij deze gegevens met hun API. Rechtsbasis: uw expliciete toestemming.
            <strong>⚠️ Let op:</strong> Dit betreft een gegevensoverdracht naar de VS (onderworpen aan adequaatheidsbesluit).
          </li>
        </ul>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          Geen verkoop aan derden:
        </h3>
        <p>
          We verkopen uw persoonlijke gegevens <strong>NOOIT</strong> aan adverteerders, data brokers of andere bedrijven.
        </p>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          Wettelijke verplichting:
        </h3>
        <p>
          We mogen uw gegevens openbaarmaken als dit wettelijk verplicht is (bijvoorbeeld gerechtsbevel, belastingautoriteiten).
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>6. Uw rechten onder de AVG</h2>

        <p>
          U hebt de volgende rechten met betrekking tot uw persoonlijke gegevens:
        </p>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          6.1 Recht op toegang (artikel 15)
        </h3>
        <p>
          U kunt een kopie van al uw persoonlijke gegevens aanvragen. Stuur een e-mail naar privacy@youcaps.ai.
        </p>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          6.2 Recht op rectificatie (artikel 16)
        </h3>
        <p>
          U kunt onjuiste of onvolledige gegevens laten corrigeren. U kunt veel van uw gezondheidsgegevens zelf aanpassen in de app.
        </p>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          6.3 Recht op verwijdering ("Recht op vergetelheid", artikel 17)
        </h3>
        <p>
          U kunt aanvragen dat wij uw account en alle bijbehorende gegevens verwijderen. Wij zullen dit binnen 30 dagen doen, behalve:
        </p>
        <ul>
          <li>Toestemmingslogs (moeten 3 jaar worden bewaard voor compliance)</li>
          <li>Anonimiseerde, niet-identificeerbare gegevens (blijven voor AI-training)</li>
        </ul>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          6.4 Recht op gegevensoverdraagbaarheid (artikel 20)
        </h3>
        <p>
          U kunt al uw gegevens in een leesbaar formaat (CSV/JSON) exporteren en naar een ander bedrijf meenemen.
        </p>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          6.5 Recht om bezwaar in te dienen (artikel 21)
        </h3>
        <p>
          U kunt weigeren dat wij uw gegevens voor bepaalde doeleinden verwerken (bijv. AI-aanbevelingen, Oura-sync).
        </p>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          6.6 Klachten indienen
        </h3>
        <p>
          Als u vragen heeft over hoe wij uw gegevens verwerken, neem dan contact met ons op.
          U hebt ook het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens (Dutch DPA):
        </p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          <strong>Autoriteit Persoonsgegevens</strong><br />
          www.autoriteitpersoonsgegevens.nl<br />
          Bezwaarschriften@ap.nl
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>7. Gegevensveiligheid</h2>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          Technische maatregelen:
        </h3>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li><strong>HTTPS/TLS:</strong> Alle communicatie is versleuteld in transit</li>
          <li><strong>Wachtwoord hashing:</strong> Wachtwoorden worden veilig opgeslagen (bcrypt)</li>
          <li><strong>JWT tokens:</strong> Verloopt na 30 dagen, ondertekend met geheim sleutel</li>
          <li><strong>Databasebeveiliging:</strong> PostgreSQL met interne netwerkisolatie</li>
        </ul>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          Organisatorische maatregelen:
        </h3>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li>Beperkte teamtoegang (only-need-to-know)</li>
          <li>Vertrouwelijkheidsovereenkomsten met alle medewerkers</li>
          <li>Incidentresponsplan voor datalekken</li>
        </ul>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          Datalekken:
        </h3>
        <p>
          Mocht er een datalek optreden, zullen wij u binnen 72 uur notificeren (indien van toepassing) en de Autoriteit Persoonsgegevens informeren.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>8. Personeelsgegevens & Toestemming</h2>

        <p>
          Veel van uw gezondheidsgegevens vallen onder de "gevoelige categorie" van de AVG.
          We verwerken deze <strong>alleen met uw expliciete toestemming</strong>.
        </p>

        <p style={{ marginTop: 'var(--space-md)' }}>
          U geeft toestemming door:
        </p>
        <ul>
          <li>De quiz te voltooien en het privacybeleid te accepteren</li>
          <li>De menstruatietracker in te stellen</li>
          <li>Zich aan te melden voor Oura-synchronisatie (optioneel)</li>
        </ul>

        <p style={{ marginTop: 'var(--space-md)' }}>
          <strong>U kunt uw toestemming op elk moment intrekken</strong> door naar uw Instellingen te gaan en "Verwijder mijn gegevens" te selecteren.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>9. AI & Geautomatiseerde Besluitvorming</h2>

        <p>
          De YouCaps-app gebruikt AI voor:
        </p>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li><strong>Artikel aanbevelingen:</strong> Gebaseerd op uw cyclus, symptomen en readiness. Transparant (u ziet waarom).</li>
          <li><strong>Readiness-score:</strong> Informatief alleen, geen bindende beslissing.</li>
          <li><strong>Digitale tweeling (toekomst):</strong> Persoonlijke ML-modellen voor voorspellingen. Vereist afzonderlijke toestemming.</li>
        </ul>

        <p>
          <strong>U hebt altijd het recht om geautomatiseerde besluiten te betwisten.</strong> Neem contact met ons op voor uitleg of bezwaar.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>10. Contact & Gegevensbeschermer</h2>

        <p>
          <strong>Voor vragen over privacybeleid:</strong>
        </p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          YouCaps BV<br />
          E-mail: privacy@youcaps.ai<br />
          [Adres TBD]
        </p>

        <p style={{ marginTop: 'var(--space-lg)' }}>
          <strong>Gegevensbeschermingsverantwoordelijke:</strong><br />
          [Naam & e-mail TBD]
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>11. Wijzigingen aan dit Privacybeleid</h2>

        <p>
          We kunnen dit privacybeleid af en toe bijwerken. Als er grote wijzigingen zijn, zullen wij u per e-mail waarschuwen.
          U zult opnieuw toestemming moeten geven voor wijzigingen in hoe wij gevoelige gegevens verwerken.
        </p>
      </section>

      <p style={{ marginTop: 'var(--space-xxl)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-lg)', color: 'var(--ink-3)', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400' }}>
        <strong>Laatst bijgewerkt:</strong> 4 juni 2026<br />
        <strong>Versie:</strong> 1.0
      </p>
    </div>
  )
}
