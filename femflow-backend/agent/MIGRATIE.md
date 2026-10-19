# Migratieplan agenttabellen (nog niet uitgevoerd)

Vier tabellen, allemaal nieuw, allemaal met het `femflow_`-voorvoegsel. Geen
enkele bestaande tabel of kolom verandert, dus de app blijft tijdens en na de
migratie precies hetzelfde doen.

| Tabel | Waarvoor | Fase |
|---|---|---|
| `femflow_agent_consent` | toestemming per gebruiker voor de agent | 1 |
| `femflow_agent_audit` | auditspoor, vijf kolommen, geen inhoud | 2 |
| `femflow_agent_oauth_codes` | autorisatiecodes, gehasht, 60 seconden | 2 |
| `femflow_agent_oauth_refresh` | refreshtokens, gehasht, 30 dagen | 2 |

De DDL staat onderaan `femflow-backend/schema.sql` en is de enige bron. Er is
geen migratietool in dit project: schemawijzigingen gaan met de hand op Neon,
zoals in CLAUDE.md staat.

## Volgorde

1. **Neem een backup** (Neon branch of point-in-time restore punt noteren).
2. Open de SQL-editor op de Neon-branch van productie.
3. Voer de vier `CREATE TABLE IF NOT EXISTS`-statements uit, plus de drie
   bijbehorende indexen. Alles is idempotent: twee keer draaien kan geen kwaad.
4. Controleer:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_name LIKE 'femflow_agent%';
   ```
   Verwacht: vier rijen.
5. Zet pas daarna `AGENT_AUDIT_SALT` op Render. Zonder dat zout logt de agent
   met een zout dat per processtart wisselt.
6. `AGENT_ENABLED` en `AGENT_OAUTH_ENABLED` blijven uit tot alles erbij staat.

## Terugdraaien

De tabellen staan los van de app. Terugdraaien is `DROP TABLE` in omgekeerde
volgorde (eerst `codes` en `refresh`, dan `audit`, dan `consent`), met de
kanttekening dat je daarmee het auditspoor weggooit. Zet liever de vlaggen uit
en laat de tabellen staan.

## Waarom dit veilig is tijdens draaiende productie

- Alleen `CREATE TABLE IF NOT EXISTS` en `CREATE INDEX IF NOT EXISTS`: geen
  `ALTER`, geen `UPDATE`, geen lock op bestaande tabellen.
- De foreign keys wijzen naar `femflow_users(id)` met `ON DELETE CASCADE`, dus
  een accountverwijdering ruimt ook de agentgegevens op. Dat is getest.
- De backend raakt deze tabellen alleen aan als de vlaggen aan staan. Staan de
  tabellen er wel en de vlaggen niet, dan gebeurt er niets.
- Staat de audittabel er niet en de agent wel aan, dan draait alles door: het
  log meldt één keer dat schrijven niet lukt. Ook dat is getest.

## Hoe dit getest is zonder productie aan te raken

`agent/oauth/postgres.test.js` draait **het echte DDL uit `schema.sql`** in een
in-memory Postgres (`pg-mem`) en voert daar de echte queries op uit: de
toestemmingsrij met `ON CONFLICT DO UPDATE`, het auditlog, de code- en
refreshopslag, en de cascade bij het verwijderen van een gebruiker.

Wat pg-mem niet dekt en op Neon dus nog een keer gecontroleerd moet worden:
tijdzonegedrag van `TIMESTAMPTZ` bij `NOW()`, en het gedrag van `BIGSERIAL`
onder gelijktijdige schrijvers. Beide zijn laag risico; het eerste raakt
alleen de leesbaarheid van het auditlog, het tweede alleen de volgorde van
id's.
