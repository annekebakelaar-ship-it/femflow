# Testdienst op Render en koppeling met ChatGPT

Voorbereiding, nog niet uitgevoerd. Er is niets gedeployed en er is geen
dienst aangemaakt. Dit is wat er moet gebeuren, met de exacte waarden.

**Waarom een aparte dienst en niet de bestaande femflow-api:** de agent heeft
een eigen database (de Neon-branch `agent-test`), een eigen sleutelpaar, een
eigen auditzout en vlaggen die op productie uit horen te blijven. Een tweede
dienst houdt die werelden gescheiden; een verkeerd gezette vlag op femflow-api
zou meteen echte gebruikers raken.

## De dienst

| Instelling | Waarde |
|---|---|
| Naam | `ovari-agent-test` |
| Repository | dezelfde repo, branch `agent-fase-4` |
| Root directory | `femflow-backend` |
| Build command | `npm ci` |
| Start command | `npm start` |
| Health check path | `/api/v1/health` |
| Instance type | Starter of hoger |
| Regio | Frankfurt (zelfde kant als de Neon-branch, eu-central-1) |

Over het instancetype: een gratis instance slaapt na een kwartier en doet er
daarna tientallen seconden over om wakker te worden. ChatGPT loopt dan tegen
een time-out bij het ontdekken of bij de eerste tool-aanroep. Dit is een
betaalde dienst, dus dat moet jij aanzetten; ik maak niets aan.

## Omgevingsvariabelen

Geheim, zelf invullen (en nooit gelijk aan die van productie):

| Variabele | Wat erin hoort |
|---|---|
| `DATABASE_URL` | de connectiestring van `ovari_agent_test` op branch `agent-test` |
| `JWT_SECRET` | een nieuw, eigen geheim voor deze dienst, minstens 32 tekens |
| `AGENT_AUDIT_SALT` | 64 hex-tekens, eenmalig gezet en daarna niet meer wijzigen |
| `AGENT_OAUTH_PRIVATE_KEY` | PKCS#8 PEM, zie `SLEUTELROTATIE.md` voor het genereren |
| `AGENT_OAUTH_PUBLIC_KEY` | de bijbehorende SPKI PEM |
| `REVIEW_CODE` | zes cijfers naar keuze, alleen voor de testgebruiker |
| `SENDGRID_API_KEY` | mag een loze waarde zijn: de testgebruiker logt in via de review-code |

Vast, letterlijk over te nemen (`<dienst>` is het adres van de dienst):

```
NODE_ENV=production
PORT=5000
AGENT_ENABLED=true
AGENT_OAUTH_ENABLED=true
AGENT_OAUTH_ISSUER=https://<dienst>
AGENT_OAUTH_RESOURCE=https://<dienst>/api/v1/agent/oauth/mcp
AGENT_OAUTH_CIMD_HOSTS=chatgpt.com
FRONTEND_URL=https://<testfrontend>
REVIEW_EMAIL=ovari-test-1@voorbeeld.invalid
```

`AGENT_OAUTH_CLIENTS` blijft leeg: ChatGPT komt binnen via CIMD, en een lege
lijst betekent dat er verder niemand kan koppelen.

`REVIEW_EMAIL` wijst naar de fictieve testgebruiker die al in de database
staat, dus inloggen werkt zonder dat er mail verstuurd hoeft te worden.

## Frontend

Het toestemmingsscherm staat op `/agent/toestemming` en het intrekken op
`/agent/koppelingen`. Dat zijn gewone routes in de bestaande app, dus er is
een testfrontend nodig die naar deze API wijst: een Vercel preview-deploy van
dezelfde branch met `VITE_API_URL=https://<dienst>` is genoeg. Zet
`FRONTEND_URL` van de dienst op het adres daarvan, want daar stuurt
`/authorize` de browser heen.

Zonder testfrontend kan de koppeling niet afgemaakt worden: de beslissing
vraagt een ingelogde gebruiker in de app.

