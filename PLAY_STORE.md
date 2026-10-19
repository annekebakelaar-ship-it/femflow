> REBRAND 4 jul 2026: FemFlow -> Ovari (naamconflict met bestaande
> menstruatietracker). Nieuwe package-id app.youcaps.ovari = NIEUWE app in
> Play Console: oude femflow-inzending intrekken, listing/screenshots/
> feature-graphic opnieuw met Ovari-branding, zelfde keystore mag hergebruikt.

# Ovari op Google Play — klaarzet-document

Alles wat je in de Play Console invult. Kopieer per veld. Niets hiervan is
medisch advies-taal; Ovari is een tracker, geen medisch hulpmiddel.

---

## 1. Basis

- **App-naam (max 30 tekens):** `Ovari: overgang en menopauze` (28 tekens)
  - Live stond 19 okt 2026 alleen `ovari` (kleine letter, 5 tekens). De titel
    weegt het zwaarst in Play-zoekresultaten, en op "ovari" zoekt niemand.
  - Alternatief als je cyclus belangrijker vindt dan menopauze:
    `Ovari: cyclus en overgang` (25 tekens).
- **Standaardtaal:** Nederlands (nl-NL)
- **Categorie:** Gezondheid en fitness
- **Tags:** kies uit de vaste lijst de opties die het dichtst bij
  menstruatie, cyclus en vrouwengezondheid liggen (Play Console > Store-
  instellingen > App-categorie > Tags beheren, max 5). Tags bepalen in welke
  bladerlijsten je meedoet.
- **Contact-e-mail:** info@youcaps.app
- **Privacybeleid-URL:** https://ovari.youcaps.app/privacy
- **Website:** https://ovari.youcaps.app

---

## 2. Korte beschrijving (max 80 tekens)

`Houd je cyclus en perimenopauze bij. Rustig inzicht, privé, geen reclame.`
(73 tekens)

Live stond: "Volg je cyclus en de overgang. Rustig inzicht in je lichaam,
privé." (67 tekens). Die mist het woord perimenopauze, en dat is precies wat
mensen intikken: Google-suggesties geven "menopauze app", "gratis menopauze
app", "peri menopauze app" en "pre menopauze app" als bestaande zoekvraag.

Alternatief, met het woord overgangsklachten in plaats van perimenopauze:
`Cyclus en overgangsklachten bijhouden. Rustig, privé en zonder reclame.`
(71 tekens)

---

## 3. Volledige beschrijving (max 4000 tekens)

Ovari is een rustige, private app voor je cyclus, de perimenopauze en de
overgang. Voor vrouwen die willen begrijpen wat er in hun lichaam verandert,
zonder ruis en zonder advertenties.

Je cyclus verandert jaren voor je laatste menstruatie. Onregelmatige cycli,
slecht slapen, opvliegers en nachtzweten horen bij die fase, maar ze zijn
moeilijk te bespreken zolang je niets kunt laten zien. Ovari legt je eigen
patroon vast, dag voor dag, in het Nederlands.

Wat Ovari voor je doet:

- Vandaag: elke dag je fase, herstel, slaap, temperatuur en energie op één
  scherm, met een persoonlijk advies.
- Je cyclus bijhouden: tik losse dagen aan in de kalender. Ook als je cyclus
  onregelmatig wordt, zie je je eigen patroon en een eerlijk venster in plaats
  van een vaste 28-dagenaanname.
- Check-in: leg in een paar tikken vast hoe je je voelt, van opvliegers en
  nachtzweten tot slecht slapen, stemming en brain fog.
- Leefstijl: advies over kracht, beweging, rust, slaap, voeding en
  supplementen dat past bij je fase en je herstel.
- Huisartsrapport: maak een PDF van je laatste zes maanden en neem die mee
  naar je huisarts. Je hoeft niet uit te leggen hoe je je voelt, je laat zien
  wat er gebeurt.
- Kennisbank: negentien nuchtere artikelen over de overgang, van opvliegers
  en botgezondheid tot brain fog en pijn bij seks.

Voor wie Ovari is gemaakt:

- Vrouwen van veertig en ouder die merken dat hun cyclus verandert.
- Vrouwen met overgangsklachten die een gesprek met hun huisarts willen
  voorbereiden.
- Iedereen die haar menstruatie wil bijhouden zonder advertenties,
  pushberichten of een tijdlijn vol reclame.

Privacy staat voorop:

- Je dagboek en symptomen blijven op je telefoon.
- Je kunt je account en al je gegevens op elk moment volledig verwijderen.
- Geen advertenties en geen verkoop van je gegevens.

Ovari is gratis te gebruiken en volledig in het Nederlands.

Belangrijk: Ovari geeft informatie, geen medisch advies, en is geen medisch
hulpmiddel. Heb je klachten die je zorgen baren, raadpleeg dan je huisarts.

### Wearable-regel: pas toevoegen als de koppeling echt werkt

De live listing belooft nu "koppel je Oura Ring". Op 19 okt 2026 staan
OURA_CLIENT_ID en OURA_REDIRECT_URI niet op Render, dus die knop kan niemand
gebruiken. Laat de regel weg tot dat is gezet. Daarna deze regel tussen
Kennisbank en "Voor wie Ovari is gemaakt" plakken:

- Wearable: koppel als je wilt je Oura Ring, zodat slaap, HRV en herstel
  naast je cyclus staan.

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

## Release 2.2.2 (versionCode 10, 19 oktober 2026)

**Wat is er nieuw** (Play Console, max 500 tekens):

Nieuw in Ovari 2.2.2
- Je kunt Ovari nu vanuit de app beoordelen. Dat verzoek verschijnt op een rustig moment, nadat je je huisartsrapport hebt gemaakt of als je een aantal dagen hebt ingecheckt, en hoogstens eens per vier maanden.

Bundel: C:UsersdanibDownloadsovari-2.2.2-versionCode10.aab (7,6 MB, jarsigner verified).
Dien deze release in samen met de nieuwe app-naam en beschrijvingen uit secties 1 tot 3.

## Release 2.2.1 (versionCode 9, september 2026)

**Wat is er nieuw** (Play Console, max 500 tekens):

Nieuw in Ovari 2.2.1
- De kennisbank toont het niveau nu in het Nederlands: Basis, Verdieping en Diepgaand, rustig vormgegeven in plaats van felle labels.
- Het huisartsrapport en je gegevensexports heten nu Ovari in plaats van FemFlow.
- Veertien schermteksten zijn herschreven zodat ze prettiger lezen.

Winkelvermelding: korte en volledige beschrijving van 2.2.0 blijven ongewijzigd, zie hieronder.

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
