// De HTML-huls om een gerenderde juridische pagina heen.
//
// De tokens hieronder zijn dezelfde als in index.html, zodat de statische
// versie er precies zo uitziet als in de app. De pagina heeft geen JavaScript
// nodig: de tekst staat gewoon in de HTML, zodat een beoordelaar, een crawler
// of een geautomatiseerde controle hem kan lezen.
import { BASIS } from './kennisPagina.js'

const FONTS =
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap'

const TOKENS = `
  :root {
    --bg:            #F6F1EC;
    --surface:       #FFFFFF;
    --surface-warm:  #FBF6F1;
    --ink:           #2A211C;
    --ink-2:         #6E635B;
    --ink-3:         #A89E95;
    --border:        #E8E0D8;
    --border-subtle: #F1EBE4;
    --accent:        #D4A373;
    --accent-soft:   #ECE0D2;
    --font-display:  'Cinzel', Georgia, serif;
    --font-sans:     'Hanken Grotesk', system-ui, sans-serif;
    --space-xs:  8px;
    --space-sm:  16px;
    --space-md:  24px;
    --space-lg:  32px;
    --space-xl:  40px;
    --space-xxl: 56px;
  }
`

function esc(tekst) {
  return String(tekst).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function juridischeUrl(pad) {
  return `${BASIS}/${pad}`
}

export function juridischePagina({ pad, titel, omschrijving, inhoud, datum }) {
  const url = juridischeUrl(pad)
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)} | Ovari</title>
<meta name="description" content="${esc(omschrijving)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(titel)} | Ovari">
<meta property="og:description" content="${esc(omschrijving)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${BASIS}/icon-512.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
${TOKENS}
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--ink);
    font-family: var(--font-sans);
    font-weight: 300;
    font-size: 15px;
    line-height: 1.65;
  }
  .rand { max-width: 760px; margin: 0 auto; padding: 24px 20px 72px; }
  .kop { display: flex; align-items: center; justify-content: space-between; gap: 16px;
         padding-bottom: 18px; border-bottom: 1px solid var(--border); margin-bottom: 32px; }
  .kop a { font-family: var(--font-display); font-size: 20px; letter-spacing: .06em;
           color: var(--ink); text-decoration: none; }
  .kop nav a { font-family: var(--font-sans); font-size: 13px; color: var(--ink-2);
               margin-left: 16px; text-decoration: none; }
  .kop nav a:hover { color: var(--ink); text-decoration: underline; }
  h1 { font-family: var(--font-display); font-weight: 400; font-size: 30px; line-height: 1.2; }
  h2 { font-family: var(--font-display); font-weight: 400; line-height: 1.3; }
  h3 { font-family: var(--font-sans); font-weight: 600; }
  a { color: var(--accent); text-underline-offset: 3px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: 8px 12px 8px 0; border-bottom: 1px solid var(--border); vertical-align: top; }
  ul { padding-left: 20px; }
  li { margin-bottom: 6px; }
  .voet { margin-top: 56px; padding-top: 20px; border-top: 1px solid var(--border);
          font-size: 13px; color: var(--ink-3); }
  .voet a { color: var(--ink-2); }
  @media (max-width: 520px) {
    .kop { flex-direction: column; align-items: flex-start; gap: 10px; }
    .kop nav a { margin: 0 16px 0 0; }
  }
</style>
</head>
<body>
<div class="rand">
  <header class="kop">
    <a href="${BASIS}/">OVARI</a>
    <nav>
      <a href="${BASIS}/privacy">Privacy</a>
      <a href="${BASIS}/terms">Voorwaarden</a>
      <a href="${BASIS}/support">Support</a>
      <a href="${BASIS}/kennis">Kennisbank</a>
    </nav>
  </header>
  <main>
${inhoud}
  </main>
  <footer class="voet">
    <p>Ovari is een app van YouCaps. Ovari geeft informatie, geen medisch advies, en is geen medisch hulpmiddel.</p>
    <p>Deze pagina is gegenereerd op ${datum} uit de bron van de app, zodat er maar een versie van deze tekst bestaat.</p>
  </footer>
</div>
</body>
</html>
`
}
