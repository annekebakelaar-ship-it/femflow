import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Volume2, VolumeX } from 'react-feather'
import { mindfulPrompts } from '../utils/mindful'
import { spreek, stopSpraak, MEDITATIE_STEM } from '../utils/spreek'
import { startOceaan, stopOceaan } from '../utils/oceaan'

// Begeleide mindfulness voor de Leefstijl-hub: gesproken aanwijzingen
// (vrouwenstem, nl) met stiltes ertussen, een langzaam ademende gloed als
// rustpunt en de lopende aanwijzing in beeld. Duur: 3, 5 of 10 minuten.

const serif = "'Cinzel', Georgia, serif"
const sans = "'Hanken Grotesk', system-ui, sans-serif"

export default function MindfulOefening({ onSluit }) {
  const [status, setStatus] = useState('kies')   // kies | bezig | klaar
  const [duurMin, setDuurMin] = useState(5)
  const [sec, setSec] = useState(0)
  const [geluid, setGeluid] = useState(true)
  const [golven, setGolven] = useState(false)   // achtergrondgeluid, bewust standaard uit
  const [tekst, setTekst] = useState('')
  const geluidRef = useRef(true)
  const promptsRef = useRef([])
  const wakeLockRef = useRef(null)

  // Golfgeluid volgt de sessie: aan bij start (indien gekozen), uit daarna
  useEffect(() => {
    if (status === 'bezig' && golven) startOceaan()
    else stopOceaan()
  }, [status, golven])
  useEffect(() => () => stopOceaan(0), [])

  // Scherm aanhouden tijdens de sessie (waar ondersteund)
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

  useEffect(() => {
    if (status !== 'bezig') return
    const t = setInterval(() => setSec(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [status])

  const totaal = duurMin * 60

  // Aanwijzingen op hun moment uitspreken en in beeld zetten
  useEffect(() => {
    if (status !== 'bezig') return
    if (sec >= totaal) { setStatus('klaar'); stopSpraak(); return }
    const prompt = promptsRef.current.find(p => p.sec === sec)
    if (prompt) {
      setTekst(prompt.tekst)
      if (geluidRef.current) spreek(prompt.tekst, MEDITATIE_STEM)
    }
  }, [sec, status, totaal])

  useEffect(() => () => stopSpraak(), [])

  const start = useCallback(() => {
    promptsRef.current = mindfulPrompts(duurMin)
    setSec(0)
    setTekst('')
    setStatus('bezig')
  }, [duurMin])

  function toggleGeluid() {
    setGeluid(g => {
      geluidRef.current = !g
      if (g) stopSpraak()
      return !g
    })
  }

  const over = Math.max(0, totaal - sec)
  const minOver = `${Math.floor(over / 60)}:${String(over % 60).padStart(2, '0')}`

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', background: '#1a1614', fontFamily: sans }}>
      <style>{`
        @keyframes mfAdem { 0%, 100% { transform: scale(0.85); opacity: 0.7; } 50% { transform: scale(1.08); opacity: 1; } }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 0' }}>
        <button onClick={onSluit} style={{ background: 'rgba(212,163,115,0.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={16} color="#A8998A" />
        </button>
        {status === 'bezig' && (
          <button onClick={toggleGeluid} style={{ background: 'rgba(212,163,115,0.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {geluid ? <Volume2 size={16} color="#D4A373" /> : <VolumeX size={16} color="#A8998A" />}
          </button>
        )}
      </div>

      {status === 'kies' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, letterSpacing: '0.22em', color: '#A8998A', margin: '0 0 8px' }}>MINDFULNESS</p>
          <h1 style={{ fontFamily: serif, fontSize: 30, color: '#F5F2EB', margin: '0 0 10px' }}>Even niets</h1>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: '#A8998A', margin: '0 0 28px', maxWidth: 280 }}>
            Een rustige stem begeleidt je, met stiltes ertussen. Zoek een plek waar je even niet gestoord wordt.
          </p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {[3, 5, 10].map(m => (
              <button key={m} onClick={() => setDuurMin(m)} style={{ padding: '10px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: sans, fontSize: 14, background: duurMin === m ? 'rgba(212,163,115,0.35)' : 'rgba(212,163,115,0.1)', color: duurMin === m ? '#F5F2EB' : '#A8998A' }}>
                {m} min
              </button>
            ))}
          </div>

          {/* Achtergrondgeluid: eerlijk gebracht en standaard uit */}
          <button onClick={() => setGolven(g => !g)} style={{ padding: '9px 18px', borderRadius: 999, marginBottom: 8, border: `1px solid ${golven ? 'rgba(212,163,115,0.5)' : 'rgba(212,163,115,0.2)'}`, cursor: 'pointer', fontFamily: sans, fontSize: 13, background: golven ? 'rgba(212,163,115,0.18)' : 'transparent', color: golven ? '#F5F2EB' : '#A8998A' }}>
            Zacht golfgeluid: {golven ? 'aan' : 'uit'}
          </button>
          <p style={{ fontSize: 11, lineHeight: 1.5, color: '#6B5D52', margin: '0 0 24px', maxWidth: 260 }}>
            Stilte is de oefening; geluid mag als het je helpt te beginnen.
          </p>

          <button onClick={start} style={{ padding: '16px 48px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: sans, fontSize: 15, fontWeight: 600, color: '#211C1A', background: 'linear-gradient(135deg, #DFB88A, #D4A373)', boxShadow: '0 6px 24px rgba(212,163,115,0.35)' }}>
            Start
          </button>
        </div>
      )}

      {status === 'bezig' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
          {/* Langzaam ademende gloed als rustpunt voor de ogen */}
          <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(223,184,138,0.4) 0%, rgba(200,152,100,0.18) 55%, transparent 75%)', filter: 'blur(8px)', animation: 'mfAdem 9s ease-in-out infinite' }} />
            <p style={{ position: 'relative', fontFamily: serif, fontSize: 30, color: '#F5F2EB', margin: 0, zIndex: 2 }}>{minOver}</p>
          </div>
          <p style={{ fontFamily: serif, fontSize: 17, lineHeight: 1.6, color: '#D9CFC2', margin: '0 0 28px', minHeight: 80, maxWidth: 300 }}>
            {tekst || 'Maak het je gemakkelijk.'}
          </p>
          <button onClick={() => { setStatus('klaar'); stopSpraak() }} style={{ padding: '10px 24px', borderRadius: 999, border: '1px solid rgba(212,163,115,0.3)', background: 'transparent', color: '#D4A373', fontFamily: sans, fontSize: 13, cursor: 'pointer' }}>
            Stoppen
          </button>
        </div>
      )}

      {status === 'klaar' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', marginBottom: 24, background: 'radial-gradient(circle, rgba(223,184,138,0.4) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: serif, fontSize: 22, color: '#F5F2EB', margin: 0 }}>Stil</p>
          </div>
          <h2 style={{ fontFamily: serif, fontSize: 24, color: '#F5F2EB', margin: '0 0 8px' }}>Goed gedaan</h2>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: '#A8998A', margin: '0 0 24px', maxWidth: 260 }}>
            Neem dit tempo even mee de rest van je dag in.
          </p>
          <button onClick={onSluit} style={{ padding: '13px 36px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: sans, fontSize: 14, fontWeight: 600, color: '#211C1A', background: 'linear-gradient(135deg, #DFB88A, #D4A373)' }}>
            Klaar
          </button>
        </div>
      )}
    </div>
  )
}
