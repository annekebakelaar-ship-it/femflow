import { useState, useEffect } from 'react'
import { ArrowLeft, Camera, Clock, ChevronRight, Compass, Info } from 'react-feather'
import { getWearableReadings } from '../../api/client'
import { getSecure } from '../../utils/secureStorage'
import { PIJLERS, FASE_POETIC, vindActiviteit } from '../../content/leefstijl'
import { leefstijlAdvies, hrvSignaal } from '../../utils/leefstijlAdvies'
import NavV2 from '../../components/NavV2'
import AdemOefening from '../../components/AdemOefening'
import MindfulOefening from '../../components/MindfulOefening'
import VoedingScanner from '../../components/VoedingScanner'
import SupplementSuggestie from '../../components/SupplementSuggestie'
import { openExternal } from '../../utils/openExternal'

// Leefstijl-hub: wat kun je in je vrije tijd doen, gekoppeld aan je fase en
// je herstel. Bovenaan EEN intelligent dagadvies (fase + HRV + slaap +
// symptomen, zie utils/leefstijlAdvies.js), daaronder de vier pijlers met
// verdiepende activiteiten. Detailweergave in-page, zoals de kennisbank.

const serif = "'Playfair Display', Georgia, serif"
const sans = "'Hanken Grotesk', system-ui, sans-serif"

const KAART = { borderRadius: 16, background: 'rgba(20,8,4,0.38)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }

// Activiteiten met een ingebouwde begeleide oefening
const OEFENINGEN = { ademwerk: 'adem', meditatie: 'mindful' }

function berekenFase(menstrualData) {
  if (!menstrualData?.startDate) return null
  const start = new Date(menstrualData.startDate)
  const today = new Date()
  const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24))
  const cycleLength = menstrualData.cycleLength || 28
  const dag = (diffDays % cycleLength) + 1
  const bleed = menstrualData.bleedingDays || 5
  let fase
  if (dag <= bleed) fase = 'Menstruatie'
  else if (dag <= Math.floor(cycleLength * 0.35)) fase = 'Folliculair'
  else if (dag <= Math.floor(cycleLength * 0.5)) fase = 'Ovulatie'
  else fase = 'Luteaal'
  return { fase, dag, cycleLength }
}

// Detailweergave van een activiteit (in-page, met terugknop)
function ActiviteitDetail({ activiteit, faseInfo, onTerug, onStartOefening }) {
  const a = activiteit
  const actueleFase = faseInfo?.fase
  return (
    <div style={{ padding: '0 16px 32px' }}>
      <button onClick={onTerug} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0 16px', color: '#c4896a', fontFamily: sans, fontSize: 14 }}>
        <ArrowLeft size={16} /> Leefstijl
      </button>

      <p style={{ fontSize: 12, letterSpacing: '0.18em', color: '#a08070', margin: '0 0 6px', fontFamily: sans, textTransform: 'uppercase' }}>{a.pijlerNaam}</p>
      <h1 style={{ fontFamily: serif, fontSize: 28, color: '#f5ede8', margin: '0 0 8px', lineHeight: 1.2 }}>{a.titel}</h1>
      <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#d4a96a', margin: '0 0 16px', fontFamily: sans }}>
        <Clock size={13} /> {a.duur}
      </p>

      {/* Fase-fit */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {a.fases.map(f => {
          const nu = f === actueleFase
          return (
            <span key={f} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, fontFamily: sans, background: nu ? 'rgba(196,137,106,0.3)' : 'rgba(196,137,106,0.1)', color: nu ? '#f5ede8' : '#c4896a' }}>
              {FASE_POETIC[f]}{nu ? ' · nu' : ''}
            </span>
          )
        })}
      </div>

      {/* Begeleide oefening: ademwerk (cirkel + tellen) en mindfulness (gesproken begeleiding) */}
      {OEFENINGEN[a.id] && (
        <button onClick={() => onStartOefening(OEFENINGEN[a.id])} style={{ width: '100%', padding: 15, marginBottom: 16, borderRadius: 16, border: 'none', cursor: 'pointer', fontFamily: sans, fontSize: 15, fontWeight: 600, color: '#1a0d08', background: 'linear-gradient(135deg, #d4a96a, #c4896a)', boxShadow: '0 6px 24px rgba(212,169,106,0.3)' }}>
          Start de begeleide oefening
        </button>
      )}

      <div style={{ ...KAART, padding: 18, marginBottom: 16 }}>
        <p style={{ fontSize: 12, letterSpacing: '0.14em', color: '#a08070', margin: '0 0 8px', fontFamily: sans }}>WAAROM DIT WERKT</p>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: '#f5ede8', margin: 0, fontFamily: sans }}>{a.waarom}</p>
      </div>

      {a.uitleg.map((par, i) => (
        <p key={i} style={{ fontSize: 14, lineHeight: 1.7, color: '#d8c7ba', margin: '0 0 14px', fontFamily: sans }}>{par}</p>
      ))}

      <div style={{ ...KAART, padding: 18, margin: '6px 0 16px' }}>
        <p style={{ fontSize: 12, letterSpacing: '0.14em', color: '#a08070', margin: '0 0 10px', fontFamily: sans }}>ZO BEGIN JE</p>
        {a.stappen.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < a.stappen.length - 1 ? 10 : 0 }}>
            <span style={{ fontFamily: serif, color: '#c4896a', fontSize: 14, lineHeight: 1.5, flexShrink: 0 }}>{i + 1}.</span>
            <span style={{ fontSize: 13, lineHeight: 1.55, color: '#f5ede8', fontFamily: sans }}>{s}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, padding: 16, borderRadius: 16, background: 'rgba(212,169,106,0.08)' }}>
        <Info size={15} color="#d4a96a" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, lineHeight: 1.6, color: '#d8c7ba', margin: 0, fontFamily: sans }}>{a.nuance}</p>
      </div>
    </div>
  )
}

