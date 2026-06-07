const BASE = 'https://wearable-age-api.onrender.com'

const JWT_KEY = 'wab_jwt'

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

export async function requestMagicLink(email) {
  return request('/auth/request-link', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function verifyMagicLink(token) {
  const data = await request('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
  saveToken(data.access_token)
  return data
}

export async function login(credentials) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  saveToken(data.access_token)
  return data
}

export async function signup(credentials) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  saveToken(data.access_token)
  return data
}

export async function getMe() {
  return request('/auth/me')
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
