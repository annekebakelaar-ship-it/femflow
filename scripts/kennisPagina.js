// Statische kennisbankpagina's voor ovari.youcaps.app/kennis, zodat Google de
// artikelen kan vinden. Pure functies, getest in kennisPagina.test.js;
// bouw-kennis.js schrijft ze weg tijdens vite build.
//
// Bewust zonder tracking of cookies: meten gebeurt via de trackingcode op de
// knoppen naar de app. Lichte papierkleur voor lange teksten, editorial
// register: serif koppen, haarlijnen, kleine kapitalen.

export const BASIS = 'https://ovari.youcaps.app'
export const PLAY_URL = 'https://play.google.com/store/apps/details?id=app.youcaps.ovari'

export const CATEGORIEEN = {
  cycle: 'Cyclus en overgang',
  mood: 'Mentaal',
  sleep: 'Slaap',
  stress: 'Stress',
  nutrition: 'Voeding',
  exercise: 'Bewegen',
}
const VOLGORDE = ['cycle', 'mood', 'sleep', 'stress', 'nutrition', 'exercise']

export function escapeHtml(tekst) {
  return String(tekst ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function artikelUrl(artikel) {
  return `${BASIS}/kennis/${artikel.id}`
}

// Meta-omschrijving: maximaal 160 tekens, afgebroken op een woordgrens
export function metaOmschrijving(tekst, max = 160) {
  const schoon = String(tekst ?? '').replace(/\s+/g, ' ').trim()
  if (schoon.length <= max) return schoon
  const kort = schoon.slice(0, max - 1)
  return kort.slice(0, kort.lastIndexOf(' ')).replace(/[,;:.]$/, '') + '…'
}

// Knoppen naar de app met trackingcode (campagne kennisbank, variant = artikel)
export function appLinks(variant) {
  const inhoud = String(variant || 'overzicht').replace(/-/g, '_')
  const utm = `utm_source=kennis&utm_medium=blog&utm_campaign=kennisbank&utm_content=${encodeURIComponent(inhoud)}`
  return {
    web: `${BASIS}/?${utm}`,
    play: `${PLAY_URL}&referrer=${encodeURIComponent(utm)}`,
  }
}

const CSS = `
:root{--papier:#F5F2EB;--inkt:#211C1A;--grijs:#6B5D52;--lijn:#DDD3C6;--oker:#9C6B3E}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--papier);color:var(--inkt);font-family:'Hanken Grotesk',system-ui,sans-serif;font-size:19px;line-height:1.7}
a{color:inherit}
.kolom{max-width:720px;margin:0 auto;padding:0 24px}
header.site{border-bottom:1px solid var(--lijn)}
header.site .kolom{display:flex;align-items:center;justify-content:space-between;height:76px}
header.site img{height:21px;width:auto;display:block}
.klein{font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--oker);text-decoration:none}
main{padding:64px 0 24px}
.meta{font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--grijs);margin:0 0 20px}
h1{font-family:'Noto Serif Display',Georgia,serif;font-weight:400;font-size:48px;line-height:1.12;margin:0 0 18px}
.onder{font-size:22px;line-height:1.5;color:var(--grijs);margin:0}
hr{border:0;border-top:1px solid var(--lijn);margin:40px 0}
h2{font-family:'Noto Serif Display',Georgia,serif;font-weight:400;font-size:29px;line-height:1.25;margin:44px 0 12px}
p{margin:0 0 18px}
.noot{font-size:15px;line-height:1.6;color:var(--grijs);border-top:1px solid var(--lijn);padding-top:20px;margin-top:48px}
.cta{border-top:1px solid var(--inkt);border-bottom:1px solid var(--lijn);padding:40px 0 36px;margin:56px 0}
.cta h2{margin-top:0}
.knoppen{display:flex;flex-wrap:wrap;gap:14px;margin-top:24px}
.knop{display:inline-block;padding:13px 24px;border:1px solid var(--inkt);border-radius:999px;font-size:15px;letter-spacing:.03em;text-decoration:none;line-height:1.2}
.knop.vol{background:var(--inkt);color:var(--papier)}
.lijst{list-style:none;margin:0;padding:0}
.lijst li{border-top:1px solid var(--lijn)}
.lijst li:last-child{border-bottom:1px solid var(--lijn)}
.lijst a{text-decoration:none;display:block;padding:20px 0}
.lijst .t{font-family:'Noto Serif Display',Georgia,serif;font-size:24px;line-height:1.3;display:block}
.lijst .s{font-size:16px;line-height:1.5;color:var(--grijs);display:block;margin-top:4px}
.sectie{margin-top:56px}
footer.site{border-top:1px solid var(--lijn);padding:28px 0 48px;font-size:14px;line-height:1.6;color:var(--grijs)}
footer.site .kolom{display:flex;flex-wrap:wrap;gap:12px 24px;justify-content:space-between}
footer.site a{text-decoration:none}
@media (max-width:600px){body{font-size:18px}h1{font-size:36px}.onder{font-size:19px}h2{font-size:25px}main{padding-top:44px}.lijst .t{font-size:21px}}
`

function kop({ titel, omschrijving, url, type = 'website', jsonLd = [] }) {
  const ld = jsonLd.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(titel)}</title>
<meta name="description" content="${escapeHtml(omschrijving)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="Ovari">
<meta property="og:locale" content="nl_NL">
<meta property="og:title" content="${escapeHtml(titel)}">
<meta property="og:description" content="${escapeHtml(omschrijving)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${BASIS}/icon-512.png">
<meta name="theme-color" content="#F5F2EB">
<link rel="icon" href="/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Display:wght@400&family=Hanken+Grotesk:wght@400;500&display=swap" rel="stylesheet">
<style>${CSS}</style>
${ld}
</head>`
}

function siteKop(links) {
  return `<header class="site"><div class="kolom">
<a href="/kennis" aria-label="Ovari kennisbank"><img src="/kennis/ovari-woordmerk.png" alt="Ovari" width="83" height="21"></a>
<a class="klein" data-app="web" href="${escapeHtml(links.web)}">Open de app</a>
</div></header>`
}

function siteVoet() {
  return `<footer class="site"><div class="kolom">
<span>Ovari, rustig inzicht in je cyclus en de overgang</span>
<span><a href="/kennis">Kennisbank</a> &nbsp;·&nbsp; <a href="/privacy">Privacy</a> &nbsp;·&nbsp; <a href="/terms">Voorwaarden</a></span>
</div></footer>`
}

function ctaBlok(links) {
  return `<section class="cta" aria-label="Ovari-app">
<h2>Houd je cyclus en klachten bij met Ovari</h2>
<p>Leg in een paar tikken vast hoe je je voelt, zie je eigen patroon en maak voor je afspraak een overzicht van zes maanden voor je huisarts. De app is gratis en je dagboek blijft op je telefoon.</p>
<div class="knoppen">
<a class="knop vol" data-app="play" href="${escapeHtml(links.play)}">Download in Google Play</a>
<a class="knop" data-app="web" href="${escapeHtml(links.web)}">Gebruik in je browser</a>
</div>
</section>`
}

// Komt een lezer binnen via een campagnelink (utm_source in de url), dan nemen
// de knoppen naar de app die trackingcode over. Zo schrijft GA4 een installatie
// toe aan de campagne en niet aan de kennisbank. Geen cookies, geen opslag.
function utmDoorgeven(variant) {
  const standaardInhoud = `kennis_${String(variant).replace(/-/g, '_')}`
  return `<script>(function(){try{var q=new URLSearchParams(location.search);if(!q.get('utm_source'))return;var p=['utm_source','utm_medium','utm_campaign'].map(function(k){return q.get(k)?k+'='+encodeURIComponent(q.get(k)):''}).filter(Boolean);p.push('utm_content='+encodeURIComponent(q.get('utm_content')||${JSON.stringify(standaardInhoud)}));var utm=p.join('&');document.querySelectorAll('a[data-app]').forEach(function(a){a.href=a.getAttribute('data-app')==='play'?${JSON.stringify(PLAY_URL)}+'&referrer='+encodeURIComponent(utm):${JSON.stringify(BASIS)}+'/?'+utm})}catch(e){}})();</script>`
}

function lijstItem(a) {
  return `<li><a href="/kennis/${a.id}"><span class="t">${escapeHtml(a.title)}</span><span class="s">${escapeHtml(a.subtitle)} &nbsp;·&nbsp; ${a.readTime} min</span></a></li>`
}

// Drie verwante artikelen: eerst dezelfde categorie, dan aanvullen met de rest
export function verwant(artikel, alle, aantal = 3) {
  const anders = alle.filter(a => a.id !== artikel.id)
  const zelfde = anders.filter(a => a.category === artikel.category)
  const rest = anders.filter(a => a.category !== artikel.category)
  return [...zelfde, ...rest].slice(0, aantal)
}

export function artikelPagina(artikel, alle, datum) {
  const url = artikelUrl(artikel)
  const omschrijving = metaOmschrijving(artikel.description || artikel.subtitle)
  const links = appLinks(artikel.id)
  const categorie = CATEGORIEEN[artikel.category] || 'Kennisbank'
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: artikel.title,
      description: omschrijving,
      inLanguage: 'nl-NL',
      mainEntityOfPage: url,
      dateModified: datum,
      author: { '@type': 'Organization', name: artikel.source || 'Ovari Redactie' },
      publisher: { '@type': 'Organization', name: 'Ovari', logo: { '@type': 'ImageObject', url: `${BASIS}/icon-512.png` } },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Kennisbank', item: `${BASIS}/kennis` },
        { '@type': 'ListItem', position: 2, name: artikel.title, item: url },
      ],
    },
  ]
  const secties = (artikel.body || []).map(s => `<h2>${escapeHtml(s.kop)}</h2>\n<p>${escapeHtml(s.tekst)}</p>`).join('\n')
  return `${kop({ titel: `${artikel.title} | Ovari`, omschrijving, url, type: 'article', jsonLd })}
<body>
${siteKop(links)}
<main><article class="kolom">
<p class="meta"><a href="/kennis" style="text-decoration:none">Kennisbank</a> &nbsp;·&nbsp; ${escapeHtml(categorie)} &nbsp;·&nbsp; ${artikel.readTime} min lezen</p>
<h1>${escapeHtml(artikel.title)}</h1>
<p class="onder">${escapeHtml(artikel.subtitle)}</p>
<hr>
${secties}
<p class="noot">Dit artikel is informatief en geen medisch advies. Bespreek aanhoudende of zorgwekkende klachten met je huisarts.</p>
${ctaBlok(links)}
<section class="sectie" aria-label="Lees ook">
<p class="meta">Lees ook</p>
<ul class="lijst">
${verwant(artikel, alle).map(lijstItem).join('\n')}
</ul>
</section>
</article></main>
${siteVoet()}
${utmDoorgeven(artikel.id)}
</body>
</html>
`
}

export function overzichtPagina(alle) {
  const url = `${BASIS}/kennis`
  const omschrijving = 'Nuchtere artikelen over de perimenopauze, opvliegers, slaap, stemming en je cyclus. Geschreven door de redactie van Ovari.'
  const links = appLinks('overzicht')
  const groepen = VOLGORDE
    .map(cat => ({ cat, artikelen: alle.filter(a => a.category === cat) }))
    .filter(g => g.artikelen.length)
  const secties = groepen.map(g => `<section class="sectie" aria-label="${escapeHtml(CATEGORIEEN[g.cat])}">
<p class="meta">${escapeHtml(CATEGORIEEN[g.cat])}</p>
<ul class="lijst">
${g.artikelen.map(lijstItem).join('\n')}
</ul>
</section>`).join('\n')
  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Kennisbank over de overgang en je cyclus',
    description: omschrijving,
    inLanguage: 'nl-NL',
    url,
  }]
  return `${kop({ titel: 'Kennisbank over de overgang en je cyclus | Ovari', omschrijving, url, jsonLd })}
<body>
${siteKop(links)}
<main><div class="kolom">
<p class="meta">Kennisbank</p>
<h1>Nuchtere kennis over je cyclus en de overgang</h1>
<p class="onder">Artikelen over opvliegers, slaap, stemming, voeding en meer. Zonder poespas en zonder beloftes.</p>
${secties}
${ctaBlok(links)}
</div></main>
${siteVoet()}
${utmDoorgeven('overzicht')}
</body>
</html>
`
}

export function sitemapXml(urls, datum) {
  const regels = urls.map(u => `  <url><loc>${escapeHtml(u)}</loc><lastmod>${datum}</lastmod></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${regels}
</urlset>
`
}
