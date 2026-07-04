import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Compass, Droplet, Heart, Moon, Thermometer, Zap,
  User, Settings, LogOut, ChevronDown, ChevronRight,
} from 'react-feather'
import NavV2 from '../../components/NavV2'
import { leefstijlAdvies } from '../../utils/leefstijlAdvies'
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts'
import { getWearableReadings, clearToken } from '../../api/client'
import { getSecure } from '../../utils/secureStorage'
import wordmarkImg from '../../assets/ovari-wordmark.png'
import ringImg from '../../assets/ovari-ring.png'

// V2-homepage: de RUSTIGE variant van het dashboard. Zelfde palet en
// designtaal als DashboardPreview, maar elk gegeven staat er nog maar
// EEN keer op: hero (fase), dunne cycluslijn, een HRV-kaart, een stille
// statregel en een contextuele inzichtkaart. Geen bel, geen dubbele
// grafieken, geen horizontale scroll-strip.
// Preview op /preview-v2; na akkoord wijst /dashboard hierheen.

const serif = "'Playfair Display', Georgia, serif"
const sans = "'Hanken Grotesk', system-ui, sans-serif"

const POETIC = { Menstruatie: 'Herstel', Folliculair: 'Opbouw', Ovulatie: 'Verbind', Luteaal: 'Verhelder' }

// Rustige, niet-medische fase-teksten voor de contextkaart
const FASE_TIP = {
  Menstruatie: 'Rustig aan vandaag. Warmte en voldoende drinken helpen veel vrouwen door deze dagen.',
  Folliculair: 'Je energie bouwt in deze fase meestal op. Een goed moment om iets nieuws te plannen.',
  Ovulatie: 'Rond de eisprong piekt je energie vaak. Plan gerust iets actiefs.',
  Luteaal: 'Je lichaam vraagt in deze fase vaak om meer rust en regelmaat.',
}

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
  return { fase, dag, cycleLength, bleed }
}

// Dagen sinds de laatste symptoomlog (null = nog nooit gelogd)
function dagenSindsLog(log) {
  if (!log?.length) return null
  const laatste = Math.max(...log.map(e => new Date(e.date).getTime()))
  return Math.floor((Date.now() - laatste) / (1000 * 60 * 60 * 24))
}

const DAGEN = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']

function CycleHero({ faseInfo, onClick }) {
  const poetic = faseInfo ? POETIC[faseInfo.fase] : 'Welkom'
  return (
    <div onClick={onClick} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, paddingTop: 76, paddingBottom: 8, cursor: 'pointer' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,163,115,0.18) 0%, transparent 70%)' }} />

      {/* Faselabel boven de ring */}
      <p style={{ position: 'relative', fontSize: 11, margin: '0 0 10px', color: 'rgba(230,212,190,0.75)', letterSpacing: '0.25em', fontFamily: sans }}>
        {faseInfo ? `${faseInfo.fase.toUpperCase()} FASE` : 'JE CYCLUS'}
      </p>

      {/* Het Ovari-ringembleem IS de cirkel: het fasewoord staat in de opening */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 224, height: 213 }}>
        <img src={ringImg} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.9, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', width: 120, height: 120, background: 'radial-gradient(circle, rgba(223,184,138,0.4) 0%, rgba(200,152,100,0.18) 45%, transparent 70%)', filter: 'blur(12px)' }} />
        <p style={{ position: 'relative', zIndex: 10, fontFamily: serif, fontStyle: 'italic', fontSize: 27, lineHeight: 1, color: '#F5F2EB', textShadow: '0 0 30px rgba(212,163,115,0.55), 0 2px 18px rgba(0,0,0,0.5)', margin: 0 }}>
          {poetic}
        </p>
      </div>

      {/* Dagregel onder de ring */}
      <p style={{ position: 'relative', fontSize: 14, margin: '12px 0 0', color: '#DFB88A', fontFamily: sans }}>
        {faseInfo ? `Dag ${faseInfo.dag} van ${faseInfo.cycleLength}` : 'Stel je cyclus in'}
      </p>
    </div>
  )
}

