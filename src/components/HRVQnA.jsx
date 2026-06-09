import { useState } from 'react'
import { Send } from 'react-feather'

export default function HRVQnA({ score }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setLoading(true)

    try {
      // Maak een eenvoudige response gebaseerd op het type vraag
      const answer = getSmartAnswer(userMessage, score)
      setMessages(prev => [...prev, { role: 'assistant', text: answer }])
    } catch (error) {
      console.error('Failed to get answer:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, ik kon je vraag niet verwerken. Probeer het later opnieuw.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p style={{
        margin: '0 0 var(--space-md) 0',
        fontSize: '13px',
        color: 'var(--ink-2)',
      }}>
        Stel vragen over je HRV score of wat je eraan kunt doen.
      </p>

      {/* Chat messages */}
      <div style={{
        background: 'rgba(199, 154, 110, 0.05)',
        borderRadius: '8px',
        padding: 'var(--space-md)',
        marginBottom: 'var(--space-md)',
        minHeight: '120px',
        maxHeight: '300px',
        overflowY: 'auto',
      }}>
        {messages.length === 0 ? (
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-3)' }}>
            Geen vragen nog. Typ iets hieronder om te beginnen.
          </p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{
              marginBottom: '12px',
              textAlign: msg.role === 'user' ? 'right' : 'left',
            }}>
              <div style={{
                display: 'inline-block',
                maxWidth: '80%',
                background: msg.role === 'user' ? 'var(--accent)' : 'white',
                color: msg.role === 'user' ? 'white' : 'var(--ink)',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                lineHeight: 1.5,
                border: msg.role === 'user' ? 'none' : '1px solid rgba(199, 154, 110, 0.2)',
              }}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div style={{
            display: 'inline-block',
            padding: '10px 12px',
            background: 'white',
            borderRadius: '8px',
            fontSize: '13px',
            border: '1px solid rgba(199, 154, 110, 0.2)',
            color: 'var(--ink-2)',
          }}>
            Denken...
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        display: 'flex',
        gap: '8px',
      }}>
        <input
          type="text"
          placeholder="Stel een vraag..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '1px solid rgba(199, 154, 110, 0.2)',
            borderRadius: '8px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            transition: 'all 150ms ease',
          }}
        />
        <button
          onClick={handleAsk}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 12px',
            background: input.trim() && !loading ? 'var(--accent)' : 'rgba(199, 154, 110, 0.3)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            if (input.trim() && !loading) {
              e.currentTarget.style.background = 'var(--accent)'
              e.currentTarget.style.opacity = '0.9'
            }
          }}
          onMouseLeave={(e) => {
            if (input.trim() && !loading) {
              e.currentTarget.style.background = 'var(--accent)'
              e.currentTarget.style.opacity = '1'
            }
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

// Eenvoudige rule-based antwoorden (later kunnen we dit uitbreiden met Claude API)
function getSmartAnswer(question, score) {
  const q = question.toLowerCase()

  // HRV-gerelateerde vragen
  if (q.includes('wat is hrv') || q.includes('wat betekent hrv')) {
    return 'HRV (Hartritme Variabiliteit) is de variatie in tijd tussen je hartslag. Een hogere HRV wijst op beter stress-herstel en gezondheid. Het is belangrijk voor perimenopauze omdat hormoonale veranderingen HRV beïnvloeden.'
  }

  if (q.includes('waarom laag') || q.includes('waarom is mijn score laag') || q.includes('score te laag')) {
    return `Je score van ${score} kan laag zijn door: stress, slechte slaap, nachtelijk zweten (bij perimenopauze), caffeine, of te veel alcohol. Probeer deze factoren te adresseren.`
  }

  if (q.includes('hoe verhogen') || q.includes('verbeteren') || q.includes('hoger')) {
    return 'Je HRV verbeteren doe je door: 1) Meer slapen (7-9 uur), 2) Stressreductie (meditatie/yoga), 3) Regelmatige beweging, 4) Minder caffeine & alcohol, 5) Consistent slaaproutine.'
  }

  if (q.includes('perimenopauze') || q.includes('menopauze')) {
    return 'Tijdens perimenopauze kunnen hormoonale fluctuaties je HRV beïnvloeden. Hete flitsen en nachtelijk zweten verstoren slaap, wat HRV verlaagt. Dit is normaal. Focus op slaaphygiëne en stressbeheersing.'
  }

  if (q.includes('slaap') || q.includes('slapen')) {
    return 'Slaap is cruciaal voor HRV. Nachtelijk zweten verstoort slaap. Zorg voor een koele slaapkamer (16-19°C), ventilatie, en consistent slaaproutine. Dit helpt je HRV.'
  }

  // Fallback
  return 'Goeie vraag! Voor meer specifieke medische advies, raadpleeg een arts. Maar over het algemeen: veel slapen, stress reduceren, en regelmatig bewegen helpen je HRV.'
}
