import { FORMULAS, DEFAULT_USER } from './mockData'

function delay(ms) {
  const jitter = Math.random() * 400
  return new Promise(resolve => setTimeout(resolve, ms + jitter))
}

export async function signIn(email) {
  await delay(600)
  return { ...DEFAULT_USER, email }
}

export async function saveOnboarding(data) {
  await delay(400)
  return { success: true, ...data }
}

export async function getCurrentFormula(goal) {
  await delay(500)
  return FORMULAS[goal] || FORMULAS.energy
}

export async function submitCheckin(data) {
  await delay(800)
  return { success: true, submittedAt: new Date().toISOString() }
}

export async function getDeliveryDate() {
  await delay(300)
  const d = new Date()
  d.setDate(d.getDate() + 5)
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function pauseSubscription() {
  await delay(600)
  return { status: 'paused' }
}

export async function cancelSubscription() {
  await delay(800)
  return { status: 'cancelled' }
}
