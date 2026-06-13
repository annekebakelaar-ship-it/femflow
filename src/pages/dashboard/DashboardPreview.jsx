import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, BarChart2, BookOpen, Menu, Bell, ChevronRight, Droplet,
  Moon, Heart, Wind, Zap, TrendingUp, User, Settings, LogOut, ChevronDown,
} from 'react-feather'
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts'
import { getWearableReadings, clearToken } from '../../api/client'
import { getSecure } from '../../utils/secureStorage'
import heroImg from '../../assets/figma-hero.png'

// Dashboard in de Figma-stijl, gewired aan echte data + routes.
// Op /preview tot Danib akkoord is om /dashboard hierheen te wijzen.

const serif = "'Playfair Display', Georgia, serif"
const sans = "'Hanken Grotesk', system-ui, sans-serif"

// Klinische fase -> poëtische naam (zelfde mapping als de CycleBloom)
const POETIC = { Menstruatie: 'Herstel', Folliculair: 'Opbouw', Ovulatie: 'Verbind', Luteaal: 'Verhelder' }

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
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(196,137,106,0.2) 0%, transparent 70%)' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 260, height: 260, marginTop: 80 }}>
        <div style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', width: 252, height: 252, border: '1px solid rgba(212,170,100,0.25)', boxShadow: '0 0 22px 4px rgba(212,160,80,0.12)' }} />
        <div style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', width: 160, height: 160, background: 'radial-gradient(circle, rgba(220,175,100,0.45) 0%, rgba(196,137,80,0.2) 45%, transparent 70%)', filter: 'blur(14px)' }} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <p style={{ fontSize: 12, marginBottom: 8, color: 'rgba(232,200,170,0.75)', letterSpacing: '0.25em', fontFamily: sans }}>
            {faseInfo ? `${faseInfo.fase.toUpperCase()} FASE` : 'JE CYCLUS'}
          </p>
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 48, lineHeight: 1, color: '#f5ede8', textShadow: '0 0 40px rgba(196,137,106,0.55), 0 2px 24px rgba(0,0,0,0.5)', margin: 0 }}>
            {poetic}
          </p>
          <p style={{ fontSize: 14, marginTop: 8, color: '#d4a96a', fontFamily: sans }}>
            {faseInfo ? `Dag ${faseInfo.dag} / ${faseInfo.cycleLength}` : 'Stel je cyclus in'}
          </p>
        </div>
      </div>
    </div>
  )
}

function PhaseCard({ faseInfo, onClick }) {
  return (
    <div onClick={onClick} style={{ margin: '0 16px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'rgba(20,8,4,0.38)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', cursor: 'pointer' }}>
      <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #b06a3a, #e8b87a, #c4896a)', boxShadow: '0 4px 14px rgba(220,160,80,0.35)' }}>
        <Droplet size={22} color="#f5ede8" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 12, margin: '0 0 2px 0', color: '#a08070', fontFamily: sans }}>{faseInfo ? `Dag ${faseInfo.dag}` : 'Cyclus'}</p>
        <p style={{ fontWeight: 600, fontSize: 16, margin: 0, color: '#f5ede8', fontFamily: serif }}>{faseInfo ? faseInfo.fase : 'Nog niet ingesteld'}</p>
        <p style={{ fontSize: 12, margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: 4, color: '#c4896a', fontFamily: sans }}>
          Bekijk inzichten <ChevronRight size={12} />
        </p>
      </div>
    </div>
  )
}

