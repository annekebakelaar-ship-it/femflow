// Intelligente dagkeuze voor de Leefstijl-hub: kiest EEN activiteit voor
// vandaag op basis van fase + herstel (HRV t.o.v. eigen baseline) + slaap +
// recente symptomen. Eerlijk en beschrijvend: de reden noemt altijd het
// echte signaal waarop de keuze rust, nooit een verzonnen score.
//
// Prioriteit (belangrijkste signaal wint):
//   1. korte nacht            -> slaap-pijler
//   2. HRV duidelijk onder je eigen baseline -> rust
//   3. menstruatiefase        -> zacht bewegen
//   4. recente slaap/stemmings-symptomen in luteale fase -> rust
//   5. folliculair/ovulatie   -> kracht (zwaar als HRV op/boven baseline)
//   6. luteaal                -> kracht-basis
//   7. geen data/fase         -> kracht-basis (het anker in de perimenopauze)

// HRV vandaag + baseline (gemiddelde van de eerdere metingen, max 15)
export function hrvSignaal(readings) {
  const met = (readings || []).filter(r => r?.hrv_ms != null)
  if (!met.length) return { vandaag: null, baseline: null }
  const vandaag = Math.round(met[met.length - 1].hrv_ms)
  const eerder = met.slice(0, -1).slice(-15)
  if (eerder.length < 5) return { vandaag, baseline: null }
  const baseline = Math.round(eerder.reduce((s, r) => s + r.hrv_ms, 0) / eerder.length)
  return { vandaag, baseline }
}

// Recente klachten: minstens `minAantal` logs van de gegeven symptoom-ids in
// de laatste `dagen` dagen. De symptoomlog is presence-based ({symptom, date}),
// dus we tellen voorkomens in plaats van een score.
function recenteKlachten(symptomen, ids, dagen = 3, minAantal = 2) {
  const grens = Date.now() - dagen * 864e5
  const n = (symptomen || []).filter(e =>
    e?.date && new Date(e.date).getTime() >= grens && ids.includes(e.symptom || e.id)
  ).length
  return n >= minAantal
}

export function leefstijlAdvies({ faseInfo, readings, symptomen, slaapUur } = {}) {
  const { vandaag, baseline } = hrvSignaal(readings)
  const fase = faseInfo?.fase || null

  // 1. Korte nacht: eerst slaap repareren, dan pas presteren
  if (slaapUur != null && slaapUur < 6) {
    return {
      activiteitId: 'avondritueel',
      kop: 'Vandaag: je nacht voorbereiden',
      reden: `Je sliep vannacht ${slaapUur} uur. Vanavond telt het meest: een rustig laatste uur en op tijd naar bed.`,
    }
  }

  // 2. HRV duidelijk onder eigen baseline: hersteldag
  if (vandaag != null && baseline != null && vandaag <= baseline * 0.9) {
    return {
      activiteitId: 'ademwerk',
      kop: 'Vandaag: rust nemen',
      reden: `Je HRV is ${vandaag} ms, onder je eigen gemiddelde van ${baseline} ms. Een hersteldag levert deze week meer op dan doorduwen.`,
    }
  }

  // 3. Menstruatie: zacht bewegen als basis
  if (fase === 'Menstruatie') {
    return {
      activiteitId: 'wandelen',
      kop: 'Vandaag: zacht bewegen',
      reden: `Dag ${faseInfo.dag} van je cyclus. Een stevige wandeling houdt je in beweging zonder iets van je herstel te vragen.`,
    }
  }

  // 4. Luteaal + recente slaap-/stemmings-symptomen: rustmoment
  if (fase === 'Luteaal' && recenteKlachten(symptomen, ['sleep_problem', 'mood_swing', 'extreme_fatigue'])) {
    return {
      activiteitId: 'meditatie',
      kop: 'Vandaag: een rustmoment',
      reden: 'Je logde de laatste dagen slaap- of stemmingsklachten en zit in je luteale fase. Tien minuten rust is nu de beste investering.',
    }
  }

  // 5. Folliculair/ovulatie: krachtdag (zwaar als het herstel het toelaat)
  if (fase === 'Folliculair' || fase === 'Ovulatie') {
    const sterk = vandaag != null && baseline != null && vandaag >= baseline
    return {
      activiteitId: sterk ? 'kracht-zwaar' : 'kracht-basis',
      kop: 'Vandaag: een krachtdag',
      reden: sterk
        ? `Je zit in je ${fase.toLowerCase()}e fase en je HRV (${vandaag} ms) is op of boven je gemiddelde. Een goede dag om stevig te trainen.`
        : `Je zit in je ${fase.toLowerCase()}e fase, voor veel vrouwen de beste dagen om kracht op te bouwen.`,
    }
  }

  // 6. Luteaal zonder alarmsignalen: gewoon de basis draaien
  if (fase === 'Luteaal') {
    return {
      activiteitId: 'kracht-basis',
      kop: 'Vandaag: de basis draaien',
      reden: `Dag ${faseInfo.dag} van ${faseInfo.cycleLength}. In de luteale fase wint regelmaat van records: een gewone basissessie is precies goed.`,
    }
  }

  // 7. Geen fase bekend: kracht is het anker, ongeacht cyclus
  return {
    activiteitId: 'kracht-basis',
    kop: 'Begin bij kracht',
    reden: 'Krachttraining is het best onderbouwde leefstijladvies in de perimenopauze, wat je cyclus ook doet. Twee sessies per week is genoeg om te starten.',
  }
}
