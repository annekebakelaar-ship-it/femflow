import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const QUESTIONS = {
  q1: {
    text: "Wat voelt anders?",
    type: "choice",
    options: [
      { value: "sleep", label: "Mijn slaap is veranderd", icon: "moon" },
      { value: "mood", label: "Mijn stemming verrast me", icon: "frown" },
      { value: "cycle", label: "Mijn cyclus voelt anders", icon: "circle" },
      { value: "energy", label: "Mijn energie zakt weg", icon: "zap" },
      { value: "idk", label: "Eigenlijk weet ik niet precies... alles voelt anders", icon: "help" },
    ],
  },
  q2_sleep: {
    text: "Hoe is je slaap veranderd?",
    type: "choice",
    options: [
      { value: "wakker_nachts", label: "Ik word 's nachts vaker wakker", icon: "alert" },
      { value: "moeilijk_inslapen", label: "Ik val moeilijker in slaap", icon: "moon" },
      { value: "niet_uitgerust", label: "Ik slaap genoeg uren maar voel me niet uitgerust", icon: "moon" },
    ],
  },
  q2_mood: {
    text: "Hoe reageert je stemming?",
    type: "choice",
    options: [
      { value: "geirriteerd", label: "Sneller geïrriteerd, zonder duidelijke reden", icon: "frown" },
      { value: "overweldigd", label: "Sneller overweldigd", icon: "alert" },
      { value: "emotioneler", label: "Emotioneler dan ik van mezelf verwacht", icon: "heart" },
    ],
  },
  q2_cycle: {
    text: "Hoe voelt je cyclus anders?",
    type: "choice",
    options: [
      { value: "korter_langer", label: "Korter of langer geworden", icon: "circle" },
      { value: "onregelmatig", label: "Onregelmatiger", icon: "circle" },
      { value: "zwaarder_lichter", label: "Zwaarder of lichter", icon: "circle" },
    ],
  },
  q2_energy: {
    text: "Hoe voelt je energie?",
    type: "choice",
    options: [
      { value: "eerder_weg", label: "Zakt eerder weg dan vroeger", icon: "trend" },
      { value: "wisselend", label: "Veel wisselender", icon: "zap" },
    ],
  },
  q2_idk: {
    text: "Hoe voelt je lichaam over het geheel?",
    type: "choice",
    options: [
      { value: "veel_veranderd", label: "Ja, veel voelt anders", icon: "check" },
      { value: "beetje_veranderd", label: "Ja, een beetje", icon: "check" },
      { value: "niet_zeker", label: "Eigenlijk niet zeker", icon: "help" },
    ],
  },
  q3_related: {
    text: "Herstelt je lichaam langzamer van inspanning?",
    type: "choice",
    options: [
      { value: "ja", label: "Ja, ik ben sneller moe", icon: "clock" },
      { value: "nee", label: "Nee, dat voelt hetzelfde", icon: "check" },
      { value: "niet_zeker", label: "Weet ik niet precies", icon: "help" },
    ],
  },
  q4_final: {
    text: "Mag ik dit patroon bewaren?",
    type: "choice",
    options: [
      { value: "yes", label: "Ja, bewaar mijn patroon", icon: "save" },
      { value: "no", label: "Nee, niet nodig", icon: "check" },
    ],
  },
}

export default function SmartQuiz() {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const email = location.state?.email || null

  // Build questions order based on current answers
  const getQuestionsOrder = () => {
    const order = ['q1']
    if (step >= 1 && answers.q1) {
      order.push(`q2_${answers.q1}`)
    }
    if (step >= 2) {
      order.push('q3_related')
    }
    if (step >= 3) {
      order.push('q4_final')
    }
    return order
  }

  const questionsOrder = getQuestionsOrder()
  const currentQuestion = QUESTIONS[questionsOrder[step]]

  // If no current question, quiz is complete
  if (!currentQuestion) {
    const constellation = {
      sleep: !!answers[`q2_${answers.q1}`],
      mood: answers.q1 === 'mood',
      stress: answers.q3_related === 'ja',
      energy: answers.q1 === 'energy',
      cycle: answers.q1 === 'cycle',
    }
    navigate('/quiz/results', { state: { answers, constellation, email } })
    return null
  }

  function handleAnswer(value) {
    const currentKey = questionsOrder[step]
    const newAnswers = { ...answers, [currentKey]: value }
    setAnswers(newAnswers)

    // If this is q4_final and user selected "yes"
    if (currentKey === 'q4_final' && value === 'yes') {
      const constellation = {
        sleep: !!newAnswers[`q2_${newAnswers.q1}`],
        mood: newAnswers.q1 === 'mood',
        stress: newAnswers.q3_related === 'ja',
        energy: newAnswers.q1 === 'energy',
        cycle: newAnswers.q1 === 'cycle',
      }
      // Save to localStorage for now, will be saved to DB after login
      localStorage.setItem('pending_quiz_results', JSON.stringify({ email, constellation }))
      // Navigate directly to login page
      navigate('/login', { state: { constellation, email } })
      return
    }

    // If this is q4_final and user selected "no", go to results page without saving
    if (currentKey === 'q4_final' && value === 'no') {
      const constellation = {
        sleep: !!newAnswers[`q2_${newAnswers.q1}`],
        mood: newAnswers.q1 === 'mood',
        stress: newAnswers.q3_related === 'ja',
        energy: newAnswers.q1 === 'energy',
        cycle: newAnswers.q1 === 'cycle',
      }
      navigate('/quiz/results', { state: { answers: newAnswers, constellation, email } })
      return
    }

    // Otherwise continue to next question
    setStep(step + 1)
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px 16px 120px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fade-slide-up 240ms ease both',
      background: 'var(--d-page)',
    }}>

      <div style={{ maxWidth: '600px', width: '100%' }}>

        {/* Progress bar */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{
            height: '3px',
            background: 'var(--d-border)',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: 'var(--space-sm)',
          }}>
            <div style={{
              height: '100%',
              background: 'var(--d-accent)',
              width: `${((step + 1) / 4) * 100}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <p style={{
            fontSize: '11px',
            fontFamily: 'var(--font-sans)',
            fontWeight: '600',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--d-ink-3)',
            margin: 0,
          }}>
            Vraag {step + 1} van 4
          </p>
        </div>

        {/* Question */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          fontWeight: '500',
          color: 'var(--d-ink)',
          marginBottom: 'var(--space-xl)',
          lineHeight: 1.25,
        }}>
          {currentQuestion.text}
        </h1>

        {/* Antwoorden: doorlopende kale lijst — geen vakken, geen randen,
            alleen tekst; bij aanraken licht de regel iets op */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 'var(--space-lg)' }}>
          {currentQuestion.options.map(option => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              style={{
                padding: '16px 12px',
                border: 'none',
                background: 'transparent',
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: 'var(--font-sans)',
                fontWeight: '500',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 150ms ease',
                color: 'var(--d-ink)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 248, 240, 0.07)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              onTouchStart={e => { e.currentTarget.style.background = 'rgba(255, 248, 240, 0.07)' }}
              onTouchEnd={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {option.label}
            </button>
          ))}
        </div>

      </div>

    </div>
  )
}
