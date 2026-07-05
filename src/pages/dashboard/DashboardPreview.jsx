import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, BarChart2, BookOpen, Menu, Bell, ChevronRight, Droplet,
  Moon, Heart, Thermometer, Zap, TrendingUp, User, Settings, LogOut, ChevronDown,
} from 'react-feather'
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts'
import { getWearableReadings, clearToken } from '../../api/client'
import { getSecure } from '../../utils/secureStorage'
import heroImg from '../../assets/figma-hero.png'

// Dashboard in de Figma-stijl, gewired aan echte data + routes.
// Op /preview tot Danib akkoord is om /dashboard hierheen te wijzen.

const serif = "'Cinzel', Georgia, serif"
const sans = "'Hanken Grotesk', system-ui, sans-serif"

// Klinische fase -> poëtische naam (zelfde mapping als de CycleBloom)
const POETIC = { Menstruatie: 'Herstel', Folliculair: 'Opbouw', Ovulatie: 'Verbind', Luteaal: 'Verhelder' }

// Alle gelogde menstruatiestarts (startDate + bleeding-entries), oplopend
function alleStarts(md) {
  if (!md?.startDate) return []
  return [
    new Date(md.startDate),
    ...(md.entries || []).filter(e => e.bleeding && e.date).map(e => new Date(e.date)),
  ].sort((a, b) => a - b)
}

// Vorige cycluslengte = dagen tussen de laatste twee gelogde starts
function vorigeCycluslengte(md) {
  const s = alleStarts(md)
  if (s.length < 2) return null
  return Math.round((s[s.length - 1] - s[s.length - 2]) / (1000 * 60 * 60 * 24))
}

// Dagen sinds de laatste symptoomlog (null = nog nooit gelogd)
function dagenSindsLog(log) {
  if (!log?.length) return null
  const laatste = Math.max(...log.map(e => new Date(e.date).getTime()))
  return Math.floor((Date.now() - laatste) / (1000 * 60 * 60 * 24))
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
  return { fase, dag, cycleLength }
}

const DAGEN = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']

function CycleHero({ faseInfo, onClick }) {
  const poetic = faseInfo ? POETIC[faseInfo.fase] : 'Welkom'
  return (
    <div onClick={onClick} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, height: 320, cursor: 'pointer' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,163,115,0.2) 0%, transparent 70%)' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 260, height: 260, marginTop: 80 }}>
        <div style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', width: 252, height: 252, border: '1px solid rgba(212,163,115,0.25)', boxShadow: '0 0 22px 4px rgba(212,163,115,0.12)' }} />
        <div style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', width: 160, height: 160, background: 'radial-gradient(circle, rgba(223,184,138,0.45) 0%, rgba(200,152,100,0.2) 45%, transparent 70%)', filter: 'blur(14px)' }} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <p style={{ fontSize: 12, marginBottom: 8, color: 'rgba(230,212,190,0.75)', letterSpacing: '0.25em', fontFamily: sans }}>
            {faseInfo ? `${faseInfo.fase.toUpperCase()} FASE` : 'JE CYCLUS'}
          </p>
          <p style={{ fontFamily: serif, fontSize: 48, lineHeight: 1, color: '#F5F2EB', textShadow: '0 0 40px rgba(212,163,115,0.55), 0 2px 24px rgba(0,0,0,0.5)', margin: 0 }}>
            {poetic}
          </p>
          <p style={{ fontSize: 14, marginTop: 8, color: '#DFB88A', fontFamily: sans }}>
            {faseInfo ? `Dag ${faseInfo.dag} / ${faseInfo.cycleLength}` : 'Stel je cyclus in'}
          </p>
        </div>
      </div>
    </div>
  )
}

