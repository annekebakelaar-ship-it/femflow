# Testfrontend op Vercel (gratis), los van productie

Doel: het toestemmingsscherm en het koppelingenoverzicht bereikbaar maken op
een vast adres, zonder het bestaande Vercel-project of het productiedomein
aan te raken.

**Niet** het bestaande project `femflow` aanpassen. Dat bouwt `master` en
bedient `ovari.youcaps.app`. Eén verkeerde instelling daar raakt echte
gebruikers. Maak in plaats daarvan een **tweede project** op dezelfde
repository; dat mag bij Vercel en is op het gratis plan gewoon toegestaan.

## Instellingen van het nieuwe project

| Instelling | Waarde |
|---|---|
| Project Name | `ovari-agent-test` (bepaalt het adres `ovari-agent-test.vercel.app`) |
| Repository | `annekebakelaar-ship-it/femflow` |
| Production Branch | `agent-fase-4` |
| Framework Preset | Vite |
| Root Directory | de wortel van de repo, **niet** `femflow-backend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci` |
| Plan | Hobby (gratis) |

Omgevingsvariabelen, scope Production:

```
VITE_API_URL=https://femflow-9yp9.onrender.com
VITE_OMGEVING=test
```

`VITE_GOOGLE_CLIENT_ID` niet zetten. De Google-knop werkt toch niet op een
nieuw domein (de origin staat niet in de OAuth-client) en de testgebruiker
logt in met de review-code.

Het adres `ovari-agent-test.vercel.app` is het productiedomein **van dit
project** en blijft dus gelijk bij elke deploy. Dat is precies wat nodig is,
want `FRONTEND_URL` en de CORS-lijst van de backend hangen aan één vast adres.

## Waarom VITE_OMGEVING=test er echt toe doet

De app viel terug op de productie-API als `VITE_API_URL` ontbrak. Met
`VITE_OMGEVING=test` weigert de bouw af te maken wanneer het API-adres
ontbreekt of naar productie wijst. Een testfrontend die stilletjes echte
gebruikersgegevens ophaalt kan daarmee niet meer ontstaan. De geslaagde bouw
drukt af welk adres hij gebruikt:

```
testbouw: API-adres https://femflow-9yp9.onrender.com
```

## Wat er al klopt in de repo

- `vercel.json` staat in de wortel: `cleanUrls`, geen trailing slash, en een
  rewrite die alle paden naar de app stuurt. Diepe links als
  `/agent/toestemming?verzoek=...` komen dus aan, inclusief querystring.
  Bestaande bestanden (`/privacy`, `/kennis/...`) worden eerst geserveerd.
- De routes `/agent/toestemming` en `/agent/koppelingen` staan in `App.jsx` en
  zitten in de bouw.
- Beide schermen sturen een uitgelogde gebruiker naar `/login`; het
  toestemmingsscherm geeft daarbij een terugkeeradres mee en de inlogpagina
  honoreert dat, maar alleen als het een pad op deze site is.

## Volgorde

1. Project aanmaken met de tabel hierboven. Nog niet deployen als Vercel dat
   vraagt; eerst de twee variabelen zetten.
2. Deployen vanaf `agent-fase-4`.
3. Controleer `https://ovari-agent-test.vercel.app/agent/koppelingen`: je hoort
   naar `/login` gestuurd te worden, niet een witte pagina te krijgen.
4. Zet op de Render-dienst `FRONTEND_URL=https://ovari-agent-test.vercel.app`
   en sla op. Render herstart.
5. Rooktest opnieuw: die hoort nu 22 van 22 te geven, inclusief de regel
   "browser wordt naar het toestemmingsscherm gestuurd".
6. Inloggen als `ovari-test-1@voorbeeld.invalid` met de review-code, en in de
   app de agent-toestemming aanzetten.

## Wat dit project niet mag

- Geen eigen domein koppelen.
- `ovari.youcaps.app` en `femflow.youcaps.app` blijven bij het bestaande
  project; daar verandert niets aan.
- Geen betaald plan: alles hierboven past op Hobby.
