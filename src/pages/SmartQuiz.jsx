import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Moon, Frown, Circle, Zap, HelpCircle, AlertCircle, Heart, TrendingDown, CheckCircle, Clock, Plus, Save } from 'react-feather'
import hero from '../assets/hero1.png'

const getIcon = (iconName) => {
  const icons = {
    moon: <Moon size={20} strokeWidth={1.5} />,
    frown: <Frown size={20} strokeWidth={1.5} />,
    circle: <Circle size={20} strokeWidth={1.5} />,
    zap: <Zap size={20} strokeWidth={1.5} />,
    help: <HelpCircle size={20} strokeWidth={1.5} />,
    alert: <AlertCircle size={20} strokeWidth={1.5} />,
    heart: <Heart size={20} strokeWidth={1.5} />,
    trend: <TrendingDown size={20} strokeWidth={1.5} />,
    check: <CheckCircle size={20} strokeWidth={1.5} />,
    clock: <Clock size={20} strokeWidth={1.5} />,
    plus: <Plus size={20} strokeWidth={1.5} />,
    save: <Save size={20} strokeWidth={1.5} />,
  }
  return icons[iconName] || null
}

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
    setAnswers({ ...answers, [currentKey]: value })
    setStep(step + 1)
  }

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--container-padding) var(--space-xxl)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fade-slide-up 240ms ease both',
      backgroundImage: `url(${hero})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>

      <div style={{ maxWidth: '600px', width: '100%' }}>

        {/* Progress bar */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{
            height: '4px',
            background: 'var(--border)',
            borderRadius: 'var(--radius-pill)',
            overflow: 'hidden',
            marginBottom: 'var(--space-sm)',
          }}>
            <div style={{
              height: '100%',
              background: 'var(--accent)',
              width: `${((step + 1) / 4) * 100}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <p style={{ fontSize: '11px', color: 'var(--ink-3)', margin: 0 }}>
            Vraag {step + 1} van 4
          </p>
        </div>

        {/* Question */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          fontWeight: '500',
          color: 'var(--ink)',
          marginBottom: 'var(--space-xl)',
          lineHeight: 1.25,
        }}>
          {currentQuestion.text}
        </h1>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          {currentQuestion.options.map(option => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid var(--border)',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-body)',
                fontFamily: 'var(--font-sans)',
                fontWeight: '500',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                display: 'flex',
                gap: 'var(--space-md)',
                alignItems: 'flex-start',
                color: 'var(--ink)',
              }}
              onMouseEnter={e => {
                e.target.style.borderColor = 'var(--accent)'
                e.target.style.background = 'var(--surface-warm)'
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.background = 'var(--surface)'
              }}
            >
              <span style={{ flexShrink: 0, color: 'var(--ink-2)' }}>{getIcon(option.icon)}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>

      </div>

    </div>
  )
}
