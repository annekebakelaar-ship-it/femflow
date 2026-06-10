# FemFlow — Opruim- en afmaakplan

Stand van zaken per 10 juni 2026, na volledige doorlichting van frontend, backend,
configuratie en alle kopieën op schijf. Volgorde = prioriteit: eerst wat gebruikers
en privacy raakt, dan kapotte config, dan schoonmaak, dan afmaken.

## STATUS (10 juni 2026)

| Fase | Status |
|------|--------|
| 1 — Security & GDPR | AF — live, Neon-migratie gedraaid |
| 2 — Configuratie | AF — live, Vercel env vars omgezet |
| 3 — Schoonmaak | AF — 84 dode bestanden weg, wab_jwt-bug gefixt |
| 4 — Halve features | AF — Google-login echt, feedback werkt, GA4 opt-in |
| 5 — Fundament | AF — ESLint (0 errors), 19 tests, keep-warm workflow |

Bonusvondsten onderweg: wab_jwt-tokenbug (8 componenten), ontbrekende
requestWearableConnect-import (Oura-koppelknop crashte), devLink-ReferenceError
in SigninPage, pool.query-transactie zonder dedicated client.

---

## Fase 1 — Kritiek: security & GDPR (backend)

Bestand: `femflow-backend/server.js`

1. **GDPR-delete is onvolledig.** `DELETE /api/v1/users/me` verwijdert alleen
   `femflow_menstruation_data`, `femflow_otp_codes` en `femflow_users`. Blijven staan:
   `femflow_wearable_connections` (incl. Oura-tokens!), `femflow_biometric_readings`,
   `femflow_quiz_results` en `femflow_welcome_signups`. Voor een health-app is dit
   de belangrijkste fix van allemaal.
2. **Geen rate limiting op OTP.** `request-code` is onbeperkt aan te roepen
   (e-mail-bombing via SendGrid-tegoed) en `verify-code` staat onbeperkt raden toe
   (6 cijfers, 10 minuten geldig). Toevoegen: `express-rate-limit` + max 5
   verificatiepogingen per code.
3. **`JWT_SECRET` fallback `'dev-secret'`.** Als de env var op Render ooit wegvalt
   draait productie stilletjes op een publiek bekende secret. Hard falen bij start
   als `JWT_SECRET` ontbreekt.
4. **Bug: `sgMail.setApiKey()` staat vóór `dotenv.config()`** (regel 13 vs 15).
   Lokaal is de API-key dus altijd `undefined`. Op Render werkt het toevallig
   omdat env vars daar al gezet zijn.
5. **CORS staat volledig open** (`app.use(cors())`). Beperken tot `FRONTEND_URL`.
6. **Oura OAuth `state` is het rauwe userId** (CSRF-gevoelig, staat zelf in de
   comment). Signed/random state met verificatie in de callback.
7. **`POST /api/v1/quiz/save` heeft geen auth** maar leest wel `req.userId`
   (altijd `null`) — resultaten worden dus nooit aan een user gekoppeld, en het
   endpoint is open voor spam.
8. **OTP-codes staan plaintext in de database.** Hashen (of accepteren als bewust
   risico, maar dan gedocumenteerd). Verlopen codes worden nooit opgeruimd.

## Fase 2 — Kapotte configuratie (frontend)

9. **`process.env.REACT_APP_*` werkt niet in Vite.** Gebruikt in
   `src/api/client.js`, `src/App.jsx`, `src/utils/oauthHandler.js` en
   `src/components/ErrorBoundary.jsx`. Vite leest alleen `import.meta.env.VITE_*`.
   Gevolg nu: de `.env` wordt volledig genegeerd, en de Google Client ID in
   productie is letterlijk `'YOUR_GOOGLE_CLIENT_ID_HERE'` — **Google-login is
   kapot in productie.** Migreren naar `VITE_API_URL` / `VITE_GOOGLE_CLIENT_ID`
   en de `.env` hernoemen. (`ErrorBoundary`: `process.env.NODE_ENV` →
   `import.meta.env.DEV`.)
10. **`vite.config.js` hardcodet `VITE_API_BASE_URL` naar de WAB-backend**
    (`wearable-age-api.onrender.com`). Alleen dode code gebruikt het nog, maar
    het is een tijdbom — verwijderen.
