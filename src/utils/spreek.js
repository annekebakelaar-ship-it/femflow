// Gedeelde spraak voor de begeleide oefeningen (adem + mindfulness).
// Kiest een Nederlandse VROUWENstem. Bekende namen per platform: Fenna/Colette
// (Windows/Edge), Ellen/Claire (iOS/macOS), Google Nederlands (Android/Chrome,
// vrouwelijk). Mannen (Xander, Frank, Maarten) worden actief vermeden; de
// stemlijst laadt asynchroon, dus we blijven proberen tot er een is.

let _stem = null

export function kiesStem() {
  const stemmen = window.speechSynthesis?.getVoices?.() || []
  const nl = stemmen.filter(v => (v.lang || '').toLowerCase().startsWith('nl'))
  if (!nl.length) return null
  const vrouw = nl.find(v => /fenna|colette|ellen|claire|laura|lotte|femke|saskia|vrouw|female/i.test(v.name))
  if (vrouw) return vrouw
  const nietMan = nl.find(v => !/xander|frank|maarten|ruben|\bman\b|male/i.test(v.name))
  return nietMan || nl[0]
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => { _stem = kiesStem() })
}

// opties: rate (tempo), pitch (toonhoogte), volume (0-1). De mindfulness
// gebruikt de zachte meditatiestand; de ademoefening blijft iets duidelijker
// omdat het telwerk goed verstaanbaar moet zijn.
export function spreek(tekst, { rate = 1.0, pitch = 1.0, volume = 1.0 } = {}) {
  try {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(tekst)
    if (!_stem) _stem = kiesStem()
    if (_stem) u.voice = _stem
    u.lang = 'nl-NL'
    u.rate = rate
    u.pitch = pitch
    u.volume = volume
    window.speechSynthesis.speak(u)
  } catch { /* geen spraak beschikbaar: de tekst staat ook op het scherm */ }
}

// Zachte meditatiestand: langzamer, iets lager, gedempt volume
export const MEDITATIE_STEM = { rate: 0.85, pitch: 0.92, volume: 0.7 }
// Ademtellen: rustig maar duidelijk verstaanbaar
export const ADEM_STEM = { rate: 1.0, pitch: 0.98, volume: 0.85 }

export function stopSpraak() {
  try { window.speechSynthesis?.cancel() } catch { /* */ }
}