function HRVCard({ hrv, weeklyHRV, onCard, onLog, onLearn }) {
  return (
    <div style={{ margin: '0 16px', borderRadius: 16, padding: 20, background: 'rgba(20,8,4,0.38)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div onClick={onCard} style={{ cursor: 'pointer' }}>
          <p style={{ fontSize: 12, marginBottom: 4, color: '#a08070', letterSpacing: '0.14em', fontFamily: sans }}>HARTRITME VARIABILITEIT</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            <span style={{ fontFamily: serif, fontSize: 52, lineHeight: 1, color: '#f5ede8', fontWeight: 700 }}>{hrv ?? '—'}</span>
            <span style={{ fontSize: 16, marginBottom: 6, color: '#c4896a', fontFamily: sans }}>ms</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button onClick={onLog} style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c4896a', border: 'none', cursor: 'pointer' }}>
            <Droplet size={16} color="#f5ede8" />
          </button>
          <button onClick={onLearn} style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d4a96a', border: 'none', cursor: 'pointer' }}>
            <BookOpen size={16} color="#1a0d08" />
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={weeklyHRV}>
          <defs>
            <linearGradient id="hrvG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c4896a" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#c4896a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="dag" axisLine={false} tickLine={false} tick={{ fill: '#a08070', fontSize: 10 }} />
          <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
          <Tooltip contentStyle={{ background: '#2a1610', border: 'none', borderRadius: 10, color: '#f5ede8', fontSize: 12 }} />
          <Area type="monotone" dataKey="hrv" stroke="#c4896a" strokeWidth={2} fill="url(#hrvG)" dot={false} connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function StatsRow({ stats }) {
  return (
    <div style={{ margin: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {stats.map(({ icon: Icon, label, value, unit }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 12, background: 'rgba(20,8,4,0.38)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(196,137,106,0.18)' }}>
            <Icon size={14} color="#c4896a" />
          </div>
          <div>
            <p style={{ fontSize: 12, margin: 0, color: '#a08070', fontFamily: sans }}>{label}</p>
            <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2, margin: 0, color: '#f5ede8', fontFamily: sans }}>
              {value} <span style={{ fontSize: 12, fontWeight: 400, color: '#a08070' }}>{unit}</span>
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
    <div style={{ margin: '0 16px', borderRadius: 16, padding: 20, background: 'rgba(20,8,4,0.38)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: '#f5ede8', fontFamily: serif }}>Cyclus overzicht</p>
        <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 999, background: 'rgba(196,137,106,0.15)', color: '#c4896a', fontFamily: sans }}>
          {faseInfo ? `${faseInfo.cycleLength} dagen` : '—'}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={70}>
        <AreaChart data={cycleData}>
          <defs>
            <linearGradient id="cycG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4a96a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#d4a96a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis hide /><YAxis hide />
          <Area type="monotone" dataKey="v" stroke="#d4a96a" strokeWidth={2} fill="url(#cycG)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        {phases.map(({ label, key }) => {
          const on = actief === key
          return (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', margin: '0 auto 4px auto', background: on ? '#c4896a' : '#5a3020' }} />
              <p style={{ fontSize: 12, margin: 0, color: on ? '#c4896a' : '#5a3020', fontFamily: sans }}>{label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InsightCard({ icon: Icon, title, desc, badge, onClick }) {
  return (
    <div onClick={onClick} style={{ borderRadius: 16, padding: 16, flexShrink: 0, background: 'rgba(20,8,4,0.38)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', width: 210, cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(196,137,106,0.15)' }}>
          <Icon size={14} color="#c4896a" />
        </div>
        <p style={{ fontSize: 14, fontWeight: 500, flex: 1, margin: 0, color: '#f5ede8', fontFamily: sans }}>{title}</p>
        <span style={{ fontSize: 12, padding: '2px 6px', borderRadius: 999, background: 'rgba(196,137,106,0.12)', color: '#c4896a', fontFamily: sans }}>{badge}</span>
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0, color: '#a08070', fontFamily: sans }}>{desc}</p>
    </div>
  )
}

export default function DashboardPreview() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [menstrualData, setMenstrualData] = useState(null)
  const [readings, setReadings] = useState([])

  useEffect(() => {
    setMenstrualData(getSecure('menstruation_data'))
    getWearableReadings(7)
      .then(r => setReadings(r.data || []))
      .catch(() => {})
  }, [])

  const faseInfo = berekenFase(menstrualData)

  // Laatste meting met data
  const laatste = [...readings].reverse().find(r => r.hrv_ms != null) || readings[readings.length - 1] || {}
  const hrv = laatste.hrv_ms != null ? Math.round(laatste.hrv_ms) : null

  const weeklyHRV = readings.slice(-7).map(r => ({
    dag: DAGEN[new Date(r.date || r.reading_date || Date.now()).getDay()] || '',
    hrv: r.hrv_ms != null ? Math.round(r.hrv_ms) : null,
  }))
  const weeklyData = weeklyHRV.length ? weeklyHRV : [{ dag: '', hrv: null }]

  const rhr = laatste.resting_heart_rate
  const slaapU = laatste.sleep_duration_min != null ? (laatste.sleep_duration_min / 60).toFixed(1) : null
  const readiness = laatste.readiness
  const energie = readiness == null ? '—' : readiness >= 70 ? 'Hoog' : readiness >= 40 ? 'Goed' : 'Laag'

  const stats = [
    { icon: Heart, label: 'Hartslag', value: rhr ?? '—', unit: rhr ? 'bpm' : '' },
    { icon: Moon, label: 'Slaap', value: slaapU ?? '—', unit: slaapU ? 'uur' : '' },
    { icon: Wind, label: 'Adem', value: '—', unit: '' },
    { icon: Zap, label: 'Energie', value: energie, unit: '' },
  ]

  // Illustratieve cyclus-curve (geen dagelijkse hormoonwaarden opgeslagen);
  // de fase-stip eronder volgt wel je echte huidige fase.
  const cycleData = [
    { day: 1, v: 42 }, { day: 5, v: 35 }, { day: 10, v: 55 },
    { day: 14, v: 72 }, { day: 18, v: 60 }, { day: 24, v: 50 }, { day: 28, v: 44 },
  ]

  function logout() { clearToken(); navigate('/') }

  const navItems = [
    { icon: Home, label: 'Home', to: '/dashboard' },
    { icon: BarChart2, label: 'Stats', to: '/dashboard/progress' },
    { icon: BookOpen, label: 'Logboek', to: '/health/symptoms' },
    { icon: Menu, label: 'Meer', to: '/menu' },
  ]

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', background: '#0a0402', fontFamily: sans }}>
      <style>{`
        .fp-noscroll { scrollbar-width: none; -ms-overflow-style: none; }
        .fp-noscroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%', maxWidth: 420, minHeight: '100vh', background: '#110806' }}>
        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #c4896a, #8b4a2c)' }} />
            <span style={{ fontFamily: serif, color: '#f5ede8', fontSize: 16 }}>FemFlow</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'rgba(196,137,106,0.1)', border: 'none', cursor: 'pointer' }}>
              <Bell size={14} color="#a08070" />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#c4896a' }} />
            </button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setAvatarOpen(!avatarOpen)} style={{ display: 'flex', alignItems: 'center', gap: 4, borderRadius: 999, padding: '4px 6px', background: 'rgba(196,137,106,0.1)', border: 'none', cursor: 'pointer' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, background: 'linear-gradient(135deg, #c4896a, #6b3a25)', color: '#f5ede8' }}>S</div>
                <ChevronDown size={10} color="#a08070" />
              </button>
              {avatarOpen && (
                <div style={{ position: 'absolute', right: 0, top: 36, borderRadius: 16, padding: '4px 0', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', zIndex: 50, background: '#2a1610', minWidth: 150 }}>
                  {[
                    { icon: User, label: 'Profiel', act: () => navigate('/account') },
                    { icon: Settings, label: 'Instellingen', act: () => navigate('/consent') },
                    { icon: LogOut, label: 'Uitloggen', act: logout },
                  ].map(({ icon: Icon, label, act }) => (
                    <button key={label} onClick={() => { setAvatarOpen(false); act() }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', color: label === 'Uitloggen' ? '#c4896a' : '#f5ede8', fontFamily: sans }}>
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
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: '#f5ede8', fontFamily: serif }}>Inzichten</p>
                <p onClick={() => navigate('/dashboard/learning')} style={{ fontSize: 12, margin: 0, color: '#c4896a', fontFamily: sans, cursor: 'pointer' }}>Alles</p>
              </div>
              <div className="fp-noscroll" style={{ display: 'flex', gap: 12, padding: '0 16px', overflowX: 'auto' }}>
                <InsightCard icon={Droplet} title="Hydratatie" desc="Drink meer water tijdens je menstruatie." badge="Tip" onClick={() => navigate('/dashboard/learning')} />
                <InsightCard icon={BookOpen} title="Dagboek" desc="3 dagen niet gelogd. Voeg symptomen toe." badge="Reminder" onClick={() => navigate('/health/symptoms')} />
                <InsightCard icon={TrendingUp} title="Vorige cyclus" desc="Bekijk je cyclus-analyse en vergelijk." badge="Inzicht" onClick={() => navigate('/health/cycle-analytics')} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-nav */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '12px 16px 24px', background: 'rgba(11,5,3,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          {navItems.map(({ icon: Icon, label, to }, i) => (
            <button key={label} onClick={() => { setActiveTab(i); navigate(to) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeTab === i ? 'rgba(196,137,106,0.16)' : 'transparent' }}>
                <Icon size={20} color={activeTab === i ? '#c4896a' : '#4a2e20'} />
              </div>
              <span style={{ fontSize: 12, color: activeTab === i ? '#c4896a' : '#4a2e20', fontFamily: sans }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
