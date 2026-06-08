// Dev utility - run in browser console to setup test data
import { saveSecure } from './secureStorage'

export function setupDevData() {
  // Set menstruation data (encrypted via saveSecure)
  saveSecure('menstruation_data', {
    name: 'Test User',
    birthDate: '1990-01-15',
    startDate: '2024-01-10',
    cycleLength: 28,
    bleedingDays: 5,
  })

  // Set consent
  localStorage.setItem('consent_given_at', new Date().toISOString())
  localStorage.setItem('consent_version', '1.0')

  // Set auth token
  localStorage.setItem('femflow_jwt', 'dev-token-12345')

  console.log('✅ Dev data loaded (encrypted)!')
  console.log('Refresh page now')
}

// Quick setup - call in console: window.setupDev()
window.setupDev = setupDevData
