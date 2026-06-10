import { useState, useEffect } from 'react'
import { startFemQuiz, saveFemAnswer, giveQuizConsent, getFemResult } from '../../api/client'

// Import step components
import Opening from '../../components/fem/Opening'
import ReasonStep from '../../components/fem/ReasonStep'
import SleepStep from '../../components/fem/SleepStep'
import MoodStep from '../../components/fem/MoodStep'
import StressStep from '../../components/fem/StressStep'
import EnergyStep from '../../components/fem/EnergyStep'
import CycleStep from '../../components/fem/CycleStep'
import MicroResult from '../../components/fem/MicroResult'
import WearableOption from '../../components/fem/WearableOption'
import ResultScreen from '../../components/fem/ResultScreen'

const SCREEN_LABELS = [
  'Opening',
  'Wat bracht je hier?',
  'Slaap',
  'Stemming',
  'Stress & Herstel',
  'Energie',
  'Cyclus',
  'Micro-Resultaat',
  'Wearable (optioneel)',
  'Resultaat',
]

export default function FemQuizFunnel({ onComplete }) {
  const [step, setStep] = useState(0)
  const [sessionId, setSessionId] = useState(null)
  const [data, setData] = useState({
    reason: null,
    sleep_change: null,
    mood_change: null,
    stress_recovery: null,
    energy_pattern: null,
    cycle_change: null,
  })
  const [, setConsentGiven] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Initialize quiz on mount
  useEffect(() => {
    async function init() {
      try {
        const res = await startFemQuiz({})
        setSessionId(res.session_id)
      } catch (e) {
        setError(`Failed to start quiz: ${e.message}`)
      }
    }
    init()
  }, [])

  async function handleNext() {
    if (!sessionId) return

    // Save current answer
    setLoading(true)
    try {
      // Map step to field
      const fieldMap = {
        1: 'reason',
        2: 'sleep_change',
        3: 'mood_change',
        4: 'stress_recovery',
        5: 'energy_pattern',
        6: 'cycle_change',
      }

      if (step in fieldMap) {
        const field = fieldMap[step]
        const answer = data[field]
        if (answer) {
          await saveFemAnswer(sessionId, { step, answer })
        }
      }

      // At step 7 (micro-result), advance with consent flow
      if (step === 7) {
        // Show consent modal (handled by MicroResult component)
        // Don't advance here; let component handle it
        return
      }

      setStep(step + 1)
    } catch (e) {
      setError(`Failed to save answer: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleConsent() {
    if (!sessionId) return
    setLoading(true)
    try {
      await giveQuizConsent(sessionId)
      setConsentGiven(true)
      setStep(8)  // Proceed to wearable screen
    } catch (e) {
      setError(`Consent failed: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleWearableSkip() {
    if (!sessionId) return
    setLoading(true)
    try {
      const res = await getFemResult(sessionId)
      setResult(res)
      setStep(9)
    } catch (e) {
      setError(`Failed to fetch result: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  function handleDataChange(field, value) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function handleBack() {
    if (step > 0) setStep(step - 1)
  }

  // Render
  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--container-padding) var(--space-xxl)',
      animation: 'fade-slide-up 240ms ease both',
    }}>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <button
          onClick={() => {
            setStep(0)
            setData({})
            setConsentGiven(false)
            setResult(null)
          }}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--ink-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          ← Reset
        </button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: '15px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ink)',
        }}>
          YOUCAPS FEM
        </span>
        <button
          onClick={onComplete}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--ink-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Sluit
        </button>
      </nav>

      {/* Progress Bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: 'var(--space-xl)' }}>
        {SCREEN_LABELS.map((_, i) => (
          <div key={i} style={{
            height: '2px',
            flex: 1,
            background: i < step ? 'var(--ink)' : i === step ? 'var(--ink)' : 'var(--border)',
            transition: 'background 250ms ease-out',
          }} />
        ))}
      </div>

      <div style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: 400,
        color: 'var(--ink-2)',
        marginBottom: 'var(--space-xl)',
      }}>
        Scherm {step + 1} van {SCREEN_LABELS.length}
      </div>

      {error && (
        <div style={{
          background: 'rgba(192, 73, 45, 0.08)',
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-lg)',
          color: 'var(--error)',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 400,
          border: `1px solid var(--error)`,
        }}>
          {error}
        </div>
      )}

      {/* Screen Components */}
      {step === 0 && <Opening onNext={handleNext} />}
      {step === 1 && (
        <ReasonStep
          value={data.reason}
          onChange={v => handleDataChange('reason', v)}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {step === 2 && (
        <SleepStep
          value={data.sleep_change}
          onChange={v => handleDataChange('sleep_change', v)}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {step === 3 && (
        <MoodStep
          value={data.mood_change}
          onChange={v => handleDataChange('mood_change', v)}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {step === 4 && (
        <StressStep
          value={data.stress_recovery}
          onChange={v => handleDataChange('stress_recovery', v)}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {step === 5 && (
        <EnergyStep
          value={data.energy_pattern}
          onChange={v => handleDataChange('energy_pattern', v)}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {step === 6 && (
        <CycleStep
          value={data.cycle_change}
          onChange={v => handleDataChange('cycle_change', v)}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {step === 7 && (
        <MicroResult
          data={data}
          onConsent={handleConsent}
          onBack={handleBack}
          loading={loading}
        />
      )}
      {step === 8 && (
        <WearableOption
          onSkip={handleWearableSkip}
          onConnect={() => {}}  // Wearable integration optional
          loading={loading}
        />
      )}
      {step === 9 && result && (
        <ResultScreen
          result={result}
          onRestart={() => {
            setStep(0)
            setData({})
            setConsentGiven(false)
            setResult(null)
          }}
          onClose={onComplete}
        />
      )}

    </div>
  )
}