## Uitrolchecklist

1. Sleutelpaar en auditzout genereren, lokaal, buiten de repo.
2. Dienst aanmaken met de tabel hierboven, variabelen zetten, nog niet koppelen.
3. `node agent/scripts/config-check.mjs` draaien met dezelfde waarden: moet nul
   fouten geven.
4. Deployen en wachten tot `/api/v1/health` 200 geeft.
5. `node agent/scripts/smoke-chatgpt.mjs https://<dienst>` draaien: moet 22 van
   22 geven. Lukt de CIMD-regel niet, dan staat `chatgpt.com` niet in
   `AGENT_OAUTH_CIMD_HOSTS`.
6. Testfrontend deployen en `FRONTEND_URL` daarop zetten.
7. Inloggen als `ovari-test-1@voorbeeld.invalid` met de review-code, en in de
   app de agent-toestemming aanzetten.
8. In ChatGPT een connector toevoegen die wijst naar
   `https://<dienst>/api/v1/agent/oauth/mcp`. ChatGPT haalt de rest zelf op via
   `/.well-known/oauth-protected-resource` en
   `/.well-known/oauth-authorization-server`.
9. De koppeling doorlopen: je hoort het Ovari-toestemmingsscherm te zien met de
   naam van de client en drie scopes met uitleg.
10. In ChatGPT iets vragen dat een tool nodig heeft. Verwacht cyclusdag 15 en
    eenentwintig gemeten nachten van de testgebruiker.
11. Koppeling intrekken via Profiel, Koppelingen, en opnieuw iets vragen: dat
    hoort meteen geweigerd te worden.
12. Auditlog nakijken:
    ```sql
    SELECT tijdstip, gebruiker, tool, toestemming, resultaat
    FROM femflow_agent_audit ORDER BY tijdstip DESC LIMIT 20;
    ```

Stap 1 tot en met 12 raken productie niet. De bestaande femflow-api, de
publieke kennisbank-MCP en de Play Store-app blijven ongemoeid.

## Wat ChatGPT van ons verwacht, en wat we leveren

| Eis | Stand |
|---|---|
| OAuth 2.1 met PKCE S256 | ja, `plain` wordt geweigerd |
| Protected resource metadata (RFC 9728) op de root | ja, plus de padvariant |
| Authorization server metadata (RFC 8414) | ja |
| Clientregistratie zonder handwerk | ja, via CIMD; `chatgpt.com/oauth/client.json` is opgehaald en geaccepteerd |
| `token_endpoint_auth_method` onderhandelen | ja, op de doorsnede: ChatGPT noemt `private_key_jwt` als voorkeur met `none` ernaast |
| Resource indicator (RFC 8707) | geaccepteerd en gecontroleerd; een vreemde resource wordt geweigerd |
| `iss` in het redirectantwoord (RFC 9207) | ja |
| MCP over streamable HTTP | ja, JSON-RPC, staatloos |
| Publiek https-adres | **nog niet**, dat is deze dienst |

## Vervaldatum van de Neon-branch

Niet te zien vanuit de database: Postgres kent geen branchvervaldatum, en
`pg_settings` met prefix `neon%` bevat alleen tenant-, timeline-, branch- en
endpoint-identiteit. Een vervaldatum is een eigenschap van de branch in het
Neon-project en staat in de console of achter de Neon API.

Kijken in de console: Branches, `agent-test`, kolom *Expires*. Staat daar een
datum, zet dan een herinnering; verloopt de branch, dan verdwijnt de database
en daarmee de testgegevens. Opnieuw opbouwen kost twee commando's
(`neon-migrate.mjs` en `neon-seed.mjs`), dus het is geen ramp, maar een
koppeling die midden in een test wegvalt kost wel een uur zoeken.

Wat ik wel kon vaststellen: de branch bestaat, het endpoint is wakker, de
rol mag schrijven en de database bevat op dit moment de twaalf tabellen met
zevenentwintig fictieve rijen.
