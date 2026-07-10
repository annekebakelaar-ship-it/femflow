import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'react-feather'

// Cycluskalender: tik de dagen aan dat je bloedt. Gemaakt voor onregelmatige
// cycli (perimenopauze, spiraal) — geen aannames, gewoon markeren wat er
// gebeurde. Ovari-stijl: espresso, umber-kaart, warm ochre voor bloed-dagen,
// Cinzel voor de maandtitel.

const OCHRE = '#D4A373', PARCHMENT = '#F5F2EB', MUTED = '#A8998A', DIM = '#6B5D52'
const serif = "'Cinzel', Georgia, serif"
const sans = "'Hanken Grotesk', system-ui, sans-serif"

const MAANDEN = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December']
const DAGLETTERS = ['M', 'D', 'W', 'D', 'V', 'Z', 'Z']

const iso = (d) => {
  const j = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dg = String(d.getDate()).padStart(2, '0')
  return `${j}-${m}-${dg}`
}

// Weken (ma-start) voor een maand; null = vulcel buiten de maand
function weken(jaar, maand) {
  const eerste = new Date(jaar, maand, 1)
  const dagen = new Date(jaar, maand + 1, 0).getDate()
  const offset = (eerste.getDay() + 6) % 7 // ma=0
  const cellen = [...Array(offset).fill(null), ...Array.from({ length: dagen }, (_, i) => i + 1)]
  while (cellen.length % 7 !== 0) cellen.push(null)
  const rijen = []
  for (let i = 0; i < cellen.length; i += 7) rijen.push(cellen.slice(i, i + 7))
  return rijen
}

export default function CyclusKalender({ dagen = [], onToggle }) {
  const nu = new Date()
  const [jaar, setJaar] = useState(nu.getFullYear())
  const [maand, setMaand] = useState(nu.getMonth())

  const set = new Set(dagen)
  const vandaagIso = iso(nu)
  const inToekomst = (d) => d > vandaagIso

  function vorige() { maand === 0 ? (setMaand(11), setJaar(jaar - 1)) : setMaand(maand - 1) }
  function volgende() { maand === 11 ? (setMaand(0), setJaar(jaar + 1)) : setMaand(maand + 1) }
  const magVolgende = jaar < nu.getFullYear() || (jaar === nu.getFullYear() && maand < nu.getMonth())

  return (
    <div style={{ background: 'rgba(45,38,35,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: 22, padding: '18px 16px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
      {/* Maandnavigatie */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button onClick={vorige} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(212,163,115,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={16} color={MUTED} />
        </button>
        <p style={{ fontFamily: serif, fontSize: 17, letterSpacing: '0.06em', color: PARCHMENT, margin: 0 }}>
          {MAANDEN[maand]} {jaar}
        </p>
        <button onClick={volgende} disabled={!magVolgende} style={{ width: 34, height: 34, borderRadius: '50%', background: magVolgende ? 'rgba(212,163,115,0.1)' : 'transparent', border: 'none', cursor: magVolgende ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={16} color={magVolgende ? MUTED : 'rgba(168,153,138,0.25)'} />
        </button>
      </div>

      {/* Dagletters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {DAGLETTERS.map((l, i) => (
          <span key={i} style={{ textAlign: 'center', fontFamily: sans, fontSize: 10, letterSpacing: '0.1em', color: DIM }}>{l}</span>
        ))}
      </div>

      {/* Dagen */}
      {weken(jaar, maand).map((rij, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {rij.map((dag, ci) => {
            if (!dag) return <span key={ci} />
            const datum = iso(new Date(jaar, maand, dag))
            const bloed = set.has(datum)
            const vandaag = datum === vandaagIso
            const toekomst = inToekomst(datum)
            return (
              <button
                key={ci}
                onClick={() => !toekomst && onToggle(datum)}
                disabled={toekomst}
                style={{
                  width: 38, height: 38, margin: '0 auto', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: toekomst ? 'default' : 'pointer',
                  fontFamily: sans, fontSize: 13,
                  background: bloed ? OCHRE : 'transparent',
                  color: bloed ? '#211C1A' : toekomst ? 'rgba(168,153,138,0.3)' : PARCHMENT,
                  fontWeight: bloed ? 600 : 400,
                  border: vandaag && !bloed ? `1px solid ${OCHRE}` : '1px solid transparent',
                  boxShadow: bloed ? '0 2px 10px rgba(212,163,115,0.35)' : 'none',
                  transition: 'background .15s, box-shadow .15s',
                }}
              >
                {dag}
              </button>
            )
          })}
        </div>
      ))}

      <p style={{ fontFamily: sans, fontSize: 11, lineHeight: 1.5, color: DIM, textAlign: 'center', margin: '10px 0 0' }}>
        Tik de dagen dat je bloedt — ook prima als je cyclus onregelmatig is.
      </p>
    </div>
  )
}
