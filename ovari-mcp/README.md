# Ovari MCP-server, fase 1

Een read-only MCP-server over de openbare Ovari-kennisbank. Twee tools,
negentien artikelen, geen persoonsgegevens.

Deze dienst staat los van de bestaande Express-backend in `femflow-backend/`.
Daar is niets aan gewijzigd. Ook aan de app zelf is niets gewijzigd.

## Wat deze dienst wel en niet doet

Wel:

- `search_knowledge` doorzoekt de negentien artikelen en geeft de best
  passende terug met een samenvatting, een tekstfragment en de openbare URL.
- `fetch_article` geeft de volledige tekst van een artikel terug.

Niet, en dat is met opzet:

- geen databaseverbinding, er is geen databasestuurprogramma geladen
- geen inloggen, geen OAuth, geen tokens
- geen persoonsgegevens, geen wearable-data, geen symptoomlogboeken
- geen schrijfacties

Alle inhoud die deze server teruggeeft staat al openbaar op
`https://ovari.youcaps.app/kennis`. Er komt hier dus niets naar buiten dat nog
niet openbaar was.

## Waarom een aparte dienst

De bestaande API deelt tokens uit die dertig dagen geldig zijn en alles openen,
tot en met het verwijderen van een account. Die twee werelden houden we
gescheiden, zodat een fout in de ene nooit de andere kan raken. Deze dienst
heeft een eigen `package.json`, eigen afhankelijkheden en een eigen proces.

## Bestanden

| Bestand | Wat het doet |
|---|---|
| `server.js` | HTTP-laag, het `/mcp`-eindpunt, Origin-controle, snelheidslimiet |
| `src/artikelen.js` | Leest de kennisbank uit `../src/content/artikelen.js` en bepaalt wat naar buiten mag |
| `src/zoek.js` | Zoeken en scoren. Pure functies, geen afhankelijkheden |
| `src/tools.js` | De twee tools met hun schema's en annotaties |
| `src/zoek.test.js` | Eenheidstests |
| `scripts/rooktest.js` | Start de server en praat er met een echte MCP-client tegen |

De artikelen worden rechtstreeks uit de app gelezen. Eén bron van waarheid:
verandert een artikel in de app, dan verandert het hier mee. Er wordt niets
gekopieerd en niets teruggeschreven.

## De relevantiedrempel

`search_knowledge` geeft alleen artikelen terug die boven een minimale score
uitkomen. Die grens is niet gekozen maar afgeleid uit de gewichten in
`src/zoek.js`. De score van een artikel valt namelijk op herkenbare waarden:

| Score | Wat het betekent |
|---|---|
| 1 | een enkele zoekterm, alleen in de lopende tekst |
| 2 | een term in een tussenkop, of twee termen in de tekst |
| 3 | een term in de ondertitel of de omschrijving |
| 6 | een term in de titel |

Een losse vermelding in de lopende tekst zegt niets: het woord "vrouwen" staat
in vijftien van de negentien artikelen. De lichtste vorm van bewijs die wel
iets zegt is een term in een tussenkop. De drempel is daarom `GEWICHT.kop`.

Gemeten op de echte kennisbank: irrelevante vragen halen hoogstens 0,67 en
toevallige treffers landen precies op 1,0, dus die vallen er allemaal onder.
Een vraag over hypotheekrente of pizza levert nu een lege lijst op, en het
woord "vrouwen" gaat van vijftien treffers naar één.

### Bekende grens

Alle zoektermen wegen even zwaar. Een veelzeggend woord als "botontkalking"
telt dus net zo zwaar als het vulwoord "tegen". Bij de vraag "wat helpt tegen
botontkalking in de overgang" raken twee artikelen allebei drie van de vier
termen en eindigen ze op exact dezelfde score. Het juiste artikel staat er wel
bij, maar niet gegarandeerd bovenaan.

Twee manieren om dat op te lossen, geen van beide nu doorgevoerd omdat ze de
gemeten drempel opnieuw zouden ijken:

