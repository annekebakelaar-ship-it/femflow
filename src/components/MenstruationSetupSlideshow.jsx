import { useState, useRef, useEffect } from 'react'
import { ChevronRight } from 'react-feather'
import WheelPicker from './WheelPicker'
import DayPicker from './DayPicker'

const SYMPTOMS = [
  'Pijn',
  'Moeheid',
  'Bloating',
  'Buienslachtigheid',
  'Hoofdpijn',
  'Borstpijn',
  'Nausea',
  'Acne',
]

export default function MenstruationSetupSlideshow({ onComplete, onCancel }) {
  const [slide, setSlide] = useState(0)
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [bleedingDays, setBleedingDays] = useState('')
  const [cycleLength, setCycleLength] = useState(28)
  const [awareness, setAwareness] = useState('')
  const [monthOffset, setMonthOffset] = useState(0)

  const today = new Date().toISOString().split('T')[0]

  // Calendar for menstruation date slide
  const currentMonth = new Date()
  currentMonth.setMonth(currentMonth.getMonth() + monthOffset)
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const slides = [
    {
      title: 'Hoe kan ik je noemen?',
      subtitle: '',
      content: (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '100%',
          padding: '0 var(--space-lg)',
        }}>
          <input
            type="text"
            placeholder="Jouw naam"
            value={name}
            onChange={(e) => setName(String(e.target.value).substring(0, 100))}
            maxLength="100"
            style={{
              padding: '10px 16px',
              fontSize: 'var(--font-size-body)',
              border: '1px solid #E0E0E0',
              borderRadius: '28px',
              fontFamily: 'var(--font-sans)',
              transition: 'all 200ms ease',
              width: '100%',
              boxSizing: 'border-box',
              height: '40px',
            }}
          />
        </div>
      ),
      isComplete: name.trim().length > 0,
    },
    {
      title: 'Wanneer ben je geboren?',
      subtitle: 'Scrol om je datum in te stellen',
      content: (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <WheelPicker
            value={birthDate ? {
              day: parseInt(birthDate.split('-')[2]),
              month: parseInt(birthDate.split('-')[1]),
              year: parseInt(birthDate.split('-')[0]),
            } : { day: 1, month: 1, year: new Date().getFullYear() }}
            onChange={(val) => {
              const dateStr = `${String(val.year).padStart(4, '0')}-${String(val.month).padStart(2, '0')}-${String(val.day).padStart(2, '0')}`
              setBirthDate(dateStr)
            }}
            minYear={1940}
            maxYear={new Date().getFullYear() - 13}
          />
        </div>
      ),
      isComplete: birthDate.length === 10,
    },
    {
      title: 'Wanneer begon je menstruatie?',
      subtitle: '',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Calendar Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
          }}>
            {/* Day headers */}
            {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(day => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: 'var(--font-size-micro)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-label)',
                  padding: '8px',
                }}
              >
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days */}
            {days.map(day => {
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const dateStr = date.toISOString().split('T')[0]
              const isSelected = startDate === dateStr
              const endOfDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 23, 59, 59)
              const isPast = endOfDay <= new Date()

              return (
                <button
                  key={day}
                  onClick={() => {
                    setStartDate(dateStr)
                    setTimeout(() => setSlide(3), 300)
                  }}
                  disabled={false}
                  style={{
                    padding: '12px 8px',
                    background: isSelected ? '#4F46E5' : isPast ? '#F5F5F5' : '#EEE',
                    color: isSelected ? 'white' : 'var(--color-text)',
                    border: isSelected ? '2px solid #4F46E5' : '1px solid #E0E0E0',
                    borderRadius: '8px',
                    cursor: isPast ? 'pointer' : 'not-allowed',
                    fontWeight: isSelected ? 'var(--font-weight-semibold)' : 'normal',
                    fontSize: 'var(--font-size-small)',
                    transition: 'all 200ms ease',
                    opacity: isPast ? 1 : 0.5,
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      ),
      isComplete: !!startDate,
    },
    {
      title: 'Hoeveel dagen bloed je?',
      subtitle: 'Selecteer het aantal dagen',
      content: (
        <div style={{
          display: 'flex',
          gap: 'var(--space-md)',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => {
                setBleedingDays(num.toString())
                setTimeout(() => setSlide(4), 300)
              }}
              style={{
                minWidth: '60px',
                height: '60px',
                padding: '12px',
                background: bleedingDays === num.toString() ? '#4F46E5' : '#F5F5F5',
                color: bleedingDays === num.toString() ? 'white' : 'var(--color-text)',
                border: bleedingDays === num.toString() ? '2px solid #4F46E5' : '1px solid #E0E0E0',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: '18px',
                transition: 'all 200ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {num}
            </button>
          ))}
        </div>
      ),
      isComplete: !!bleedingDays,
    },
    {
      title: 'Wat is je cyclus lengte?',
      subtitle: 'Scrol omhoog en omlaag om te kiezen',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', alignItems: 'center' }}>
          <DayPicker
            value={cycleLength}
            onChange={setCycleLength}
            minDay={10}
            maxDay={50}
          />
        </div>
      ),
      isComplete: cycleLength >= 10 && cycleLength <= 50,
    },
  ]

  const currentSlide = slides[slide] || slides[0]
  const isComplete = currentSlide.isComplete

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      animation: 'fade-in 200ms ease',
      overflow: 'hidden',
      width: '100%',
      padding: '0 16px',
      boxSizing: 'border-box',
    }}>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 6vw, 28px)',
          fontWeight: '600',
          color: 'var(--ink)',
          margin: 0,
          lineHeight: '1.2',
        }}>
          {currentSlide.title}
        </h2>
        {currentSlide.subtitle && (
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: '400',
            color: 'var(--ink-2)',
            margin: 0,
            lineHeight: '1.5',
          }}>
            {currentSlide.subtitle}
          </p>
        )}
      </div>

      {/* Content */}
      <div style={{
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      }}>
        {currentSlide.content}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginTop: 'auto',
        marginBottom: '16px',
        width: '100%',
      }}>
        <button
          onClick={() => {
            if (isComplete) {
              if (slide < slides.length - 1) {
                setSlide(slide + 1)
              } else {
                onComplete(name, birthDate, startDate, cycleLength)
              }
            }
          }}
          disabled={!isComplete}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: isComplete ? '#4A3F2F' : '#E0E0E0',
            color: isComplete ? 'white' : '#A0A0A0',
            border: 'none',
            borderRadius: '28px',
            cursor: isComplete ? 'pointer' : 'not-allowed',
            fontWeight: 'var(--font-weight-semibold)',
            fontSize: 'var(--font-size-body)',
            transition: 'all 200ms ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            height: '40px',
          }}
        >
          {slide === slides.length - 1 ? 'Klaar' : 'Volgende'}
          {slide < slides.length - 1 && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  )
}
