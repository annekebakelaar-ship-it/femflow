import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Moon, Thermometer, Zap, User, Settings, LogOut, ChevronDown } from 'react-feather'
import NavV2 from '../../components/NavV2'
import { leefstijlAdvies } from '../../utils/leefstijlAdvies'
import { getWearableReadings, clearToken } from '../../api/client'
import { getSecure } from '../../utils/secureStorage'
import wordmarkImg from '../../assets/ovari-wordmark.png'
// Foto: Pexels 9155566 "Close-up Shot of a Wet Shoulder" door Ron Lach (Pexels-licentie, vrij te gebruiken)
import heroImg from '../../assets/home-vandaag.jpg'
import { meet } from '../../utils/meet'
import { begroeting, herstelTekst, slaapTekst, temperatuurTekst, energieTekst, voornaamUit, adviesTekst } from '../../utils/vandaag'

// Home "Vandaag", getrouw nagebouwd naar het ontwerp van 13 sep 2026:
// begroeting, een Vandaag-kaart met fase en foto, vier stille tegels
// (herstel, slaap, temperatuur, energie), een persoonlijk advies met twee
// acties en de zwevende navigatie. Maten zijn uit het ontwerp gemeten op
// een schermbreedte van 430 px. Route: /dashboard (en /preview-v2).

const serif = "'Noto Serif Display', Georgia, serif"
const sans = "'Hanken Grotesk', system-ui, sans-serif"
const WIT = '#FDFBF8'
const OKER = '#EDBC8C'
const RAND = '#2D241C'
const KAART = '#1D1812'

const KOP = {
  Menstruatie: 'Je lichaam vraagt om rust',
  Folliculair: 'Je energie bouwt weer op',
  Ovulatie: 'Een goed moment voor kracht',
  Luteaal: 'Je lichaam vraagt om vertragen',
}
const FASE_NAAM = { Menstruatie: 'Menstruatie', Folliculair: 'Folliculaire fase', Ovulatie: 'Ovulatiefase', Luteaal: 'Luteale fase' }

