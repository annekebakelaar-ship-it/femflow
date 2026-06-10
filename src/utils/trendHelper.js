// Gedeelde trendberekening voor biomarkers (HRV, RHR, slaapduur).
// Neutraal en zonder interpretatie: vergelijkt het gemiddelde van de tweede
// helft van de reeks met de eerste helft.

const STABIEL_DREMPEL = 0.03 // < 3% verschil telt als stabiel

export function berekenTrend(waarden) {
  const schoon = (waarden || []).filter(v => v != null && !Number.isNaN(v))
  if (schoon.length < 4) {
    return { richting: 'onvoldoende data', pctVerschil: null, gemiddelde: gemiddelde(schoon) }
  }

  const helft = Math.floor(schoon.length / 2)
  const eerste = gemiddelde(schoon.slice(0, helft))
  const tweede = gemiddelde(schoon.slice(helft))
  const verschil = (tweede - eerste) / eerste

  let richting = 'stabiel'
  if (verschil > STABIEL_DREMPEL) richting = 'stijgend'
  else if (verschil < -STABIEL_DREMPEL) richting = 'dalend'

  return {
    richting,
    pctVerschil: Math.round(verschil * 1000) / 10,
    gemiddelde: gemiddelde(schoon),
  }
}

export function gemiddelde(waarden) {
  if (!waarden || waarden.length === 0) return null
  return waarden.reduce((a, b) => a + b, 0) / waarden.length
}
