import { describe, it, expect } from 'vitest'
import { ARTIKELEN } from '../src/content/artikelen.js'
import {
  BASIS, CATEGORIEEN, escapeHtml, metaOmschrijving, appLinks, artikelUrl,
  artikelPagina, overzichtPagina, sitemapXml, verwant,
} from './kennisPagina.js'

describe('hulpfuncties', () => {
  it('escapet html-tekens', () => {
    expect(escapeHtml('<b>"A" & B</b>')).toBe('&lt;b&gt;&quot;A&quot; &amp; B&lt;/b&gt;')
    expect(escapeHtml(null)).toBe('')
  })

  it('kort een omschrijving in op een woordgrens tot maximaal 160 tekens', () => {
    const lang = 'woord '.repeat(60)
    const kort = metaOmschrijving(lang)
    expect(kort.length).toBeLessThanOrEqual(160)
    expect(kort.endsWith('…')).toBe(true)
    expect(metaOmschrijving('Korte zin.')).toBe('Korte zin.')
  })

  it('zet een trackingcode op de knoppen naar de app', () => {
    const l = appLinks('slaap-en-cyclus')
    expect(l.web).toBe(`${BASIS}/?utm_source=kennis&utm_medium=blog&utm_campaign=kennisbank&utm_content=slaap_en_cyclus`)
    expect(l.play).toContain('referrer=utm_source%3Dkennis%26utm_medium%3Dblog')
  })
})

describe('artikelen', () => {
  it('heeft voor elk artikel een geldig adres en een bekende categorie', () => {
    for (const a of ARTIKELEN) {
      expect(a.id).toMatch(/^[a-z0-9-]+$/)
      expect(CATEGORIEEN[a.category]).toBeTruthy()
    }
    expect(new Set(ARTIKELEN.map(a => a.id)).size).toBe(ARTIKELEN.length)
  })

  it('bouwt een artikelpagina met titel, canonical, gestructureerde data en alle koppen', () => {
    const a = ARTIKELEN[0]
    const html = artikelPagina(a, ARTIKELEN, '2026-09-14')
    expect(html).toContain('<html lang="nl">')
    expect(html).toContain(`<title>${escapeHtml(a.title)} | Ovari</title>`)
    expect(html).toContain(`<link rel="canonical" href="${artikelUrl(a)}">`)
    expect(html).toContain('"@type":"Article"')
    for (const s of a.body) expect(html).toContain(escapeHtml(s.kop))
    expect(html).toContain('geen medisch advies')
  })

  it('geeft een campagnecode uit de url door aan de knoppen naar de app', () => {
    const a = ARTIKELEN[0]
    const html = artikelPagina(a, ARTIKELEN, '2026-09-14')
    expect(html).toContain('data-app="play"')
    expect(html).toContain('data-app="web"')
    expect(html).toContain("q.get('utm_source')")
    expect(html).toContain(`kennis_${a.id.replace(/-/g, '_')}`)
    expect(overzichtPagina(ARTIKELEN)).toContain('kennis_overzicht')
  })

  it('toont drie verwante artikelen, zonder het artikel zelf', () => {
    const a = ARTIKELEN[0]
    const v = verwant(a, ARTIKELEN)
    expect(v).toHaveLength(3)
    expect(v.some(x => x.id === a.id)).toBe(false)
  })

  it('linkt vanaf het overzicht naar alle artikelen', () => {
    const html = overzichtPagina(ARTIKELEN)
    for (const a of ARTIKELEN) expect(html).toContain(`href="/kennis/${a.id}"`)
  })

  it('zet alle adressen in de sitemap', () => {
    const urls = [`${BASIS}/`, `${BASIS}/kennis`, ...ARTIKELEN.map(artikelUrl)]
    const xml = sitemapXml(urls, '2026-09-14')
    expect(xml.match(/<url>/g)).toHaveLength(urls.length)
    expect(xml).toContain('<lastmod>2026-09-14</lastmod>')
  })
})
