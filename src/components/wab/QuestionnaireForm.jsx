import { useState } from 'react'

const QUESTIONS = [
  {
    key: 'activity',
    label: 'How active are you?',
    hint: 'Average over the past month',
    options: [
      { value: 'sedentary', label: 'Sedentary',  sub: 'Mostly desk work, little exercise' },
      { value: 'moderate',  label: 'Moderate',   sub: '2–3 workouts per week' },
      { value: 'active',    label: 'Active',     sub: '4–5 workouts per week' },
      { value: 'athlete',   label: 'Athlete',    sub: 'Daily training or competitive sport' },
    ],
  },
  {
    key: 'sleep',
    label: 'How do you generally sleep?',
    hint: 'Think about the past 2 weeks',
    options: [
      { value: 'poor',      label: 'Poor',      sub: 'Often wake up, feel unrestored' },
      { value: 'average',   label: 'Average',   sub: 'Okay, sometimes disrupted' },
      { value: 'good',      label: 'Good',      sub: 'Mostly restful nights' },
      { value: 'excellent', label: 'Excellent', sub: 'Deep, consistent, refreshed' },
    ],
  },
  {
    key: 'energy',
    label: 'How are your daily energy levels?',
    hint: 'Without coffee compensation',
    options: [
      { value: 'very_low',  label: 'Very low',  sub: 'Fatigued most of the day' },
      { value: 'low',       label: 'Low',       sub: 'Often sluggish' },
      { value: 'moderate',  label: 'Moderate',  sub: 'Up and down' },
      { value: 'high',      label: 'High',      sub: 'Alert and productive' },
      { value: 'very_high', label: 'Very high', sub: 'Consistent energy all day' },
    ],
  },
  {
    key: 'stress',
    label: 'What is your average stress level?',
    hint: 'Work, life, relationships combined',
    options: [
      { value: 'very_high', label: 'Very high', sub: 'Constant pressure' },
      { value: 'high',      label: 'High',      sub: 'Frequently stressed' },
      { value: 'moderate',  label: 'Moderate',  sub: 'Sometimes stressed' },
      { value: 'low',       label: 'Low',       sub: 'Generally calm' },
      { value: 'very_low',  label: 'Very low',  sub: 'Rarely stressed' },
    ],
  },
  {
    key: 'recovery',
    label: 'How quickly do you recover after exercise?',
    hint: 'Muscle soreness, energy return',
    options: [
      { value: 'none',    label: "I don't exercise", sub: 'Less than once a week' },
      { value: 'slow',    label: 'Slowly',           sub: 'More than 48 hours' },
      { value: 'average', label: 'Average',          sub: '24 – 48 hours' },
      { value: 'fast',    label: 'Fast',             sub: 'Less than 24 hours' },
    ],
  },
  {
    key: 'rhr',
    label: 'Do you know your resting heart rate?',
    hint: 'From a smartwatch, fitness tracker, or manual check',
    options: [
      { value: 'under50', label: 'Under 50 bpm', sub: 'Athletic range' },
      { value: '50to60',  label: '50 – 60 bpm',  sub: 'Very good' },
      { value: '60to70',  label: '60 – 70 bpm',  sub: 'Normal' },
      { value: '70to80',  label: '70 – 80 bpm',  sub: 'Average' },
      { value: 'unknown', label: "I don't know", sub: "We'll estimate it" },
    ],
  },
]

