# Volgende app-update

Punten die we meenemen in de eerstvolgende Android-update, na 2.2.0 (versionCode 8).
Opgeschreven op 13 september 2026.

## Verbeterpunten in de app

Alle drie afgerond op 19 september 2026.

1. ~~**Kennisbank-labels rustiger en in het Nederlands**~~ GEDAAN
   `LearningHub.jsx` toont nu Basis, Verdieping en Diepgaand in oker met een
   haarlijn, in plaats van Beginner en Intermediate in fel groen en geel.

2. ~~**Bestandsnaam van het huisartsrapport**~~ GEDAAN
   De download heet nu `ovari-cyclusrapport-<datum>.pdf`. Ook meegenomen:
   `ovari-export` en `ovari-data-export` op de accountpagina en bij de
   toestemmingen, die heetten ook nog femflow.

3. ~~**Gedachtestreepjes uit schermteksten**~~ GEDAAN
   Veertien zichtbare teksten herschreven naar gewone zinnen, in tien bestanden
   plus de leefstijlteksten en de voedingsregels. Bewust NIET aangepast: het
   losse streepje als plaatshouder voor een ontbrekende waarde op het
   startscherm, in de wearable-overlay en in de voedingsscanner. Dat is een
   teken in een tabel, geen lopende tekst.

   Nog open, buiten deze lijst: `src/content/artikelen.js` bevat nog 39
   gedachtestreepjes in de artikelteksten. Die staan ook op de website. Dat is
   een aparte schrijfronde, want het zijn hele zinnen die herschreven moeten
   worden.

## Controleren voor de update (geen code)

4. ~~**Privacyclaims laten kloppen**~~ GEDAAN op 20 september 2026
   Danib heeft de regio opgezocht: de Neon-database staat in Frankfurt, dus
   binnen de EU. De API-server draait op Render in Oregon, dus buiten de EU.
   Het privacybeleid noemt nu allebei die feiten, in plaats van alleen
   "Eu-gebaseerd". De storetekst claimt niets meer over servers.
   Nog te controleren door Danib: of de verwerkersovereenkomst met Render
   daadwerkelijk is afgesloten. Die zin stond al in het beleid en is niet
   door mij geverifieerd.

5. **Wearable-koppeling op een telefoon testen**
   De terugkeer naar de app na het inloggen bij Oura of Fitbit zit sinds 2.2.0 in de app, maar is nog niet op een echt toestel getest.

## Bij het uitbrengen

- `versionCode` en de versienaam ophogen in `android/app/build.gradle` (nu versionCode 8, versie 2.2.0).
- Release-tekst toevoegen aan `PLAY_STORE.md`.
- Bundel bouwen, eerst op de interne testtrack zetten en daarna naar productie.
