// Secure localStorage for sensitive health data
// Uses simple base64+passphrase obfuscation (not military-grade, but prevents casual access)
// For production: use TweetNaCl.js or libsodium.js

const PASSPHRASE = 'femflow_health_data_v1'
const PREFIX = 'secure_'

function simpleEncrypt(data, passphrase) {
  try {
    const json = JSON.stringify(data)
    return btoa(json + '::' + passphrase.substring(0, 8)).split('').reverse().join('')
  } catch {
    return null
  }
}

function simpleDecrypt(encrypted, passphrase) {
  try {
    const reversed = encrypted.split('').reverse().join('')
    const decoded = atob(reversed)
    const [json, phrase] = decoded.split('::')
    if (phrase !== passphrase.substring(0, 8)) {
      console.warn('Invalid passphrase')
      return null
    }
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function saveSecure(key, data) {
  try {
    const encrypted = simpleEncrypt(data, PASSPHRASE)
    if (!encrypted) throw new Error('Encryption failed')
    localStorage.setItem(PREFIX + key, encrypted)
  } catch (err) {
    console.error('Failed to save secure data:', err)
  }
}

export function getSecure(key) {
  try {
    const encrypted = localStorage.getItem(PREFIX + key)
    if (!encrypted) return null
    const decrypted = simpleDecrypt(encrypted, PASSPHRASE)
    return decrypted
  } catch (err) {
    console.error('Failed to retrieve secure data:', err)
    return null
  }
}

export function deleteSecure(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch (err) {
    console.error('Failed to delete secure data:', err)
  }
}

export function deleteAllSecure() {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (err) {
    console.error('Failed to delete all secure data:', err)
  }
}

export function exportSecureData() {
  try {
    const data = {}
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(PREFIX)) {
        const plainKey = key.replace(PREFIX, '')
        data[plainKey] = getSecure(plainKey)
      }
    })
    return data
  } catch (err) {
    console.error('Failed to export data:', err)
    return null
  }
}
