export const PHASE_COLORS = {
  menstruation: '#E85D75',
  follicular: '#7ECF51',
  ovulatory: '#FFD93D',
  luteal: '#A78BFA',
}

export const PHASE_GRADIENTS = {
  menstruation: 'linear-gradient(135deg, #E85D75 0%, #C2185B 100%)',
  follicular: 'linear-gradient(135deg, #7ECF51 0%, #5BA034 100%)',
  ovulatory: 'linear-gradient(135deg, #FFD93D 0%, #F59E0B 100%)',
  luteal: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
}

export const PHASE_EMOJI = {
  menstruation: '🩸',
  follicular: '🌱',
  ovulatory: '🌻',
  luteal: '🌙',
}

export function getPhaseByDay(day, cycleLength = 28) {
  if (day < 5) return 'menstruation'
  if (day < 11) return 'follicular'
  if (day < 16) return 'ovulatory'
  return 'luteal'
}

export function getPhaseName(phase) {
  const names = {
    menstruation: 'Menstruatie',
    follicular: 'Folliculair',
    ovulatory: 'Ovulatie',
    luteal: 'Luteaal',
  }
  return names[phase] || phase
}

export function getPhaseLength(phase, cycleLength = 28) {
  if (phase === 'menstruation') return 5
  if (phase === 'follicular') return 6
  if (phase === 'ovulatory') return 5
  return cycleLength - 16
}

export function getDayInPhase(day, cycleLength = 28) {
  const phase = getPhaseByDay(day, cycleLength)
  let startDay = 1

  if (phase === 'follicular') startDay = 5
  if (phase === 'ovulatory') startDay = 11
  if (phase === 'luteal') startDay = 16

  return day - startDay + 1
}

export function getPhaseColor(phase) {
  return PHASE_COLORS[phase] || '#999'
}

export function getPhaseGradient(phase) {
  return PHASE_GRADIENTS[phase] || PHASE_GRADIENTS.follicular
}

export function getPhaseEmoji(phase) {
  return PHASE_EMOJI[phase] || '•'
}

export function calculateCycleTrends(entries) {
  const trends = {
    avgCycleLength: 0,
    topSymptoms: [],
    symptomsByPhase: {},
  }

  if (entries.length === 0) return trends

  // Calculate average cycle length from last 3 cycles
  const cycleLengths = []
  let currentCycleStart = null

  for (const entry of entries) {
    const date = new Date(entry.date)
    if (entry.symptoms?.bloating > 0 || entry.bleeding) {
      if (currentCycleStart) {
        cycleLengths.push(Math.floor((date - currentCycleStart) / (1000 * 60 * 60 * 24)))
      }
      currentCycleStart = date
    }
  }

  trends.avgCycleLength = cycleLengths.length > 0
    ? Math.round(cycleLengths.reduce((a, b) => a + b) / cycleLengths.length)
    : 28

  // Get top symptoms
  const symptomCounts = {}
  for (const entry of entries) {
    if (entry.symptoms) {
      for (const [symptom, intensity] of Object.entries(entry.symptoms)) {
        if (intensity > 0) {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + intensity
        }
      }
    }
  }

  trends.topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([symptom]) => symptom)

  return trends
}

export function getPhaseInsights(phase) {
  const insights = {
    menstruation: {
      energy: 'Jouw energieniveau is het laagst. Rust is essentieel.',
      exercise: 'Kies voor yoga of wandelen in plaats van intensieve training',
      nutrition: 'Meer ijzer, vitamin B12 en rood vlees',
      sleep: '7-9 uur slaap voor herstel',
    },
    follicular: {
      energy: 'Jouw energieniveau stijgt. Dit is een goed moment voor doelen.',
      exercise: 'Ideaal voor intensieve training en nieuwe activiteiten',
      nutrition: 'Meer rauwe groenten, fruit en verse producten',
      sleep: '7-8 uur slaap volstaat',
    },
    ovulatory: {
      energy: 'Jouw energieniveau is op het hoogtepunt! Je bent het meest alert.',
      exercise: 'Ideaal voor HIIT, hardlopen en krachtige workouts',
      nutrition: 'Meer eiwit en gezonde vetten',
      sleep: '6-7 uur slaap (je voelt je energiek)',
    },
    luteal: {
      energy: 'Jouw energieniveau daalt. Zorg goed voor jezelf.',
      exercise: 'Kies voor rustigere activiteiten: pilates, zwemmen',
      nutrition: 'Meer complexe koolhydraten, magnesium en calcium',
      sleep: '8-9 uur slaap is belangrijk voor balans',
    },
  }
  return insights[phase] || insights.follicular
}
