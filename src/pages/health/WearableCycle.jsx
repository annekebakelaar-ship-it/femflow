import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import WearableOverlay from '../../components/WearableOverlay'
import { getMockWearableData } from '../../utils/wearableCycleHelper'
import logo from '../../assets/YouCapsLogo.png.png'

export default function WearableCycle() {
  const navigate = useNavigate()
  const [menstrualData, setMenstrualData] = useState(null)
  const [wearableReadings, setWearableReadings] = useState(null)
  const [grafiekMode, setGrafiekMode] = useState('regular')

  useEffect(() => {
    // Load menstruation data
    const stored = localStorage.getItem('menstruation_data')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setMenstrualData(data)
      } catch (e) {
        console.error('Failed to load menstruation data:', e)
      }
    }

    // For now, use mock wearable data
    // In production, this would fetch from API
    const mockData = stored ? JSON.parse(stored) : null
    setWearableReadings(getMockWearableData(grafiekMode, mockData))
  }, [grafiekMode])

  if (!menstrualData?.startDate) {
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

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          fontWeight: '500',
          color: 'var(--ink)',
          margin: '0 0 var(--space-md) 0',
          lineHeight: '1.25',
        }}>
          Wearable & Cyclus
        </h1>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          fontWeight: '400',
          color: 'var(--ink-2)',
          margin: '0 0 var(--space-xl) 0',
          lineHeight: '1.5',
        }}>
          Geen menstruatiedata gevonden. Vul je menstruatiegegevens in op de Menstruatietracker.
        </p>

        <button
          onClick={() => navigate('/health/menstruation')}
          style={{
            padding: 'var(--space-md) var(--space-lg)',
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
          Naar Menstruatietracker
        </button>
      </div>
    )
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

      {/* Title */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '26px',
        fontWeight: '500',
        color: 'var(--ink)',
        margin: '0 0 var(--space-md) 0',
        lineHeight: '1.25',
      }}>
        Wearable & Cyclus
      </h1>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '15px',
        fontWeight: '400',
        color: 'var(--ink-2)',
        margin: '0 0 var(--space-xl) 0',
        lineHeight: '1.5',
      }}>
        Zie hoe je fysiologische signalen meebewegen met je cyclus.
      </p>

      {/* Test Mode */}
      <div style={{
        background: 'var(--surface-warm)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        marginBottom: 'var(--space-lg)',
        display: 'flex',
        gap: 'var(--space-sm)',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', flex: '1 1 100%' }}>
          Testmodus Wearable Data
        </span>
        <button
          onClick={() => setGrafiekMode('regular')}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: grafiekMode === 'regular' ? 'var(--accent)' : 'var(--surface)',
            color: grafiekMode === 'regular' ? 'white' : 'var(--ink)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Regelmatig
        </button>
        <button
          onClick={() => setGrafiekMode('irregular')}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: grafiekMode === 'irregular' ? 'var(--accent)' : 'var(--surface)',
            color: grafiekMode === 'irregular' ? 'white' : 'var(--ink)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Diffuus (overgang)
        </button>
        <button
          onClick={() => setGrafiekMode('gaps')}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: grafiekMode === 'gaps' ? 'var(--accent)' : 'var(--surface)',
            color: grafiekMode === 'gaps' ? 'white' : 'var(--ink)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Met gaten
        </button>
      </div>

      {/* Overlay Component */}
      {wearableReadings && (
        <WearableOverlay menstrualData={menstrualData} wearableReadings={wearableReadings} />
      )}

      {/* Info Card */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px',
          fontWeight: '500',
          color: 'var(--ink)',
          margin: '0 0 var(--space-md) 0',
          lineHeight: '1.25',
        }}>
          Wat zie je hier?
        </h2>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: '400',
          color: 'var(--ink-2)',
          lineHeight: 1.6,
        }}>
          <div>
            <strong style={{ color: 'var(--ink)', fontWeight: '600' }}>Signalen over je cyclus</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              Je wearable meet basale temperatuur, HRV, rust-hartslag en slaap. Deze pagina toont hoe die signalen zich gedragen gedurende je cyclus.
            </p>
          </div>

          <div>
            <strong style={{ color: 'var(--ink)', fontWeight: '600' }}>Temperatuurpatroon</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              Bij regelmatige cycli zie je typisch een stijging na ovulatie. Dit wordt veroorzaakt door het hormoon progestoron. Dit patroon helpt je eigen fysiologie beter te begrijpen.
            </p>
          </div>

          <div>
            <strong style={{ color: 'var(--ink)', fontWeight: '600' }}>Andere signalen</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              HRV, rust-hartslag en slaap kunnen ook met hormoonfluctuaties samenhangen. Dit zijn waarnemingen, niet diagnoses.
            </p>
          </div>

          <div>
            <strong style={{ color: 'var(--ink)', fontWeight: '600' }}>Geen voorspellingen</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              Deze grafieken tonen wat al is gebeurd, niet wat gaat gebeuren. De temperatuurstijging bevestigt ovulatie achteraf, voorspelt die niet.
            </p>
          </div>

          <div>
            <strong style={{ color: 'var(--ink)', fontWeight: '600' }}>Privacy</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              Wearable + cyclus-data samen zijn gevoelig. Deze gegevens zijn alleen voor jou zichtbaar, niet gedeeld, en verwijderd als jij dat vraagt.
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
