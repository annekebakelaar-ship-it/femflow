/**
 * Synthetic Oura data generator for FemFlow
 * Ported from WAB's backend/services/oura/synth.py
 *
 * Generates realistic, correlated sleep data via latent recovery state
 * for testing and demo purposes.
 */

import { randomUUID } from 'crypto'

const SCENARIOS = ['stable', 'declining', 'recovering', 'dip']

class UserProfile {
  constructor(userId, baselineHrv, baselineRhr, baselineDeepMin, baselineTotalMin) {
    this.userId = userId
    this.baselineHrv = baselineHrv
    this.baselineRhr = baselineRhr
    this.baselineDeepMin = baselineDeepMin
    this.baselineTotalMin = baselineTotalMin
    this.phi = 0.62 // AR(1) persistence
  }

  static fromSeed(userId, rng) {
    const baselineHrv = rng.uniform(38, 62)
    const baselineRhr = rng.uniform(50, 62)
    const baselineDeepMin = rng.uniform(70, 105)
    const baselineTotalMin = rng.uniform(400, 460)
    return new UserProfile(userId, baselineHrv, baselineRhr, baselineDeepMin, baselineTotalMin)
  }
}

class SeededRandom {
  constructor(seed) {
    this.seed = seed
    this.state = seed
  }

  next() {
    this.state = (this.state * 1103515245 + 12345) & 0x7fffffff
    return this.state / 0x7fffffff
  }

  uniform(lo, hi) {
    return lo + this.next() * (hi - lo)
  }

  gauss(mean, stdDev) {
    // Box-Muller transform
    const u1 = this.next()
    const u2 = this.next()
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
    return mean + stdDev * z
  }

  choice(arr) {
    return arr[Math.floor(this.next() * arr.length)]
  }
}

function scenarioDrift(scenario, i, n) {
  if (scenario === 'stable') return 0.0
  if (scenario === 'declining') return -1.6 * (i / Math.max(n - 1, 1))
  if (scenario === 'recovering') return 1.6 * (i / Math.max(n - 1, 1))
  if (scenario === 'dip') {
    const center = n * 0.5
    const width = Math.max(n * 0.1, 2.0)
    return -2.4 * Math.exp(-((i - center) ** 2) / (2 * width ** 2))
  }
  throw new Error(`Unknown scenario: ${scenario}`)
}

function recoverySeriesgen(scenario, n, phi, rng) {
  const series = []
  let prev = 0.0
  for (let i = 0; i < n; i++) {
    const weekday = i % 7
    const weekly = weekday === 5 || weekday === 6 ? 0.18 : -0.06
    let shock = rng.gauss(0, 0.45)
    if (rng.next() < 0.05) {
      shock -= rng.uniform(0.8, 1.6)
    }
    let z = phi * prev + weekly + scenarioDrift(scenario, i, n) + shock
    z = Math.max(-3.0, Math.min(3.0, z))
    series.push(z)
    prev = z
  }
  return series
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

function metricsForDay(profile, recovery, rng) {
  let hrv = profile.baselineHrv * (1 + 0.18 * recovery) + rng.gauss(0, 2.0)
  let rhr = profile.baselineRhr * (1 - 0.045 * recovery) + rng.gauss(0, 1.2)
  let deepMin = profile.baselineDeepMin * (1 + 0.14 * recovery) + rng.gauss(0, 6)
  let totalMin = profile.baselineTotalMin * (1 + 0.06 * recovery) + rng.gauss(0, 18)

  hrv = clamp(hrv, 12, 140)
  rhr = clamp(rhr, 38, 90)
  deepMin = clamp(deepMin, 25, 160)
  totalMin = clamp(totalMin, 240, 560)
  deepMin = Math.min(deepMin, totalMin * 0.35)

  return {
    average_hrv: Math.round(hrv),
    lowest_heart_rate: Math.round(rhr),
    average_heart_rate: Math.round(rhr + rng.uniform(6, 12)),
    deep_sleep_duration: Math.round(deepMin * 60),
    total_sleep_duration: Math.round(totalMin * 60),
    recovery_z: Math.round(recovery * 1000) / 1000,
  }
}

function readinessScore(metrics, profile) {
  const hrvPart = (metrics.average_hrv - profile.baselineHrv) / profile.baselineHrv
  const rhrPart = (profile.baselineRhr - metrics.lowest_heart_rate) / profile.baselineRhr
  const deepPart = (metrics.deep_sleep_duration / 60 - profile.baselineDeepMin) / profile.baselineDeepMin
  const raw = 70 + 100 * (0.5 * hrvPart + 0.3 * rhrPart + 0.2 * deepPart)
  return Math.round(clamp(raw, 1, 100))
}

function buildSleepDocument(profile, day, metrics) {
  const totalS = metrics.total_sleep_duration
  const deepS = metrics.deep_sleep_duration
  const remS = Math.round(totalS * 0.22)
  const lightS = Math.max(totalS - deepS - remS, 0)
  const awakeS = Math.round(totalS * 0.08)
  const timeInBed = totalS + awakeS

  const bedtimeStart = new Date(day)
  bedtimeStart.setHours(23, 12, 0, 0)
  bedtimeStart.setDate(bedtimeStart.getDate() - 1)

  const bedtimeEnd = new Date(bedtimeStart.getTime() + timeInBed * 1000)

  return {
    id: randomUUID(),
    day: day.toISOString().split('T')[0],
    type: 'long_sleep',
    bedtime_start: bedtimeStart.toISOString(),
    bedtime_end: bedtimeEnd.toISOString(),
    average_hrv: metrics.average_hrv,
    lowest_heart_rate: metrics.lowest_heart_rate,
    average_heart_rate: metrics.average_heart_rate,
    deep_sleep_duration: deepS,
    light_sleep_duration: lightS,
    rem_sleep_duration: remS,
    total_sleep_duration: totalS,
    awake_time: awakeS,
    time_in_bed: timeInBed,
    efficiency: Math.round((100 * totalS / timeInBed) * 10) / 10,
    readiness_score: readinessScore(metrics, profile),
    recovery_z: metrics.recovery_z,
  }
}

function generateSleepRange(userId, days = 60, scenario = 'stable', endDay = null) {
  if (!SCENARIOS.includes(scenario)) {
    throw new Error(`Scenario must be one of ${SCENARIOS.join(', ')}`)
  }

  if (!endDay) endDay = new Date()

  // Deterministic seed from userId
  const seed = Math.abs(userId.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))
  const rng = new SeededRandom(seed)

  const profile = UserProfile.fromSeed(userId, rng)
  const recovery = recoverySeriesgen(scenario, days, profile.phi, rng)

  const docs = []
  const startDay = new Date(endDay)
  startDay.setDate(startDay.getDate() - (days - 1))

  for (let i = 0; i < days; i++) {
    const d = new Date(startDay)
    d.setDate(d.getDate() + i)
    const metrics = metricsForDay(profile, recovery[i], rng)
    docs.push(buildSleepDocument(profile, d, metrics))
  }

  return { data: docs, next_token: null }
}

export { generateSleepRange, SCENARIOS }
