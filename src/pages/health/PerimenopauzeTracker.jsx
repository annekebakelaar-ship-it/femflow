import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart2, Target, TrendingUp, AlertCircle, Zap } from 'react-feather'
import VariabiliteitsBand from '../../components/VariabiliteitsBand'
import CycluslengteGrafiek from '../../components/CycluslengteGrafiek'
import { getMockCycleLengths } from '../../utils/cycleHelper'

const mockRegularCycles = () => {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 45) // Started 45 days ago

  return {
    startDate: startDate.toISOString().split('T')[0],
    cycleLength: 28,
    cycleLengths: [28, 27, 28, 29, 28], // Very consistent
    entries: [],
  }
}

const mockIrregularCycles = () => {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 80) // Started 80 days ago

  return {
    startDate: startDate.toISOString().split('T')[0],
    cycleLength: 31,
    cycleLengths: [25, 32, 28, 34, 30, 31], // Quite variable (σ ≈ 3)
    entries: [],
  }
}

export default function PerimenopauzeTracker() {
  const navigate = useNavigate()
  const [menstrualData, setMenstrualData] = useState(() => {
    try {
      const stored = localStorage.getItem('menstruation_data')
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error('localStorage error:', e)
    }
    return mockRegularCycles()
  })
  const [mockMode, setMockMode] = useState('regular')  // regular | irregular
  const [grafiekMode, setGrafiekMode] = useState('regular') // regular | early_transition | late_transition

  const applyMock = (mode) => {
    setMockMode(mode)
    if (mode === 'regular') {
      setMenstrualData(mockRegularCycles())
    } else {
      setMenstrualData(mockIrregularCycles())
    }
  }

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
          onClick={() => navigate('/health/menstruation')}
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
        <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: '500',
            color: 'var(--ink)',
          }}>FemFlow</span>
        <div style={{ width: '20px' }} />
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, letterSpacing: '-0.5px',
        color: 'var(--ink)',
        margin: '0 0 var(--space-sm) 0',
      }}>
        Perimenopauze Tracker
      </h1>

      <p style={{
        fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5,
        color: 'var(--ink-2)',
        margin: '0 0 var(--space-xl) 0',
      }}>
        Eerlijk onzekerheidsvenster gebaseerd op je werkelijke cyclusdata
      </p>

      {/* Mock Controls (Development) */}
      <div style={{
        background: 'var(--surface-warm)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: 'var(--space-md)',
        marginBottom: 'var(--space-lg)',
        display: 'flex',
        gap: 'var(--space-sm)',
        flexWrap: 'wrap',
        opacity: 0.7,
        boxShadow: '0 12px 40px rgba(42, 33, 28, 0.15), 0 4px 12px rgba(42, 33, 28, 0.08)',
      }}>
        <span style={{ fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '600', flex: '1 1 100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} style={{ color: 'var(--ink)' }} />
          Testmodus
        </span>
        <button
          onClick={() => applyMock('regular')}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: mockMode === 'regular' ? 'var(--ink)' : 'var(--border)',
            color: mockMode === 'regular' ? 'var(--surface)' : 'var(--ink)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Regelmatige cyclus (σ ≈ 0.8)
        </button>
        <button
          onClick={() => applyMock('irregular')}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: mockMode === 'irregular' ? 'var(--ink)' : 'var(--border)',
            color: mockMode === 'irregular' ? 'var(--surface)' : 'var(--ink)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Grillige cyclus (σ ≈ 3)
        </button>
      </div>

      {/* Variability Band Component */}
      <VariabiliteitsBand menstrualData={menstrualData} />

      {/* Cyclus Grafiek Test Mode */}
      <div style={{
        background: 'var(--accent-soft)',
        border: '1px solid var(--accent)',
        borderRadius: '8px',
        padding: 'var(--space-md)',
        marginBottom: 'var(--space-lg)',
        display: 'flex',
        gap: 'var(--space-sm)',
        flexWrap: 'wrap',
        opacity: 0.7,
        boxShadow: '0 12px 40px rgba(42, 33, 28, 0.15), 0 4px 12px rgba(42, 33, 28, 0.08)',
      }}>
        <span style={{ fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '600', flex: '1 1 100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} style={{ color: 'var(--accent)' }} />
          Testmodus Cyclus Grafiek
        </span>
        <button
          onClick={() => setGrafiekMode('regular')}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: grafiekMode === 'regular' ? 'var(--accent)' : 'var(--border)',
            color: grafiekMode === 'regular' ? 'var(--surface)' : 'var(--ink)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Regelmatig
        </button>
        <button
          onClick={() => setGrafiekMode('early_transition')}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: grafiekMode === 'early_transition' ? 'var(--accent)' : 'var(--border)',
            color: grafiekMode === 'early_transition' ? 'var(--surface)' : 'var(--ink)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          +7 dagen sprong
        </button>
        <button
          onClick={() => setGrafiekMode('late_transition')}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: grafiekMode === 'late_transition' ? 'var(--accent)' : 'var(--border)',
            color: grafiekMode === 'late_transition' ? 'var(--surface)' : 'var(--ink)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          ≥60 dagen
        </button>
      </div>

      {/* Cyclus Lengte Grafiek */}
      <CycluslengteGrafiek
        menstrualData={{
          ...menstrualData,
          // Override entries to use mock cycle data
          entries: getMockCycleLengths(grafiekMode).flatMap((cycle) => [
            { date: cycle.startDate.toISOString().split('T')[0], bleeding: true },
          ]),
        }}
      />

      {/* Info Section */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: 'var(--space-lg)',
        marginBottom: 'var(--space-lg)',
        opacity: 0.7,
        boxShadow: '0 12px 40px rgba(42, 33, 28, 0.15), 0 4px 12px rgba(42, 33, 28, 0.08)',
      }}>
        <h2 style={{
          fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600',
          margin: '0 0 var(--space-md) 0',
        }}>
          Hoe werkt dit venster?
        </h2>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
          color: 'var(--ink-2)',
          lineHeight: 1.6,
        }}>
          <div>
            <strong style={{ color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={16} style={{ color: 'var(--ink)' }} />
              Basis: werkelijke data
            </strong>
            <p style={{ margin: '4px 0 0 0' }}>
              Geen vaste 28 dagen. Het venster berekent je eigen cyclus-patroon uit je historische data.
            </p>
          </div>

          <div>
            <strong style={{ color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={16} style={{ color: 'var(--ink)' }} />
              Waarschijnlijk (68%)
            </strong>
            <p style={{ margin: '4px 0 0 0' }}>
              Donkerde beige band. Hier begint je menstruatie zeer waarschijnlijk.
            </p>
          </div>

          <div>
            <strong style={{ color: 'var(--ink)' }}>Mogelijk (95%)</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              Lichtere beige band. Uitzonderin, maar niet onmogelijk.
            </p>
          </div>

          <div>
            <strong style={{ color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} style={{ color: 'var(--ink)' }} />
              Band wordt breder bij variabiliteit
            </strong>
            <p style={{ margin: '4px 0 0 0' }}>
              Hoe griliger je cyclus, hoe breder het venster. Dat geeft je eerlijke verwachtingen.
            </p>
          </div>

          <div>
            <strong style={{ color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} style={{ color: 'var(--ink)' }} />
              Voorlopig label
            </strong>
            <p style={{ margin: '4px 0 0 0' }}>
              Met minder dan 5 cycli wordt het venster extra verbreed omdat je patroon nog onzeker is.
            </p>
          </div>
        </div>
      </div>

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
  )
}