function PhaseCard({ faseInfo, onClick }) {
  return (
    <div onClick={onClick} style={{ margin: '0 16px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'rgba(45,38,35,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', cursor: 'pointer' }}>
      <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #B08050, #E5C297, #D4A373)', boxShadow: '0 4px 14px rgba(220,160,80,0.35)' }}>
        <Droplet size={22} color="#F5F2EB" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 12, margin: '0 0 2px 0', color: '#A8998A', fontFamily: sans }}>{faseInfo ? `Dag ${faseInfo.dag}` : 'Cyclus'}</p>
        <p style={{ fontWeight: 600, fontSize: 16, margin: 0, color: '#F5F2EB', fontFamily: serif }}>{faseInfo ? faseInfo.fase : 'Nog niet ingesteld'}</p>
        <p style={{ fontSize: 12, margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: 4, color: '#D4A373', fontFamily: sans }}>
          Bekijk inzichten <ChevronRight size={12} />
        </p>
      </div>
    </div>
  )
}

function HRVCard({ hrv, weeklyHRV, onCard, onLog, onLearn }) {
  return (
    <div style={{ margin: '0 16px', borderRadius: 16, padding: 20, background: 'rgba(45,38,35,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div onClick={onCard} style={{ cursor: 'pointer' }}>
          <p style={{ fontSize: 12, marginBottom: 4, color: '#A8998A', letterSpacing: '0.14em', fontFamily: sans }}>HARTRITME VARIABILITEIT</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            <span style={{ fontFamily: serif, fontSize: 52, lineHeight: 1, color: '#F5F2EB', fontWeight: 700 }}>{hrv ?? '—'}</span>
            <span style={{ fontSize: 16, marginBottom: 6, color: '#D4A373', fontFamily: sans }}>ms</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button onClick={onLog} style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#D4A373', border: 'none', cursor: 'pointer' }}>
            <Droplet size={16} color="#F5F2EB" />
          </button>
          <button onClick={onLearn} style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DFB88A', border: 'none', cursor: 'pointer' }}>
            <BookOpen size={16} color="#211C1A" />
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={weeklyHRV}>
          <defs>
            <linearGradient id="hrvG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4A373" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#D4A373" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="dag" axisLine={false} tickLine={false} tick={{ fill: '#A8998A', fontSize: 10 }} />
          <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
          <Tooltip contentStyle={{ background: '#2D2623', border: 'none', borderRadius: 10, color: '#F5F2EB', fontSize: 12 }} />
          <Area type="monotone" dataKey="hrv" stroke="#D4A373" strokeWidth={2} fill="url(#hrvG)" dot={false} connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function StatsRow({ stats }) {
  return (
    <div style={{ margin: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {stats.map(({ icon: Icon, label, value, unit }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 12, background: 'rgba(45,38,35,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(212,163,115,0.18)' }}>
            <Icon size={14} color="#D4A373" />
          </div>
          <div>
            <p style={{ fontSize: 12, margin: 0, color: '#A8998A', fontFamily: sans }}>{label}</p>
            <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2, margin: 0, color: '#F5F2EB', fontFamily: sans }}>
              {value} <span style={{ fontSize: 12, fontWeight: 400, color: '#A8998A' }}>{unit}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function CycleOverview({ faseInfo, cycleData }) {
  const phases = [
    { label: 'Mens.', key: 'Menstruatie' }, { label: 'Follic.', key: 'Folliculair' },
    { label: 'Ovul.', key: 'Ovulatie' }, { label: 'Luteaal', key: 'Luteaal' },
  ]
  const actief = faseInfo?.fase
  return (
    <div style={{ margin: '0 16px', borderRadius: 16, padding: 20, background: 'rgba(45,38,35,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: '#F5F2EB', fontFamily: serif }}>Cyclus overzicht</p>
        <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 999, background: 'rgba(212,163,115,0.15)', color: '#D4A373', fontFamily: sans }}>
          {faseInfo ? `${faseInfo.cycleLength} dagen` : '—'}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={70}>
        <AreaChart data={cycleData}>
          <defs>
            <linearGradient id="cycG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DFB88A" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#DFB88A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis hide /><YAxis hide />
          <Area type="monotone" dataKey="v" stroke="#DFB88A" strokeWidth={2} fill="url(#cycG)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        {phases.map(({ label, key }) => {
          const on = actief === key
          return (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', margin: '0 auto 4px auto', background: on ? '#D4A373' : '#6B5D52' }} />
              <p style={{ fontSize: 12, margin: 0, color: on ? '#D4A373' : '#6B5D52', fontFamily: sans }}>{label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InsightCard({ icon: Icon, title, desc, badge, onClick }) {
  return (
    <div onClick={onClick} style={{ borderRadius: 16, padding: 16, flexShrink: 0, background: 'rgba(45,38,35,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', width: 210, cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,163,115,0.15)' }}>
          <Icon size={14} color="#D4A373" />
        </div>
        <p style={{ fontSize: 14, fontWeight: 500, flex: 1, margin: 0, color: '#F5F2EB', fontFamily: sans }}>{title}</p>
        <span style={{ fontSize: 12, padding: '2px 6px', borderRadius: 999, background: 'rgba(212,163,115,0.12)', color: '#D4A373', fontFamily: sans }}>{badge}</span>
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0, color: '#A8998A', fontFamily: sans }}>{desc}</p>
    </div>
  )
}

export default function DashboardPreview() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
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

  // Laatste meting met data
  const laatste = [...readings].reverse().find(r => r.hrv_ms != null) || readings[readings.length - 1] || {}
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
    { icon: Moon, label: 'Slaap', value: slaapU ?? '—', unit: slaapU ? 'uur' : '' },
    { icon: Thermometer, label: 'Temp.', value: temp ?? '—', unit: temp ? '°C' : '' },
    { icon: Zap, label: 'Energie', value: energie, unit: '' },
  ]

  // Echte cyclus-curve uit je HRV-verloop (laatste ~30 dagen); de fase-stip
  // eronder volgt je huidige fase. Geen data -> zachte illustratieve curve.
  const hrvReeks = readings.filter(r => r.hrv_ms != null).map((r, i) => ({ day: i, v: Math.round(r.hrv_ms) }))
  const cycleData = hrvReeks.length >= 3 ? hrvReeks : [
    { day: 1, v: 42 }, { day: 5, v: 35 }, { day: 10, v: 55 },
    { day: 14, v: 72 }, { day: 18, v: 60 }, { day: 24, v: 50 }, { day: 28, v: 44 },
  ]

  // Persoonlijk: voorletter + vorige cycluslengte
  const initiaal = (menstrualData?.name || '').trim().charAt(0).toUpperCase() || '•'
  const vorigeLengte = vorigeCycluslengte(menstrualData)
  const vorigeDesc = vorigeLengte
    ? `Je vorige cyclus was ${vorigeLengte} dagen. Vergelijk nu.`
    : 'Bekijk je cyclus-analyse en vergelijk.'

  // Meldingen voor de bel — afgeleid uit echte data, geen backend nodig
  const meldingen = []
  if (faseInfo) {
    const over = faseInfo.cycleLength - faseInfo.dag + 1
    meldingen.push({ icon: Droplet, tekst: over <= 0 ? 'Je menstruatie wordt nu verwacht' : `Volgende menstruatie over ${over} dag${over === 1 ? '' : 'en'}` })
  }
  const dSinds = dagenSindsLog(symptomLog)
  if (dSinds == null) meldingen.push({ icon: BookOpen, tekst: 'Nog geen symptomen gelogd' })
  else if (dSinds >= 2) meldingen.push({ icon: BookOpen, tekst: `${dSinds} dagen niet gelogd` })
  if (hrv != null) meldingen.push({ icon: Heart, tekst: `Je HRV vandaag: ${hrv} ms` })

  function logout() { clearToken(); navigate('/') }

  const navItems = [
    { icon: Home, label: 'Home', to: '/dashboard' },
    { icon: BarChart2, label: 'Stats', to: '/dashboard/progress' },
    { icon: BookOpen, label: 'Logboek', to: '/health/symptoms' },
    { icon: Menu, label: 'Meer', to: '/menu' },
  ]

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', background: '#1a1614', fontFamily: sans }}>
      <style>{`
        .fp-noscroll { scrollbar-width: none; -ms-overflow-style: none; }
        .fp-noscroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%', maxWidth: 420, minHeight: '100vh', background: '#211c1a' }}>
        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #D4A373, #8F6A44)' }} />
            <span style={{ fontFamily: serif, color: '#F5F2EB', fontSize: 16 }}>Ovari</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setBellOpen(!bellOpen); setAvatarOpen(false) }} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'rgba(212,163,115,0.1)', border: 'none', cursor: 'pointer' }}>
                <Bell size={14} color="#A8998A" />
                {meldingen.length > 0 && <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#D4A373' }} />}
              </button>
              {bellOpen && (
                <div style={{ position: 'absolute', right: 0, top: 40, borderRadius: 16, padding: '8px 0', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', zIndex: 50, background: '#2D2623', width: 240 }}>
                  <p style={{ fontSize: 11, letterSpacing: '0.1em', color: '#A8998A', margin: '4px 16px 8px', fontFamily: sans }}>MELDINGEN</p>
                  {meldingen.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#A8998A', margin: '0 16px 6px', fontFamily: sans }}>Niets nieuws.</p>
                  ) : meldingen.map(({ icon: Icon, tekst }, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px' }}>
                      <Icon size={14} color="#D4A373" />
                      <span style={{ fontSize: 13, color: '#F5F2EB', fontFamily: sans }}>{tekst}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setAvatarOpen(!avatarOpen); setBellOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 4, borderRadius: 999, padding: '4px 6px', background: 'rgba(212,163,115,0.1)', border: 'none', cursor: 'pointer' }}>
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
        </div>

        {/* Scrollgebied */}
        <div className="fp-noscroll" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          <img src={heroImg} alt="" aria-hidden style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 560, objectFit: 'cover', objectPosition: 'center 20%', pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 560, pointerEvents: 'none', zIndex: 1, background: 'linear-gradient(to bottom, rgba(10,4,2,0.5) 0%, rgba(10,4,2,0.15) 30%, rgba(17,8,6,0.55) 65%, rgba(17,8,6,1) 100%)' }} />

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24, zIndex: 2 }}>
            <CycleHero faseInfo={faseInfo} onClick={() => navigate(faseInfo ? '/health/cycle-analytics' : '/health/menstruation')} />
            <PhaseCard faseInfo={faseInfo} onClick={() => navigate('/health/cycle-analytics')} />
            <HRVCard
              hrv={hrv}
              weeklyHRV={weeklyData}
              onCard={() => navigate('/wearable/hrv-insights')}
              onLog={() => navigate('/health/menstruation')}
              onLearn={() => navigate('/dashboard/learning')}
            />
            <StatsRow stats={stats} />
            <CycleOverview faseInfo={faseInfo} cycleData={cycleData} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: '#F5F2EB', fontFamily: serif }}>Inzichten</p>
                <p onClick={() => navigate('/dashboard/learning')} style={{ fontSize: 12, margin: 0, color: '#D4A373', fontFamily: sans, cursor: 'pointer' }}>Alles</p>
              </div>
              <div className="fp-noscroll" style={{ display: 'flex', gap: 12, padding: '0 16px', overflowX: 'auto' }}>
                <InsightCard icon={Droplet} title="Hydratatie" desc="Drink meer water tijdens je menstruatie." badge="Tip" onClick={() => navigate('/dashboard/learning')} />
                <InsightCard icon={BookOpen} title="Dagboek" desc="3 dagen niet gelogd. Voeg symptomen toe." badge="Reminder" onClick={() => navigate('/health/symptoms')} />
                <InsightCard icon={TrendingUp} title="Vorige cyclus" desc={vorigeDesc} badge="Inzicht" onClick={() => navigate('/health/cycle-analytics')} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-nav */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '12px 16px 24px', background: 'rgba(26,22,20,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          {navItems.map(({ icon: Icon, label, to }, i) => (
            <button key={label} onClick={() => { setActiveTab(i); navigate(to) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeTab === i ? 'rgba(212,163,115,0.16)' : 'transparent' }}>
                <Icon size={20} color={activeTab === i ? '#D4A373' : '#574B41'} />
              </div>
              <span style={{ fontSize: 12, color: activeTab === i ? '#D4A373' : '#574B41', fontFamily: sans }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
