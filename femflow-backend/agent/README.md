# Ovari Agent Foundation

Persoonlijke agentmodule, **standaard uitgeschakeld**. Bouwopdracht 01,
19 oktober 2026. Nog niet gedeployed, nog niet aan de frontend gekoppeld.

Dit is de fundering: authenticatie, toestemming, drie alleen-lezen tools op de
eigen gegevens van de ingelogde gebruiker, en tests met fictieve gegevens. Er
zit bewust nog geen taalmodel in.

---

## Wat de inventarisatie opleverde

De agent kan alleen werken met wat de backend echt heeft. Dat is minder dan de
app laat zien, en dat bepaalt het ontwerp:

| Gegeven | Waar het staat | Bruikbaar voor een servertool |
|---|---|---|
| Cyclus | `femflow_menstruation_data`, **één rij per gebruiker** (`UNIQUE(user_id)`): laatste start, opgegeven cycluslengte, bloedingsdagen | Ja, maar het is geen reeks |
| Wearable-metingen | `femflow_biometric_readings`, dag per dag | Ja, rijkste bron |
| Koppelingen | `femflow_wearable_connections` | Ja |
| Quizuitkomst | `femflow_quiz_results.constellation` | Ja |
| Leeftijd | `femflow_users.birth_date` | Ja |
| **Dagelijkse check-ins (symptomen)** | versleuteld op het toestel (`secureStorage`, sleutel `symptom_log`) | **Nee** |
| **Dag-voor-dag cyclushistorie** | idem, op het toestel | **Nee** |

De twee belangrijkste persoonlijke reeksen staan dus op de telefoon en niet op
de server. Dat is een bewuste keuze van de app en die blijft staan. Een agent
die over symptomen wil praten heeft een toolrunner op het toestel nodig, of de
app moet die gegevens meesturen in de aanvraag. Allebei is een aparte
beslissing en valt buiten deze fundering.

## Architectuur

```
server.js
  └── als AGENT_ENABLED=true:  app.use('/api/v1/agent', maakAgentRouter({ pool, authenticateToken }))

agent/
  vlag.js          AGENT_ENABLED lezen (alleen de exacte waarde "true" telt)
  index.js         router: status, toestemming, toolmanifest, tooluitvoering
  toestemming.js   pure beslisregel + lezen/geven/intrekken
  tools.js         de drie tools, als neutrale objecten
  gegevens.js      pure samenvatters, geen database en geen netwerk
  *.test.js        24 tests met verzonnen gebruikers
```

De router krijgt `pool` en `authenticateToken` mee in plaats van ze te
importeren. `server.js` blijft daardoor ongemoeid op twee importregels en één
`if` na, en de hele keten is te testen met een nep-pool.

## Uitgeschakeld betekent afwezig

Staat de vlag uit, dan wordt de router niet gemonteerd en bestaan de endpoints
niet (404 via de bestaande afhandeling). Er is geen half-aangezette toestand en
een fout in deze module kan de live app niet raken. Aanzetten doe je met
`AGENT_ENABLED=true` op Render; `render.yaml` zet hem expliciet op `"false"`.

## Authenticatie

Hergebruikt `authenticateToken` uit `server.js`, dus hetzelfde JWT als de rest
van de app. Geen tweede gebruikersadministratie, geen eigen sleutels, en een
uitgelogde of verwijderde gebruiker verliest hier onmiddellijk toegang.

Eén harde regel, overgenomen uit `youcaps-pt-mcp-private`: **identiteit komt
uitsluitend uit het token**. Geen enkele tool heeft een parameter waarmee een
gebruiker gekozen kan worden, en de invoerschema's staan op
`additionalProperties: false`. Een test bewijst dat een `user_id` in de body
genegeerd wordt en nooit in een query terechtkomt.

## Toestemming

Losse toestemming in `femflow_agent_consent`, apart van de cookiebanner en de
wearable-toestemming: die zeggen niets over het laten lezen van je gegevens
door een assistent.

- `GET /api/v1/agent/consent` geeft de stand.
- `POST` geeft toestemming (versie 1.0), `DELETE` trekt hem in.
- Intrekken verwijdert de rij niet maar vult `revoked_at`, zodat aantoonbaar is
  wanneer er toegang was.
- Een tooluitvoering zonder geldige toestemming wordt geweigerd **voordat er
  ook maar één gegevensquery draait**. Ook daar is een test voor.
- Verandert de toestemmingstekst, dan verhoog je `TOESTEMMING_VERSIE` en moet
  iedereen opnieuw akkoord geven (`toestemming_oude_versie`).

De SQL staat onderaan `schema.sql` en is **nog niet op Neon uitgevoerd**.

## De drie tools

Alle drie alleen-lezen, zonder parameters, en alle drie geven een expliciete
reden terug in plaats van een lege uitkomst. Dat laatste is het verschil tussen
"ik weet het niet" en een model dat gemiddelden gaat verzinnen.