// Dunne, eerlijke cycluslijn: vier fase-segmenten op schaal, een stip op
// vandaag. Vervangt het oude "Cyclus overzicht" (dat stiekem een tweede
// HRV-grafiek was).
function CycleLijn({ faseInfo, onClick }) {
  if (!faseInfo) return null
  const { dag, cycleLength, bleed } = faseInfo
  const grens = [
    { key: 'Menstruatie', tot: bleed },
    { key: 'Folliculair', tot: Math.floor(cycleLength * 0.35) },
    { key: 'Ovulatie', tot: Math.floor(cycleLength * 0.5) },
    { key: 'Luteaal', tot: cycleLength },
  ]
  let vorige = 0
  const positie = Math.min(100, Math.max(0, ((dag - 0.5) / cycleLength) * 100))
  return (
    <div onClick={onClick} style={{ margin: '0 20px', cursor: 'pointer' }}>
      <div style={{ position: 'relative', height: 4, borderRadius: 999, overflow: 'visible', display: 'flex', gap: 3 }}>
        {grens.map(({ key, tot }) => {
          const breedte = ((tot - vorige) / cycleLength) * 100
          vorige = tot
          const actief = key === faseInfo.fase
          return (
            <div key={key} style={{ width: `${breedte}%`, height: '100%', borderRadius: 999, background: actief ? 'rgba(212,163,115,0.75)' : 'rgba(212,163,115,0.18)' }} />
          )
        })}
        <div style={{ position: 'absolute', left: `${positie}%`, top: '50%', transform: 'translate(-50%, -50%)', width: 10, height: 10, borderRadius: '50%', background: '#E5C297', boxShadow: '0 0 8px 2px rgba(220,170,90,0.5)' }} />
      </div>
    </div>
  )
}

function HRVCard({ hrv, weeklyHRV, onClick }) {
  return (
    <div onClick={onClick} style={{ margin: '0 16px', borderRadius: 16, padding: 20, background: 'rgba(45,38,35,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', cursor: 'pointer' }}>
      <p style={{ fontSize: 12, marginTop: 0, marginBottom: 4, color: '#A8998A', letterSpacing: '0.14em', fontFamily: sans }}>HERSTEL - HRV</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 12 }}>
        <span style={{ fontFamily: serif, fontSize: 52, lineHeight: 1, color: '#F5F2EB', fontWeight: 700 }}>{hrv ?? '—'}</span>
        <span style={{ fontSize: 16, marginBottom: 6, color: '#D4A373', fontFamily: sans }}>ms</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={weeklyHRV}>
          <defs>
            <linearGradient id="hrvG2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4A373" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#D4A373" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="dag" axisLine={false} tickLine={false} tick={{ fill: '#A8998A', fontSize: 10 }} />
          <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
          <Tooltip contentStyle={{ background: '#2D2623', border: 'none', borderRadius: 10, color: '#F5F2EB', fontSize: 12 }} />
          <Area type="monotone" dataKey="hrv" stroke="#D4A373" strokeWidth={2} fill="url(#hrvG2)" dot={false} connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Een stille statregel: een kaart, vier kolommen, geen icoonblokjes
function StatsRij({ stats }) {
  return (
    <div style={{ margin: '0 16px', borderRadius: 16, padding: '14px 8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: 'rgba(45,38,35,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
      {stats.map(({ icon: Icon, label, value, unit }) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <Icon size={13} color="#7a5a44" style={{ marginBottom: 6 }} />
          <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.2, margin: 0, color: '#F5F2EB', fontFamily: sans }}>
            {value}<span style={{ fontSize: 11, fontWeight: 400, color: '#A8998A', marginLeft: 2 }}>{unit}</span>
          </p>
          <p style={{ fontSize: 11, margin: '2px 0 0 0', color: '#A8998A', fontFamily: sans }}>{label}</p>
        </div>
      ))}
    </div>
  )
}

