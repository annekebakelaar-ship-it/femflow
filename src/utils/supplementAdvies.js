// Client-side supplementsuggesties — de FemFlow → YouCaps funnel (fase 1).
//
// Uitgangspunten:
// - Volledig op het apparaat: er gaat geen gezondheidsdata naar een server.
// - Alleen door de EU goedgekeurde gezondheidsclaims (EFSA-register); nooit
//   beloftes over opvliegers, overgang of medische klachten.
// - Een suggestie verschijnt pas als er eigen data is die hem onderbouwt;
//   de "reden" is altijd een feitelijke observatie uit de eigen gegevens.

const SUPPLEMENTEN = {
  magnesium: {
    naam: 'Magnesium',
    claim: 'draagt bij tot de vermindering van vermoeidheid en moeheid',
  },
  magnesium_spier: {
    naam: 'Magnesium',
    claim: 'draagt bij tot een normale spierwerking',
  },
  melatonine: {
    naam: 'Melatonine',
    claim: 'draagt bij tot verkorting van de tijd die nodig is om in slaap te vallen',
  },
  vitamine_b6: {
    naam: 'Vitamine B6',
    claim: 'draagt bij tot de regulering van de hormonale activiteit',
  },
  omega_3: {
    naam: 'Omega-3 (DHA)',
    claim: 'draagt bij tot de instandhouding van de normale hersenfunctie',
  },
}

const MAX_SUGGESTIES = 3

// observaties: { slaapGemUur, hrvRichting, fase, symptomen: { [id]: aantal } }
// Alle velden optioneel; zonder onderbouwing geen suggesties.
export function bouwSupplementSuggesties(observaties = {}) {
  const { slaapGemUur, hrvRichting, fase, symptomen = {} } = observaties
  const suggesties = []
  const voegToe = (id, reden) => {
    // Dedupliceer op naam: magnesium mag niet twee keer verschijnen
    // (vermoeidheid- en krampen-trigger delen het ingrediënt)
    if (suggesties.some(s => s.naam === SUPPLEMENTEN[id].naam)) return
    suggesties.push({ id, ...SUPPLEMENTEN[id], reden })
  }

  // Slaap: korte nachten of gelogde slaapklachten -> melatonine
  if (slaapGemUur != null && slaapGemUur < 7) {
    voegToe('melatonine', `Je sliep gemiddeld ${String(slaapGemUur).replace('.', ',')} uur per nacht in de afgelopen periode`)
  } else if ((symptomen.sleep_problem || 0) >= 3) {
    voegToe('melatonine', `Je logde ${symptomen.sleep_problem}x slecht geslapen in de afgelopen maanden`)
  }

  // Krampen -> magnesium met de spierwerking-claim
  if ((symptomen.cramps || 0) >= 3) {
    voegToe('magnesium_spier', `Je logde ${symptomen.cramps}x krampen in de afgelopen maanden`)
  }

  // Vermoeidheid gelogd
  if ((symptomen.extreme_fatigue || 0) >= 3) {
    voegToe('magnesium', `Je logde ${symptomen.extreme_fatigue}x vermoeidheid in de afgelopen maanden`)
  }

  // Dalende HRV-trend
  if (hrvRichting === 'dalend') {
    voegToe('magnesium', 'Je HRV-trend over de afgelopen periode is dalend')
  }

  // Stemming of luteale fase -> B6 (hormonale activiteit)
  if ((symptomen.mood_swing || 0) >= 3) {
    voegToe('vitamine_b6', `Je logde ${symptomen.mood_swing}x stemmingswisselingen in de afgelopen maanden`)
  } else if (fase === 'Luteaal') {
    voegToe('vitamine_b6', 'Je zit in de luteale fase van je cyclus')
  }

  // Brain fog -> omega-3
  if ((symptomen.brain_fog || 0) >= 3) {
    voegToe('omega_3', `Je logde ${symptomen.brain_fog}x brain fog in de afgelopen maanden`)
  }

  return suggesties.slice(0, MAX_SUGGESTIES)
}
