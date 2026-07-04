import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken, getWearableReadings } from '../../api/client'
import HRVQnA from '../../components/HRVQnA'
import Footer from '../../components/Footer'
import hero from '../../assets/hero1.png'

export default function HRVInsightsPage() {
  const navigate = useNavigate()
  const [hrvScore, setHrvScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (!getToken()) {
      navigate('/login')
      return
    }
    setIsLoggedIn(true)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return

    getWearableReadings(7)
      .then(result => {
        if (result.data && result.data.length > 0) {
          const hrvValues = result.data
            .map(d => d.hrv_ms)
            .filter(v => v != null && v > 0)

          if (hrvValues.length > 0) {
            const avgHrv = hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length
            const score = Math.min(100, Math.round((avgHrv / 100) * 100))
            setHrvScore(score)
          }
        }
      })
      .catch(err => console.error('Failed to load HRV data:', err))
      .finally(() => setLoading(false))
  }, [isLoggedIn])

  if (!isLoggedIn) return null
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Data laden...</div>
  if (!hrvScore) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Geen wearable data beschikbaar. Genereer eerst testdata op de wearable pagina.</p>
        <button
          onClick={() => navigate('/wearable')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: 'var(--d-accent)',
            color: '#211C1A',
            border: 'none',
            borderRadius: '999px',
            cursor: 'pointer',
          }}
        >
          Naar Wearable
        </button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'var(--space-lg)',
      backgroundColor: 'var(--d-bg)',
      backgroundImage: `linear-gradient(rgba(27, 15, 7, 0.82), rgba(27, 15, 7, 0.92)), url(${hero})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      paddingBottom: '140px',
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            marginBottom: 'var(--space-lg)',
            color: 'var(--d-ink)',
          }}
        >
          ←
        </button>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: '500',
          marginBottom: 'var(--space-lg)',
          color: 'var(--d-ink)',
        }}>
          Hartritme Variabiliteit
        </h1>

        <div style={{
          background: 'var(--d-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: 'var(--space-lg)',
          borderRadius: '22px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
          marginBottom: 'var(--space-lg)',
        }}>
          <HRVInsights score={hrvScore} />
        </div>

        <div style={{
          background: 'var(--d-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: 'var(--space-lg)',
          borderRadius: '22px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
          marginBottom: 'var(--space-lg)',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: 'var(--space-md)',
            color: 'var(--d-ink)',
          }}>
            Jouw vragen
          </h2>
          <HRVQnA score={hrvScore} />
        </div>
      </div>

      <Footer />
    </div>
  )
}

function HRVInsights({ score }) {
  const getInsights = (score) => {
    if (score >= 80) {
      return {
        status: 'Optimaal',
        color: 'rgba(79, 140, 90, 0.1)',
        description: 'Je hartritme variabiliteit is uitstekend. Dit duidt op goede autonome herstellingscapaciteit en stress-tolerantie.',
        details: [
          'Je lichaam herstelt goed van dagelijkse stressoren',
          'Je parasympathisch zenuwstelsel werkt optimaal',
          'Dit is gunstig voor perimenopauze-symptoombeheersing',
          'Voort voort met je huidige leefstijl',
        ],
      }
    } else if (score >= 60) {
      return {
        status: 'Goed',
        color: 'rgba(199, 154, 110, 0.1)',
        description: 'Je HRV is op een gezond niveau. Je lichaam herstelt goed, maar er is ruimte voor optimalisatie.',
        details: [
          'Je hebt een goede balans tussen stress en rust',
          'Aandacht voor slaapkwaliteit kan HRV verbeteren',
          'Regelmatige beweging ondersteunt je autonome zenuwstelsel',
          'Monitor je score om veranderingen te zien',
        ],
      }
    } else if (score >= 40) {
      return {
        status: 'Matig',
        color: 'rgba(192, 73, 45, 0.1)',
        description: 'Je HRV wijst op verhoogde stress of onvoldoende herstel. Dit kan hormonaal of lifestyle-gerelateerd zijn.',
        details: [
          'Dit kan tijdens perimenopauze normaal zijn',
          'Prioriteer slaap: nachtelijk zweten verstoort HRV',
          'Probeer stressreductie (meditatie, yoga)',
          'Hydratatie en regelmatige beweging helpen',
        ],
      }
    } else {
      return {
        status: 'Laag',
        color: 'rgba(192, 73, 45, 0.1)',
        description: 'Je HRV is laag, wat duidt op significant stress of onvoldoende herstel. Dit vereist aandacht.',
        details: [
          'Dit kan hete flitsen of nachtelijk zweten aangeven',
          'Zorg voor voldoende slaap (7-9 uur)',
          'Verminder caffeine en alcohol',
          'Overweeg contact met een arts als dit aanhoudt',
        ],
      }
    }
  }

  const insights = getInsights(score)

  return (
    <div>
      <div style={{
        background: insights.color,
        padding: 'var(--space-md)',
        borderRadius: '8px',
        marginBottom: 'var(--space-md)',
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--d-ink-2)' }}>
          Je score vandaag
        </p>
        <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: 'var(--d-ink)' }}>
          {score}
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '600', color: 'var(--d-ink)' }}>
          {insights.status}
        </p>
      </div>

      <p style={{
        margin: '0 0 var(--space-md) 0',
        fontSize: '15px',
        color: 'var(--d-ink-2)',
        lineHeight: 1.6,
      }}>
        {insights.description}
      </p>

      <h3 style={{
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--d-ink)',
        marginBottom: 'var(--space-md)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        Wat dit betekent
      </h3>

      <ul style={{
        margin: 0,
        paddingLeft: '20px',
        color: 'var(--d-ink-2)',
        fontSize: '14px',
        lineHeight: 1.8,
      }}>
        {insights.details.map((detail, i) => (
          <li key={i} style={{ marginBottom: '8px' }}>
            {detail}
          </li>
        ))}
      </ul>
    </div>
  )
}
