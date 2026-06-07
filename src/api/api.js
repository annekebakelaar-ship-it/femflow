const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

function getToken() {
  return localStorage.getItem('youcaps_token')
}

function toAgeRange(age) {
  const n = Number(age)
  if (n <= 25) return '18-25'
  if (n <= 35) return '26-35'
  if (n <= 45) return '36-45'
  if (n <= 55) return '46-55'
  return '56+'
}

export async function startOnboarding({ goal, age, sex, diet }) {
  const token = getToken()
  const res = await fetch(`${BASE}/onboarding/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ goal, age_range: toAgeRange(age), sex, diet }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(`API ${res.status}`)
    err.status = res.status
    err.detail = body.detail
    throw err
  }
  return res.json()
}
