# Persoonlijke MCP-laag met OAuth 2.1

Fase 2 van de Ovari-agent. **Standaard uit**, nergens gedeployed, geen
migratie uitgevoerd.

Dit is de laag waarmee een externe assistent (ChatGPT) straks de persoonlijke
gegevens van één ingelogde gebruiker mag lezen. De publieke kennisbank-MCP
(`ovari-mcp`, met `search_knowledge` en `fetch_article`) staat hier volledig
buiten en is niet aangeraakt.

## Waarom het app-JWT hier niet gebruikt mag worden

Het app-JWT is HS256 met `JWT_SECRET`, dertig dagen geldig, en geeft toegang
tot de hele API: cyclus opslaan, account verwijderen, alles. Dat token aan een
externe partij geven zou betekenen:

- geen scope, dus alles of niets;
- geen korte levensduur, dus een lek werkt een maand door;
- niet intrekbaar zonder iedereen uit te loggen;
- hetzelfde geheim als de app zelf.

Daarom geeft deze laag een **eigen soort token** uit: RS256 met een apart
sleutelpaar, uitgever en audience die alleen hier gelden, scopes per tool,
tien minuten geldig, met een `jti` en een roterend refreshtoken. Het app-JWT
wordt alleen gebruikt om de mens in de browser te herkennen op het moment dat
zij akkoord geeft, en verlaat de app nooit.

## Wat er nu werkt (code, met tests)

| Onderdeel | Bestand | Toestand |
|---|---|---|
| Authorization code grant met verplichte PKCE S256 | `flow.js`, `pkce.js` | werkend |
| `state` verplicht en ongewijzigd teruggegeven | `flow.js` | werkend |
| Exacte `redirect_uri`-match, geen wildcards, https verplicht | `clients.js` | werkend |
| Eenmalige code, 60 seconden, gehasht opgeslagen | `flow.js`, `opslag.js` | werkend |
| Hergebruik van een code trekt alle grants van die gebruiker in | `flow.js` | werkend |
| Toegangstoken RS256, 10 minuten, scope per tool | `jwt.js`, `flow.js` | werkend |
| Roterende refreshtokens, 30 dagen, gehasht | `flow.js`, `opslag.js` | werkend |
| Intrekken (RFC 7009) en intrekken bij toestemmingverlies | `flow.js` | werkend |
| Tokenvalidatie: handtekening, iss, aud, levensduur, claim-allowlist | `hulpbron.js` | werkend |
| Scope-afdwinging per tool | `hulpbron.js`, `metadata.js` | werkend |
| Toestemmingcontrole en toestemmingversie per aanroep | `hulpbron.js` | werkend |
| Auditlog van elke weigering en elke geslaagde aanroep | `../audit.js` | werkend |
| Ontdekking: JWKS, authorization server metadata, protected resource metadata | `metadata.js`, `router.js` | werkend |
| Geheugenopslag voor codes en tokens | `opslag.js` | werkend, voor tests en lokaal |
| Postgres-opslag | `opslag.js` | code geschreven, tabellen **niet aangemaakt** |

27 mock-integratietests in `oauth.test.js` dekken: de hele koppeling,
verkeerde verifier, ontbrekende state, vreemde redirect_uri, hergebruikte
code, verlopen token, verversen, rotatie, ontbrekende toestemming, ingetrokken
toestemming, oude toestemmingversie, ontbrekende scope, geknoeide `sub`,
vreemde ondertekening, verkeerde audience, intrekken, en het auditspoor.

## Wat ontwerp is, nog geen code

1. **Het toestemmingsscherm in de app.** `/authorize` keurt het verzoek en
   vertelt de app welke client welke scopes vraagt; `/authorize/decision`
   verwacht een ingelogde gebruiker en een expliciet `akkoord: true`. Het
   scherm zelf is niet gebouwd. Zonder dat scherm kan niemand koppelen, wat
   als veilige stand prima is.
2. **Dynamische clientregistratie.** ChatGPT verwacht RFC 7591 of een
   client-id metadata document. Nu registreer je een client met de hand in
   `AGENT_OAUTH_CLIENTS`. Voor een pilot is dat genoeg en het scheelt een
   groot stuk aanvalsvlak. Bij YouCaps is dit al eens gebouwd
   (`services/oauth_clients.py`, CIMD), dus daar ligt het patroon klaar.
3. **OIDC.** Er is nu geen `id_token`, geen `/userinfo` en geen `nonce`. Voor
   toegang tot gegevens is OAuth genoeg; OIDC gaat over identiteit doorgeven
   aan de client, en dat willen we hier juist niet: de client krijgt geen naam
   en geen e-mailadres.
4. **De MCP-laag als eigen dienst.** De endpoints draaien nu in femflow-api.
   Ze kunnen los: de resource-kant heeft alleen de publieke sleutel en de
   database nodig. Verplaatsen betekent `AGENT_OAUTH_RESOURCE` aanpassen en
   JWKS ophalen over https in plaats van uit de omgeving.
5. **Opruimtaak** voor verlopen codes en refreshtokens.
6. **Sleutelrotatie.** JWKS kan meerdere sleutels publiceren; de code tekent nu
   met één sleutel en valideert met één sleutel.

## Bekende grenzen

- Zonder `AGENT_OAUTH_CLIENTS` is er geen enkele client en eindigt elk
  autorisatieverzoek op `invalid_client`.
- De well-known-adressen staan nu onder `/api/v1/agent/oauth/`. Een echte
  client verwacht ze op de root (`/.well-known/oauth-authorization-server`).
  Dat is een kwestie van twee aliasroutes in `server.js` op het moment dat er
  echt gekoppeld wordt.
- Er is geen snelheidslimiet op `/token`. Voor een pilot met handmatig
  geregistreerde clients is dat te overzien, maar het hoort erbij voordat dit
  publiek wordt.

## Aanzetten (checklist, nog niet gedaan)

1. Migratie draaien: `femflow_agent_audit`, `femflow_agent_oauth_codes`,
   `femflow_agent_oauth_refresh` uit `schema.sql`.
2. `AGENT_AUDIT_SALT` zetten (lange willekeurige reeks, nooit wijzigen zonder
   te weten dat oude logregels dan niet meer koppelen).
3. Sleutelpaar genereren en als `AGENT_OAUTH_PRIVATE_KEY` en
   `AGENT_OAUTH_PUBLIC_KEY` zetten.
4. Client registreren in `AGENT_OAUTH_CLIENTS`.
5. Toestemmingsscherm in de app bouwen.
6. Pas daarna `AGENT_ENABLED=true` en `AGENT_OAUTH_ENABLED=true`.

Stap 6 is de laatste, niet de eerste. Zolang een van de stappen ontbreekt
weigert `server.js` de laag te monteren en zegt hij in het log waarom.
