import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ConsentModal from '../../components/ConsentModal'
import { saveSecure, getSecure } from '../../utils/secureStorage'

const INITIAL_DATA = {
  name: '',
  startDate: null,
  cycleLength: 28,
  bleedingDays: 5,
}

export default function MenstruationTracker() {
  const navigate = useNavigate()
  const [menstrualData, setMenstrualData] = useState(INITIAL_DATA)
  const [showConsent, setShowConsent] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    try {
      const consentGiven = localStorage.getItem('consent_given_at')
      if (!consentGiven) {
        setShowConsent(true)
        return
      }

      const stored = getSecure('menstruation_data')
      if (!stored || !stored.startDate) {
        setShowSetup(true)
        return
      }

      setMenstrualData(stored)
    } catch (e) {
      console.error('Failed to load menstruation data:', e)
      setShowSetup(true)
    }
  }, [])

  const handleConsentAccept = () => {
    setShowConsent(false)
    setShowSetup(true)
  }

  const handleSetupComplete = (data) => {
    saveSecure('menstruation_data', data)
    setMenstrualData(data)
    setShowSetup(false)
    setTimeout(() => navigate('/dashboard'), 500)
  }

  if (showConsent) {
    return <ConsentModal onAccept={handleConsentAccept} />
  }

  if (showSetup) {
    return (
      <div style={{
        minHeight: '100vh',
        padding: 'var(--space-lg)',
        background: 'var(--d-page)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', marginBottom: 'var(--space-lg)', color: 'var(--d-ink)' }}>
          Menstruatie Instellingen
        </h1>

        <SetupForm onComplete={handleSetupComplete} />
      </div>
    )
  }

  const today = new Date()
  const start = new Date(menstrualData.startDate)
  const daysFromStart = Math.floor((today - start) / (1000 * 60 * 60 * 24))
  const currentDay = (daysFromStart % menstrualData.cycleLength) + 1

  const getPhase = (day) => {
    if (day <= menstrualData.bleedingDays) return 'Menstruatie'
    if (day <= Math.floor(menstrualData.cycleLength * 0.35)) return 'Folliculair'
    if (day <= Math.floor(menstrualData.cycleLength * 0.5)) return 'Ovulatie'
    return 'Luteaal'
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'var(--space-lg)',
      background: 'var(--d-page)',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', marginBottom: 'var(--space-sm)', color: 'var(--d-ink)' }}>
          Mijn Cyclus
        </h1>

        <p style={{ color: 'var(--d-ink-2)', fontSize: '15px', marginBottom: 'var(--space-lg)' }}>
          Dag {currentDay} van {menstrualData.cycleLength}
        </p>

        <div style={{
          background: 'var(--d-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: 'var(--space-lg)',
          borderRadius: '22px',
          marginBottom: 'var(--space-lg)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09), inset 0 0 30px rgba(199, 154, 110, 0.08)',
        }}>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label style={{ fontSize: '12px', color: 'var(--d-ink-3)', textTransform: 'uppercase' }}>
              Huidge Fase
            </label>
            <p style={{ fontSize: '20px', fontWeight: '600', color: 'var(--d-ink)', margin: 'var(--space-sm) 0 0 0' }}>
              {getPhase(currentDay)}
            </p>
          </div>

          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label style={{ fontSize: '12px', color: 'var(--d-ink-3)', textTransform: 'uppercase' }}>
              Volgende Menstruatie
            </label>
            <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--d-ink)', margin: 'var(--space-sm) 0 0 0' }}>
              {new Date(start.getTime() + (menstrualData.cycleLength - currentDay + 1) * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/account')}
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            background: 'var(--d-accent)',
            color: '#1B0F07',
            border: 'none',
            borderRadius: '999px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: 'var(--space-lg)',
          }}
        >
          Instellingen Wijzigen
        </button>
      </div>
    </div>
  )
}

function SetupForm({ onComplete }) {
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [cycleLength, setCycleLength] = useState(28)
  const [bleedingDays, setBleedingDays] = useState(5)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim() || !birthDate || !startDate) {
      setError('Alle velden zijn verplicht')
      return
    }

    const cycle = parseInt(cycleLength)
    const bleed = parseInt(bleedingDays)

    if (cycle < 10 || cycle > 50) {
      setError('Cyclus lengte moet tussen 10 en 50 dagen zijn')
      return
    }

    if (bleed < 1 || bleed > 9) {
      setError('Periode dagen moet tussen 1 en 9 zijn')
      return
    }

    onComplete({
      name,
      birthDate,
      startDate,
      cycleLength: cycle,
      bleedingDays: bleed,
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{
      maxWidth: '400px',
      width: '100%',
      background: 'var(--d-card)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
      padding: 'var(--space-lg)',
      borderRadius: '22px',
    }}>
      {error && (
        <div style={{
          background: 'rgba(192, 73, 45, 0.18)',
          color: 'var(--error)',
          padding: 'var(--space-md)',
          borderRadius: '8px',
          marginBottom: 'var(--space-lg)',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: 'var(--d-ink-2)' }}>
          Naam
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: 'none',
            background: 'var(--d-card)',
            color: 'var(--d-ink)',
            borderRadius: '12px',
            fontFamily: 'inherit',
            colorScheme: 'dark',
          }}
        />
      </div>

      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: 'var(--d-ink-2)' }}>
          Geboortedatum
        </label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: 'none',
            background: 'var(--d-card)',
            color: 'var(--d-ink)',
            borderRadius: '12px',
            fontFamily: 'inherit',
            colorScheme: 'dark',
          }}
        />
      </div>

      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: 'var(--d-ink-2)' }}>
          Startdatum Huidge Cyclus
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: 'none',
            background: 'var(--d-card)',
            color: 'var(--d-ink)',
            borderRadius: '12px',
            fontFamily: 'inherit',
            colorScheme: 'dark',
          }}
        />
      </div>

      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: 'var(--d-ink-2)' }}>
          Cyclus Lengte (dagen): {cycleLength}
        </label>
        <input
          type="range"
          min="10"
          max="50"
          value={cycleLength}
          onChange={(e) => setCycleLength(e.target.value)}
          style={{
            width: '100%',
            accentColor: 'var(--d-accent)',
            height: '6px',
            cursor: 'pointer',
          }}
        />
      </div>

      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: 'var(--d-ink-2)' }}>
          Periode Dagen: {bleedingDays}
        </label>
        <input
          type="range"
          min="1"
          max="9"
          value={bleedingDays}
          onChange={(e) => setBleedingDays(e.target.value)}
          style={{
            width: '100%',
            accentColor: 'var(--d-accent)',
            height: '6px',
            cursor: 'pointer',
          }}
        />
      </div>

      <button
        type="submit"
        style={{
          width: '100%',
          padding: 'var(--space-md)',
          background: 'var(--d-accent)',
          color: '#1B0F07',
          border: 'none',
          borderRadius: '999px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        Opslaan
      </button>
    </form>
  )
}
