import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { startOnboarding } from '../../api/api'
import ProgressBar from '../../components/ProgressBar'

const PHASES = ['Doel verwerken', 'Profiel matchen', 'Formule samenstellen', 'Voorraad checken']

export default function AnalysisStep() {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState(0)
  const [error, setError] = useState(null)
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  // Houdt het API-resultaat vast zodra het binnenkomt
  const resultRef = useRef(null)
  const apiDoneRef = useRef(false)

  // Progress-animatie â€” loopt ~3 seconden
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100 }
        return p + 100 / 30
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Fase-labels
  useEffect(() => {
    const timer = setInterval(() => {
      setPhase(p => p < PHASES.length - 1 ? p + 1 : p)
    }, 600)
    return () => clearInterval(timer)
  }, [])

  // Start API-call direct bij mount â€” parallel aan de animatie
  useEffect(() => {
    startOnboarding({
      goal: state.goal,
      age: state.profile?.age,
      sex: state.profile?.gender,
      diet: state.profile?.diet,
    })
      .then(data => {
        resultRef.current = data
        apiDoneRef.current = true
        // Als animatie al klaar was, navigeer direct
        if (progress >= 100) commitAndNavigate(data)
      })
      .catch(err => {
        if (err.status === 401) {
          navigate('/signin')
        } else {
          setError('Er is iets misgegaan. Probeer het opnieuw.')
        }
      })
  }, [])

  // Navigeer zodra animatie klaar is Ã©n API klaar is
  useEffect(() => {
    if (progress >= 100 && apiDoneRef.current && resultRef.current) {
      commitAndNavigate(resultRef.current)
    }
  }, [progress])

  function commitAndNavigate(data) {
    dispatch({ type: 'SET_FORMULA', payload: data.formula })
    dispatch({ type: 'SET_ONBOARDING_ID', payload: data.id })
    navigate('/onboarding/formula')
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--ink)', marginBottom: 'var(--space-md)' }}>{error}</p>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: ''15px'' }}>
          Terug
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '60vh' }}>
      <h1 style={{ fontSize: ''26px'', fontWeight: '600', letterSpacing: '-1px', marginBottom: 'var(--space-md)' }}>AI analyseert je profiel</h1>
      <p style={{ color: 'var(--ink-2)', marginBottom: 'var(--space-lg)', minHeight: '24px' }}>{PHASES[phase]}</p>
      <ProgressBar value={progress} />
    </div>
  )
}

