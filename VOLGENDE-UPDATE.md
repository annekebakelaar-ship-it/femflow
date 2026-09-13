# Volgende app-update

Punten die we meenemen in de eerstvolgende Android-update, na 2.2.0 (versionCode 8).
Opgeschreven op 13 september 2026.

## Verbeterpunten in de app

1. **Kennisbank-labels rustiger en in het Nederlands**
   De niveaulabels tonen "Beginner" en "Intermediate" in het Engels, in fel groen en geel (`#FFD700`).
   Waar: `src/pages/dashboard/LearningHub.jsx`, kleurenmap rond regel 227.
   Doel: Nederlandse labels, bijvoorbeeld "Basis" en "Verdieping", in de huisstijl. Oker tekst met een haarlijn, geen felle vlakken.

2. **Bestandsnaam van het huisartsrapport**
   De download heet nog `femflow-cyclusrapport-<datum>.pdf`.
   Waar: `src/components/huisartsrapport/HuisartsRapport.jsx`, rond regel 44.
   Doel: `ovari-cyclusrapport-<datum>.pdf`.

3. **Gedachtestreepjes uit schermteksten**
   Tien zichtbare teksten gebruiken nog een gedachtestreepje, zoals de hint onder de cycluskalender en de ondertitel van de symptoomlogger.
   Waar: QuizResults (2x), MenstruationTracker, SymptomLoggerPage, SigninPage, WearableOverlay, VoedingScanner, SymptomQuicklog, HRVInsightsCard en CyclusKalender.
   Vinden: `grep -rn "—" src --include=*.jsx`
   Doel: herschrijven naar gewone zinnen met een punt of komma.

## Controleren voor de update (geen code)

4. **Privacyclaims laten kloppen**
   De API draait op Render in de VS, regio Oregon. Het privacybeleid in de app noemt de database "EU-gebaseerd" (`src/pages/legal/PrivacyPolicy.jsx`, rond regel 199), maar de regio van de Neon-database is nog niet gecontroleerd.
   Doel: Neon-regio nakijken en zo nodig het privacybeleid en het Data Safety-formulier in Play Console aanpassen. De oude storetekst met "EU-servers" is al vervangen.

5. **Wearable-koppeling op een telefoon testen**
   De terugkeer naar de app na het inloggen bij Oura of Fitbit zit sinds 2.2.0 in de app, maar is nog niet op een echt toestel getest.

## Bij het uitbrengen

- `versionCode` en de versienaam ophogen in `android/app/build.gradle` (nu versionCode 8, versie 2.2.0).
- Release-tekst toevoegen aan `PLAY_STORE.md`.
- Bundel bouwen, eerst op de interne testtrack zetten en daarna naar productie.
