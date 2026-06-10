// FemFlow API - Render backend (set via VITE_API_URL or use default)
const BASE = import.meta.env.VITE_API_URL || 'https://femflow-api.onrender.com'

const JWT_KEY = 'femflow_jwt'

export function getToken() {
  return localStorage.getItem(JWT_KEY)
}

export function saveToken(token) {
  localStorage.setItem(JWT_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(JWT_KEY)
}

export function isLoggedIn() {
  return !!getToken()
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw Object.assign(new Error(err.detail || 'Request failed'), { status: res.status })
  }
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────

// FemFlow: OTP Code Authentication (6-digit codes via email)
export async function requestMagicLink(email) {
  return request('/api/v1/auth/request-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function verifyMagicLink(code, email) {
  const data = await request('/api/v1/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ code, email }),
  })
  if (data.token) {
    saveToken(data.token)
  }
  return data
}

export async function login(credentials) {
  const data = await request('/api/v1/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  if (data.token) {
    saveToken(data.token)
  }
  return data
}

export async function signup(credentials) {
  const data = await request('/api/v1/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  if (data.token) {
    saveToken(data.token)
  }
  return data
}

export async function getMe() {
  return request('/api/v1/users/me')
}

// ── Oura (legacy-namen; delegeren naar de echte /api/v1/wearable endpoints) ───
// De oude paden (/api/oura/*, /api/readings) stammen uit WAB en bestaan niet
// in de FemFlow-backend — alle aanroepen faalden daardoor met een 404.

export async function requestOuraConnect() {
  const res = await requestWearableConnect()
  return { connect_url: res.auth_url }
}

export async function pullOuraData() {
  return pullWearableData()
}

export async function getOuraStatus() {
  return getWearableStatus()
}

export async function seedSynthData(days = 90, scenario = 'stable') {
  return seedWearableData(days, scenario)
}

// Geeft een platte array readings terug, met rhr_bpm-alias voor oude callers
export async function getReadings(days = 90) {
  const res = await getWearableReadings(days)
  return (res.data || []).map(r => ({ ...r, rhr_bpm: r.resting_heart_rate }))
}

// ── Consent (client-side: er is bewust geen consent-endpoint op de server) ───

const CONSENT_KEY = 'femflow_wearable_consent'

export async function giveConsent(consentVersion, purposes) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({
    consent_version: consentVersion,
    purposes,
    given_at: new Date().toISOString(),
  }))
  return { success: true }
}

export async function checkConsent(consentVersion, purposes) {
  try {
    const stored = JSON.parse(localStorage.getItem(CONSENT_KEY))
    return !!stored
      && stored.consent_version === consentVersion
      && purposes.every(p => stored.purposes.includes(p))
  } catch {
    return false
  }
}

export async function withdrawConsent() {
  localStorage.removeItem(CONSENT_KEY)
  return { success: true }
}

// ── FemFlow Menstruation Data ───────────────────────────────────────

export async function getMenstruationData() {
  return request('/api/v1/menstruation')
}

export async function saveMenstruationData(startDate, cycleLength, bleedingDays) {
  return request('/api/v1/menstruation', {
    method: 'POST',
    body: JSON.stringify({
      start_date: startDate,
      cycle_length: cycleLength,
      bleeding_days: bleedingDays,
    }),
  })
}

export async function updateUserProfile(name, birthDate) {
  return request('/api/v1/users/me', {
    method: 'PUT',
    body: JSON.stringify({
      name,
      birth_date: birthDate,
    }),
  })
}

export async function deleteAccount() {
  return request('/api/v1/users/me', {
    method: 'DELETE',
  })
}

// ── Welcome Signups ─────────────────────────────────────────────────────────

export async function saveWelcomeSignup(email) {
  return request('/api/v1/welcome/signup', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function unsubscribeEmail(email) {
  return request('/api/v1/welcome/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

// ── Quiz Results ─────────────────────────────────────────────────────────────

export async function saveQuizResults(email, constellation) {
  // For post-login: uses authenticated request
  return request('/api/v1/quiz/save', {
    method: 'POST',
    body: JSON.stringify({ email, constellation }),
  })
}

export async function getQuizResults() {
  return request('/api/v1/quiz/results')
}

// ── Wearable (Oura) ────────────────────────────────────────────────────────

export async function requestWearableConnect() {
  return request('/api/v1/wearable/request-connect', {
    method: 'POST',
  })
}

export async function getWearableStatus() {
  return request('/api/v1/wearable/status')
}

export async function pullWearableData() {
  return request('/api/v1/wearable/pull', {
    method: 'POST',
  })
}

export async function seedWearableData(days = 60, scenario = 'stable') {
  return request('/api/v1/wearable/seed', {
    method: 'POST',
    body: JSON.stringify({ days, scenario }),
  })
}

export async function getWearableReadings(days = 90) {
  return request(`/api/v1/wearable/readings?days=${days}`)
}

export async function sendFeedback(feedback, email, url) {
  return request('/api/v1/feedback', {
    method: 'POST',
    body: JSON.stringify({ feedback, email, url }),
  })
}
