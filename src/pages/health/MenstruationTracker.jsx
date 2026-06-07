import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HormoneChart from '../../components/HormoneChart'
import CycleVisualization from '../../components/CycleVisualization'
import PhaseInsightCard from '../../components/PhaseInsightCard'
import SymptomHeatmap from '../../components/SymptomHeatmap'
import CycleSummary from '../../components/CycleSummary'
import ManualEntryModal from '../../components/ManualEntryModal'
import MenstruationSetupSlideshow from '../../components/MenstruationSetupSlideshow'
import logo from '../../assets/YouCapsLogo.png.png'
import afbeelding1 from '../../assets/afbeelding1.png'

const INITIAL_DATA = {
  startDate: null,
  cycleLength: 28,
  cycleLengths: [],  // Historical cycle lengths for variability analysis
  entries: [],
}

export default function MenstruationTracker() {
  const navigate = useNavigate()
  const [menstrualData, setMenstrualData] = useState(null)
  const [currentTab, setCurrentTab] = useState('overview')
  const [selectedDay, setSelectedDay] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  // Load data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('menstruation_data')
      if (!stored) {
        setShowSetup(true)
        setMenstrualData(INITIAL_DATA)
        return
      }

      const data = JSON.parse(stored)
      setMenstrualData(data)

      if (data.startDate) {
        const today = new Date()
        const start = new Date(data.startDate)
        const daysFromStart = Math.floor((today - start) / (1000 * 60 * 60 * 24))
        const daysInCycle = (daysFromStart % data.cycleLength) + 1
        setSelectedDay(daysInCycle)
      }
    } catch (e) {
      console.error('Failed to load menstruation data:', e)
      setShowSetup(true)
      setMenstrualData(INITIAL_DATA)
    }
  }, [])

  // Save data to localStorage
  const saveMenstrualData = (data) => {
    localStorage.setItem('menstruation_data', JSON.stringify(data))
    setMenstrualData(data)
  }

  // Handle setup wizard
  const handleSetupComplete = (startDate, cycleLength) => {
    const newData = {
      ...INITIAL_DATA,
      startDate,
      cycleLength: parseInt(cycleLength) || 28,
    }
    saveMenstrualData(newData)
    setShowSetup(false)
    // Navigate to dashboard after setup
    setTimeout(() => navigate('/dashboard'), 500)
  }

  // Handle adding/updating entry
  const handleSaveEntry = (entry) => {
    const updated = {
      ...menstrualData,
      entries: [
        ...menstrualData.entries.filter((e) => e.date !== entry.date),
        entry,
      ],
    }
    saveMenstrualData(updated)
    setIsModalOpen(false)
  }

  // Show setup wizard if no data
  if (showSetup || !menstrualData?.startDate) {
    return (
      <div style={{
        minHeight: '100vh',
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        padding: 'var(--space-lg) var(--space-lg) 140px var(--space-lg)',
        background: 'var(--bg)',
        animation: 'fade-slide-up 240ms ease both',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-lg)',
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '20px',
            }}
          >
            ←
          </button>
          <img src={logo} alt="YouCaps" style={{ height: '32px', width: 'auto' }} />
          <div style={{ width: '20px' }} />
        </div>

        <MenstruationSetupSlideshow
          onComplete={handleSetupComplete}
          onCancel={() => navigate('/dashboard')}
        />
      </div>
    )
  }

  const start = new Date(menstrualData.startDate)
  const today = new Date()
  const daysFromStart = Math.floor((today - start) / (1000 * 60 * 60 * 24))
  const currentDayInCycle = (daysFromStart % menstrualData.cycleLength) + 1
  const displayDay = selectedDay || currentDayInCycle

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      backgroundImage: `url(${afbeelding1})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      animation: 'fade-slide-up 240ms ease both',
    }}>
    <div style={{
      width: '100%',
      maxWidth: 'var(--container-max)',
      padding: 'var(--space-lg) var(--space-lg) 140px var(--space-lg)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-lg)',
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '20px',
          }}
        >
          ←
        </button>
        <img src={logo} alt="YouCaps" style={{ height: '32px', width: 'auto' }} />
        <div style={{ width: '20px' }} />
      </div>

      {/* Setup Modal */}
      {showSetup && (
        <MenstruationSetupSlideshow
          onComplete={handleSetupComplete}
          onCancel={() => navigate('/dashboard')}
        />
      )}

      {/* Page Title */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '26px',
        fontWeight: '500',
        color: 'var(--ink)',
        margin: '0 0 var(--space-md) 0',
        lineHeight: '1.25',
      }}>
        Mijn Cyclus
      </h1>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '15px',
        fontWeight: '400',
        color: 'var(--ink-2)',
        margin: '0 0 var(--space-xl) 0',
        lineHeight: '1.5',
      }}>
        Dag {currentDayInCycle} van {menstrualData.cycleLength}
      </p>

      {/* Phase Insight Card */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <PhaseInsightCard
          day={displayDay}
          cycleLength={menstrualData.cycleLength}
        />
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-sm)',
        marginBottom: 'var(--space-lg)',
        borderBottom: '1px solid var(--border)',
        overflow: 'auto',
      }}>
        {['overview', 'symptoms', 'trends'].map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            style={{
              padding: 'var(--space-md) var(--space-lg)',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: currentTab === tab ? 'var(--ink)' : 'var(--ink-3)',
              borderBottom: currentTab === tab ? `3px solid var(--ink)` : 'none',
              marginBottom: '-2px',
            }}
          >
            {tab === 'overview' && 'Overzicht'}
            {tab === 'symptoms' && 'Symptomen'}
            {tab === 'trends' && 'Trends'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {currentTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <HormoneChart cycleLength={menstrualData.cycleLength} />
          <CycleVisualization
            currentDay={currentDayInCycle}
            cycleLength={menstrualData.cycleLength}
            onDaySelect={setSelectedDay}
          />
          <CycleSummary
            menstrualData={menstrualData}
            currentDay={currentDayInCycle}
          />
        </div>
      )}

      {/* Symptoms Tab */}
      {currentTab === 'symptoms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                flex: 1,
                padding: 'var(--space-md)',
                background: 'var(--ink)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              + Voeg Inzending Toe
            </button>
          </div>
          <SymptomHeatmap menstrualData={menstrualData} />
        </div>
      )}

      {/* Trends Tab */}
      {currentTab === 'trends' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <CycleSummary
            menstrualData={menstrualData}
            currentDay={currentDayInCycle}
          />
          <SymptomHeatmap menstrualData={menstrualData} />
        </div>
      )}

      {/* Manual Entry Modal */}
      <ManualEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEntry}
        selectedDate={selectedDay}
      />

      <style>{`
        @keyframes fade-slide-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
    </div>
  )
}
