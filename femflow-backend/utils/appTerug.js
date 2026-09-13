// Terugkeer naar de native Ovari-app na een Oura- of Fitbit-koppeling.
// De app registreert het schema app.youcaps.ovari:// (AndroidManifest) en
// vangt de link op met @capacitor/app (appUrlOpen in App.jsx).

export const APP_SCHEMA = 'app.youcaps.ovari'

// Alleen deze vaste uitkomsten: geen invoer van buiten, dus geen open redirect
const TOEGESTAAN = new Set(['oura_connected=true', 'oura_error=true', 'fitbit_connected=true', 'fitbit_error=true'])

export function appTerugUrl(uitkomst) {
  if (!TOEGESTAAN.has(uitkomst)) throw new Error(`Onbekende uitkomst: ${uitkomst}`)
  return `${APP_SCHEMA}://wearable?${uitkomst}`
}

// Een 302 naar een eigen schema wordt in Chrome Custom Tabs soms geblokkeerd.
// Daarom een kleine pagina die direct doorstuurt, met een knop als terugval.
export function appTerugPagina(uitkomst) {
  const url = appTerugUrl(uitkomst)
  const gelukt = uitkomst.endsWith('connected=true')
  const titel = gelukt ? 'Verbonden' : 'Verbinden mislukt'
  const tekst = gelukt ? 'Je gaat terug naar de Ovari-app.' : 'Ga terug naar de app en probeer het opnieuw.'
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ovari</title>
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#16120E;color:#FDFBF8;font-family:system-ui,sans-serif;text-align:center;padding:24px;box-sizing:border-box}
h1{font-weight:400;font-size:26px;margin:0 0 8px}
p{color:#D0CAC4;margin:0}
a{display:inline-block;margin-top:24px;padding:12px 28px;border-radius:999px;background:#EDBC8C;color:#120D0A;text-decoration:none;font-weight:500}
</style>
</head>
<body>
<div>
<h1>${titel}</h1>
<p>${tekst}</p>
<a href="${url}">Terug naar Ovari</a>
</div>
<script>location.replace(${JSON.stringify(url)})</script>
</body>
</html>`
}
