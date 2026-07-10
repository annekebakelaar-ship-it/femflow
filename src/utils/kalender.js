// Cycluskalender-logica (puur, getest). De gebruiker tikt losse bloed-dagen
// aan — juist voor onregelmatige cycli (perimenopauze, spiraal). Uit die
// dagen leiden we startDate, cycleLength en bleedingDays af (mediaan, dus
// robuust bij grillige patronen), en we schrijven die terug in dezelfde
// datavorm zodat alles wat erop leunt (fase-berekening, dashboard, FAB,
// historie, rapport) ongewijzigd blijft werken.

const DAG = 24 * 60 * 60 * 1000

const iso = (d) => new Date(d).toISOString().slice(0, 10)
// 12:00 als anker zodat zomertijd-randen geen dag verschuiven
const ms = (datum) => new Date(datum + 'T12:00:00').getTime()
const vorigeDag = (datum) => iso(ms(datum) - DAG)

function mediaan(arr) {
  if (!arr.length) return null
  const s = [...arr].sort((a, b) => a - b)
  // Onderste mediaan bij een even aantal: conservatief (geen halve dagen)
  return s[Math.floor((s.length - 1) / 2)]
}

// Alle bloed-dagen uit de (oude of nieuwe) datavorm, gesorteerd en uniek.
// Migratie: oude data heeft startDate + bleedingDays (aaneengesloten reeks)
// en losse entries met bleeding: true (gelogd via de druppel-FAB).
export function dagenUit(md) {
  const set = new Set(md?.dagen || [])
  if (!md?.dagen) {
    if (md?.startDate) {
      const n = Math.max(1, Math.min(10, md.bleedingDays || 5))
      for (let i = 0; i < n; i++) set.add(iso(ms(iso(md.startDate)) + i * DAG))
    }
    for (const e of md?.entries || []) {
      if (e.bleeding && e.date) set.add(iso(e.date))
    }
  }
  return [...set].sort()
}

// Startdagen: bloed-dagen waarvan de dag ervoor geen bloed-dag is
export function startsUit(dagen) {
  const set = new Set(dagen)
  return dagen.filter(d => !set.has(vorigeDag(d)))
}

// Afgeleide cyclusdata uit de aangeklikte dagen. Mediaan boven gemiddelde:
// een uitschieter (vakantie, vergeten loggen) trekt het beeld dan niet scheef.
export function afgeleide(dagen, huidig = {}) {
  const starts = startsUit(dagen)
  if (!starts.length) {
    return { ...huidig, dagen, startDate: huidig.startDate || null }
  }

  // Cycluslengte: mediaan van de afstanden tussen opeenvolgende starts
  const gaten = []
  for (let i = 1; i < starts.length; i++) {
    const gat = Math.round((ms(starts[i]) - ms(starts[i - 1])) / DAG)
    if (gat >= 15 && gat <= 90) gaten.push(gat) // <15 = zelfde periode; >90 = gat in loggen
  }
  const cyclus = mediaan(gaten)

  // Menstruatieduur: mediaan van de aaneengesloten reekslengtes
  const set = new Set(dagen)
  const reeksen = starts.map(s => {
    let n = 1
    let d = s
    while (set.has(iso(ms(d) + DAG))) { n++; d = iso(ms(d) + DAG) }
    return n
  })
  const duur = mediaan(reeksen)

  const startDate = starts[starts.length - 1]
  return {
    ...huidig,
    dagen,
    startDate,
    cycleLength: Math.max(15, Math.min(60, cyclus || huidig.cycleLength || 28)),
    bleedingDays: Math.max(1, Math.min(10, duur || huidig.bleedingDays || 5)),
    // Historie-compatibel: eerdere starts als bleeding-entries (startDate apart)
    entries: [
      ...(huidig.entries || []).filter(e => !e.bleeding),
      ...starts.slice(0, -1).map(date => ({ bleeding: true, date })),
    ],
  }
}

// Tik een dag aan of uit en geef de volledige nieuwe datavorm terug
export function toggleDag(md, datum) {
  const set = new Set(dagenUit(md))
  if (set.has(datum)) set.delete(datum)
  else set.add(datum)
  return afgeleide([...set].sort(), md)
}
