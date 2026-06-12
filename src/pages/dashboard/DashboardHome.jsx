import { useState, useEffect } from 'react'
import { Book, TrendingUp } from 'react-feather'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { getQuizResults, getWearableReadings } from '../../api/client'
import { getSecure } from '../../utils/secureStorage'
import ReadinessScore from '../../components/ReadinessScore'
import HRVInsightsCard from '../../components/HRVInsightsCard'
import CycleInsightsCard from '../../components/CycleInsightsCard'
import CycleBloom from '../../components/CycleBloom'
import WearableBloom from '../../components/WearableBloom'
import VariabiliteitsBand from '../../components/VariabiliteitsBand'
import CycluslengteGrafiek from '../../components/CycluslengteGrafiek'
import WearableOverlay from '../../components/WearableOverlay'
import { getMockWearableData } from '../../utils/wearableCycleHelper'
import QuizResultsOverview from '../../components/QuizResultsOverview'
import QuizOverviewCard from '../../components/QuizOverviewCard'
import PeriodeLogKnop from '../../components/PeriodeLogKnop'
import SupplementSuggestie from '../../components/SupplementSuggestie'

export default function DashboardHome() {
  const [menuOpen] = useState(false)
  const [menstrualData, setMenstrualData] = useState(null)
  const [quizResults, setQuizResults] = useState(null)

  const [wearableData] = useState(null)
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

    let phase
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

  const menstrualPhase = getMenstrualPhase()

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
      background: 'var(--d-page)',
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

      {/* Mobiele kolom: alle kaarten op telefoonbreedte, ook op desktop */}
      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      {/* Menstruatiestart loggen — de kernhandeling, dus bovenaan */}
      <div style={{ marginTop: '56px' }}>
        <PeriodeLogKnop onGelogd={() => setMenstrualData(getSecure('menstruation_data'))} />
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
            color: 'var(--d-ink)',
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
                  <div style={{ fontSize: '12px', color: 'var(--d-ink-2)', marginTop: '4px' }}>
                    {info.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Cycle Bloom Carousel */}
      {menstrualPhase && menstrualData && (
        <div style={{
          width: '100%',
          padding: 'var(--space-sm) 0',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}>
          <Swiper
            spaceBetween={0}
            slidesPerView="auto"
            centeredSlides={true}
            grabCursor={true}
            style={{ maxWidth: '100%', overflow: 'visible' }}
          >
            <SwiperSlide style={{ width: 'auto', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
              }}>
                <div style={{
                  position: 'absolute',
                  inset: '-40px',
                  background: 'radial-gradient(circle, rgba(214, 160, 106, 0.30) 0%, rgba(217, 106, 122, 0.12) 45%, transparent 70%)',
                  filter: 'blur(30px)',
                  pointerEvents: 'none',
                }} />
                <CycleBloom
                  size={320}
                day={menstrualPhase.daysInCycle}
                  phases={[
                    { poetic: "Herstel", clinical: "Menstruatie", days: 5 },
                    { poetic: "Opbouw", clinical: "Folliculair", days: 8 },
                    { poetic: "Verbind", clinical: "Ovulatie", days: 3 },
                    { poetic: "Verhelder", clinical: "Luteaal", days: 12 },
                  ]}
                />
              </div>
            </SwiperSlide>
          </Swiper>
          {menstrualPhase && (
            <div style={{ marginTop: '-20px' }}>
              <CycleInsightsCard menstrualPhase={menstrualPhase} />
            </div>
          )}
        </div>
      )}

      {/* Wearable Bloom Carousel */}
      {hrvScore != null && (
        <div style={{
          width: '100%',
          padding: 'var(--space-sm) 0',
          boxSizing: 'border-box',
          overflow: 'hidden',
          marginTop: 'var(--space-xl)',
        }}>
          <Swiper
            spaceBetween={0}
            slidesPerView="auto"
            centeredSlides={true}
            grabCursor={true}
            style={{ maxWidth: '100%', overflow: 'visible' }}
          >
            <SwiperSlide style={{ width: 'auto', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
              }}>
                <div style={{
                  position: 'absolute',
                  inset: '-40px',
                  background: 'radial-gradient(circle, rgba(214, 160, 106, 0.30) 0%, rgba(217, 106, 122, 0.12) 45%, transparent 70%)',
                  filter: 'blur(30px)',
                  pointerEvents: 'none',
                }} />
                <WearableBloom
                  size={320}
                  score={hrvScore}
                  label="Hartritme Variabiliteit"
                />
              </div>
            </SwiperSlide>
          </Swiper>
          {hrvScore != null && (
            <div style={{ marginTop: '-20px' }}>
              <HRVInsightsCard hrvScore={hrvScore} />
            </div>
          )}
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

      {/* YouCaps funnel: verschijnt alleen met onderbouwende eigen data */}
      <SupplementSuggestie cyclusFase={menstrualPhase?.phase || null} />

      </div>
    </div>
  )
}
