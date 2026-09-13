// Alleen voor lokale ontwikkeling: voorbeelddata voor het homescherm, gelijk
// aan het ontwerp van 13 sep 2026 (Anna, luteale fase dag 18 van 28, herstel
// 62 ms, slaap 7u 42m, 36,6 graden, energie 78/100). Actief via
// /preview-v2?demo en alleen als import.meta.env.DEV waar is, dus nooit in
// de productiebuild.

const DAG = 24 * 60 * 60 * 1000
const datum = (dagenTerug) => new Date(Date.now() - dagenTerug * DAG).toISOString().slice(0, 10)
const moment = (dagenTerug) => new Date(Date.now() - dagenTerug * DAG).toISOString()

export function homeDemo() {
  const readings = Array.from({ length: 30 }, (_, i) => {
    const golf = Math.sin(i / 3.2)
    return {
      date: datum(29 - i),
      hrv_ms: Math.round(56 + golf * 4),
      resting_heart_rate: Math.round(57 - golf * 2),
      sleep_duration_min: Math.round(430 + Math.cos(i / 2.5) * 25),
      temperature: +(36.5 + golf * 0.1).toFixed(1),
      readiness: Math.round(72 + golf * 6),
    }
  })
  // Laatste meting exact zoals in het ontwerp
  Object.assign(readings[29], { hrv_ms: 62, sleep_duration_min: 462, temperature: 36.6, readiness: 78 })
  return {
    // Vast uur zodat de begroeting "Goedemorgen" is, zoals in het ontwerp
    uur: 9,
    menstruation: { startDate: datum(17), cycleLength: 28, bleedingDays: 5, name: 'Anna' },
    // Twee recente slaap- en stemmingslogs in de luteale fase geven het
    // rustadvies uit het ontwerp
    symptomen: [
      { symptom: 'sleep_problem', date: moment(1) },
      { symptom: 'mood_swing', date: moment(0) },
    ],
    readings,
  }
}
