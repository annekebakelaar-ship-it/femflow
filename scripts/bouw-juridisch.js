// Schrijft het privacybeleid, de voorwaarden en de supportpagina als echte
// HTML in de build-map.
//
// WAAROM: de app is een single page application. Alle adressen gaven dezelfde
// lege huls terug en de tekst verscheen pas nadat JavaScript had gedraaid. Een
// mens in een browser zag alles, maar een beoordelaar die de URL ophaalt, een
// crawler of een geautomatiseerde controle zag niets. Voor een MCP-connector is
// dat riskant: een ontbrekend privacybeleid is bij de beoordeling een directe
// afwijzing.
//
// HOE: de bestaande React-componenten blijven de enige bron van waarheid. Ze
// worden hier met react-dom/server naar HTML gerenderd. Er wordt dus geen
// juridische tekst gekopieerd; verandert de component, dan verandert de
// statische pagina mee bij de volgende build.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import esbuild from 'esbuild'
import { juridischePagina, juridischeUrl } from './juridischPagina.js'

const hier = path.dirname(fileURLToPath(import.meta.url))
const wortel = path.resolve(hier, '..')

export const JURIDISCHE_PAGINAS = [
  {
    naam: 'PrivacyPolicy',
    bron: 'src/pages/legal/PrivacyPolicy.jsx',
    pad: 'privacy',
    aliassen: ['legal/privacy'],
    titel: 'Privacybeleid',
    omschrijving:
      'Hoe Ovari omgaat met je gegevens: wat we verzamelen, waarvoor, hoe lang we het bewaren, met wie we het delen en welke rechten je hebt onder de AVG.',
  },
  {
    naam: 'TermsOfService',
    bron: 'src/pages/legal/TermsOfService.jsx',
    pad: 'terms',
    aliassen: ['legal/terms'],
    titel: 'Algemene voorwaarden',
    omschrijving:
      'De voorwaarden voor het gebruik van Ovari: wat de dienst wel en niet is, wat we van je verwachten en waar je terechtkunt bij een geschil.',
  },
  {
    naam: 'Support',
    bron: 'src/pages/legal/Support.jsx',
    pad: 'support',
    aliassen: [],
    titel: 'Support en contact',
    omschrijving:
      'Hulp bij Ovari: contact per e-mail en WhatsApp, en antwoorden op veelgestelde vragen over je account, je gegevens en het koppelen van een wearable.',
  },
]

// Bouwt de componenten met esbuild naar een tijdelijk ESM-bestand. React zelf
// blijft extern, zodat het gewoon uit node_modules komt en er geen tweede kopie
// in de bundel belandt.
async function rendermodule() {
  const stub = path.join(hier, 'ssr-stub-capacitor.js')

  const invoer = [
    "import { createElement } from 'react'",
    "import { renderToStaticMarkup } from 'react-dom/server'",
    ...JURIDISCHE_PAGINAS.map((p, i) => `import C${i} from ${JSON.stringify('./' + p.bron)}`),
    'export function renderAlles() {',
    '  return {',
    ...JURIDISCHE_PAGINAS.map((p, i) => `    ${JSON.stringify(p.pad)}: renderToStaticMarkup(createElement(C${i})),`),
    '  }',
    '}',
  ].join('\n')

  const tijdelijk = path.join(wortel, `.juridisch-ssr-${process.pid}.mjs`)

  await esbuild.build({
    stdin: { contents: invoer, resolveDir: wortel, sourcefile: 'juridisch-ssr.js', loader: 'js' },
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    jsx: 'automatic',
    logLevel: 'silent',
    external: ['react', 'react-dom', 'react-dom/server', 'react/jsx-runtime'],
    alias: { '@capacitor/core': stub, '@capacitor/browser': stub },
    outfile: tijdelijk,
  })

  try {
    const mod = await import(pathToFileURL(tijdelijk).href)
    return mod.renderAlles()
  } finally {
    fs.rmSync(tijdelijk, { force: true })
  }
}

export async function bouwJuridisch(outDir) {
  const datum = new Date().toISOString().slice(0, 10)
  const gerenderd = await rendermodule()
  const geschreven = []

  for (const pagina of JURIDISCHE_PAGINAS) {
    const inhoud = gerenderd[pagina.pad]
    if (!inhoud || inhoud.length < 200) {
      throw new Error(`Juridische pagina ${pagina.pad} rendert leeg, build afgebroken`)
    }

    const html = juridischePagina({
      pad: pagina.pad,
      titel: pagina.titel,
      omschrijving: pagina.omschrijving,
      inhoud,
      datum,
    })

    for (const doelPad of [pagina.pad, ...pagina.aliassen]) {
      const doel = path.join(outDir, `${doelPad}.html`)
      fs.mkdirSync(path.dirname(doel), { recursive: true })
      fs.writeFileSync(doel, html)
      geschreven.push(doelPad)
    }
  }

  return { paginas: geschreven.length, urls: JURIDISCHE_PAGINAS.map((p) => juridischeUrl(p.pad)) }
}
