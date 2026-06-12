// Logica voor het loggen van een menstruatiestart vanaf het dashboard.
// Pure functie: geeft de nieuwe data + status terug, doet zelf geen opslag.

export const LOG_BEREIK_DAGEN = 3 // vandaag, gisteren, eergisteren

export function logOpties(nu = new Date()) {
  const labels = ['Vandaag', 'Gisteren', 'Eergisteren']
  return labels.slice(0, LOG_BEREIK_DAGEN).map((label, i) => {
    const d = new Date(nu)
    d.setDate(d.getDate() - i)
    return { label, datum: d.toISOString().split('T')[0] }
  })
}

// Voegt een menstruatiestart toe aan menstrualData.
// - Geen bestaande data: maakt een nieuw record met deze start
// - Datum al gelogd (als startDate of entry): status 'duplicaat', niets gewijzigd
// - Anders: entry met bleeding: true erbij
export function voegPeriodeStartToe(menstrualData, datum) {
  const zelfdeDag = (a, b) => new Date(a).toDateString() === new Date(b).toDateString()

  if (!menstrualData || !menstrualData.startDate) {
    return {
      status: 'aangemaakt',
      data: {
        ...(menstrualData || {}),
        startDate: datum,
        cycleLength: menstrualData?.cycleLength || 28,
        bleedingDays: menstrualData?.bleedingDays || 5,
        entries: menstrualData?.entries || [],
      },
    }
  }

  const alGelogd = zelfdeDag(menstrualData.startDate, datum)
    || (menstrualData.entries || []).some(e => e.bleeding && e.date && zelfdeDag(e.date, datum))
  if (alGelogd) {
    return { status: 'duplicaat', data: menstrualData }
  }

  return {
    status: 'toegevoegd',
    data: {
      ...menstrualData,
      entries: [...(menstrualData.entries || []), { bleeding: true, date: datum }],
    },
  }
}

// Laatst gelogde start (startDate of bleeding-entry), als Date — voor de
// subtekst "laatste start: ..." en de check of er recent al gelogd is
export function laatsteStart(menstrualData) {
  if (!menstrualData?.startDate) return null
  const datums = [
    new Date(menstrualData.startDate),
    ...(menstrualData.entries || [])
      .filter(e => e.bleeding && e.date)
      .map(e => new Date(e.date)),
  ]
  return new Date(Math.max(...datums.map(d => d.getTime())))
}

// Alle gelogde starts (startDate + bleeding-entries), chronologisch oplopend
export function alleStarts(menstrualData) {
  if (!menstrualData?.startDate) return []
  const datums = [new Date(menstrualData.startDate)]
  for (const e of menstrualData.entries || []) {
    if (e.bleeding && e.date) {
      const d = new Date(e.date)
      if (!datums.some(x => x.toDateString() === d.toDateString())) datums.push(d)
    }
  }
  return datums.sort((a, b) => a - b)
}

// Verwijdert een gelogde start.
// - Entry-datum: entry weg
// - startDate zelf: oudste entry wordt de nieuwe startDate (anker schuift op)
// - Laatste overgebleven start: weigeren ('laatste') — dan blijft er een
//   geldig record over; de datum aanpassen kan via Mijn Gegevens
export function verwijderPeriodeStart(menstrualData, datum) {
  if (!menstrualData?.startDate) return { status: 'niet-gevonden', data: menstrualData }
  const zelfdeDag = (a, b) => new Date(a).toDateString() === new Date(b).toDateString()
  const entries = menstrualData.entries || []

  const entryIndex = entries.findIndex(e => e.bleeding && e.date && zelfdeDag(e.date, datum))
  if (entryIndex !== -1) {
    return {
      status: 'verwijderd',
      data: { ...menstrualData, entries: entries.filter((_, i) => i !== entryIndex) },
    }
  }

  if (zelfdeDag(menstrualData.startDate, datum)) {
    const bloedEntries = entries
      .filter(e => e.bleeding && e.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
    if (bloedEntries.length === 0) {
      return { status: 'laatste', data: menstrualData }
    }
    const nieuweStart = bloedEntries[0]
    return {
      status: 'verwijderd',
      data: {
        ...menstrualData,
        startDate: nieuweStart.date,
        entries: entries.filter(e => e !== nieuweStart),
      },
    }
  }

  return { status: 'niet-gevonden', data: menstrualData }
}

// Symptoomtelling binnen een datumvenster (voor de cyclushistorie):
// geeft [{ label, aantal }] terug, aflopend gesorteerd
export function symptomenTussen(symptomLog, vanaf, tot) {
  const telling = new Map()
  for (const entry of symptomLog || []) {
    if (!entry.date) continue
    const d = new Date(entry.date)
    if (d < vanaf || (tot && d >= tot)) continue
    const label = entry.label || entry.symptom
    telling.set(label, (telling.get(label) || 0) + 1)
  }
  return [...telling.entries()]
    .map(([label, aantal]) => ({ label, aantal }))
    .sort((a, b) => b.aantal - a.aantal)
}
