// Schrijft de statische kennisbank, het woordmerk en de sitemap in de build-map.
// Wordt aangeroepen door de plugin 'ovari-kennisbank' in vite.config.js, zodat
// het bij elke vite build meeloopt (Vercel en de Android-build).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ARTIKELEN } from '../src/content/artikelen.js'
import { BASIS, artikelPagina, overzichtPagina, sitemapXml, artikelUrl } from './kennisPagina.js'
import { JURIDISCHE_PAGINAS } from './bouw-juridisch.js'

const hier = path.dirname(fileURLToPath(import.meta.url))

export function bouwKennis(outDir) {
  const datum = new Date().toISOString().slice(0, 10)
  const kennisDir = path.join(outDir, 'kennis')
  fs.mkdirSync(kennisDir, { recursive: true })
  fs.copyFileSync(path.join(hier, '../src/assets/ovari-wordmark.png'), path.join(kennisDir, 'ovari-woordmerk.png'))

  for (const artikel of ARTIKELEN) {
    fs.writeFileSync(path.join(kennisDir, `${artikel.id}.html`), artikelPagina(artikel, ARTIKELEN, datum))
  }
  fs.writeFileSync(path.join(outDir, 'kennis.html'), overzichtPagina(ARTIKELEN))

  const urls = [
    `${BASIS}/`,
    `${BASIS}/kennis`,
    ...ARTIKELEN.map(artikelUrl),
    // De juridische pagina's worden door bouwJuridisch geschreven, maar horen
    // wel in de sitemap. Ze staan daar in een lijst, zodat er geen tweede
    // plek is waar deze adressen worden bijgehouden.
    ...JURIDISCHE_PAGINAS.map((p) => `${BASIS}/${p.pad}`),
  ]
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemapXml(urls, datum))
  return { artikelen: ARTIKELEN.length, urls: urls.length }
}
