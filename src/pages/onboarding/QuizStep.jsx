import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingShell from './OnboardingShell'
import Button from '../../components/Button'

const QUIZ_STEPS = ['Welkom', 'Quiz', 'Advies', 'Betaling']

const QUESTIONS = [
  {
    key: 'goal',
    question: 'Wat is je voornaamste doel?',
    options: [
      { value: 'energie',    label: 'Meer energie' },
      { value: 'slaap',      label: 'Beter slapen' },
      { value: 'stress',     label: 'Minder stress' },
      { value: 'herstel',    label: 'Sneller herstel' },
      { value: 'immuniteit', label: 'Sterker immuunsysteem' },
    ],
  },
  {
    key: 'sleep',
    question: 'Hoe slaap je gemiddeld?',
    options: [
      { value: 'goed',   label: 'Goed Â· 7 uur of meer' },
      { value: 'matig',  label: 'Matig Â· 6â€“7 uur' },
      { value: 'slecht', label: 'Slecht Â· minder dan 6 uur' },
    ],
  },
  {
    key: 'stress',
    question: 'Hoeveel stress ervaar je dagelijks?',
    options: [
      { value: 'weinig',    label: 'Weinig' },
      { value: 'gemiddeld', label: 'Gemiddeld' },
      { value: 'veel',      label: 'Veel' },
    ],
  },
  {
    key: 'activity',
    question: 'Hoe actief ben je?',
    options: [
      { value: 'laag',  label: 'Weinig actief Â· zittend werk' },
      { value: 'matig', label: 'Matig Â· 3â€“5x per week bewegen' },
      { value: 'hoog',  label: 'Zeer actief Â· dagelijks sporten' },
    ],
  },
  {
    key: 'energy',
    question: 'Hoe is je energieniveau overdag?',
    options: [
      { value: 'goed',      label: 'Constant goed' },
      { value: 'wisselend', label: 'Wisselend' },
      { value: 'laag',      label: 'Laag â€” voel me vaak moe' },
    ],
  },
]

export default function QuizStep() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState({})

  const allAnswered = QUESTIONS.every(q => answers[q.key])

  function select(key, value) {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  function submit() {
    localStorage.setItem('youcaps_quiz', JSON.stringify(answers))
    localStorage.removeItem('youcaps_advice')
    navigate('/welkom/advies')
  }

  return (
    <OnboardingShell step={2} steps={QUIZ_STEPS}>
      <h1 style={{
        fontSize: ''26px'',
        fontWeight: '600',
        letterSpacing: '-1px',
        lineHeight: 1.1,
        marginBottom: 'var(--space-sm)',
      }}>
        Snel wat vragen.
      </h1>
      <p style={{
        fontSize: ''15px'',
        color: 'var(--ink-2)',
        lineHeight: 1.6,
        marginBottom: 'var(--space-xl)',
      }}>
        5 vragen, dan genereren we je persoonlijke formule.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        {QUESTIONS.map(q => (
          <div key={q.key}>
            <p style={{
              fontSize: ''15px'',
              fontWeight: '500',
              marginBottom: 'var(--space-sm)',
            }}>
              {q.question}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {q.options.map(opt => {
                const selected = answers[q.key] === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => select(q.key, opt.value)}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 0,
                      border: selected ? '2px solid var(--ink)' : '1px solid var(--border)',
                      background: selected ? 'var(--ink)' : 'white',
                      color: selected ? 'white' : 'var(--ink)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                      animation: selected ? 'pop-in 200ms ease both' : 'none',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {allAnswered && (
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <Button onClick={submit}>Genereer mijn formule â†’</Button>
        </div>
      )}
    </OnboardingShell>
  )
}

