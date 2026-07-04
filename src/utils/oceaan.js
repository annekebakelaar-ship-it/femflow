// Zacht golfgeluid voor de mindfulness, volledig gegenereerd met WebAudio:
// bruine ruis door een laagdoorlaatfilter, met twee langzame golvingen op het
// volume zodat het als rustige branding klinkt. Geen audiobestanden, geen
// licenties, geen extra bundelgewicht. Standaard UIT in de oefening: stilte
// is de oefening; dit is een opstapje voor wie stilte nog ongemakkelijk vindt.

let _ctx = null
let _master = null
let _stoppen = []

export function startOceaan(volume = 0.5) {
  try {
    stopOceaan(0)
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return false
    _ctx = new AC()

    // 4 seconden bruine ruis als loop (laagfrequent, zacht van karakter)
    const lengte = _ctx.sampleRate * 4
    const buffer = _ctx.createBuffer(1, lengte, _ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let vorig = 0
    for (let i = 0; i < lengte; i++) {
      const wit = Math.random() * 2 - 1
      vorig = (vorig + 0.02 * wit) / 1.02
      data[i] = vorig * 3.5
    }

    const bron = _ctx.createBufferSource()
    bron.buffer = buffer
    bron.loop = true

    const filter = _ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 420
    filter.Q.value = 0.6

    // Golfslag: twee trage, net verschillende deiningen op het volume
    const deining = _ctx.createGain()
    deining.gain.value = 0.6
    const maakLfo = (hz, diepte) => {
      const lfo = _ctx.createOscillator()
      lfo.frequency.value = hz
      const lfoGain = _ctx.createGain()
      lfoGain.gain.value = diepte
      lfo.connect(lfoGain)
      lfoGain.connect(deining.gain)
      lfo.start()
      return lfo
    }
    const lfo1 = maakLfo(0.07, 0.25)   // hoofddeining (~14s per golf)
    const lfo2 = maakLfo(0.113, 0.12)  // lichte onregelmatigheid

    _master = _ctx.createGain()
    _master.gain.value = 0
    // Zacht infaden (geen klik, geen schrik)
    _master.gain.linearRampToValueAtTime(0.055 * volume, _ctx.currentTime + 2)

    bron.connect(filter)
    filter.connect(deining)
    deining.connect(_master)
    _master.connect(_ctx.destination)
    bron.start()

    _stoppen = [bron, lfo1, lfo2]
    return true
  } catch {
    return false // geen WebAudio: oefening werkt gewoon zonder geluid
  }
}

export function stopOceaan(fadeSec = 1.2) {
  try {
    if (!_ctx) return
    const ctx = _ctx, master = _master, stoppen = _stoppen
    _ctx = null; _master = null; _stoppen = []
    if (master && fadeSec > 0) {
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeSec)
    }
    setTimeout(() => {
      try { stoppen.forEach(n => n.stop?.()) } catch { /* */ }
      try { ctx.close() } catch { /* */ }
    }, fadeSec > 0 ? fadeSec * 1000 + 100 : 0)
  } catch { /* */ }
}
