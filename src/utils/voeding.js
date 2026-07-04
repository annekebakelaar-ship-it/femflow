// Duiding van gescande producten (Open Food Facts) in Ovari-toon:
// beschrijvend en eerlijk, geen oordelen of dieetadvies. Drempels volgen de
// gangbare etiket-richtlijnen per 100 g (o.a. UK 'traffic light' en de
// EU-claimgrenzen voor eiwit- en vezelbronnen).

// nutriments: het OFF-object met *_100g velden. Geeft { regels, eiwitrijk }.
export function duidProduct(nutriments = {}) {
  const n = (veld) => {
    const v = nutriments[veld]
    return typeof v === 'number' && isFinite(v) ? v : null
  }

  const eiwit = n('proteins_100g')
  const suiker = n('sugars_100g')
  const verzadigd = n('saturated-fat_100g')
  const zout = n('salt_100g')
  const vezels = n('fiber_100g')

  const regels = []
  const eiwitrijk = eiwit != null && eiwit >= 10

  if (eiwit != null) {
    if (eiwit >= 10) regels.push({ toon: 'goed', tekst: `Eiwitrijk: ${afronden(eiwit)} g per 100 g — een serieuze stap richting je dagdoel.` })
    else if (eiwit >= 5) regels.push({ toon: 'neutraal', tekst: `Bevat wat eiwit (${afronden(eiwit)} g per 100 g).` })
  }
  if (vezels != null && vezels >= 6) {
    regels.push({ toon: 'goed', tekst: `Goede vezelbron: ${afronden(vezels)} g per 100 g — helpt je bloedsuiker rustig te houden.` })
  } else if (vezels != null && vezels >= 3) {
    regels.push({ toon: 'neutraal', tekst: `Bevat vezels (${afronden(vezels)} g per 100 g).` })
  }
  if (suiker != null && suiker > 22.5) {
    regels.push({ toon: 'let-op', tekst: `Veel suiker: ${afronden(suiker)} g per 100 g. In je luteale week merk je de dip erna vaak het sterkst.` })
  }
  if (verzadigd != null && verzadigd > 5) {
    regels.push({ toon: 'let-op', tekst: `Veel verzadigd vet: ${afronden(verzadigd)} g per 100 g.` })
  }
  if (zout != null && zout > 1.5) {
    regels.push({ toon: 'let-op', tekst: `Veel zout: ${afronden(zout)} g per 100 g.` })
  }

  if (!regels.length) {
    regels.push({ toon: 'neutraal', tekst: 'Geen opvallende cijfers voor de dingen waar wij op letten (eiwit, vezels, suiker, verzadigd vet, zout).' })
  }
  return { regels, eiwitrijk }
}

function afronden(v) {
  return Math.round(v * 10) % 10 === 0 ? String(Math.round(v)) : v.toFixed(1).replace('.', ',')
}

// De voedingswaarden die we tonen, in vaste volgorde. null = onbekend.
export function voedingstabel(nutriments = {}) {
  const n = (veld) => {
    const v = nutriments[veld]
    return typeof v === 'number' && isFinite(v) ? v : null
  }
  return [
    { label: 'Energie', waarde: n('energy-kcal_100g'), eenheid: 'kcal' },
    { label: 'Eiwit', waarde: n('proteins_100g'), eenheid: 'g' },
    { label: 'Vezels', waarde: n('fiber_100g'), eenheid: 'g' },
    { label: 'Suikers', waarde: n('sugars_100g'), eenheid: 'g' },
    { label: 'Verz. vet', waarde: n('saturated-fat_100g'), eenheid: 'g' },
    { label: 'Zout', waarde: n('salt_100g'), eenheid: 'g' },
  ]
}

// Geldige EAN-8/EAN-13/UPC-barcode? (alleen cijfers, juiste lengte)
export function isBarcode(code) {
  return /^\d{8}$|^\d{12,13}$/.test(String(code || '').trim())
}
