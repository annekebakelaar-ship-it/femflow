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

// ── Oura ─────────────────────────────────────────────────────────────────────

export async function requestOuraConnect() {
  return request('/api/oura/request-connect', { method: 'POST' })
}

export async function pullOuraData() {
  return request('/api/oura/pull', { method: 'POST' })
}

export async function getOuraStatus() {
  return request('/api/oura/status')
}

export async function seedSynthData(days = 90, scenario = 'stable') {
  return request(`/api/oura/seed?days=${days}&scenario=${scenario}`, { method: 'POST' })
}

// ── Readings ─────────────────────────────────────────────────────────────────

export async function getReadings(days = 90) {
  return request(`/api/readings?days=${days}`)
}

// ── Age calculation ───────────────────────────────────────────────────────────

export async function calculateAge(payload) {
  return request('/api/age/calculate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ── Reformulation ─────────────────────────────────────────────────────────

export async function evaluateReformulation() {
  return request('/api/reformulate/evaluate', { method: 'POST' })
}

export async function getReformulation(userId) {
  return request(`/api/reformulate/${userId}`)
}

// ── Consent ───────────────────────────────────────────────────────────────

export async function giveConsent(consentVersion, purposes) {
  return request('/consent/give', {
    method: 'POST',
    body: JSON.stringify({ consent_version: consentVersion, purposes }),
  })
}

export async function checkConsent(consentVersion, purposes) {
  const res = await request(`/consent/status?consent_version=${consentVersion}`)
  return res.has_active_consent && res.purposes && purposes.every(p => res.purposes.includes(p))
}

export async function withdrawConsent(consentVersion, deleteData = true) {
  return request('/consent/withdraw', {
    method: 'POST',
    body: JSON.stringify({ consent_version: consentVersion, delete_data: deleteData }),
  })
}

// ── Supplements ────────────────────────────────────────────────────────────────

export async function getSupplements() {
  return request('/api/reformulate/latest')
}

// ── FEM Quiz (Perimenopauze Herkenning) ────────────────────────────────────────

export async function startFemQuiz(payload) {
  return request('/api/fem/quiz/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function saveFemAnswer(sessionId, payload) {
  return request(`/api/fem/quiz/${sessionId}/answer`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getFemQuizState(sessionId) {
  return request(`/api/fem/quiz/${sessionId}`)
}

export async function giveQuizConsent(sessionId) {
  return request(`/api/fem/quiz/${sessionId}/consent`, {
    method: 'POST',
  })
}

export async function getFemResult(sessionId) {
  return request(`/api/fem/quiz/${sessionId}/result`, {
    method: 'POST',
  })
}

// ── Readiness Score ────────────────────────────────────────────────────

export async function calculateReadiness(wearableData, cycleData) {
  return request('/api/readiness/calculate', {
    method: 'POST',
    body: JSON.stringify({
      wearable_data: wearableData,
      cycle_data: cycleData,
    }),
  })
}

// ── Symptom Logging ────────────────────────────────────────────────────

export async function logSymptom(symptomType) {
  return request('/api/v1/logs/symptom', {
    method: 'POST',
    body: JSON.stringify({ symptom_type: symptomType }),
  })
}

export async function getRecentSymptoms(limit = 10) {
  return request(`/api/v1/logs/symptom/recent?limit=${limit}`)
}

// ── Lifestyle Triggers ──────────────────────────────────────────────────

export async function saveLifestyleTriggers(date, triggers) {
  return request('/api/v1/logs/triggers', {
    method: 'PUT',
    body: JSON.stringify({ date, triggers }),
  })
}

export async function getLifestyleTriggers(date) {
  return request(`/api/v1/logs/triggers?date=${date}`)
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