function berekenFase(menstrualData) {
  if (!menstrualData?.startDate) return null
  const start = new Date(menstrualData.startDate)
  const diffDays = Math.floor((new Date() - start) / (1000 * 60 * 60 * 24))
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

function Lotus() {
  return (
    <svg width="25" height="19" viewBox="0 0 25 19" fill="none" stroke={OKER} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
      <path d="M12.5 1C9.2 4.6 8.5 10 12.5 17.8C16.5 10 15.8 4.6 12.5 1Z" />
      <path d="M12.5 17.8C6.4 18 1.7 13.9 0.9 7.7C5.1 7.5 8.5 9.5 10.3 12.6" />
      <path d="M12.5 17.8C18.6 18 23.3 13.9 24.1 7.7C19.9 7.5 16.5 9.5 14.7 12.6" />
    </svg>
  )
}

function VandaagKaart({ faseInfo, onClick }) {
  return (
    <div onClick={onClick} style={{ position: 'relative', height: 181.5, margin: '19.9px 20px 0', borderRadius: 14, border: `1px solid ${RAND}`, background: 'linear-gradient(180deg, #1B1611 0%, #19140F 100%)', overflow: 'hidden', cursor: 'pointer', boxSizing: 'border-box', flexShrink: 0 }}>
      <img src={heroImg} alt="" style={{ position: 'absolute', top: 0, right: 0, width: 147.5, height: '100%', objectFit: 'cover', objectPosition: 'right center', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 20%, rgba(0,0,0,0.8) 38%, #000 52%)', maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 20%, rgba(0,0,0,0.8) 38%, #000 52%)' }} />
      <div style={{ position: 'relative', padding: '0 20px' }}>
        <p style={{ margin: '23.2px 0 0', fontSize: 10.5, lineHeight: 1, letterSpacing: '0.22em', color: '#E5E1DD', fontFamily: sans, fontWeight: 300 }}>VANDAAG</p>
        <h1 style={{ margin: '12.45px 0 0', maxWidth: 236, fontFamily: serif, fontWeight: 400, fontSize: 25.5, lineHeight: '30.2px', color: WIT }}>
          {faseInfo ? KOP[faseInfo.fase] : 'Begin met je cyclus'}
        </h1>
        <p style={{ margin: '13.05px 0 0', fontSize: 14.1, lineHeight: 1, color: '#D0CAC4', fontFamily: sans, fontWeight: 300, whiteSpace: 'nowrap' }}>
          {faseInfo
            ? <>{FASE_NAAM[faseInfo.fase]}<span style={{ display: 'inline-block', width: 3.7, height: 3.7, borderRadius: '50%', background: '#D0CAC4', margin: '0 7.3px', verticalAlign: 'middle', position: 'relative', top: -1 }} />Dag {faseInfo.dag} van {faseInfo.cycleLength}</>
            : 'Log je laatste menstruatie'}
        </p>
      </div>
    </div>
  )
}

function Tegel({ icon: Icon, label, waarde, onClick }) {
  return (
    <div onClick={onClick} style={{ flex: 1, minWidth: 0, height: 105.5, borderRadius: 13, border: `1px solid ${RAND}`, background: KAART, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
      <Icon size={20} strokeWidth={1.5} color={OKER} style={{ marginTop: 14, flexShrink: 0 }} />
      <span style={{ marginTop: 11.8, fontSize: 12, lineHeight: 1, color: '#D7D1CB', fontFamily: sans, fontWeight: 300, whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ marginTop: 8, fontSize: 19.3, lineHeight: 1, color: OKER, fontFamily: serif, fontVariantNumeric: 'lining-nums', whiteSpace: 'nowrap' }}>{waarde}</span>
    </div>
  )
}

function AdviesKaart({ tekst, onUitleg, onCheckin }) {
  return (
    <div style={{ position: 'relative', height: 176.5, margin: '14.6px 20px 0', borderRadius: 12, border: `1px solid ${RAND}`, background: KAART, boxSizing: 'border-box', padding: '0 20px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', height: 18.7, marginTop: 18.2 }}>
        <Lotus />
        <span style={{ marginLeft: 16.9, fontSize: 10.5, lineHeight: 1, letterSpacing: '0.16em', color: '#DFDAD5', fontFamily: sans, fontWeight: 300 }}>PERSOONLIJK ADVIES</span>
      </div>
      <p style={{ margin: '10px 0 0', maxWidth: 312, fontFamily: serif, fontSize: 18.9, lineHeight: '24.7px', color: WIT, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tekst}</p>
      <div style={{ position: 'absolute', left: 20, right: 17, bottom: 18.5, display: 'flex', gap: 11 }}>
        <button onClick={onUitleg} style={{ flex: 1, height: 37.7, borderRadius: 999, border: '1px solid #E9B988', background: 'transparent', color: WIT, fontFamily: sans, fontSize: 13.5, fontWeight: 300, cursor: 'pointer' }}>Meer uitleg</button>
        <button onClick={onCheckin} style={{ flex: 1, height: 37.7, borderRadius: 999, border: 'none', background: 'linear-gradient(180deg, #DBAD7F 0%, #CFA276 55%, #B98F68 100%)', color: '#120D0A', fontFamily: sans, fontSize: 13.9, fontWeight: 400, cursor: 'pointer' }}>Check-in doen</button>
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
  const [uur, setUur] = useState(() => new Date().getHours())

  useEffect(() => {
    // Lokale ontwikkeling: /preview-v2?demo vult het scherm met voorbeelddata
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('demo')) {
      import('../../dev/homeDemo').then(({ homeDemo }) => {
        const d = homeDemo()
        setMenstrualData(d.menstruation)
        setSymptomLog(d.symptomen)
        setReadings(d.readings)
        setUur(d.uur)
      })
      return
    }
    setMenstrualData(getSecure('menstruation_data'))
    setSymptomLog(getSecure('symptom_log') || [])
    getWearableReadings(30)
      .then(r => setReadings(r.data || []))
      .catch(() => {})
  }, [])

  const faseInfo = berekenFase(menstrualData)
  const laatste = [...readings].reverse().find(r => r.hrv_ms != null) || readings[readings.length - 1] || {}
  const slaapMin = laatste.sleep_duration_min
  const advies = leefstijlAdvies({
    faseInfo,
    readings,
    symptomen: symptomLog,
    slaapUur: slaapMin != null ? +(slaapMin / 60).toFixed(1) : null,
  })

  const stats = [
    { icon: Heart, label: 'Herstel', waarde: herstelTekst(laatste.hrv_ms) },
    { icon: Moon, label: 'Slaap', waarde: slaapTekst(slaapMin) },
    { icon: Thermometer, label: 'Temperatuur', waarde: temperatuurTekst(laatste.temperature) },
    { icon: Zap, label: 'Energie', waarde: energieTekst(laatste.readiness) },
  ]

  const voornaam = voornaamUit(menstrualData?.name)
  const initiaal = voornaam.charAt(0).toUpperCase() || '•'

  // Volledig herladen: wist ook de gebruiker in App, anders stuurt / meteen terug naar de home
  function logout() { clearToken(); window.location.replace('/') }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', background: '#0F0C09', fontFamily: sans }}>
      <style>{`
        .fp-noscroll { scrollbar-width: none; -ms-overflow-style: none; }
        .fp-noscroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 430, height: '100dvh', background: '#16120E' }}>
        <div className="fp-noscroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingBottom: 20 }}>

          {/* Kop: woordmerk gecentreerd, avatar rechts */}
          <div style={{ position: 'relative', height: 35.2, marginTop: 11, flexShrink: 0 }}>
            <img src={wordmarkImg} alt="Ovari" style={{ position: 'absolute', left: '50%', top: 0.3, height: 22.1, width: 90.1, transform: 'translateX(-50%)' }} />
            <div style={{ position: 'absolute', right: 17.5, top: 0 }}>
              <button onClick={() => setAvatarOpen(!avatarOpen)} aria-label="Accountmenu" style={{ display: 'flex', alignItems: 'center', width: 54.8, height: 35.2, borderRadius: 999, padding: '0 0 0 5px', background: '#2A2319', border: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg, #D4A776, #B8895E)', color: '#FFFFFF', fontFamily: sans }}>{initiaal}</div>
                <ChevronDown size={13} strokeWidth={2.2} color="#F2EEE9" style={{ marginLeft: 5 }} />
              </button>
              {avatarOpen && (
                <div style={{ position: 'absolute', right: 0, top: 42, borderRadius: 14, padding: '4px 0', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', zIndex: 50, background: KAART, border: `1px solid ${RAND}`, minWidth: 160 }}>
                  {[
                    { icon: User, label: 'Profiel', act: () => navigate('/account') },
                    { icon: Settings, label: 'Instellingen', act: () => navigate('/consent') },
                    { icon: LogOut, label: 'Uitloggen', act: logout },
                  ].map(({ icon: Icon, label, act }) => (
                    <button key={label} onClick={() => { setAvatarOpen(false); act() }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', color: label === 'Uitloggen' ? OKER : WIT, fontFamily: sans }}>
                      <Icon size={13} /> {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <h2 style={{ margin: '0.7px 0 0 26px', fontFamily: serif, fontWeight: 400, fontSize: 23, lineHeight: 1.2, color: WIT, flexShrink: 0 }}>
            {begroeting(uur)}{voornaam ? `, ${voornaam}` : ''}
          </h2>

          <VandaagKaart faseInfo={faseInfo} onClick={() => navigate(faseInfo ? '/health/cycle-analytics' : '/health/menstruation')} />

          <div style={{ display: 'flex', gap: 9, margin: '13.7px 20px 0', flexShrink: 0 }}>
            {stats.map(s => <Tegel key={s.label} {...s} onClick={() => navigate('/wearable/hrv-insights')} />)}
          </div>

          <AdviesKaart
            tekst={adviesTekst(advies.activiteitId)}
            onUitleg={() => { meet('home_meer_uitleg', { advies: advies.activiteitId }); navigate('/dashboard/leefstijl') }}
            onCheckin={() => { meet('home_checkin', { advies: advies.activiteitId }); navigate('/health/symptoms') }}
          />
        </div>

        <NavV2 />
      </div>
    </div>
  )
}
