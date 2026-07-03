import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Volume2, VolumeX } from 'react-feather'
import { ademStap, rondesIn, IN_SEC, UIT_SEC } from '../utils/adem'

// Begeleide ademoefening (4 tellen in, 6 tellen uit) voor de Leefstijl-hub.
// Een cirkel groeit mee met de inademing en krimpt met de uitademing; de
// telefoon telt hardop mee via spraaksynthese (nl-NL), uit te zetten met
// de geluidsknop. Duur kiesbaar: 1, 3 of 5 minuten.

const serif = "'Playfair Display', Georgia, serif"
const sans = "'Hanken Grotesk', system-ui, sans-serif"

function spreek(tekst) {
  try {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(tekst)
    u.lang = 'nl-NL'
    u.rate = 1.05
    window.speechSynthesis.speak(u)
  } catch { /* geen spraak beschikbaar: de cijfers staan ook op het scherm */ }
}

export default function AdemOefening({ onSluit }) {
  const [status, setStatus] = useState('kies')   // kies | bezig | klaar
  const [duurMin, setDuurMin] = useState(3)
  const [sec, setSec] = useState(0)
  const [geluid, setGeluid] = useState(true)
  const geluidRef = useRef(true)
  const wakeLockRef = useRef(null)

  // Scherm aanhouden tijdens de oefening (waar ondersteund)
  useEffect(() => {
    if (status !== 'bezig') return
    let actief = true
    if (navigator.wakeLock?.request) {
      navigator.wakeLock.request('screen')
        .then(l => { if (actief) wakeLockRef.current = l; else l.release() })
        .catch(() => {})
    }
    return () => {
      actief = false
      wakeLockRef.current?.release?.()
      wakeLockRef.current = null
    }
  }, [status])

  // De klok: elke seconde een tik
  useEffect(() => {
    if (status !== 'bezig') return
    const t = setInterval(() => setSec(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [status])

  const totaal = duurMin * 60
  const stap = ademStap(sec)
  const klaarNa = rondesIn(duurMin)

  // Hardop tellen: faseovergang zegt "Adem in/uit", daarna de tellen
  useEffect(() => {
    if (status !== 'bezig') return
    if (sec >= totaal) { setStatus('klaar'); spreek('Goed gedaan'); return }
    if (!geluidRef.current) return
    if (stap.tel === 1) spreek(stap.fase === 'in' ? 'Adem in' : 'Adem uit')
    else spreek(String(stap.tel))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec, status])

  // Spraak netjes stoppen bij sluiten/afronden
  useEffect(() => () => { try { window.speechSynthesis?.cancel() } catch { /* */ } }, [])

  const start = useCallback(() => {
    setSec(0)
    setStatus('bezig')
    if (geluidRef.current) spreek('We beginnen. Adem in')
  }, [])

  function toggleGeluid() {
    setGeluid(g => {
      geluidRef.current = !g
      if (g) { try { window.speechSynthesis?.cancel() } catch { /* */ } }
      return !g
    })
  }

  const inademen = stap.fase === 'in'
  const over = Math.max(0, totaal - sec)
  const minOver = `${Math.floor(over / 60)}:${String(over % 60).padStart(2, '0')}`

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', background: '#0a0402', fontFamily: sans }}>
      {/* Kop: sluiten + geluid */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 0' }}>
        <button onClick={onSluit} style={{ background: 'rgba(196,137,106,0.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={16} color="#a08070" />
        </button>
        {status === 'bezig' && (
          <button onClick={toggleGeluid} style={{ background: 'rgba(196,137,106,0.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {geluid ? <Volume2 size={16} color="#c4896a" /> : <VolumeX size={16} color="#a08070" />}
          </button>
        )}
      </div>

      {status === 'kies' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, letterSpacing: '0.22em', color: '#a08070', margin: '0 0 8px' }}>ADEMOEFENING</p>
          <h1 style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 30, color: '#f5ede8', margin: '0 0 10px' }}>4 tellen in, 6 tellen uit</h1>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: '#a08070', margin: '0 0 28px', maxWidth: 280 }}>
            Beweeg mee met de cirkel. Je telefoon telt hardop mee; zet het geluid uit als je liever stil oefent.
          </p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
            {[1, 3, 5].map(m => (
              <button key={m} onClick={() => setDuurMin(m)} style={{ padding: '10px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: sans, fontSize: 14, background: duurMin === m ? 'rgba(196,137,106,0.35)' : 'rgba(196,137,106,0.1)', color: duurMin === m ? '#f5ede8' : '#a08070' }}>
                {m} min
              </button>
            ))}
          </div>
          <button onClick={start} style={{ padding: '16px 48px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: sans, fontSize: 15, fontWeight: 600, color: '#1a0d08', background: 'linear-gradient(135deg, #d4a96a, #c4896a)', boxShadow: '0 6px 24px rgba(212,169,106,0.35)' }}>
            Start
          </button>
        </div>
      )}

      {status === 'bezig' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
          {/* Ademcirkels: buitenring vast, binnencirkel beweegt op de adem */}
          <div style={{ position: 'relative', width: 260, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 36 }}>
            <div style={{ position: 'absolute', width: 252, height: 252, borderRadius: '50%', border: '1px solid rgba(212,170,100,0.25)' }} />
            <div style={{
              position: 'absolute', width: 220, height: 220, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(220,175,100,0.5) 0%, rgba(196,137,80,0.25) 55%, transparent 75%)',
              filter: 'blur(6px)',
              transform: `scale(${inademen ? 1 : 0.55})`,
              transition: `transform ${inademen ? IN_SEC : UIT_SEC}s cubic-bezier(0.45, 0, 0.35, 1)`,
            }} />
            <div style={{
              position: 'absolute', width: 150, height: 150, borderRadius: '50%',
              border: '1px solid rgba(232,200,170,0.4)', background: 'rgba(196,137,106,0.12)',
              transform: `scale(${inademen ? 1.35 : 0.8})`,
              transition: `transform ${inademen ? IN_SEC : UIT_SEC}s cubic-bezier(0.45, 0, 0.35, 1)`,
            }} />
            <div style={{ position: 'relative', textAlign: 'center', zIndex: 2 }}>
              <p style={{ fontFamily: serif, fontSize: 56, color: '#f5ede8', margin: 0, lineHeight: 1, textShadow: '0 2px 24px rgba(0,0,0,0.5)' }}>{stap.tel}</p>
              <p style={{ fontSize: 13, letterSpacing: '0.2em', color: '#d4a96a', margin: '8px 0 0', textTransform: 'uppercase' }}>
                {inademen ? 'Adem in' : 'Adem uit'}
              </p>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#a08070', margin: 0 }}>
            Ronde {Math.min(stap.ronde, klaarNa)} van {klaarNa} · nog {minOver}
          </p>
          <button onClick={() => { setStatus('klaar'); try { window.speechSynthesis?.cancel() } catch { /* */ } }} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 999, border: '1px solid rgba(196,137,106,0.3)', background: 'transparent', color: '#c4896a', fontFamily: sans, fontSize: 13, cursor: 'pointer' }}>
            Stoppen
          </button>
        </div>
      )}

      {status === 'klaar' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', marginBottom: 24, background: 'radial-gradient(circle, rgba(220,175,100,0.4) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 22, color: '#f5ede8', margin: 0 }}>Rust</p>
          </div>
          <h2 style={{ fontFamily: serif, fontSize: 24, color: '#f5ede8', margin: '0 0 8px' }}>Goed gedaan</h2>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: '#a08070', margin: '0 0 24px', maxWidth: 260 }}>
            {Math.min(stap.ronde, klaarNa)} rondes rustig geademd. Merk even op hoe je lijf nu voelt, voordat je verder gaat.
          </p>
          <button onClick={onSluit} style={{ padding: '13px 36px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: sans, fontSize: 14, fontWeight: 600, color: '#1a0d08', background: 'linear-gradient(135deg, #d4a96a, #c4896a)' }}>
            Klaar
          </button>
        </div>
      )}
    </div>
  )
}
