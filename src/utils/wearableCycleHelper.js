// Align wearable data with cycle timeline
// Returns array of { cycleDay, temperature, hrv, restingHR, sleep, isPeriodDay }

export function alignWearableWithCycle(menstrualData, wearableReadings) {
  if (!menstrualData?.startDate || !wearableReadings || wearableReadings.length === 0) {
    return []
  }

  const cycleStart = new Date(menstrualData.startDate)
  const cycleLength = menstrualData.cycleLength || 28
  const periodDays = menstrualData.bleedingDays || 5

  // Get period start dates from entries
  const periodStarts = [cycleStart]
  menstrualData.entries?.forEach(entry => {
    if (entry.bleeding && entry.date) {
      const date = new Date(entry.date)
      if (!periodStarts.some(d => d.toDateString() === date.toDateString())) {
        periodStarts.push(date)
      }
    }
  })
  periodStarts.sort((a, b) => a - b)

  // Map wearable readings to cycle days
  const aligned = []

  wearableReadings.forEach(reading => {
    const readingDate = new Date(reading.date || reading.timestamp)

    // Find which cycle this reading belongs to
    let cycleStartDate = cycleStart
    for (let i = periodStarts.length - 1; i >= 0; i--) {
      if (readingDate >= periodStarts[i]) {
        cycleStartDate = periodStarts[i]
        break
      }
    }

    const daysSinceStart = Math.floor((readingDate - cycleStartDate) / (1000 * 60 * 60 * 24))
    const cycleDay = daysSinceStart % cycleLength

    // Check if this is a period day
    const isPeriodDay = daysSinceStart < periodDays

    aligned.push({
      date: readingDate,
      cycleDay,
      temperature: reading.skin_temperature || reading.temperature || null,
      hrv: reading.hrv || null,
      restingHR: reading.rhr_bpm || reading.resting_heart_rate || null,
      sleep: reading.sleep_duration_min ? reading.sleep_duration_min / 60 : null, // Convert to hours
      isPeriodDay,
    })
  })

  // Sort by cycle day
  return aligned.sort((a, b) => a.cycleDay - b.cycleDay)
}

// Calculate average signal per cycle day (smoothing)
export function aggregateByDay(alignedData) {
  const byDay = {}

  alignedData.forEach(reading => {
    const day = Math.floor(reading.cycleDay)
    if (!byDay[day]) {
      byDay[day] = {
        day,
        temperatures: [],
        hrvs: [],
        heartRates: [],
        sleeps: [],
        isPeriodDay: reading.isPeriodDay,
        count: 0,
      }
    }
    if (reading.temperature) byDay[day].temperatures.push(reading.temperature)
    if (reading.hrv) byDay[day].hrvs.push(reading.hrv)
    if (reading.restingHR) byDay[day].heartRates.push(reading.restingHR)
    if (reading.sleep) byDay[day].sleeps.push(reading.sleep)
    byDay[day].count++
  })

  // Calculate averages
  const result = []
  for (const day in byDay) {
    const data = byDay[day]
    result.push({
      day: parseInt(day),
      temperature: data.temperatures.length > 0 ? (data.temperatures.reduce((a, b) => a + b) / data.temperatures.length).toFixed(1) : null,
      hrv: data.hrvs.length > 0 ? Math.round(data.hrvs.reduce((a, b) => a + b) / data.hrvs.length) : null,
      restingHR: data.heartRates.length > 0 ? Math.round(data.heartRates.reduce((a, b) => a + b) / data.heartRates.length) : null,
      sleep: data.sleeps.length > 0 ? (data.sleeps.reduce((a, b) => a + b) / data.sleeps.length).toFixed(1) : null,
      isPeriodDay: data.isPeriodDay,
    })
  }

  return result.sort((a, b) => a.day - b.day)
}

// Mock wearable data for testing
export function getMockWearableData(mode = 'regular', menstrualData) {
  const today = new Date()
  const cycleStart = menstrualData ? new Date(menstrualData.startDate) : new Date(today.getTime() - 60 * 86400000)
  const readings = []

  // Generate 60 days of readings
  for (let i = 0; i < 60; i++) {
    const date = new Date(cycleStart.getTime() + i * 86400000)
    const cycleDay = i % 28

    if (mode === 'regular') {
      // Temperature rises after ovulation (day 14)
      const tempBase = cycleDay < 14 ? 36.2 : 36.7
      const temperature = tempBase + Math.random() * 0.3
      const hrv = 50 + Math.random() * 20 - (cycleDay > 14 ? 10 : 0) // HRV slightly lower post-ovulation
      const rhr = 60 + Math.random() * 5
      const sleep = 7 + Math.random() * 2

      readings.push({
        date: date.toISOString().split('T')[0],
        skin_temperature: parseFloat(temperature.toFixed(1)),
        hrv: Math.round(hrv),
        rhr_bpm: Math.round(rhr),
        sleep_duration_min: Math.round(sleep * 60),
      })
    } else if (mode === 'irregular') {
      // Noisy, irregular pattern (transition)
      const tempBase = 36.4
      const temperature = tempBase + Math.random() * 0.6 - 0.3
      const hrv = 45 + Math.random() * 30
      const rhr = 62 + Math.random() * 8
      const sleep = 6.5 + Math.random() * 2.5

      readings.push({
        date: date.toISOString().split('T')[0],
        skin_temperature: parseFloat(temperature.toFixed(1)),
        hrv: Math.round(hrv),
        rhr_bpm: Math.round(rhr),
        sleep_duration_min: Math.round(sleep * 60),
      })
    } else if (mode === 'gaps') {
      // Some days missing (not wearing device)
      if (i % 3 !== 0) { // Skip every 3rd day
        const tempBase = cycleDay < 14 ? 36.2 : 36.7
        const temperature = tempBase + Math.random() * 0.3
        const hrv = 50 + Math.random() * 20
        const rhr = 60 + Math.random() * 5
        const sleep = 7 + Math.random() * 2

        readings.push({
          date: date.toISOString().split('T')[0],
          skin_temperature: parseFloat(temperature.toFixed(1)),
          hrv: Math.round(hrv),
          rhr_bpm: Math.round(rhr),
          sleep_duration_min: Math.round(sleep * 60),
        })
      }
    }
  }

  return readings
}
