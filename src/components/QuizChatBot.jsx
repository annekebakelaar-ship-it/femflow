import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle } from 'react-feather'

const INITIAL_MESSAGE = {
  type: 'bot',
  text: 'Hallo! 👋 Ik ben je persoonlijke gezondheidsassistent. Heb je vragen over je quiz resultaten of wil je meer weten over hoe je je gezondheid kunt verbeteren?',
}

const RESPONSE_PATTERNS = {
  sleep: {
    keywords: ['slaap', 'slapen', 'moe', 'vermoeid', 'uitgeput'],
    responses: [
      'Slaap is fundamenteel voor je gezondheid. Ik raad aan: 7-9 uur per nacht, consistent slaapschema, geen schermen 1 uur voor bed, en een koele, donkere slaapkamer.',
      'Vermoeidheid kan heel veel veroorzaken. Probeer je slaappatroon te tracken op je wearable en zie of je voldoende diepe slaap krijgt.',
      'Goede slaap helpt je hormonen, energie, en stemming. Wil je je slaap gaan tracken? Je kunt dit doen via je wearable dashboard.',
    ],
  },
  mood: {
    keywords: ['stemming', 'emotie', 'droevig', 'blij', 'gestrest', 'gelukkig'],
    responses: [
      'Je stemming wordt beïnvloed door veel factoren: slaap, beweging, voeding, en sociale connectie. Wat voelt nu het meest relevant?',
      'Beweging en buiten tijd helpen enorm voor je stemming. Zelfs 20 minuten wandelen kan verschil maken.',
      'Je menstruatiecyclus beïnvloedt je stemming. Probeer patronen op te merken en zorg extra goed voor jezelf in je luteale fase.',
    ],
  },
  stress: {
    keywords: ['stress', 'gespannen', 'angstig', 'onrustig', 'overweldigd'],
    responses: [
      'Stress management is essentieel. Probeer: ademhalingsoefeningen, meditatie, yoga, of gewoon 10 minuten buiten zijn.',
      'Je lichaam heeft rust nodig. Zorg dat je voldoende slaap krijgt en plan rustmomenten in je dag.',
      'Stress remt je genezing af. Log je stressniveaus in je lifestyle check en zie welke triggers je kunt vermijden.',
    ],
  },
  energy: {
    keywords: ['energie', 'moe', 'energieloos', 'traag', 'actief'],
    responses: [
      'Energie komt van: goede voeding (vooral eiwitten), voldoende water, regelmatige beweging, en goede slaap.',
      'Je energieniveaus veranderen door je cyclus. In je folliculaire fase heb je meestal meer energie - plan intensieve trainingen dan.',
      'Zou je willen beginnen met het tracken van je trainingen en voeding? Dit helpt je patronen herkennen.',
    ],
  },
  cycle: {
    keywords: ['cyclus', 'menstruatie', 'hormoon', 'periode', 'PMS'],
    responses: [
      'Je cyclus is niet iets wat je moet "behandelen" - het is informatie! Elke fase heeft andere behoeften en sterktes.',
      'In je folliculaire fase (dagen 5-10) heb je meer energie. In je luteale fase (dagen 16+) heb je meer rust en voeding nodig.',
      'Wanneer je je cyclus tracked, kun je je trainingen, voeding, en rust daarop afstemmen. Wil je je cyclus gaan tracken?',
    ],
  },
  general: {
    keywords: [],
    responses: [
      'Goeie vraag! Wil je meer specifiek worden? Bijvoorbeeld over slaap, stemming, stress, energie, of cyclus?',
      'Elke persoon is anders. Wat werkt voor jou, zou je kunnen ontdekken door dingen te tracken en patronen op te merken.',
      'Dit zijn goede onderwerpen om te onderzoeken. Ik ben hier om je te helpen je gezondheid beter te begrijpen.',
    ],
  },
}

function getResponse(userMessage, activeSignals) {
  const lowerMessage = userMessage.toLowerCase()

  // Check each signal category
  for (const signal of activeSignals) {
    const patterns = RESPONSE_PATTERNS[signal]
    if (patterns.keywords.some(k => lowerMessage.includes(k))) {
      return patterns.responses[Math.floor(Math.random() * patterns.responses.length)]
    }
  }

  // Check for general keywords
  for (const [key, patterns] of Object.entries(RESPONSE_PATTERNS)) {
    if (key !== 'general' && patterns.keywords.some(k => lowerMessage.includes(k))) {
      return patterns.responses[Math.floor(Math.random() * patterns.responses.length)]
    }
  }

  // Default response
  return RESPONSE_PATTERNS.general.responses[Math.floor(Math.random() * RESPONSE_PATTERNS.general.responses.length)]
}

export default function QuizChatBot({ activeSignals = [] }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = { type: 'user', text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate thinking
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate response
    const botResponse = getResponse(input, activeSignals)
    const botMessage = { type: 'bot', text: botResponse }
    setMessages((prev) => [...prev, botMessage])
    setIsLoading(false)
  }

  return (
    <div
      style={{
        background: 'var(--d-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: 'none',
        borderRadius: '22px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
        display: 'flex',
        flexDirection: 'column',
        height: '500px',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(199, 154, 110, 0.35) 0%, rgba(199, 154, 110, 0.12) 100%)',
          padding: 'var(--space-lg)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
        }}
      >
        <MessageCircle size={20} />
        <h3 style={{
          fontSize: 'var(--font-size-body)',
          fontWeight: 'var(--font-weight-semibold)',
          margin: 0,
        }}>
          Gezondheidsassistent
        </h3>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: '12px',
                background: msg.type === 'user' ? 'var(--d-accent)' : 'var(--d-card-solid)',
                color: msg.type === 'user' ? '#1B0F07' : 'var(--d-ink)',
                fontSize: 'var(--font-size-small)',
                lineHeight: '1.5',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--d-ink-3)',
                animation: 'bounce 1.4s infinite',
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--d-ink-3)',
                animation: 'bounce 1.4s infinite 0.2s',
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--d-ink-3)',
                animation: 'bounce 1.4s infinite 0.4s',
              }}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: 'var(--space-md)',
          borderTop: '1px solid var(--d-border)',
          display: 'flex',
          gap: 'var(--space-sm)',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSend()
            }
          }}
          placeholder="Stel een vraag..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: 'var(--space-sm)',
            border: 'none', background: 'var(--d-card-solid)', color: 'var(--d-ink)',
            borderRadius: '8px',
            fontSize: 'var(--font-size-small)',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          style={{
            padding: 'var(--space-sm) var(--space-md)',
            background: 'var(--d-accent)',
            color: '#1B0F07',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            opacity: isLoading || !input.trim() ? 0.5 : 1,
            transition: 'all 200ms ease',
          }}
        >
          <Send size={16} />
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          40% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