| Tool | Geeft | Weigert met |
|---|---|---|
| `get_my_cycle_overview` | laatste start, opgegeven cycluslengte, cyclusdag vandaag, rekenkundig verwachte volgende start, plus een `basis`-veld dat zegt dat dit zelfgerapporteerd is | `geen_cyclusgegevens`, `verouderd` (meer dan twee cycluslengtes zonder invoer) |
| `get_my_recovery_trend` | laatste 7 nachten tegen de 21 daarvoor: slaap, diepe slaap, HRV, rusthartslag, herstelindex, met richting per waarde | `geen_wearable`, `geen_metingen`, `te_weinig_metingen` (< 5 nachten), `verouderd` (nieuwste nacht ouder dan 10 dagen) |
| `get_my_profile_context` | leeftijd, lid sinds, quizuitkomst, gekoppelde wearables, welke gegevens ingevuld zijn | nooit: dit is altijd beschikbaar, maar velden kunnen leeg zijn |

`gegevens.js` geeft **nooit naam of e-mailadres terug**. Een assistent heeft de
identiteit van de gebruiker niet nodig om over haar gegevens te praten, en wat
hier niet uit komt kan ook nooit in een model-prompt belanden. Een test
controleert dat.

## Endpoints

| Methode | Pad | Toestemming nodig |
|---|---|---|
| GET | `/api/v1/agent/status` | nee |
| GET | `/api/v1/agent/consent` | nee |
| POST | `/api/v1/agent/consent` | nee (dit *is* de toestemming) |
| DELETE | `/api/v1/agent/consent` | nee |
| GET | `/api/v1/agent/tools` | nee, het manifest bevat alleen beschrijvingen |
| POST | `/api/v1/agent/tools/:naam` | **ja** |

Tooluitvoering is begrensd op 30 aanroepen per minuut **per gebruiker**, niet
per IP: een agent die doordraait raakt zo alleen de eigen gebruiker.

## Wat er bewust nog niet in zit

- **Geen taalmodel.** De tools zijn neutrale objecten met een naam, een
  beschrijving en een JSON-schema. Die passen zowel op een MCP-server (zoals
  `youcaps-pt-mcp-private`) als op een Claude-toolrun. Wie later een model
  aansluit, kiest daar het model en de kosten bij; voor nieuwe bouwsels is
  Claude (`claude-opus-5` of `claude-sonnet-5-5`) het uitgangspunt.
- **Geen schrijftools.** Niets logt, wijzigt of verwijdert iets.
- **Geen interface.** De frontend is niet aangeraakt.
- **Geen symptoomtool**, om de reden hierboven.
- **Auditlog: sinds fase 2 WEL aanwezig** (`audit.js`), zie hieronder.

## Fase 2 (branch agent-fase-2)

- **Auditlog** (`audit.js`): tijdstip, gepseudonimiseerde gebruiker (HMAC met
  `AGENT_AUDIT_SALT`), toolnaam, toestemmingstatus en resultaatcode. Geen
  gezondheidsinhoud, geen tokens, geen request bodies: `schrijfRegel()` kent
  die velden niet eens. Ook weigeringen en het intrekken van toestemming gaan
  het log in. Een kapot auditlog breekt nooit het antwoord aan de gebruiker.
- **Persoonlijke MCP-laag met OAuth 2.1** (`oauth/`), eigen vlag
  `AGENT_OAUTH_ENABLED`, standaard uit. Zie `oauth/README.md` voor wat werkt,
  wat ontwerp is en de checklist om het ooit aan te zetten.

## Fase 4 (branch agent-fase-4): klaar maken voor een echte koppeling

- **Fail-closed auditing.** Lukt het niet om de verplichte auditregel op te
  slaan, dan gaan er GEEN gegevens de deur uit: 503 via de API, een fout
  zonder inhoud via het MCP-protocol. Een onzichtbare uitgifte is erger dan
  een mislukte.
- **Opruimen** van verlopen codes en refreshtokens (`oauth/opruimen.js`),
  elke zes uur, met een timer die het proces niet wakker houdt.
- **Sleutelrotatie**: JWKS publiceert tijdens een rotatie twee sleutels en de
  verificatie accepteert ze allebei. Plan in `SLEUTELROTATIE.md`.
- **Scripts**: `scripts/config-check.mjs` keurt een omgeving voordat je hem
  aanzet (en drukt nooit sleutelmateriaal af), `scripts/smoke-chatgpt.mjs`
  test een publieke testomgeving en eindigt met de handmatige stappen.
- **Vondst tijdens de rooktest**: een afgewezen promise in een Express
  4-handler nam het hele proces mee toen de database weg was. Alle async
  handlers van de OAuth-router gaan nu door een vangnet dat 503 teruggeeft.

## De kennisfuncties zijn niet aangeraakt

De kennisbank (`src/content/artikelen.js`, `scripts/bouw-kennis.js`,
`scripts/kennisPagina.js`, de gegenereerde `/kennis`-pagina's en de sitemap)
is volledig ongewijzigd. De agent leest geen artikelen en vervangt geen
kennisfunctie.

## Zelf draaien

```bash
# tests (draaien mee met npm test in de repowortel)
npx vitest run femflow-backend/agent/

# lokaal aanzetten
AGENT_ENABLED=true npm start   # in femflow-backend/
```
