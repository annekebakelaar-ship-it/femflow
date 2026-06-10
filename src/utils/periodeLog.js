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
