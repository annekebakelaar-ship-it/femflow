// Calculate completed cycle lengths from menstruation data
// A completed cycle = days between two period starts
export function getCycleLengths(menstrualData) {
  if (!menstrualData || !menstrualData.startDate || !menstrualData.entries) {
    return []
  }

  const periodStarts = [new Date(menstrualData.startDate)]

  // Add any period starts from entries (entries with bleeding type)
  menstrualData.entries?.forEach(entry => {
    // If entry marks start of bleeding, add to period starts
    if (entry.bleeding && entry.date) {
      const date = new Date(entry.date)
      if (!periodStarts.some(d => d.toDateString() === date.toDateString())) {
        periodStarts.push(date)
      }
    }
  })

  // Sort chronologically
  periodStarts.sort((a, b) => a - b)

  // Calculate distances between consecutive starts = completed cycle lengths
  const cycleLengths = []
  for (let i = 1; i < periodStarts.length; i++) {
    const length = Math.round((periodStarts[i] - periodStarts[i - 1]) / (1000 * 60 * 60 * 24))
    if (length > 0 && length < 365) { // Sanity check
      cycleLengths.push({
        length,
        startDate: periodStarts[i - 1],
        endDate: periodStarts[i],
      })
    }
  }

  return cycleLengths
}

// Check if a cycle marks STRAW early transition (≥7 day change from previous)
export function hasEarlyTransitionMarker(cycleLengths, index) {
  if (index === 0 || !cycleLengths[index - 1]) return false
  const diff = Math.abs(cycleLengths[index].length - cycleLengths[index - 1].length)
  return diff >= 7
}

// Check if a cycle marks STRAW late transition (≥60 days)
export function hasLateTransitionMarker(cycle) {
  return cycle.length >= 60
}

// Mock data for testing
export function getMockCycleLengths(mode = 'regular') {
  const today = new Date()

  if (mode === 'regular') {
    // Regular 28-day cycles, no markers
    return [
      { length: 28, startDate: new Date(today.getTime() - 180 * 86400000), endDate: new Date(today.getTime() - 152 * 86400000) },
      { length: 28, startDate: new Date(today.getTime() - 152 * 86400000), endDate: new Date(today.getTime() - 124 * 86400000) },
      { length: 28, startDate: new Date(today.getTime() - 124 * 86400000), endDate: new Date(today.getTime() - 96 * 86400000) },
      { length: 29, startDate: new Date(today.getTime() - 96 * 86400000), endDate: new Date(today.getTime() - 67 * 86400000) },
      { length: 28, startDate: new Date(today.getTime() - 67 * 86400000), endDate: new Date(today.getTime() - 39 * 86400000) },
      { length: 28, startDate: new Date(today.getTime() - 39 * 86400000), endDate: today },
    ]
  }

  if (mode === 'early_transition') {
    // Cycle with +9 day jump (early transition marker)
    return [
      { length: 28, startDate: new Date(today.getTime() - 180 * 86400000), endDate: new Date(today.getTime() - 152 * 86400000) },
      { length: 28, startDate: new Date(today.getTime() - 152 * 86400000), endDate: new Date(today.getTime() - 124 * 86400000) },
      { length: 28, startDate: new Date(today.getTime() - 124 * 86400000), endDate: new Date(today.getTime() - 96 * 86400000) },
      { length: 37, startDate: new Date(today.getTime() - 96 * 86400000), endDate: new Date(today.getTime() - 59 * 86400000) }, // +9 days
      { length: 28, startDate: new Date(today.getTime() - 59 * 86400000), endDate: new Date(today.getTime() - 31 * 86400000) },
      { length: 30, startDate: new Date(today.getTime() - 31 * 86400000), endDate: today },
    ]
  }

  if (mode === 'late_transition') {
    // Cycle with ≥60 days (late transition marker)
    return [
      { length: 28, startDate: new Date(today.getTime() - 240 * 86400000), endDate: new Date(today.getTime() - 212 * 86400000) },
      { length: 28, startDate: new Date(today.getTime() - 212 * 86400000), endDate: new Date(today.getTime() - 184 * 86400000) },
      { length: 65, startDate: new Date(today.getTime() - 184 * 86400000), endDate: new Date(today.getTime() - 119 * 86400000) }, // ≥60 days
      { length: 32, startDate: new Date(today.getTime() - 119 * 86400000), endDate: new Date(today.getTime() - 87 * 86400000) },
      { length: 28, startDate: new Date(today.getTime() - 87 * 86400000), endDate: new Date(today.getTime() - 59 * 86400000) },
      { length: 31, startDate: new Date(today.getTime() - 59 * 86400000), endDate: today },
    ]
  }

  return []
}