function estimateBiomarkers({ activity, sleep, energy, stress, recovery, rhr }) {
  const activityLevel = activity || 'moderate'

  // HRV estimate (ms)
  let hrv = 44
  const sleepBonus  = { poor: -16, average: -5, good: 6, excellent: 14 }
  const stressBonus = { very_high: -16, high: -9, moderate: 0, low: 6, very_low: 11 }
  const actBonus    = { sedentary: -7, moderate: 0, active: 7, athlete: 14 }
  hrv += (sleepBonus[sleep] || 0) + (stressBonus[stress] || 0) + (actBonus[activityLevel] || 0)
  if (energy === 'very_high') hrv += 5
  if (energy === 'high')      hrv += 2
  if (energy === 'very_low')  hrv -= 9
  if (energy === 'low')       hrv -= 4
  // Athlete + good sleep synergy
  if (activityLevel === 'athlete' && (sleep === 'good' || sleep === 'excellent')) hrv += 5
  // Stress + poor sleep compound
  if ((stress === 'very_high' || stress === 'high') && (sleep === 'poor' || sleep === 'average')) hrv -= 5

  // RHR estimate (bpm)
  let rhrVal
  const knownRHR = { under50: 47, '50to60': 55, '60to70': 65, '70to80': 75 }
  if (rhr !== 'unknown') {
    rhrVal = knownRHR[rhr]
  } else {
    const actRHR = { sedentary: 72, moderate: 66, active: 59, athlete: 51 }
    rhrVal = actRHR[activityLevel] || 66
    if (stress === 'very_high') rhrVal += 6
    if (stress === 'high')      rhrVal += 3
    if (stress === 'low')       rhrVal -= 2
    if (stress === 'very_low')  rhrVal -= 4
    if (sleep === 'poor')       rhrVal += 3
    if (sleep === 'excellent')  rhrVal -= 2
  }

  // Deep sleep estimate (min/night)
  const sleepBase = { poor: 40, average: 60, good: 78, excellent: 96 }
  let deep = sleepBase[sleep] || 60
  if (energy === 'very_high') deep += 9
  if (energy === 'high')      deep += 4
  if (energy === 'very_low')  deep -= 13
  if (energy === 'low')       deep -= 6
  if (recovery === 'fast')    deep += 6
  if (recovery === 'slow')    deep -= 6
  if (activityLevel === 'athlete' && sleep !== 'poor') deep += 5

  return {
    hrv_avg:        Math.max(10, Math.min(120, Math.round(hrv))),
    rhr_avg:        Math.max(40, Math.min(100, Math.round(rhrVal))),
    deep_sleep_avg: Math.max(20, Math.min(140, Math.round(deep))),
    activity_level: activityLevel,
    provider: 'questionnaire',
  }
}

export default function QuestionnaireForm({ onData, onBack }) {
  const [answers, setAnswers] = useState({})
  const [step, setStep] = useState(0)

  const q = QUESTIONS[step]
  const total = QUESTIONS.length
  const progress = (step / total) * 100

  function select(value) {
    const next = { ...answers, [q.key]: value }
    setAnswers(next)
    if (step < total - 1) {
      setStep(s => s + 1)
    } else {
      onData(estimateBiomarkers(next))
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={step === 0 ? onBack : undefined}
      />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 'var(--container-max)',
        background: 'var(--color-bg)',
        padding: 'var(--space-lg) var(--container-padding)',
        paddingBottom: 'calc(var(--space-xl) + env(safe-area-inset-bottom, 0px))',
        animation: 'fade-slide-up 240ms ease both',
        borderTop: '1px solid var(--color-border)',
        maxHeight: '92vh',
        overflowY: 'auto',
      }}>

        {/* Progress bar */}
        <div style={{ height: 2, background: 'var(--color-border-subtle)', marginBottom: 'var(--space-lg)' }}>
          <div style={{
            height: '100%', background: 'var(--color-text)',
            width: `${progress}%`, transition: 'width 0.35s ease',
          }} />
        </div>

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)',
            color: 'var(--color-label)', letterSpacing: '.4px',
            textTransform: 'uppercase', marginBottom: 6,
          }}>
            {step + 1} / {total}
          </p>
          <h2 style={{ fontSize: 'var(--font-size-heading)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: '-0.5px', marginBottom: 4 }}>
            {q.label}
          </h2>
          <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-label)' }}>{q.hint}</p>
        </div>

        {/* Options */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          {q.options.map(o => (
            <button
              key={o.value}
              onClick={() => select(o.value)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 0',
                background: 'none', border: 'none',
                borderBottom: '1px solid var(--color-border-subtle)',
                cursor: 'pointer', width: '100%', textAlign: 'left',
                transition: 'opacity var(--transition-fast)',
                opacity: answers[q.key] && answers[q.key] !== o.value ? 0.35 : 1,
              }}
            >
              <div>
                <p style={{
                  fontSize: 'var(--font-size-body)',
                  fontWeight: answers[q.key] === o.value ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                  marginBottom: 2,
                }}>
                  {o.label}
                </p>
                <p style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-label)', fontFamily: 'var(--font-mono)' }}>
                  {o.sub}
                </p>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-micro)',
                color: answers[q.key] === o.value ? 'var(--color-text)' : 'var(--color-label)',
                flexShrink: 0, marginLeft: 12,
              }}>
                {answers[q.key] === o.value ? '✓' : '→'}
              </span>
            </button>
          ))}
        </div>

        {/* Back */}
        {step > 0 ? (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{
              background: 'none', border: 'none', padding: 0,
              fontSize: 'var(--font-size-small)', color: 'var(--color-label)',
              cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px',
            }}
          >
            ← Previous question
          </button>
        ) : (
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', padding: 0,
              fontSize: 'var(--font-size-small)', color: 'var(--color-label)',
              cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px',
            }}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}