// EEN contextuele kaart: de meest relevante boodschap van dit moment,
// met echte cijfers (geen hardcoded teksten meer).
function ContextKaart({ faseInfo, dSinds, advies, onLog, onFase, onLeefstijl }) {
  let icon = BookOpen, titel, tekst, actie, label = null, actieTekst
  if (dSinds == null) {
    titel = 'Begin je logboek'
    tekst = 'Log je eerste symptomen, dan zie je hier straks je eigen patronen terug.'
    actie = onLog
    actieTekst = 'Open je logboek'
  } else if (dSinds >= 2) {
    titel = 'Even bijwerken'
    tekst = `Je hebt ${dSinds} dagen niet gelogd. Twee tikken en je patroon blijft compleet.`
    actie = onLog
    actieTekst = 'Open je logboek'
  } else if (advies) {
    // Logboek is bij -> het intelligente leefstijl-dagadvies (fase + herstel)
    icon = Compass
    titel = advies.kop
    tekst = advies.reden
    actie = onLeefstijl
    label = 'Leefstijl'
    actieTekst = 'Bekijk in Leefstijl'
  } else if (faseInfo) {
    icon = Droplet
    titel = `${faseInfo.fase}`
    tekst = FASE_TIP[faseInfo.fase]
    actie = onFase
    actieTekst = 'Meer over deze fase'
  } else {
    icon = Droplet
    titel = 'Stel je cyclus in'
    tekst = 'Met je startdatum en cycluslengte wordt dit scherm persoonlijk.'
    actie = onFase
    actieTekst = 'Stel je cyclus in'
  }
  const Icon = icon
  return (
    <div onClick={actie} style={{ margin: '0 16px', borderRadius: 16, padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start', background: 'rgba(45,38,35,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', cursor: 'pointer' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,163,115,0.15)' }}>
        <Icon size={15} color="#D4A373" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px 0', color: '#F5F2EB', fontFamily: serif, flex: 1 }}>{titel}</p>
          {label && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, flexShrink: 0, background: 'rgba(212,163,115,0.15)', color: '#DFB88A', fontFamily: sans }}>{label}</span>}
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.55, margin: 0, color: '#A8998A', fontFamily: sans }}>{tekst}</p>
        {/* Duidelijke actieregel: de hele kaart is tikbaar, dit zegt waarheen */}
        <p style={{ fontSize: 12, margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4, color: '#D4A373', fontFamily: sans }}>
          {actieTekst} <ChevronRight size={12} />
        </p>
      </div>
    </div>
  )
}

