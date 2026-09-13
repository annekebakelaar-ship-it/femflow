> REBRAND 4 jul 2026: FemFlow -> Ovari (naamconflict met bestaande
> menstruatietracker). Nieuwe package-id app.youcaps.ovari = NIEUWE app in
> Play Console: oude femflow-inzending intrekken, listing/screenshots/
> feature-graphic opnieuw met Ovari-branding, zelfde keystore mag hergebruikt.

# Ovari op Google Play — klaarzet-document

Alles wat je in de Play Console invult. Kopieer per veld. Niets hiervan is
medisch advies-taal; Ovari is een tracker, geen medisch hulpmiddel.

---

## 1. Basis

- **App-naam:** Ovari
- **Standaardtaal:** Nederlands (nl-NL)
- **Categorie:** Gezondheid en fitness
- **Contact-e-mail:** info@youcaps.app
- **Privacybeleid-URL:** https://ovari.youcaps.app/privacy
- **Website:** https://ovari.youcaps.app

---

## 2. Korte beschrijving (max 80 tekens)

Volg je cyclus en perimenopauze. Zie je eigen patroon, rustig en privé.

---

## 3. Volledige beschrijving (max 4000 tekens)

Ovari is een rustige, private tracker voor je menstruatiecyclus en de
(peri)menopauze. Geen ruis, geen advertenties, geen doorverkoop van je
gegevens. Alleen jouw lichaam, jouw patroon, helder in beeld.

Wat je met Ovari doet:

- Je cyclus bijhouden: menstruatie, lengte en symptomen, dag voor dag.
- Je patroon zien: Ovari rekent een eerlijk venster uit op basis van je
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

Belangrijk: Ovari geeft informatie, geen medisch advies, en is geen
medisch hulpmiddel. Heb je klachten die je zorgen baren, raadpleeg dan je
huisarts.

Gemaakt met zorg in de EU.

---

## 4. Grafische assets die Play vraagt

- **App-icoon:** 512x512 PNG. KLAAR: public/icon-512.png (druppel op caramel).
- **Feature graphic:** 1024x500 PNG. NOG MAKEN (kan ik genereren met het
  Ovari-woordmerk op de warme achtergrond).
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

## 7. App-toegang voor de review (review-login is gebouwd)

Ovari logt in met een e-mailcode (OTP) die reviewers niet kunnen ontvangen.
Opgelost: de backend accepteert een vast review-adres plus een vaste code via
twee env-vars. Te doen:

1. Zet op Render (femflow-api > Environment) twee variabelen en sla op
   (Render redeployt automatisch):
   - REVIEW_EMAIL = review@youcaps.app
   - REVIEW_CODE  = 204816   (kies zelf 6 cijfers)
2. Vul in de Play Console bij "App-toegang > Inloggegevens vereist":
   - E-mail: review@youcaps.app
   - Code: 204816
   - Notitie: "Vul het e-mailadres in, druk op code aanvragen, voer 204816 in."
3. Alleen exact dit adres werkt met deze vaste code. Alle andere gebruikers
   houden de gewone e-mailcode. Wil je de review-toegang dichtzetten na
   publicatie, verwijder dan de twee env-vars.

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

---

## Release 2.2.0 (versionCode 8, september 2026)

**Wat is er nieuw** (Play Console, max 500 tekens):

Nieuw in Ovari 2.2.0
- Nieuw startscherm: je fase, herstel, slaap, temperatuur en energie in één oogopslag, met een persoonlijk advies voor vandaag.
- Je blijft ingelogd: open je de app, dan kom je direct in je overzicht.
- Cycluskalender: tik losse dagen aan, handig bij een onregelmatige cyclus.
- Leefstijl overzichtelijker, met een nieuwe navigatie: Vandaag, Inzichten, Tracken, Leefstijl en Profiel.

Storescreenshots: zes beelden van 1080x1920, zie de sectie Storescreenshots hieronder.

### Korte beschrijving (2.2.0, max 80 tekens)

Volg je cyclus en de overgang. Rustig inzicht in je lichaam, privé.

### Volledige beschrijving (2.2.0, max 4000 tekens)

Ovari is een rustige, private app voor je cyclus en de overgang. Voor vrouwen die willen begrijpen wat er in hun lichaam verandert, zonder ruis en zonder advertenties.

Wat Ovari voor je doet:

- Vandaag: elke dag je fase, herstel, slaap, temperatuur en energie op één scherm, met een persoonlijk advies.
- Je cyclus: tik losse dagen aan in de kalender. Ook als je cyclus onregelmatig wordt, zie je je eigen patroon.
- Check-in: leg in een paar tikken vast hoe je je voelt, van opvliegers tot slecht slapen.
- Leefstijl: advies over kracht, beweging, rust, slaap, voeding en supplementen dat past bij je fase en je herstel.
- Huisartsrapport: maak een PDF-overzicht van je laatste zes maanden en neem het mee naar je huisarts.
- Kennisbank: nuchtere artikelen over de overgang, van opvliegers tot botgezondheid.
- Wearable: koppel als je wilt je Oura Ring, zodat je slaap, HRV en herstel naast je cyclus ziet.

Privacy staat voorop:

- Je dagboek en symptomen blijven op je telefoon.
- Je kunt je account en al je gegevens op elk moment volledig verwijderen.
- Geen advertenties en geen verkoop van je gegevens.

Belangrijk: Ovari geeft informatie, geen medisch advies, en is geen medisch hulpmiddel. Heb je klachten die je zorgen baren, raadpleeg dan je huisarts.

### Storescreenshots (2.2.0, 1080x1920, in deze volgorde)

`assets/screenshots/ovari-2.2-01-home.png` t/m `ovari-2.2-06-kracht.png`. Vervang alle oude screenshots en houd deze volgorde aan.

LET OP: de oude volledige beschrijving hierboven noemt verwerking "op EU-servers". De API draait op Render in de VS (regio Oregon). Die zin is daarom uit de nieuwe tekst gehaald; controleer ook het Data Safety-formulier en het privacybeleid.
