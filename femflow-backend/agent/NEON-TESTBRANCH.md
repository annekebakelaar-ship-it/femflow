# Opbouwplan Neon-testbranch `agent-test` / database `ovari_agent_test`

Status: **plan, nog niets uitgevoerd.** Geen DDL, geen datamutatie, geen
verbinding gemaakt. Productie en `neondb` blijven buiten beeld.

## Hoe de verbinding gecontroleerd wordt

`agent/scripts/neon-check.mjs` leest de connectiestring uit
`AGENT_TEST_DATABASE_URL` of uit een bestand buiten de repository
(standaard `C:\Users\danib\femflow-keys\neon-agent-test.url`) en drukt nooit
credentials af: alleen host, databasenaam en sslmode.

De volgorde is expres: **eerst de naam keuren, dan pas verbinden.** Wijst de
URL naar `neondb`, `femflow` of `postgres`, dan wordt er niet eens een sessie
geopend. Daarna, op de verbinding zelf:

| Controle | Eis |
|---|---|
| `current_database()` | `ovari_agent_test` |
| databasenaam in de URL | `ovari_agent_test` |
| host | eindigt op `.neon.tech` |
| `pg_settings` met prefix `neon%` | wordt afgedrukt voor de branch- en endpointidentiteit |
| `version()` | PostgreSQL 13 of hoger, anders bestaat `gen_random_uuid()` niet |
| tabellen, views, sequences buiten de systeemschema's | **nul** |
| `has_database_privilege(..., 'CREATE')` | waar |

De branchnaam zelf staat niet in een connectiestring. Wat de branch vastlegt
is de endpoint-host plus de `neon.*`-instellingen; die moet je één keer naast
de Neon-console leggen (branch `agent-test`, project `age-sync`). Dat is de
enige stap die ik niet voor je kan dichttimmeren.

## Wat er opgebouwd moet worden, en waarom

De agent raakt meer dan alleen zijn eigen vier tabellen: de tools lezen
cyclus-, wearable- en profielgegevens, en inloggen schrijft een OTP-code. Voor
een end-to-end test is het hele basisschema nodig. Dat is ook het veiligst:
`schema.sql` is de enige bron, is volledig idempotent (`IF NOT EXISTS`) en
bevat geen enkele `ALTER`, `DROP`, `DELETE` of `UPDATE` buiten commentaar.
Dat heb ik nagelopen.

### Volgorde en afhankelijkheden (uit de repository geverifieerd)

| # | Tabel | Foreign key |
|---|---|---|
| 1 | `femflow_users` | geen |
| 2 | `femflow_otp_codes` | geen |
| 3 | `femflow_menstruation_data` | `femflow_users(id)` ON DELETE CASCADE, `UNIQUE(user_id)` |
| 4 | `femflow_wearable_connections` | `femflow_users(id)` CASCADE, `UNIQUE(user_id, wearable_type)` |
| 5 | `femflow_biometric_readings` | `femflow_users(id)` CASCADE, `UNIQUE(user_id, reading_date)` |
| 6 | `femflow_quiz_results` | `femflow_users(id)` CASCADE |
| 7 | `femflow_welcome_signups` | geen |
| 8 | `femflow_feedback` | `femflow_users(id)` ON DELETE SET NULL |
| 9 | `femflow_agent_consent` | `femflow_users(id)` CASCADE |
| 10 | `femflow_agent_audit` | geen (bewust: het spoor overleeft een verwijderd account) |
| 11 | `femflow_agent_oauth_codes` | `femflow_users(id)` CASCADE |
| 12 | `femflow_agent_oauth_refresh` | `femflow_users(id)` CASCADE |

Elke foreign key wijst naar een tabel die eerder in het bestand staat, dus de
volgorde van `schema.sql` is meteen de migratievolgorde. Daarna 13 indexen,
allemaal `IF NOT EXISTS`.

Totaal: **12 `CREATE TABLE IF NOT EXISTS` + 13 `CREATE INDEX IF NOT EXISTS` = 25 statements**, exact zoals ze in `femflow-backend/schema.sql` staan.

### Twee aandachtspunten