// Persoonlijke begeleiding: interesse-kaart onder de Kracht-pijler.
// Loopt via de bestaande Ovari-WhatsApp-lijn; het gtag-event (consent-gated,
// zelfde patroon als youcaps_cta_click) maakt de vraag meetbaar zodat duidelijk
// wordt of een echte PT-samenwerking het uitbouwen waard is.
function PTKaart() {
  function vraagAan() {
    if (typeof window.gtag === 'function') window.gtag('event', 'pt_interesse', { source: 'leefstijl_hub' })
    const tekst = encodeURIComponent('Hoi! Ik gebruik Ovari en heb interesse in online personal training die rekening houdt met mijn cyclus.')
    openExternal(`https://wa.me/31617261463?text=${tekst}`)
  }
  return (
    <div style={{ ...KAART, margin: '12px 16px 0', padding: 18, border: '1px solid rgba(212,169,106,0.2)' }}>
      <p style={{ fontSize: 12, letterSpacing: '0.14em', color: '#d4a96a', margin: '0 0 6px', fontFamily: sans }}>PERSOONLIJKE BEGELEIDING</p>
      <p style={{ fontFamily: serif, fontSize: 17, color: '#f5ede8', margin: '0 0 6px' }}>Liever iemand die meekijkt?</p>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: '#a08070', margin: '0 0 14px', fontFamily: sans }}>
        Online begeleiding van een personal trainer die rekening houdt met je cyclus en de overgang. Stuur een berichtje, dan nemen we persoonlijk contact op.
      </p>
      <button onClick={vraagAan} style={{ padding: '12px 22px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: sans, fontSize: 13, fontWeight: 600, color: '#1a0d08', background: 'linear-gradient(135deg, #d4a96a, #c4896a)' }}>
        Vraag via WhatsApp
      </button>
    </div>
  )
}

