# Ovari op de Apple App Store (iOS)

iOS-fundering staat klaar (Capacitor iOS-project in `ios/`, iconen + splash
gegenereerd, cloud-build-recept in `codemagic.yaml`). Bouwen gebeurt op een
cloud-Mac via Codemagic, dus je hebt zelf geen Mac nodig.

## Goed nieuws: Ovari is gratis
Geen in-app-aankopen, dus geen 15-30% Apple-heffing en geen IAP-gedoe. Dit is
precies waarom Ovari de logische eerste iOS-app is (anders dan YouCaps, dat
een abonnement verkoopt).

## Wat jij eenmalig doet zodra je Apple Developer-account erdoor is
1. **Bundle-id registreren:** Apple Developer > Identifiers > `app.youcaps.ovari`.
2. **App aanmaken** in App Store Connect (naam Ovari, taal Nederlands).
3. **App Store Connect API-key** maken (Users and Access > Integrations > App
   Store Connect API) en in **Codemagic** toevoegen (Team > Integrations). Vul
   die naam in `codemagic.yaml` in bij `integrations.app_store_connect`.
4. In `codemagic.yaml` de `APP_STORE_APPLE_ID` invullen (numerieke App-ID).
5. Codemagic aan je repo koppelen en de workflow `ios-femflow` starten. Resultaat
   gaat automatisch naar **TestFlight**; daarna kun je naar productie-review.

## App Review-zaken (iOS, vergelijkbaar met Play)
- **Sign-in voor de reviewer:** zelfde review-login als bij Android. Geef bij
  "App Review Information > Sign-In required" op: `review@youcaps.app` + code
  `204816`. (Werkt via de env-vars op Render.)
- **Account verwijderen:** Apple eist dit voor apps met accounts. Zit al in de
  app (Account > Account verwijderen).
- **App Privacy (nutrition labels):** zelfde antwoorden als de Data Safety in
  PLAY_STORE.md (e-mail, gezondheids- en fitnessgegevens, niet gedeeld,
  versleuteld in transit, verwijderbaar).
- **Gezondheidsdata-disclaimer:** geen medisch advies, geen medisch hulpmiddel
  (staat in de beschrijving). Apple is streng op menstruatie-/gezondheidsapps;
  hou de teksten feitelijk.

## Winkelteksten
Hergebruik de teksten uit PLAY_STORE.md (titel, korte en lange beschrijving).
Apple-limieten: subtitel max 30 tekens, promotietekst max 170, beschrijving
max 4000.

## Screenshots (iOS-formaten)
Apple wil iPhone-screenshots in vaste maten (6.7" en 6.5"). De inhoud mag
dezelfde zijn als de Play-screenshots (welkom, kennisbank, check). Het makkelijkst
op je eigen iPhone na de eerste TestFlight-build, of via de Codemagic/simulator.

## Nog open (zelfde als Android, fase 2)
- Wearable-OAuth (Oura) deep-link round-trip voor native; nu nog niet af.