1. **`gen_random_uuid()`** is ingebouwd vanaf PostgreSQL 13. Neon draait 15 of
   hoger, dus er is geen `pgcrypto` nodig. De versiecontrole in `neon-check.mjs`
   bevestigt dat voor we iets uitvoeren.
2. **Eén comment in `schema.sql` bevat een puntkomma**
   (`-- FemFlow Feedback (uit de FeedbackWidget; user_id optioneel)`). Een
   naïeve splitser op `;` hakt die regel doormidden en slaat daardoor
   `femflow_feedback` over. De Neon SQL-editor heeft daar geen last van, en
   uitvoeren vanuit Node doe ik in één keer met het hele bestand in plaats van
   statement voor statement. Het comment opschonen mag ook, maar dat is een
   repo-wijziging die hier niet nodig is.

## Fictieve gegevens

`agent/testdata/seed-agent-test.sql`, 27 rijen, allemaal verzonnen:

| Wat | Aantal | Toelichting |
|---|---|---|
| gebruikers | 2 | `.invalid`-adressen, vaste UUID's; Twee bestaat om te bewijzen dat haar gegevens nooit bij Een opduiken |
| cyclusrijen | 2 | Een staat op cyclusdag 15, Twee op andere waarden |
| wearable-koppeling | 1 | `access_token` is NOT NULL, dus er staat `NEP-TOKEN-geen-echte-koppeling`; een echte pull hoort hiermee te falen |
| nachten | 21 | laatste zeven met hogere HRV, zodat de hersteltrend een richting laat zien |
| quizuitkomst | 1 | fictief |

De toestemming wordt **niet** geseed: die hoort via het scherm in de app
gegeven te worden, want dat is juist wat getest moet worden.

Handig detail: zet `REVIEW_EMAIL` van de testdienst op
`ovari-test-1@voorbeeld.invalid`. De review-login zoekt op e-mailadres, vindt
deze rij en gebruikt dus precies deze testgebruiker, zonder dat er mail
verstuurd hoeft te worden.

## Uitvoeringsplan, in volgorde

| Stap | Handeling | Soort |
|---|---|---|
| 0 | `node agent/scripts/neon-check.mjs` | alleen lezen |
| 1 | `schema.sql` uitvoeren (25 statements) | DDL |
| 2 | Controleren: 12 tabellen, 13 indexen, 9 foreign keys met het juiste ON DELETE | alleen lezen |
| 3 | `testdata/seed-agent-test.sql` uitvoeren (27 rijen, in één transactie) | datamutatie |
| 4 | Controleren: rijaantallen per tabel, en dat Twee geen metingen heeft | alleen lezen |
| 5 | Cascadeproef met een **derde** wegwerpgebruiker: aanmaken, rij in elke kindtabel, `DELETE FROM femflow_users`, controleren dat alles meegaat en dat `femflow_agent_audit` blijft staan | datamutatie |

Stap 1, 3 en 5 wijzigen iets en gebeuren pas na akkoord. Stap 5 raakt bewust
niet aan de twee testgebruikers.

## Controlequery's voor stap 2 en 4

```sql
-- tabellen en indexen
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;

-- foreign keys met hun verwijderregel
SELECT c.conname, c.conrelid::regclass AS tabel, c.confrelid::regclass AS verwijst_naar,
       CASE c.confdeltype WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL' ELSE c.confdeltype END AS bij_verwijderen
FROM pg_constraint c WHERE c.contype = 'f' ORDER BY tabel;

-- rijaantallen na de seed
SELECT 'users' AS tabel, COUNT(*) FROM femflow_users
UNION ALL SELECT 'menstruation', COUNT(*) FROM femflow_menstruation_data
UNION ALL SELECT 'wearable', COUNT(*) FROM femflow_wearable_connections
UNION ALL SELECT 'readings', COUNT(*) FROM femflow_biometric_readings
UNION ALL SELECT 'quiz', COUNT(*) FROM femflow_quiz_results
UNION ALL SELECT 'consent', COUNT(*) FROM femflow_agent_consent
UNION ALL SELECT 'audit', COUNT(*) FROM femflow_agent_audit;
```

Verwacht na stap 3: 2, 2, 1, 21, 1, 0, 0.
