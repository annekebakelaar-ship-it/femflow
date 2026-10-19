# Deployment-checklist, fase 1

Nog niet uitgevoerd. Dit is wat er nodig is en wat er al klopt.

## Wat ik heb gecontroleerd en in orde is

| Punt | Stand |
|---|---|
| Leest de poort uit `PORT` | ja, met 5100 als terugval |
| Luistert op alle interfaces | ja, nodig achter de proxy van een host |
| Geheimen nodig | geen, alleen `PORT` en het optionele `ALLOWED_ORIGINS` |
| Databasestuurprogramma aanwezig | nee, `pg` en `jsonwebtoken` zitten er niet in |
| Afhankelijkheden | vijf stuks, nul kwetsbaarheden |
| `package-lock.json` | aanwezig, dus `npm ci` is reproduceerbaar |
| Startcommando | `npm start` |
| Node-versie vastgelegd | ja, `>=20` |
| Gezondheidsadres | `GET /health` |
| Origin-controle | ja, vreemde Origin geeft 403 |
| Snelheidslimiet | 120 verzoeken per minuut per IP |

## Stappen om het online te zetten

1. **Nieuwe dienst op Render**, type web service, vanuit deze repository.
   Hoofdmap `ovari-mcp`, bouwcommando `npm ci`, startcommando `npm start`.
   Render checkt de hele repository uit, dus het pad naar
   `../src/content/artikelen.js` blijft kloppen.
2. **Betaald instantietype.** Een gratis instantie slaapt na een kwartier en
   doet er daarna twintig tot vijftig seconden over om wakker te worden. Voor
   een connector die beoordeeld wordt is dat te traag.
3. **Gezondheidscontrole** instellen op `/health`.
4. **Eigen domein** koppelen, bijvoorbeeld `mcp.ovari.youcaps.app`. Het adres
   moet stabiel en publiek zijn. Een tunnel of een tijdelijk testadres wordt
   voor publieke indiening niet geaccepteerd.
5. **Omgevingsvariabelen.** Alleen `ALLOWED_ORIGINS` als je nog een extra
   origin wilt toestaan. Verder niets. Staat er een databaseadres of een
   geheim tussen, dan hoort dat er niet.

## Controleren na het uitrollen

```bash
curl https://mcp.ovari.youcaps.app/health
curl -i https://mcp.ovari.youcaps.app/mcp          # hoort 405 te geven
```

Daarna de rooktest tegen het echte adres, door in
`scripts/rooktest.js` de basis-URL te vervangen, of met de inspector:

```bash
npx @modelcontextprotocol/inspector
```

Transport `Streamable HTTP`, adres `https://mcp.ovari.youcaps.app/mcp`.

## Daarna pas ChatGPT

Zet de ontwikkelaarsmodus aan en voeg de connector toe met de volledige URL
inclusief `/mcp`. Probeer dan een vraag als "wat zegt Ovari over slecht slapen
tijdens de perimenopauze". ChatGPT leest de twee tools, hun schema's en hun
annotaties uit.

## Nog niet aan begonnen

Voor een publieke inzending komt hier nog bij: naam, logo, korte en lange
beschrijving, categorie, website, ondersteuningspagina, privacybeleid,
voorwaarden, minimaal vijf positieve en drie negatieve testvragen, en
domeinverificatie. Dat is werk voor nadat de connector in de
ontwikkelaarsmodus goed blijkt te werken.