export default function DashboardV2Preview() {
  const navigate = useNavigate()
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [menstrualData, setMenstrualData] = useState(null)
  const [symptomLog, setSymptomLog] = useState([])
  const [readings, setReadings] = useState([])

  useEffect(() => {
    setMenstrualData(getSecure('menstruation_data'))
    setSymptomLog(getSecure('symptom_log') || [])
    getWearableReadings(30)
      .then(r => setReadings(r.data || []))
      .catch(() => {})
  }, [])

  const faseInfo = berekenFase(menstrualData)
  const dSinds = dagenSindsLog(symptomLog)

  const laatste = [...readings].reverse().find(r => r.hrv_ms != null) || readings[readings.length - 1] || {}

  // Leefstijl-dagadvies voor de contextkaart (zelfde logica als de hub)
  const dagAdvies = leefstijlAdvies({
    faseInfo,
    readings,
    symptomen: symptomLog,
    slaapUur: laatste.sleep_duration_min != null ? +(laatste.sleep_duration_min / 60).toFixed(1) : null,
  })
  const hrv = laatste.hrv_ms != null ? Math.round(laatste.hrv_ms) : null

  const weeklyHRV = readings.slice(-7).map(r => {
    const raw = r.date || r.reading_date
    return {
      dag: raw ? (DAGEN[new Date(raw).getDay()] || '') : '',
      hrv: r.hrv_ms != null ? Math.round(r.hrv_ms) : null,
    }
  })
  const weeklyData = weeklyHRV.length ? weeklyHRV : [{ dag: '', hrv: null }]

  const rhr = laatste.resting_heart_rate
  const slaapU = laatste.sleep_duration_min != null ? (laatste.sleep_duration_min / 60).toFixed(1) : null
  const temp = laatste.temperature != null ? Number(laatste.temperature).toFixed(1) : null
  const readiness = laatste.readiness
  const energie = readiness == null ? '—' : readiness >= 70 ? 'Hoog' : readiness >= 40 ? 'Goed' : 'Laag'

  const stats = [
    { icon: Heart, label: 'Hartslag', value: rhr ?? '—', unit: rhr ? 'bpm' : '' },
    { icon: Moon, label: 'Slaap', value: slaapU ?? '—', unit: slaapU ? 'u' : '' },
    { icon: Thermometer, label: 'Temp.', value: temp ?? '—', unit: temp ? '°C' : '' },
    { icon: Zap, label: 'Energie', value: energie, unit: '' },
  ]

  const initiaal = (menstrualData?.name || '').trim().charAt(0).toUpperCase() || '•'

  function logout() { clearToken(); navigate('/') }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', background: '#1a1614', fontFamily: sans }}>
      <style>{`
        .fp-noscroll { scrollbar-width: none; -ms-overflow-style: none; }
        .fp-noscroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%', maxWidth: 420, minHeight: '100vh', background: '#211c1a' }}>
        {/* Topbar: OVARI-woordmerk gecentreerd, avatar rechts */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '16px 20px 8px', background: 'linear-gradient(to bottom, rgba(33,28,26,0.85) 0%, transparent 100%)' }}>
          <img src={wordmarkImg} alt="Ovari" style={{ position: 'absolute', left: '50%', top: 19, transform: 'translateX(-50%)', height: 19, width: 'auto' }} />
          <div style={{ position: 'relative' }}>
            <button onClick={() => setAvatarOpen(!avatarOpen)} style={{ display: 'flex', alignItems: 'center', gap: 4, borderRadius: 999, padding: '4px 6px', background: 'rgba(212,163,115,0.1)', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, background: 'linear-gradient(135deg, #D4A373, #6F5238)', color: '#F5F2EB' }}>{initiaal}</div>
              <ChevronDown size={10} color="#A8998A" />
            </button>
            {avatarOpen && (
              <div style={{ position: 'absolute', right: 0, top: 36, borderRadius: 16, padding: '4px 0', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', zIndex: 50, background: '#2D2623', minWidth: 150 }}>
                {[
                  { icon: User, label: 'Profiel', act: () => navigate('/account') },
                  { icon: Settings, label: 'Instellingen', act: () => navigate('/consent') },
                  { icon: LogOut, label: 'Uitloggen', act: logout },
                ].map(({ icon: Icon, label, act }) => (
                  <button key={label} onClick={() => { setAvatarOpen(false); act() }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', color: label === 'Uitloggen' ? '#D4A373' : '#F5F2EB', fontFamily: sans }}>
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scrollgebied — rustige espresso-achtergrond, geen foto meer */}
        <div className="fp-noscroll" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 32, zIndex: 2 }}>
            <CycleHero faseInfo={faseInfo} onClick={() => navigate(faseInfo ? '/health/cycle-analytics' : '/health/menstruation')} />
            <CycleLijn faseInfo={faseInfo} onClick={() => navigate('/health/cycle-analytics')} />
            <HRVCard hrv={hrv} weeklyHRV={weeklyData} onClick={() => navigate('/wearable/hrv-insights')} />
            <StatsRij stats={stats} />
            <ContextKaart
              faseInfo={faseInfo}
              dSinds={dSinds}
              advies={dagAdvies}
              onLog={() => navigate('/health/symptoms')}
              onFase={() => navigate(faseInfo ? '/dashboard/leefstijl' : '/health/menstruation')}
              onLeefstijl={() => navigate('/dashboard/leefstijl')}
            />
          </div>
        </div>

        {/* Bottom-nav: gedeeld met de Leefstijl-hub (vijf tabs) */}
        <NavV2 />
      </div>
    </div>
  )
}
