// De twee tools van fase 1. Allebei alleen lezen, allebei uitsluitend op de
// negentien openbare kennisbankartikelen. Geen gebruikersdata, geen database,
// geen netwerkverkeer naar buiten.
//
// De annotaties zijn eerlijk ingevuld:
//   readOnlyHint    true   deze tools veranderen niets
//   destructiveHint false  er valt niets te vernietigen
//   idempotentHint  true   dezelfde vraag geeft hetzelfde antwoord
//   openWorldHint   false  de gegevensverzameling is gesloten en bekend
import { z } from 'zod'
import {
  alleArtikelen,
  vindArtikel,
  publiekeVorm,
  volledigeTekst,
  DISCLAIMER,
  CATEGORIE_LABEL,
} from './artikelen.js'
import { zoek } from './zoek.js'

// Onder de 512 tekens, zoals de Apps SDK voorschrijft.
export const SERVER_INSTRUCTIES =
  'Ovari is een Nederlandse kennisbank over de menstruatiecyclus, de perimenopauze en de overgang. ' +
  'Gebruik search_knowledge om artikelen te vinden bij een vraag, en fetch_article om er een volledig te lezen. ' +
  'Antwoord in het Nederlands en noem de bron-URL. Dit is voorlichting, geen medisch advies: verwijs bij klachten naar de huisarts.'

const ANNOTATIES = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
}

// De vorm waarin een artikel naar buiten gaat. Staat hier een keer, zodat er
// nooit per ongeluk een veld bij komt.
const ARTIKEL_VELDEN = {
  id: z.string().describe('Stabiele identificatie, ook het laatste deel van de URL'),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  category: z.string().describe('cycle, mood, sleep, stress, nutrition of exercise'),
  category_label: z.string().describe('De Nederlandse naam van de categorie'),
  level: z.string().describe('Basis of Verdieping'),
  read_time_minutes: z.number().int(),
  url: z.string().describe('De openbare pagina op ovari.youcaps.app'),
}

const CATEGORIE_ENUM = z.enum(['cycle', 'mood', 'sleep', 'stress', 'nutrition', 'exercise'])

// ---------------------------------------------------------------- zoeken ---

const zoekTool = {
  name: 'search_knowledge',
  title: 'Zoek in de Ovari-kennisbank',
  description:
    'Doorzoekt de Nederlandstalige Ovari-kennisbank over de menstruatiecyclus, de perimenopauze en de overgang. ' +
    'Gebruik dit bij vragen over opvliegers, slaap, stemming, botgezondheid, HRV, libido, voeding of trainen rond de cyclus. ' +
    'Geeft passende artikelen terug met een samenvatting, een tekstfragment en de openbare URL. ' +
    'Bevat uitsluitend redactionele artikelen, nooit gegevens van gebruikers.',
  inputSchema: {
    query: z
      .string()
      .min(2)
      .max(200)
      .describe('De zoekvraag in het Nederlands, bijvoorbeeld "waarom slaap ik slechter voor mijn menstruatie"'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .describe('Maximaal aantal artikelen, standaard 5'),
    category: CATEGORIE_ENUM.optional().describe('Beperk tot een categorie'),
  },
  outputSchema: {
    query: z.string(),
    matched_terms: z.array(z.string()).describe('De zoektermen die daadwerkelijk zijn gebruikt'),
    total_matches: z.number().int(),
    returned: z.number().int(),
    results: z.array(
      z.object({
        ...ARTIKEL_VELDEN,
        snippet: z.string().describe('Tekstfragment rond de eerste treffer'),
        score: z.number(),
      })
    ),
    disclaimer: z.string(),
  },
  annotations: ANNOTATIES,
  async handler({ query, limit, category }) {
    const { termen, totaal, treffers } = zoek(alleArtikelen(), query, { limit, category })

    const results = treffers.map((t) => ({
      ...publiekeVorm(t.artikel),
      snippet: t.fragment,
      score: t.score,
    }))

    const structuredContent = {
      query,
      matched_terms: termen,
      total_matches: totaal,
      returned: results.length,
      results,
      disclaimer: DISCLAIMER,
    }

    const tekst = results.length
      ? [
          `${totaal} artikel(en) gevonden voor "${query}". De ${results.length} best passende:`,
          '',
          ...results.map(
            (r, i) =>
              `${i + 1}. ${r.title}\n   ${r.subtitle}\n   Categorie: ${r.category_label}. Leestijd: ${r.read_time_minutes} minuten.\n   ${r.snippet}\n   ${r.url}\n   Volledige tekst: fetch_article met id "${r.id}"`
          ),
          '',
          DISCLAIMER,
        ].join('\n')
      : `Geen artikel in de Ovari-kennisbank gaat over "${query}". De kennisbank behandelt de cyclus, de perimenopauze en de overgang.\n\n${DISCLAIMER}`

    return { content: [{ type: 'text', text: tekst }], structuredContent }
  },
}

// ---------------------------------------------------------------- ophalen ---

const artikelTool = {
  name: 'fetch_article',
  title: 'Lees een Ovari-artikel',
  description:
    'Haalt de volledige tekst van een artikel uit de Ovari-kennisbank op, aan de hand van het id uit search_knowledge. ' +
    'Gebruik dit wanneer je een onderwerp nauwkeurig wilt beantwoorden in plaats van op een samenvatting af te gaan.',
  inputSchema: {
    id: z
      .string()
      .min(2)
      .max(100)
      .describe('Het id van het artikel, bijvoorbeeld "opvliegers-nachtzweten"'),
  },
  outputSchema: {
    ...ARTIKEL_VELDEN,
    source: z.string(),
    sections: z.array(z.object({ heading: z.string(), text: z.string() })),
    text: z.string().describe('De volledige tekst, koppen en alinea achter elkaar'),
    disclaimer: z.string(),
  },
  annotations: ANNOTATIES,
  async handler({ id }) {
    const artikel = vindArtikel(id)

    if (!artikel) {
      const beschikbaar = alleArtikelen()
        .map((a) => `${a.id} (${CATEGORIE_LABEL[a.category] || a.category})`)
        .join(', ')
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Er bestaat geen artikel met id "${id}". Beschikbare ids: ${beschikbaar}. Gebruik search_knowledge om het juiste artikel te vinden.`,
          },
        ],
      }
    }

    const sections = artikel.body.map((s) => ({ heading: s.kop, text: s.tekst }))
    const text = volledigeTekst(artikel)

    const structuredContent = {
      ...publiekeVorm(artikel),
      source: artikel.source,
      sections,
      text,
      disclaimer: DISCLAIMER,
    }

    const tekst = [
      artikel.title,
      artikel.subtitle,
      '',
      ...sections.flatMap((s) => [s.heading, s.text, '']),
      `Bron: ${artikel.source}. ${structuredContent.url}`,
      '',
      DISCLAIMER,
    ].join('\n')

    return { content: [{ type: 'text', text: tekst }], structuredContent }
  },
}

export const TOOLS = [zoekTool, artikelTool]
