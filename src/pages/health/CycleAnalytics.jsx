import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSecure } from '../../utils/secureStorage'
import CycluslengteGrafiek from '../../components/CycluslengteGrafiek'

export default function CycleAnalytics() {
  const navigate = useNavigate()
  const [menstrualData, setMenstrualData] = useState(null)

  useEffect(() => {
    try {
      const stored = getSecure('menstruation_data')
      if (stored) {
        setMenstrualData(stored)
      }
    } catch (e) {
      console.error('Failed to load menstruation data:', e)
    }
  }, [])

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
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: '500',
            color: 'var(--ink)',
          }}>FemFlow</span>
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
          Cyclus Analyse
        </h1>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          fontWeight: '400',
          color: 'var(--ink-2)',
          margin: '0 0 var(--space-xl) 0',
          lineHeight: '1.5',
        }}>
          Geen menstruatiedata gevonden. Vul je menstruatiegegevens in op de Menstruatietracker om je cycluspatroon te zien.
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
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '500', color: 'var(--ink)' }}>FemFlow</span>
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
        Cyclus Analyse
      </h1>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '15px',
        fontWeight: '400',
        color: 'var(--ink-2)',
        margin: '0 0 var(--space-xl) 0',
        lineHeight: '1.5',
      }}>
        Je cycluspatroon over tijd. Bekijk trends en markante veranderingen.
      </p>

      {/* Grafiek */}
      <CycluslengteGrafiek menstrualData={menstrualData} />

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
          Hoe werkt deze analyse?
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
            <strong style={{ color: 'var(--ink)', fontWeight: '600' }}>Cycluslengte</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              De grafiek toont hoe lang elke volledige cyclus was (van start tot start van je menstruatie).
            </p>
          </div>

          <div>
            <strong style={{ color: 'var(--ink)', fontWeight: '600' }}>Markeringen</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              <strong>Geel:</strong> Cyclussen die ≥7 dagen verschillen van de vorige (waarneembare verandering).
              <br />
              <strong>Rood:</strong> Cyclussen van ≥60 dagen (opmerkelijk lang).
            </p>
          </div>

          <div>
            <strong style={{ color: 'var(--ink)', fontWeight: '600' }}>Alleen observatie</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              Dit patroon helpt je je eigen cyclus beter te begrijpen. Het is geen medische beoordeling. Bij vragen over veranderingen kun je altijd je huisarts raadplegen.
            </p>
          </div>

          <div>
            <strong style={{ color: 'var(--ink)', fontWeight: '600' }}>Privacy</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              Deze gegevens zijn alleen voor jou zichtbaar en worden niet gedeeld of gebruikt voor tracking.
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
