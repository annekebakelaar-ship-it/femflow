export default function PrivacyPolicy() {
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
        Privacybeleid Ovari
      </h1>

      <p style={{ fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400', color: 'var(--ink-3)', marginBottom: 'var(--space-lg)' }}>
        Laatst bijgewerkt: 20 september 2026
      </p>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, marginBottom: 'var(--space-md)' }}>1. Inleiding</h2>
        <p>
          Ovari is een app van YouCaps ("wij", "ons" of "onze"). Wij zijn verplicht te voldoen aan de Algemene Verordening Gegevensbescherming (AVG/GDPR).
          Dit privacybeleid legt uit hoe wij uw persoonlijke gegevens verzamelen, gebruiken, beschermen en verwijderen.
        </p>
        <p>
          YouCaps is de <strong>verwerkingsverantwoordelijke</strong> (data controller) voor alle gegevens die via deze app worden verzameld:
        </p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          YouCaps (eenmanszaak van Anneke Bakelaar)<br />
          Pietersonstraat 30<br />
          2684 XS Ter Heijde<br />
          KvK-nummer: 95822623<br />
          Btw-identificatienummer: NL005175416B50<br />
          E-mail: info@youcaps.app
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>2. Welke gegevens verzamelen wij?</h2>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          2.1 Account & Authenticatie
        </h3>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li><strong>E-mailadres:</strong> Gebruikt voor inloggen via een eenmalige code per e-mail of via Google aanmelden. Er is geen wachtwoord. Logt u in met Google, dan ontvangen wij uw e-mailadres van Google.</li>
          <li><strong>Gebruikers-ID:</strong> Gegenereerde unieke identifier</li>
        </ul>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          2.2 Gezondheidsgegevens (Gevoelige categorie)
        </h3>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li><strong>Menstruatiecyclus:</strong> startdatum, cyclusduur (21-40 dagen)</li>
          <li><strong>Dagelijkse symptomen:</strong> wat u logt in de tracker (bloeding, krampen, buikpijn, etc.)</li>
          <li><strong>Notities:</strong> Vrij in te vullen opmerkingen per dag</li>
          <li><strong>Wearable data:</strong> Slaap, hartslag variabiliteit (HRV), rusthartslagfrequentie (RHR), lichaamstemperatuur (indien u een wearable koppelt, bijvoorbeeld een Oura-ring)</li>
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
          <li>❌ Cookies. Uw inlogtoken bewaren wij in de lokale opslag van de app, niet in een cookie</li>
          <li>❌ Apparaat-ID of UDID</li>
        </ul>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          Waar deze gegevens staan
        </h3>
        <p>
          Niet alles wat u in de app vastlegt, verlaat uw telefoon. Een deel blijft
          lokaal in de app staan en wordt niet naar onze server gestuurd.
        </p>
        <p>
          <strong>Blijft op uw telefoon:</strong>
        </p>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li>Uw dagelijkse symptoomlogboek</li>
          <li>Uw leefstijltriggers, zoals alcohol, een late maaltijd of werkstress</li>
          <li>Uw voedingsscans</li>
          <li>De losse dagen die u in de cycluskalender aantikt</li>
        </ul>
        <p>
          <strong>Wordt op onze server verwerkt en opgeslagen:</strong>
        </p>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li>Uw e-mailadres, en als u die invult uw naam en geboortedatum</li>
          <li>Van uw cyclus: de startdatum, de cyclusduur en het aantal bloedingsdagen. Dus de samenvatting, niet uw dagelijkse aantekeningen</li>
          <li>Wearable-gegevens als u een wearable koppelt: slaap, diepe slaap, HRV, rusthartslag en herstel per dag</li>
          <li>Uw antwoorden op de onboardingquiz</li>
          <li>Feedback die u ons via de app stuurt</li>
        </ul>
        <p>
          Gegevens die alleen op uw telefoon staan, kunnen wij niet inzien en niet
          voor u herstellen. Verwijdert u de app of wist u de appgegevens, dan zijn
          ze weg. Het verwijderen van uw account wist de gegevens die op onze server
          staan.
        </p>
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
              <td style={{ padding: '8px' }}>E-mailadres</td>
              <td style={{ padding: '8px' }}>Contract</td>
              <td style={{ padding: '8px' }}>Inloggen, accountbeheer</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px' }}>Gezondheidsgegevens</td>
              <td style={{ padding: '8px' }}>Expliciete toestemming</td>
              <td style={{ padding: '8px' }}>Cyclusberekening en readiness-score. Persoonlijke inzichten stelt de app op uw toestel samen</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px' }}>Lifestyle triggers, blijven lokaal op uw telefoon</td>
              <td style={{ padding: '8px' }}>Toestemming</td>
              <td style={{ padding: '8px' }}>Tips in de app, berekend op uw eigen toestel</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px' }}>Wearable-data</td>
              <td style={{ padding: '8px' }}>Expliciete toestemming</td>
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
          <li><strong>Aanbevelingen in de app:</strong> De app stelt op uw eigen toestel voor welke artikelen bij u passen, op basis van wat u heeft gelogd. Uw symptomen en triggers worden daarvoor niet naar onze server gestuurd. Dit heeft geen bindende gevolgen voor u.</li>
          <li><strong>Readiness-score:</strong> Deze score berekenen wij niet zelf. Koppelt u een Oura-ring, dan ontvangen wij de readiness-score van Oura en bewaren wij die naast uw slaap, HRV en rusthartslag. Koppelt u Fitbit, dan is er geen readiness-score beschikbaar. De score is alleen ter informatie.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>4. Hoe lang bewaren wij uw gegevens?</h2>

        <table style={{ width: '100%', marginBottom: 'var(--space-md)', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Gegevenstype</th>
              <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Bewaartermijn</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px' }}>Gebruikersaccount</td>
              <td style={{ padding: '8px' }}>Tot u uw account verwijdert</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px' }}>Cyclusgegevens op onze server (startdatum, cyclusduur, bloedingsdagen)</td>
              <td style={{ padding: '8px' }}>Tot u uw account verwijdert</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px' }}>Symptomen, triggers en voedingsscans (lokaal op uw telefoon)</td>
              <td style={{ padding: '8px' }}>Tot u ze zelf verwijdert of de appgegevens wist</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px' }}>Wearable-metingen op onze server</td>
              <td style={{ padding: '8px' }}>Tot u uw account verwijdert</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px' }}>Toestemming die u in de app geeft, lokaal op uw telefoon</td>
              <td style={{ padding: '8px' }}>Tot u de appgegevens wist</td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}>Foutlogs en systeemlogboeken bij onze hostingpartij</td>
              <td style={{ padding: '8px' }}>Volgens het bewaarbeleid van die partij</td>
            </tr>
          </tbody>
        </table>

        <p>
          Op onze server verloopt er verder niets automatisch. Wij verwijderen alleen
          verlopen inlogcodes zodra ze zijn gebruikt of zijn verlopen. Uw overige
          gegevens blijven staan totdat u uw account verwijdert. Wij gebruiken uw
          gegevens niet om AI-modellen te trainen.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>5. Met wie delen wij uw gegevens?</h2>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          Gegevensverwerkers:
        </h3>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li>
            <strong>Render.com (hosting):</strong> Zij hosten onze backend-server. Die server staat in de Verenigde Staten, regio Oregon. Uw gegevens gaan daar dus doorheen terwijl u de app gebruikt. Dat is een gegevensoverdracht buiten de EU. Wij hebben een verwerkersovereenkomst met Render.
          </li>
          <li>
            <strong>Neon (database):</strong> Uw opgeslagen gegevens staan in een PostgreSQL-database in Frankfurt, binnen de EU. Het verkeer ernaartoe is versleuteld.
          </li>
          <li>
            <strong>Google (aanmelden, optioneel):</strong> Kiest u voor "Aanmelden met Google", dan verloopt het inloggen via Google en ontvangen wij uw e-mailadres van Google. Google verwerkt uw inloggegevens onder hun eigen privacybeleid.
          </li>
          <li>
            <strong>Wearable-aanbieders (bijv. Oura Inc.):</strong> Wanneer u een wearable koppelt, halen wij uw gegevens op via de API van de aanbieder. Rechtsbasis: uw expliciete toestemming.
            <strong>⚠️ Let op:</strong> Afhankelijk van de aanbieder kan dit een gegevensoverdracht buiten de EU betekenen, bijvoorbeeld naar de VS (onderworpen aan een adequaatheidsbesluit of passende waarborgen).
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
          U kunt een kopie van al uw persoonlijke gegevens aanvragen. Stuur een e-mail naar info@youcaps.app.
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
          U kunt uw account en de bijbehorende gegevens op onze server laten verwijderen. Verwijdert u uw account in de app, dan gebeurt dat direct. Vraagt u het per e-mail aan, dan doen wij dat binnen 30 dagen.
        </p>
        <ul>
          <li>Gegevens die alleen op uw telefoon staan, verwijdert u zelf door de appgegevens te wissen of de app te verwijderen. Wij kunnen daar niet bij</li>
          <li>Feedback die u ons via de app heeft gestuurd, wordt niet automatisch mee verwijderd. Wilt u die ook laten wissen, stuur ons dan een bericht</li>
        </ul>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          6.4 Recht op gegevensoverdraagbaarheid (artikel 20)
        </h3>
        <p>
          In de app downloadt u via uw accountinstellingen een JSON-bestand met de gegevens die lokaal zijn opgeslagen: uw cyclusgegevens, uw symptoomlogboek, uw triggers en uw toestemmingen. De gegevens die op onze server staan kunt u bij ons opvragen, dan sturen wij die in een leesbaar formaat toe.
        </p>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          6.5 Recht om bezwaar in te dienen (artikel 21)
        </h3>
        <p>
          U kunt weigeren dat wij uw gegevens voor bepaalde doeleinden verwerken, bijvoorbeeld het synchroniseren van uw wearable.
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
          www.autoriteitpersoonsgegevens.nl
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>7. Gegevensveiligheid</h2>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          Technische maatregelen:
        </h3>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li><strong>HTTPS/TLS:</strong> Alle communicatie is versleuteld in transit</li>
          <li><strong>Inloggen zonder wachtwoord:</strong> Eenmalige inlogcodes per e-mail die kort geldig zijn, of aanmelden via Google (OAuth). Wij slaan geen wachtwoorden op</li>
          <li><strong>JWT tokens:</strong> Verlopen na 30 dagen, ondertekend met een geheime sleutel</li>
          <li><strong>Databasebeveiliging:</strong> PostgreSQL met interne netwerkisolatie</li>
        </ul>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          Organisatorische maatregelen:
        </h3>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li>YouCaps is een eenmanszaak. Toegang tot de database ligt bij de eigenaar</li>
          <li>Bij een datalek doen wij melding volgens de wettelijke termijn</li>
        </ul>

        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          Datalekken:
        </h3>
        <p>
          Mocht er een datalek optreden, zullen wij u binnen 72 uur notificeren (indien van toepassing) en de Autoriteit Persoonsgegevens informeren.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>8. Bijzondere Persoonsgegevens & Toestemming</h2>

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
          <li>Een wearable te koppelen (optioneel)</li>
        </ul>

        <p style={{ marginTop: 'var(--space-md)' }}>
          <strong>U kunt uw toestemming op elk moment intrekken</strong> door naar uw Instellingen te gaan en "Verwijder mijn gegevens" te selecteren.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>9. AI & Geautomatiseerde Besluitvorming</h2>

        <p>
          De Ovari-app gebruikt AI voor:
        </p>
        <ul style={{ marginBottom: 'var(--space-md)' }}>
          <li><strong>Artikelaanbevelingen:</strong> Worden op uw eigen toestel samengesteld uit wat u lokaal heeft gelogd. Uw symptomen en triggers worden daarvoor niet naar onze server gestuurd. U ziet waarom een artikel wordt voorgesteld.</li>
          <li><strong>Readiness-score:</strong> Informatief alleen, geen bindende beslissing.</li>
        </ul>

        <p>
          <strong>U hebt altijd het recht om geautomatiseerde besluiten te betwisten.</strong> Neem contact met ons op voor uitleg of bezwaar.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>10. Ovari in ChatGPT</h2>

        <p>
          De openbare Ovari-kennisbank is ook te raadplegen via een koppeling met
          ChatGPT. Die koppeling doorzoekt uitsluitend openbare Ovari-artikelen,
          dezelfde artikelen die op onze website staan.
        </p>
        <p>
          De huidige koppeling heeft <strong>geen toegang</strong> tot uw
          Ovari-account, uw menstruatietracker, uw symptoomgegevens, uw persoonlijke
          aantekeningen, uw wearable-gegevens of andere persoonlijke
          gezondheidsgegevens die u in de app vastlegt. De koppeling leest alleen en
          wijzigt niets.
        </p>
        <p>
          Voor het gebruiken van deze publieke kennisbankfunctie is geen
          Ovari-account nodig.
        </p>
        <p>
          Maakt Ovari in de toekomst persoonlijke appgegevens via ChatGPT
          beschikbaar, dan valt dat niet onder de huidige functionaliteit. Voor zulke
          functionaliteit richten wij eerst passende authenticatie,
          privacy-informatie en toestemming in, voordat wij die aanbieden.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>11. Contact & Gegevensbeschermer</h2>

        <p>
          <strong>Voor vragen over dit privacybeleid:</strong>
        </p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          YouCaps (eenmanszaak van Anneke Bakelaar)<br />
          Pietersonstraat 30<br />
          2684 XS Ter Heijde<br />
          KvK-nummer: 95822623<br />
          E-mail: info@youcaps.app<br />
          WhatsApp: +31 6 17 26 14 63
        </p>

        <p style={{ marginTop: 'var(--space-lg)' }}>
          <strong>Contactpersoon gegevensbescherming:</strong><br />
          Anneke Bakelaar, info@youcaps.app
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: 'var(--space-md)' }}>12. Wijzigingen aan dit Privacybeleid</h2>

        <p>
          We kunnen dit privacybeleid af en toe bijwerken. Als er grote wijzigingen zijn, zullen wij u per e-mail waarschuwen.
          U zult opnieuw toestemming moeten geven voor wijzigingen in hoe wij gevoelige gegevens verwerken.
        </p>
      </section>

      <p style={{ marginTop: 'var(--space-xxl)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-lg)', color: 'var(--ink-3)', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400' }}>
        <strong>Laatst bijgewerkt:</strong> 20 september 2026<br />
        <strong>Versie:</strong> 1.0
      </p>
      </div>
    </div>
  )
}