export default function LifestyleHub() {
  const [menstrualData, setMenstrualData] = useState(null)
  const [symptomen, setSymptomen] = useState([])
  const [readings, setReadings] = useState([])
  const [openId, setOpenId] = useState(null)
  const [oefening, setOefening] = useState(null)   // 'adem' | 'mindful' | null

  useEffect(() => {
    setMenstrualData(getSecure('menstruation_data'))
    setSymptomen(getSecure('symptom_log') || [])
    getWearableReadings(30)
      .then(r => setReadings(r.data || []))
      .catch(() => {})
  }, [])

  const faseInfo = berekenFase(menstrualData)
  const laatste = [...readings].reverse().find(r => r.sleep_duration_min != null) || {}
  const slaapUur = laatste.sleep_duration_min != null ? +(laatste.sleep_duration_min / 60).toFixed(1) : null

  const advies = leefstijlAdvies({ faseInfo, readings, symptomen, slaapUur })
  const adviesAct = vindActiviteit(advies.activiteitId)
  const { vandaag: hrvNu } = hrvSignaal(readings)
  const open = openId ? vindActiviteit(openId) : null

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', background: '#0a0402', fontFamily: sans }}>
      <style>{`
        .fp-noscroll { scrollbar-width: none; -ms-overflow-style: none; }
        .fp-noscroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%', maxWidth: 420, minHeight: '100vh', background: '#110806' }}>

        <div className="fp-noscroll" style={{ flex: 1, overflowY: 'auto' }}>
          {open ? (
            <div style={{ paddingTop: 20 }}>
              <ActiviteitDetail activiteit={open} faseInfo={faseInfo} onTerug={() => setOpenId(null)} onStartOefening={(type) => setOefening(type)} />
            </div>
          ) : (
            <div style={{ paddingBottom: 24 }}>
              {/* Kop */}
              <div style={{ padding: '24px 16px 4px' }}>
                <p style={{ fontSize: 12, letterSpacing: '0.22em', color: '#a08070', margin: '0 0 4px', fontFamily: sans }}>LEEFSTIJL</p>
                <h1 style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 30, color: '#f5ede8', margin: 0 }}>Goed voor jezelf</h1>
                {faseInfo && (
                  <p style={{ fontSize: 13, color: '#d4a96a', margin: '6px 0 0', fontFamily: sans }}>
                    {FASE_POETIC[faseInfo.fase]} · dag {faseInfo.dag} van {faseInfo.cycleLength}{hrvNu ? ` · HRV ${hrvNu} ms` : ''}
                  </p>
                )}
              </div>

              {/* Dagadvies */}
              <div onClick={() => setOpenId(advies.activiteitId)} style={{ ...KAART, margin: '16px 16px 8px', padding: 18, cursor: 'pointer', border: '1px solid rgba(212,169,106,0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Compass size={14} color="#d4a96a" />
                  <p style={{ fontSize: 12, letterSpacing: '0.14em', color: '#d4a96a', margin: 0, fontFamily: sans }}>ADVIES VOOR VANDAAG</p>
                </div>
                <p style={{ fontFamily: serif, fontSize: 20, color: '#f5ede8', margin: '0 0 6px' }}>{advies.kop}</p>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: '#d8c7ba', margin: '0 0 10px', fontFamily: sans }}>{advies.reden}</p>
                {adviesAct && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#c4896a', margin: 0, fontFamily: sans }}>
                    {adviesAct.titel} · {adviesAct.duur} <ChevronRight size={13} />
                  </p>
                )}
              </div>

              {/* Perimenopauze-nuance, prominent en eerlijk */}
              <div style={{ display: 'flex', gap: 10, margin: '8px 16px 20px', padding: 14, borderRadius: 16, background: 'rgba(212,169,106,0.07)' }}>
                <Info size={14} color="#d4a96a" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, lineHeight: 1.6, color: '#a08070', margin: 0, fontFamily: sans }}>
                  In de perimenopauze wordt je cyclus onregelmatiger. Hoe je je vandaag voelt en je herstel wegen dan zwaarder dan de theoretische fase. Kracht en eiwit blijven het anker, wat je cyclus ook doet.
                </p>
              </div>

              {/* Pijlers */}
              {PIJLERS.map(p => (
                <div key={p.id} style={{ marginBottom: 22 }}>
                  <div style={{ padding: '0 16px', marginBottom: 4 }}>
                    <h2 style={{ fontFamily: serif, fontSize: 20, color: '#f5ede8', margin: '0 0 4px' }}>{p.naam}</h2>
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: '#a08070', margin: 0, fontFamily: sans }}>{p.intro}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 16px 0' }}>
                    {p.activiteiten.map(a => {
                      const nuFit = faseInfo && a.fases.includes(faseInfo.fase)
                      return (
                        <div key={a.id} onClick={() => setOpenId(a.id)} style={{ ...KAART, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 500, color: '#f5ede8', margin: 0, fontFamily: sans }}>{a.titel}</p>
                            <p style={{ fontSize: 12, color: '#a08070', margin: '3px 0 0', fontFamily: sans }}>{a.duur}</p>
                          </div>
                          {nuFit && (
                            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, flexShrink: 0, background: 'rgba(196,137,106,0.18)', color: '#c4896a', fontFamily: sans }}>
                              past bij nu
                            </span>
                          )}
                          <ChevronRight size={15} color="#5a3020" style={{ flexShrink: 0 }} />
                        </div>
                      )
                    })}
                  </div>
                  {p.id === 'kracht' && <PTKaart />}
                  {p.id === 'supplementen' && (
                    // Persoonlijke, data-onderbouwde suggesties (EFSA-only) —
                    // dezelfde motor + YouCaps-funnelmeting als op de home.
                    // Toont zichzelf alleen als eigen data een suggestie draagt.
                    <div style={{ margin: '12px 16px 0' }}>
                      <SupplementSuggestie cyclusFase={faseInfo?.fase || null} />
                    </div>
                  )}
                  {p.id === 'voeding' && (
                    <div onClick={() => setOefening('scanner')} style={{ ...KAART, margin: '12px 16px 0', padding: 18, display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer', border: '1px solid rgba(212,169,106,0.2)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #d4a96a, #c4896a)' }}>
                        <Camera size={17} color="#1a0d08" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: serif, fontSize: 16, color: '#f5ede8', margin: 0 }}>Scan een product</p>
                        <p style={{ fontSize: 12, lineHeight: 1.5, color: '#a08070', margin: '3px 0 0', fontFamily: sans }}>
                          Streepjescode scannen, direct zien wat erin zit — met eerlijke duiding.
                        </p>
                      </div>
                      <ChevronRight size={15} color="#c4896a" style={{ flexShrink: 0 }} />
                    </div>
                  )}
                </div>
              ))}

              <p style={{ fontSize: 11, lineHeight: 1.6, color: '#5a3020', margin: '0 16px', fontFamily: sans }}>
                Algemene leefstijlinformatie, geen medisch advies. Bij aanhoudende klachten: bespreek ze met je huisarts.
              </p>
            </div>
          )}
        </div>

        <NavV2 />

        {/* Begeleide oefeningen + scanner als laag over de hele hub */}
        {oefening === 'adem' && <AdemOefening onSluit={() => setOefening(null)} />}
        {oefening === 'mindful' && <MindfulOefening onSluit={() => setOefening(null)} />}
        {oefening === 'scanner' && <VoedingScanner onSluit={() => setOefening(null)} />}
      </div>
    </div>
  )
}
