import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Zap, AlertCircle, Activity, Book, TrendingUp } from 'react-feather'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { clearToken, getQuizResults, getWearableReadings } from '../../api/client'
import { getSecure } from '../../utils/secureStorage'
import ReadinessScore from '../../components/ReadinessScore'
import CircleWidget from '../../components/CircleWidget'
import WearableScore from '../../components/WearableScore'
import CycleRing from '../../components/CycleRing'
import VariabiliteitsBand from '../../components/VariabiliteitsBand'
import CycluslengteGrafiek from '../../components/CycluslengteGrafiek'
import WearableOverlay from '../../components/WearableOverlay'
import { getMockWearableData } from '../../utils/wearableCycleHelper'
import QuizResultsOverview from '../../components/QuizResultsOverview'
import QuizOverviewCard from '../../components/QuizOverviewCard'
import hero1 from '../../assets/hero1.png'
import logo from '../../assets/YouCapsLogo.png.png'

export default function DashboardHome() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menstrualData, setMenstrualData] = useState(null)
  const [quizResults, setQuizResults] = useState(null)

  const [wearableData, setWearableData] = useState(null)
  const [hrvScore, setHrvScore] = useState(null)

  useEffect(() => {
    const stored = getSecure('menstruation_data')
    if (stored) {
      setMenstrualData(stored)
    }

    // Load quiz results
    getQuizResults()
      .then(result => {
        if (result.constellation) {
          setQuizResults(result)
        }
      })
      .catch(err => console.error('Failed to load quiz results:', err))

    // Load wearable data for HRV score
    getWearableReadings(7)
      .then(result => {
        if (result.data && result.data.length > 0) {
          const hrvValues = result.data
            .map(d => d.hrv_ms)
            .filter(v => v != null && v > 0)

          if (hrvValues.length > 0) {
            const avgHrv = hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length
            const hrvScore0to100 = Math.min(100, Math.round((avgHrv / 100) * 100))
            setHrvScore(hrvScore0to100)
          }
        }
      })
      .catch(err => console.error('Failed to load wearable data:', err))
  }, [])

  function getMenstrualPhase() {
    if (!menstrualData?.startDate) return null

    const start = new Date(menstrualData.startDate)
    const today = new Date()
    const diffTime = Math.abs(today - start)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const daysInCycle = diffDays % (menstrualData.cycleLength || 28)

    let phase = 'Unknown'
    const bleedingDays = menstrualData.bleedingDays || 5
    if (daysInCycle < bleedingDays) phase = 'Menstruatie'
    else if (daysInCycle < 11) phase = 'Folliculair'
    else if (daysInCycle < 16) phase = 'Ovulatie'
    else phase = 'Luteaal'

    const nextPeriodDate = new Date(start)
    nextPeriodDate.setDate(nextPeriodDate.getDate() + Math.ceil((diffDays + 1) / (menstrualData.cycleLength || 28)) * (menstrualData.cycleLength || 28))

    return {
      phase,
      daysInCycle: daysInCycle + 1,
      totalDays: menstrualData.cycleLength || 28,
      nextPeriod: nextPeriodDate.toLocaleDateString('nl-NL'),
      todaySymptoms: []
    }
  }

  function getCurrentPhase(menstrualData) {
    if (!menstrualData?.startDate) return 'irregular'
    const start = new Date(menstrualData.startDate)
    const today = new Date()
    const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24))
    const cycleLen = menstrualData.cycleLength || 28
    const bleedDays = menstrualData.bleedingDays || 5
    const daysInCycle = diffDays % cycleLen

    if (daysInCycle < bleedDays) return 'menstrual'
    else if (daysInCycle < 11) return 'follicular'
    else if (daysInCycle < 16) return 'ovulatory'
    else return 'luteal'
  }

  function handleLogout() {
    clearToken()
    navigate('/')
  }

  const menstrualPhase = getMenstrualPhase()

  // Calculate readiness score dynamically
  const calculateReadiness = () => {
    if (!wearableData || !menstrualData) return null

    const sleepScore = Math.min(100, (wearableData.deep_sleep_percentage || 25) * 2)
    const hrvScore = 50 // Default baseline
    const rhrScore = Math.max(1, 100 - Math.abs(wearableData.resting_heart_rate_delta || 0) * 2)

    const cycleMultiplier = {
      'follicular': 1.1,
      'ovulatory': 1.15,
      'luteal': 0.8,
    }[getCurrentPhase(menstrualData)] || 1

    const baseScore = (sleepScore * 0.3 + hrvScore * 0.35 + rhrScore * 0.35)
    return Math.round(baseScore * cycleMultiplier)
  }

  const readinessScore = calculateReadiness()

  useEffect(() => {
    localStorage.setItem('dashboardMenuOpen', JSON.stringify(menuOpen))
  }, [menuOpen])

  return (
    <div className="dashboard-hero" style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      animation: 'fade-slide-up 240ms ease both',
      backgroundImage: `url(${hero1})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      backgroundAttachment: 'fixed',
      position: 'relative',
      paddingTop: 'var(--space-lg)',
      paddingBottom: '140px',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* Beta Badge */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 100,
      }}>
        <span style={{
          background: 'rgba(199, 154, 110, 0.9)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-sans)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          Beta v1.0
        </span>
      </div>

      {/* Circle Widgets Carousel */}
      <div style={{
        width: '100%',
        padding: '32px 0 24px 0',
        boxSizing: 'border-box',
      }}>
        <Swiper
          spaceBetween={4}
          slidesPerView="auto"
          centeredSlides={false}
          grabCursor={true}
          style={{
            maxWidth: '100%',
            overflow: 'hidden',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
        >
          {/* Cycle Day */}
          {menstrualPhase && (
            <SwiperSlide style={{ width: 'auto', display: 'flex', justifyContent: 'center' }}>
              <CircleWidget
                value={menstrualPhase.daysInCycle}
                label="Cyclus"
                icon={Calendar}
                onClick={() => navigate('/health/menstruation')}
                size={50}
                  isActive={true}
              />
            </SwiperSlide>
          )}

          {/* Readiness Score */}
          {wearableData && readinessScore && (
            <SwiperSlide style={{ width: 'auto', display: 'flex', justifyContent: 'center' }}>
              <CircleWidget
                value={readinessScore}
                label="Bereid"
                icon={Zap}
                onClick={() => navigate('/dashboard/progress')}
                size={50}
                  isActive={true}
              />
            </SwiperSlide>
          )}

          {/* Symptoms Logged Today */}
          {menstrualPhase?.todaySymptoms && menstrualPhase.todaySymptoms.length > 0 && (
            <SwiperSlide style={{ width: 'auto', display: 'flex', justifyContent: 'center' }}>
              <CircleWidget
                value={menstrualPhase.todaySymptoms.length}
                label="Symptomen"
                icon={AlertCircle}
                onClick={() => navigate('/health/symptoms')}
                size={50}
                  isActive={true}
              />
            </SwiperSlide>
          )}

          {/* Lifestyle Triggers */}
          <SwiperSlide style={{ width: 'auto', display: 'flex', justifyContent: 'center' }}>
            <CircleWidget
              value="—"
              label="Lifestyle"
              icon={Activity}
              color="var(--accent)"
              onClick={() => navigate('/health/lifestyle-check')}
              size={50}
            />
          </SwiperSlide>

          {/* Learning Hub */}
          <SwiperSlide style={{ width: 'auto', display: 'flex', justifyContent: 'center' }}>
            <CircleWidget
              value="—"
              label="Kennis"
              icon={Book}
              color="var(--accent)"
              onClick={() => navigate('/dashboard/learning')}
              size={50}
            />
          </SwiperSlide>

          {/* Progress Analytics */}
          <SwiperSlide style={{ width: 'auto', display: 'flex', justifyContent: 'center' }}>
            <CircleWidget
              value="—"
              label="Trends"
              icon={TrendingUp}
              color="var(--accent)"
              onClick={() => navigate('/dashboard/progress')}
              size={50}
            />
          </SwiperSlide>
        </Swiper>
      </div>

      {/* Quiz Results Overview */}
      <QuizResultsOverview />

      {/* Quiz Constellation Display */}
      {quizResults?.constellation && (
        <div style={{ width: '100%', padding: 'var(--space-xl) var(--space-lg)', boxSizing: 'border-box' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: '500',
            marginBottom: 'var(--space-md)',
            color: 'var(--ink)',
          }}>
            Je patroon
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 'var(--space-md)',
          }}>
            {Object.entries(quizResults.constellation).map(([key, value]) => {
              const labels = {
                sleep: { label: 'Slaap', emoji: '😴' },
                mood: { label: 'Stemming', emoji: '🎭' },
                stress: { label: 'Stress', emoji: '⚡' },
                energy: { label: 'Energie', emoji: '💪' },
                cycle: { label: 'Cyclus', emoji: '🔄' },
              }
              const info = labels[key]
              if (!value || !info) return null
              return (
                <div
                  key={key}
                  style={{
                    background: 'rgba(199, 154, 110, 0.1)',
                    padding: 'var(--space-md)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '24px',
                  }}
                >
                  <div>{info.emoji}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-2)', marginTop: '4px' }}>
                    {info.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Cycle Ring Carousel */}
      {menstrualPhase && menstrualData && (
        <div style={{ width: '100%', maxWidth: '100%', padding: 'var(--space-xl) var(--space-lg)', boxSizing: 'border-box', overflow: 'hidden' }}>
          <Swiper
            spaceBetween={0}
            slidesPerView="auto"
            centeredSlides={true}
            grabCursor={true}
            style={{ maxWidth: '100%', overflow: 'visible' }}
          >
            <SwiperSlide style={{ width: 'auto', display: 'flex', justifyContent: 'center' }}>
              <CycleRing
                size={260}
                day={menstrualPhase.daysInCycle}
                cycleLength={menstrualData.cycleLength}
              />
            </SwiperSlide>
          </Swiper>
        </div>
      )}

      {/* Wearable Score Carousel - HRV */}
      {hrvScore != null && (
        <div style={{ width: '100%', maxWidth: '100%', padding: 'var(--space-xl) var(--space-lg)', boxSizing: 'border-box', overflow: 'hidden' }}>
          <Swiper
            spaceBetween={0}
            slidesPerView="auto"
            centeredSlides={true}
            grabCursor={true}
            style={{ maxWidth: '100%', overflow: 'visible' }}
          >
            <SwiperSlide style={{ width: 'auto', display: 'flex', justifyContent: 'center' }}>
              <WearableScore
                size={260}
                score={hrvScore}
                label="Hartritme Variabiliteit"
                max={100}
              />
            </SwiperSlide>
          </Swiper>
        </div>
      )}

      {/* Cycle Length Pattern */}
      {menstrualData && <CycluslengteGrafiek menstrualData={menstrualData} />}

      {/* Wearable Overlay (if wearable connected) */}
      {wearableData && menstrualData && (
        <WearableOverlay
          menstrualData={menstrualData}
          wearableReadings={getMockWearableData('regular', menstrualData)}
        />
      )}

      {/* Quiz Overview */}
      <QuizOverviewCard />

      {/* Variability Band (Cycle Uncertainty Window) */}
      {menstrualData && <VariabiliteitsBand menstrualData={menstrualData} />}
    </div>
  )
}
