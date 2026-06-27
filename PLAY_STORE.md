# FemFlow op Google Play — klaarzet-document

Alles wat je in de Play Console invult. Kopieer per veld. Niets hiervan is
medisch advies-taal; FemFlow is een tracker, geen medisch hulpmiddel.

---

## 1. Basis

- **App-naam:** FemFlow
- **Standaardtaal:** Nederlands (nl-NL)
- **Categorie:** Gezondheid en fitness
- **Contact-e-mail:** info@youcaps.app
- **Privacybeleid-URL:** https://femflow.youcaps.app/privacy
- **Website:** https://femflow.youcaps.app

---

## 2. Korte beschrijving (max 80 tekens)

Volg je cyclus en perimenopauze. Zie je eigen patroon, rustig en privé.

---

## 3. Volledige beschrijving (max 4000 tekens)

FemFlow is een rustige, private tracker voor je menstruatiecyclus en de
(peri)menopauze. Geen ruis, geen advertenties, geen doorverkoop van je
gegevens. Alleen jouw lichaam, jouw patroon, helder in beeld.

Wat je met FemFlow doet:

- Je cyclus bijhouden: menstruatie, lengte en symptomen, dag voor dag.
- Je patroon zien: FemFlow rekent een eerlijk venster uit op basis van je
  eigen gegevens, niet op een vaste 28-dagenaanname.
- De (peri)menopauze volgen: zie hoe je cyclus varieert in de overgang, met
  een venster dat breder wordt naarmate je cyclus grilliger is.
- Optioneel je wearable koppelen (Oura): slaap, HRV en herstel worden
  inzichtelijk naast je cyclus.
- Leren uit de kennisbank: nuchtere, onderbouwde artikelen over je lichaam.

Privacy staat voorop:

- Je gezondheidsgegevens worden versleuteld verzonden en op EU-servers
  verwerkt.
- Je kunt je account en alle gegevens met een paar tikken volledig
  verwijderen, op elk moment.
- Geen advertenties en geen verkoop van je data aan derden.

Belangrijk: FemFlow geeft informatie, geen medisch advies, en is geen
medisch hulpmiddel. Heb je klachten die je zorgen baren, raadpleeg dan je
huisarts.

Gemaakt met zorg in de EU.

---

## 4. Grafische assets die Play vraagt

- **App-icoon:** 512x512 PNG. KLAAR: public/icon-512.png (druppel op caramel).
- **Feature graphic:** 1024x500 PNG. NOG MAKEN (kan ik genereren met het
  FemFlow-woordmerk op de warme achtergrond).
- **Telefoon-screenshots:** minimaal 2, maximaal 8 (bijv. 1080x1920 of
  1080x2400). NOG MAKEN (kan ik uit de emulator vastleggen).
- Tablet-screenshots: alleen nodig als je tablets target. Overslaan kan.

---

## 5. Data Safety-formulier (antwoorden)

**Verzamelt of deelt de app gebruikersdata?** Ja, verzamelt.
**Wordt data versleuteld tijdens verzending?** Ja.
**Kunnen gebruikers verwijdering van data aanvragen?** Ja (in-app:
Account > Account verwijderen; verwijdert alle gegevens permanent).

Verzamelde datatypes en doelen:

| Datatype | Verzameld | Gedeeld | Doel | Verplicht? |
|---|---|---|---|---|
| E-mailadres | Ja | Nee | Account- en inlogbeheer | Verplicht |
| Gezondheidsinfo (cyclus, symptomen) | Ja | Nee | App-functionaliteit | Optioneel |
| Fitnessinfo (HRV, slaap via wearable) | Ja | Nee | App-functionaliteit | Optioneel |
| App-interacties / analytics | Ja | Nee | Analytics (met toestemming) | Optioneel |

Toelichting: e-mail dient voor de inlogcode en je account. Gezondheids- en
fitnessgegevens vul jij zelf in of komen van je gekoppelde wearable, en
worden alleen gebruikt om je inzichten te tonen. Analytics (Google
Analytics) draait alleen na jouw cookie-toestemming en bevat geen
gezondheidsgegevens. Data wordt niet met derden gedeeld voor hun eigen
gebruik; externe partijen (hosting, e-mailbezorging) zijn verwerkers.

---

## 6. Contentbeoordeling (questionnaire)

Gezondheidsapp, geen geweld, seks, drugs of gokken. Verwachte uitkomst:
Iedereen / PEGI 3. Beantwoord de vragenlijst eerlijk; vermeld dat het om een
gezondheids-/menstruatietracker gaat.

---

## 7. App-toegang voor de review (LET OP)

FemFlow logt in met een e-mailcode (OTP). Google-reviewers kunnen die code
niet ontvangen. Bij "App-toegang" moet je daarom een testaccount of
instructies opgeven, anders wordt de app afgekeurd omdat de reviewer niet
voorbij het inloggen komt.

Op te lossen (kies een van beide, ik help je ermee):
- Een demo-account met een vaste, bekende inlogcode die alleen voor de
  review werkt, of
- Een review-bypass-route. Dit moet ik nog in de backend toevoegen.

---

## 8. Accounttype (vooraf bepalen)

- Persoonlijk account: vereist eerst een gesloten test (20 testers, 14
  dagen) voor je naar productie mag.
- Organisatie-account (op KvK, met gratis D-U-N-S-nummer): slaat die eis
  over. Waarschijnlijk de slimmere route voor YouCaps.

---

## 9. Het uploadbestand

`android/app/build/outputs/bundle/release/app-release.aab` (ondertekend).
Bij "Productie" of "Test" -> nieuwe release -> dit AAB uploaden.