1. Vulwoorden als "helpt", "tegen", "wat" en "welke" toevoegen aan de
   stopwoordenlijst. Klein en voorspelbaar.
2. Zeldzame woorden zwaarder laten wegen dan gewone, de klassieke
   omgekeerde-documentfrequentie. Nauwkeuriger, maar het verschuift alle
   scores en dus de drempel.

## Lokaal draaien

```bash
cd ovari-mcp
npm install
npm start
```

De server luistert dan op poort 5100. Controleer of hij leeft:

```bash
curl http://localhost:5100/health
```

## Testen

Drie niveaus, van snel naar echt.

**1. Eenheidstests.** Zoeklogica, scores, de vorm van de uitvoer. Deze draaien
met de testloper van de hoofdmap, zodat er één loper voor de hele repository is:

```bash
npx vitest run ovari-mcp
```

Vanuit deze map kan het ook, dat is hetzelfde commando in een jasje:

```bash
cd ovari-mcp
npm test
```

Ze draaien sowieso mee met `npm test` in de hoofdmap, want ze gebruiken geen
enkele externe afhankelijkheid.

**2. Rooktest.** Start de server op een vrije poort, maakt met de officiële
MCP-client verbinding, doet de handshake, vraagt de tools op en roept ze
allebei aan. Dit is de test die zegt of een echte client hiermee overweg kan.

```bash
cd ovari-mcp
npm run rook
```

Hij controleert ook de dingen die mis kunnen gaan: een GET op `/mcp` hoort 405
te geven, een vreemde Origin hoort 403 te geven, een onbekend artikel-id hoort
een nette fout te geven, en een te korte zoekvraag hoort geweigerd te worden.

**3. MCP Inspector.** De officiële grafische inspector, handig om zelf met de
tools te spelen. Start eerst de server met `npm start`, dan in een tweede
terminal:

```bash
npx @modelcontextprotocol/inspector
```

Kies daar transport `Streamable HTTP` en vul `http://localhost:5100/mcp` in.
De inspector draait in de browser en stuurt dus een Origin mee. Zet die in je
omgeving voordat je hem gebruikt:

```bash
ALLOWED_ORIGINS=http://localhost:6274 npm start
```

## Nog niet gedaan

Deze dienst is **niet** uitgerold en **niet** aan ChatGPT gekoppeld. Dat is de
volgende stap, en die zet je pas na je eigen controle.

Wat er bij het uitrollen komt kijken:

- Een eigen dienst op Render met hoofdmap `ovari-mcp`, startcommando
  `npm start`. De repository wordt in zijn geheel uitgecheckt, dus het pad naar
  `../src/content/artikelen.js` blijft kloppen.
- Een gratis instantie slaapt na een kwartier en doet er daarna twintig tot
  vijftig seconden over om wakker te worden. Voor een connector die beoordeeld
  wordt is dat te traag. Reken op een betaalde instantie.
- Een stabiel HTTPS-adres, bijvoorbeeld `mcp.ovari.youcaps.app`.
- In ChatGPT: ontwikkelaarsmodus aanzetten en de connector toevoegen met de
  volledige URL inclusief `/mcp`.

## Later uitbreiden

De structuur is er al op gebouwd, maar er is nu niets van geïmplementeerd.

- **Autorisatie.** `server.js` heeft één plek waar verzoeken binnenkomen. Een
  OAuth-laag komt daar als middleware voor te staan, plus twee metadata-adressen
  onder `/.well-known/`.
- **Persoonlijke tools.** `src/tools.js` exporteert een lijst. Een nieuwe tool
  is een object erbij. Tools die gebruikersdata raken krijgen een eigen scope en
  een eigen controle, en horen in een apart bestand zodat het verschil met de
  openbare tools zichtbaar blijft.
- **Schrijfacties.** Nu staat op alles `readOnlyHint: true`. Een tool die wel
  schrijft moet die annotatie eerlijk omzetten, anders liegt de server tegen de
  client.
