# Sleutelrotatieplan

De toegangstokens van de persoonlijke MCP-laag zijn RS256-JWT's. De
privésleutel staat alleen in de omgeving van de API (`AGENT_OAUTH_PRIVATE_KEY`),
de publieke sleutel wordt gepubliceerd op `/api/v1/agent/oauth/jwks.json`.

## Waarom roteren

- Een sleutel die lang meegaat wordt vaker gekopieerd dan je denkt: logs,
  back-ups, een shell-sessie, een schermdeling.
- Bij een vermoeden van lekken moet je binnen een uur kunnen wisselen zonder
  iedereen uit te loggen.
- Routine maakt het saai. Een rotatie die nooit geoefend is, mislukt precies
  op het moment dat het moet.

**Ritme:** elke zes maanden, en onmiddellijk bij elk vermoeden van lekken.

## Hoe het werkt in de code

`jwks()` publiceert een lijst sleutels en `leesToken()` accepteert een lijst.
De `kid` uit de header bepaalt alleen de volgorde van proberen, nooit of een
token geldig is: elke sleutel wordt echt geverifieerd. Ondertekenen gebeurt
altijd met de huidige privésleutel.

| Variabele | Rol |
|---|---|
| `AGENT_OAUTH_PRIVATE_KEY` | ondertekent nieuwe tokens |
| `AGENT_OAUTH_PUBLIC_KEY` | hoort bij die privésleutel, staat in JWKS |
| `AGENT_OAUTH_PUBLIC_KEYS_OUD` | oude publieke sleutels, alleen voor verificatie, gescheiden door `\|\|\|` |

## De rotatie, stap voor stap

Toegangstokens leven tien minuten. De hele overgang duurt dus een kwartier,
niet een dag.

1. **Nieuw paar maken**, buiten de repo:
   ```bash
   openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out nieuw-prive.pem
   openssl rsa -in nieuw-prive.pem -pubout -out nieuw-publiek.pem
   ```
2. **Oude publieke sleutel parkeren**: zet de huidige `AGENT_OAUTH_PUBLIC_KEY`
   in `AGENT_OAUTH_PUBLIC_KEYS_OUD` (meerdere gescheiden door `|||`).
3. **Nieuw paar zetten** als `AGENT_OAUTH_PRIVATE_KEY` en
   `AGENT_OAUTH_PUBLIC_KEY`, en de dienst herstarten.
4. **Controleren**: `node agent/scripts/config-check.mjs` moet zeggen dat het
   paar bij elkaar hoort, en `/jwks.json` hoort nu twee sleutels te tonen.
5. **Een kwartier wachten.** Alle tokens van voor de wissel zijn dan verlopen.
   Refreshtokens blijven gewoon werken: die zijn niet ondertekend maar gehasht
   opgeslagen, dus een rotatie raakt ze niet.
6. **Oude sleutel weghalen**: `AGENT_OAUTH_PUBLIC_KEYS_OUD` leegmaken en
   herstarten. JWKS toont weer één sleutel.

## Bij een vermoeden van lekken

Dan sla je stap 2 en 5 over: zet alleen het nieuwe paar, laat
`AGENT_OAUTH_PUBLIC_KEYS_OUD` leeg en herstart. Elk token dat met de oude
sleutel is ondertekend is op dat moment waardeloos. Gevolg voor gebruikers:
hun assistent moet één keer verversen, en dat gaat vanzelf met het
refreshtoken. Wil je ook die ongeldig maken, dan is dat een aparte handeling
(`UPDATE femflow_agent_oauth_refresh SET ingetrokken = TRUE`), en moet iedereen
opnieuw koppelen.

## Wat niet roteert

- `AGENT_AUDIT_SALT` blijft staan. Wijzigen betekent dat oude en nieuwe
  logregels niet meer aan elkaar te knopen zijn; dat doe je alleen bewust.
- `JWT_SECRET` van de app staat hier helemaal los van en wordt nooit gebruikt
  om MCP-tokens te ondertekenen.