11. **`render.yaml` is verouderd:** bevat `EMAIL_USER`/`EMAIL_PASSWORD`
    (nodemailer-restanten) maar mist `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
    en de drie `OURA_*` vars die de code wél gebruikt.
12. **Domein-inconsistentie:** og:url en render.yaml wijzen naar
    `femflow-two.vercel.app`, e-mails/`.env.example` naar `femflow.youcaps.app`.
    Eén canoniek domein kiezen.

## Fase 3 — Grote schoonmaak

13. **78 van de 163 bestanden in `src/` zijn onbereikbaar dode code**
    (reachability-analyse vanaf `main.jsx`). Hele mappen kunnen weg:
    `pages/onboarding/` (13 bestanden), `pages/scanner/`, `pages/advice/`,
    `pages/checkin/`, `pages/connect/`, `pages/waarom/`, oude auth-pagina's
    (`LoginPage`, `SignIn`, `SignupPage`, `VerifyToken`), drie dubbele
    Dashboards (`pages/Dashboard.jsx`, `pages/dashboard/Dashboard.jsx`),
    `api/api.js` + `api/mockApi.js` + `api/mockData.js` + `api/config.js`,
    ~15 ongebruikte componenten, `context/AppContext.jsx`,
    `utils/cycleUtils.js` + `utils/hormoneCalculator.js`, en ~13 ongebruikte
    assets (o.a. `afb*.png`, `YouCapsLogo.png.png`).
14. **Vier extra kopieën van de app op schijf:**
    - `~/femflow-backend/` — verweesde, oudere backend (1 commit, geen remote,
      mist de welcome-signup endpoints). De échte backend is
      `~/femflow/femflow-backend/` (in de frontend-repo getrackt). Verwijderen
      of archiveren.
    - `~/WearableAgeBridge/frontend/femflow/` — oude kopie uit de WAB-tijd.
    - `AppData/Local/Temp/femflow/` en `femflow-fresh/` — weggooien.
15. **WAB-erfenis hernoemen:** `src/pages/wab/` bevat de kernpagina's van
    FemFlow (DashboardHome, Results, LearningHub...). Hernoemen naar iets als
    `src/pages/dashboard/`, en de localStorage-key `wab_last_result` →
    `femflow_last_result` (met migratie of accepteren dat oude resultaten
    wegvallen).
16. **Dubbele `/` route in `App.jsx`:** regel 143 (`Welcome`) wint; de tweede
    op regel 242 (`Landing` met alle props) is onbereikbaar — weghalen, samen
    met de dan ongebruikte `handleResult`/`lastResult`-logica als `/results`
    nergens meer vandaan bereikt wordt.
17. **Duplicaat-utils:** `cycleHelper.js` vs `cycleUtils.js` — één houden.
18. **Emoji's in backend-output** (`✅`, `🚀` in console.log, `🌿` in de
    welkomstmail-onderwerpregel) — strijdig met de no-emoji regel in CLAUDE.md.
    De mail-emoji is een productkeuze; de console-emoji's kunnen gewoon weg.
19. **CLAUDE.md bijwerken** na deze ronde: env-conventie (VITE_*), juiste
    mappenstructuur, en het deploy-checklist kloppend maken.

## Fase 4 — Afmaken of verwijderen (halve features)

20. **FeedbackWidget verstuurt niets** — de fetch is uitgecomment
    (`src/components/FeedbackWidget.jsx:29`). Endpoint + tabel maken, of de
    widget weghalen. Nu wekt hij de indruk dat feedback aankomt.
21. **Google/Apple sign-in op de backend zijn placeholders** die
    `token: 'placeholder'` teruggeven. Echte tokenvalidatie bouwen, of de
    knoppen op `SigninPage` verbergen tot het af is (samen met punt 9 is
    social login nu dubbel kapot).
22. **Oura token-refresh ontbreekt** — verlopen token = "please reconnect".
23. **Oura pull gebruikt een niet-bestaand endpoint**
    (`/v2/usercollection/daily_summaries`). De v2-API heeft aparte endpoints:
    `daily_sleep`, `daily_readiness`, `sleep`, `heartrate`. Herschrijven zodra
    echte Oura-data prioriteit krijgt; tot die tijd draait alles op seed-data.
24. **GA4-consent:** ANALYTICS.md zegt "data sends regardless but users can
    opt-out" — opt-out is geen GDPR-grondslag voor analytics op een health-app.
    GA4 pas laden ná consent (Consent Mode of script-injectie na akkoord).

## Fase 5 — Fundament (laag urgent, hoog rendement)

25. **Geen lint, geen tests.** Minimaal: ESLint + een handvol tests op
    `cycleHelper.js` en de auth-flow van de backend.
26. **`package.json` backend-scripts checken** en één `npm run dev` voor het
    geheel (concurrently) overwegen.
27. **Render free tier cold starts** (~50s eerste request) — health-check ping
    of betaald plan zodra er echte gebruikers zijn.

---

## Voorgestelde volgorde

| Stap | Wat | Omvang |
|------|-----|--------|
| 1 | Fase 1: GDPR-delete, rate limiting, JWT/dotenv/CORS-fixes | 1 dagdeel |
| 2 | Fase 2: VITE_* env-migratie + render.yaml + Google-login werkend | 1 dagdeel |
| 3 | Fase 3: dode code en kopieën verwijderen, wab→femflow hernoemen | 1 dagdeel |
| 4 | Fase 4: feedback-widget en social login afmaken óf uitzetten; GA4-consent | 1-2 dagdelen |
| 5 | Fase 5: lint/tests/fundament | doorlopend |

Elke stap is een eigen branch + commit-reeks, conform de stap-voor-stap +
goedkeuring-regel uit CLAUDE.md.
