import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'react-feather'

export default function MenstruationSetupSlideshow({ onComplete, onCancel }) {
  const [slide, setSlide] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [bleedingDays, setBleedingDays] = useState('')
  const [cycleLength, setCycleLength] = useState('')
  const [awareness, setAwareness] = useState('')
  const [monthOffset, setMonthOffset] = useState(0)
  const wheelRef = useRef(null)

  // Auto-advance to wearable slide when previous slide complete
  useEffect(() => {
    // Auto-advance to slide 4 (wearable question) when slide 3 (awareness) is complete
    if (slide === 3 && startDate && bleedingDays && cycleLength && awareness && awareness.split(',').length >= 3) {
      setTimeout(() => {
        setSlide(4)
      }, 800)
    }
  }, [slide, startDate, bleedingDays, cycleLength, awareness])

  const today = new Date().toISOString().split('T')[0]

  // Calendar for slide 1
  const currentMonth = new Date()
  currentMonth.setMonth(currentMonth.getMonth() + monthOffset)
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const selectedDate = startDate ? new Date(startDate) : null

  const slides = [
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
                    setTimeout(() => setSlide(1), 300)
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
          <p style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-label)',
            margin: 0,
            textAlign: 'center',
          }}>
            Klik op de dag waarop je menstruatie begon
          </p>
        </div>
      ),
      isComplete: !!startDate,
    },
    {
      title: 'Hoeveel dagen bloed je?',
      subtitle: 'Selecteer het aantal dagen dat je typically menstrueert',
      content: (
        <div style={{
          display: 'flex',
          gap: 'var(--space-md)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-md)',
          justifyContent: 'center',
          alignItems: 'center',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          <style>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => {
                setBleedingDays(num.toString())
                setTimeout(() => setSlide(2), 300)
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
          <div style={{
            position: 'relative',
            height: '240px',
            width: '100%',
            overflow: 'hidden',
          }}>
            {/* Scroll Wheel Container */}
            <div
              ref={wheelRef}
              style={{
                height: '100%',
                overflowY: 'scroll',
                scrollSnapType: 'y mandatory',
                scrollBehavior: 'smooth',
                paddingTop: '80px',
                paddingBottom: '80px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              onScroll={() => {
                if (!wheelRef.current) return
                const middle = wheelRef.current.scrollHeight / 2 - wheelRef.current.clientHeight / 2
                const scroll = wheelRef.current.scrollTop
                const items = wheelRef.current.querySelectorAll('[data-wheel-item]')

                items.forEach((item, idx) => {
                  const num = idx + 10
                  const itemTop = item.offsetTop - wheelRef.current.scrollTop
                  const itemCenter = itemTop + item.offsetHeight / 2
                  const containerCenter = wheelRef.current.clientHeight / 2
                  const distance = Math.abs(itemCenter - containerCenter)

                  if (distance < 30) {
                    setCycleLength(num.toString())
                  }
                })
              }}
            >
              <style>{`
                div::-webkit-scrollbar { display: none; }
              `}</style>
              {Array.from({ length: 51 }, (_, i) => i + 10).map((num) => (
                <button
                  key={num}
                  data-wheel-item
                  onClick={() => {
                    setCycleLength(num.toString())
                    setTimeout(() => setSlide(3), 300)
                  }}
                  style={{
                    scrollSnapAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '48px',
                    fontSize: '24px',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text)',
                    transition: 'all 200ms ease',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.fontSize = '32px'
                    e.target.style.color = '#4F46E5'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.fontSize = '24px'
                    e.target.style.color = 'var(--color-text)'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Center Highlight Line */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '48px',
              transform: 'translateY(-50%)',
              borderTop: '2px solid #4F46E5',
              borderBottom: '2px solid #4F46E5',
              pointerEvents: 'none',
              background: 'rgba(79, 70, 229, 0.05)',
            }} />
          </div>

          <p style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-label)',
            margin: 0,
            textAlign: 'center',
          }}>
            Cycle lengte: <strong style={{ color: '#4F46E5', fontSize: '18px' }}>{cycleLength}</strong> dagen
          </p>
        </div>
      ),
      isComplete: !!cycleLength && parseInt(cycleLength) >= 10 && parseInt(cycleLength) <= 60,
    },
    {
      title: 'Cyclus veranderingen',
      subtitle: 'Welke veranderingen merk je op?',
      content: (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          width: '100%',
        }}>
          {/* Flow Change - Visual Selector */}
          <div>
            <p style={{ fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', margin: '0 0 var(--space-sm) 0' }}>
              Bloedverlies veranderd?
            </p>
            <div style={{
              display: 'flex',
              gap: 'var(--space-sm)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              {['Minder', 'Hetzelfde', 'Meer'].map((level, idx) => (
                <button
                  key={level}
                  onClick={() => setAwareness(prev => {
                    const arr = prev.split(',').filter(x => !['flow_less', 'flow_same', 'flow_more'].includes(x))
                    return [...arr, ['flow_less', 'flow_same', 'flow_more'][idx]].filter(Boolean).join(',')
                  })}
                  style={{
                    flex: '1 1 calc(33.333% - 8px)',
                    minWidth: '80px',
                    padding: 'var(--space-md)',
                    background: awareness.includes(['flow_less', 'flow_same', 'flow_more'][idx]) ? '#E85D75' : '#F5F5F5',
                    color: awareness.includes(['flow_less', 'flow_same', 'flow_more'][idx]) ? 'white' : 'var(--color-text)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-small)',
                    fontWeight: 'var(--font-weight-semibold)',
                    transition: 'all 200ms ease',
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Cycle Regularity - Toggle Buttons */}
          <div>
            <p style={{ fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', margin: '0 0 var(--space-sm) 0' }}>
              Cyclus regelmatig?
            </p>
            <div style={{
              display: 'flex',
              gap: 'var(--space-sm)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <button
                onClick={() => setAwareness(prev => {
                  const arr = prev.split(',').filter(x => !['cycle_regular', 'cycle_irregular', 'cycle_less_predictable'].includes(x))
                  return [...arr, 'cycle_regular'].filter(Boolean).join(',')
                })}
                style={{
                  flex: 1,
                  padding: 'var(--space-md)',
                  background: awareness.includes('cycle_regular') ? '#7ECF51' : '#F5F5F5',
                  color: awareness.includes('cycle_regular') ? 'white' : 'var(--color-text)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-small)',
                  fontWeight: 'var(--font-weight-semibold)',
                  transition: 'all 200ms ease',
                }}
              >
                Regelmatig
              </button>
              <button
                onClick={() => setAwareness(prev => {
                  const arr = prev.split(',').filter(x => !['cycle_regular', 'cycle_irregular', 'cycle_less_predictable'].includes(x))
                  return [...arr, 'cycle_less_predictable'].filter(Boolean).join(',')
                })}
                style={{
                  flex: 1,
                  padding: 'var(--space-md)',
                  background: awareness.includes('cycle_less_predictable') ? '#FFD93D' : '#F5F5F5',
                  color: awareness.includes('cycle_less_predictable') ? '#333' : 'var(--color-text)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-small)',
                  fontWeight: 'var(--font-weight-semibold)',
                  transition: 'all 200ms ease',
                }}
              >
                Minder voorspelbaar
              </button>
              <button
                onClick={() => setAwareness(prev => {
                  const arr = prev.split(',').filter(x => !['cycle_regular', 'cycle_irregular', 'cycle_less_predictable'].includes(x))
                  return [...arr, 'cycle_irregular'].filter(Boolean).join(',')
                })}
                style={{
                  flex: 1,
                  padding: 'var(--space-md)',
                  background: awareness.includes('cycle_irregular') ? '#A78BFA' : '#F5F5F5',
                  color: awareness.includes('cycle_irregular') ? 'white' : 'var(--color-text)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-small)',
                  fontWeight: 'var(--font-weight-semibold)',
                  transition: 'all 200ms ease',
                }}
              >
                Onregelmatig
              </button>
            </div>
          </div>

          {/* Bleeding Duration - Quick Buttons */}
          <div>
            <p style={{ fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', margin: '0 0 var(--space-sm) 0' }}>
              Bloedingsduur veranderd?
            </p>
            <div style={{
              display: 'flex',
              gap: 'var(--space-sm)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <button
                onClick={() => setAwareness(prev => {
                  const arr = prev.split(',').filter(x => !['duration_shorter', 'duration_same', 'duration_longer'].includes(x))
                  return [...arr, 'duration_shorter'].filter(Boolean).join(',')
                })}
                style={{
                  flex: 1,
                  padding: 'var(--space-md)',
                  background: awareness.includes('duration_shorter') ? '#E85D75' : '#F5F5F5',
                  color: awareness.includes('duration_shorter') ? 'white' : 'var(--color-text)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-small)',
                  fontWeight: 'var(--font-weight-semibold)',
                  transition: 'all 200ms ease',
                }}
              >
                Korter
              </button>
              <button
                onClick={() => setAwareness(prev => {
                  const arr = prev.split(',').filter(x => !['duration_shorter', 'duration_same', 'duration_longer'].includes(x))
                  return [...arr, 'duration_same'].filter(Boolean).join(',')
                })}
                style={{
                  flex: 1,
                  padding: 'var(--space-md)',
                  background: awareness.includes('duration_same') ? '#FFD93D' : '#F5F5F5',
                  color: awareness.includes('duration_same') ? '#333' : 'var(--color-text)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-small)',
                  fontWeight: 'var(--font-weight-semibold)',
                  transition: 'all 200ms ease',
                }}
              >
                Hetzelfde
              </button>
              <button
                onClick={() => setAwareness(prev => {
                  const arr = prev.split(',').filter(x => !['duration_shorter', 'duration_same', 'duration_longer'].includes(x))
                  return [...arr, 'duration_longer'].filter(Boolean).join(',')
                })}
                style={{
                  flex: 1,
                  padding: 'var(--space-md)',
                  background: awareness.includes('duration_longer') ? '#A78BFA' : '#F5F5F5',
                  color: awareness.includes('duration_longer') ? 'white' : 'var(--color-text)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-small)',
                  fontWeight: 'var(--font-weight-semibold)',
                  transition: 'all 200ms ease',
                }}
              >
                Langer
              </button>
            </div>
          </div>
        </div>
      ),
      isComplete: !!(awareness && awareness.split(',').length >= 3),
    },
    {
      title: 'Draag je een wearable?',
      subtitle: 'Koppel je smartwatch/fitness tracker',
      content: (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          width: '100%',
        }}>
          <button
            onClick={() => {
              // Navigate to wearable connection
              onCancel?.()
              setTimeout(() => window.location.href = 'https://age-sync.youcaps.app/dashboard/tracker', 500)
            }}
            style={{
              padding: 'var(--space-lg)',
              background: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: 'var(--font-size-body)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Ja, koppel wearable ✓
          </button>

          <button
            onClick={() => onComplete(startDate, cycleLength)}
            style={{
              padding: 'var(--space-lg)',
              background: '#F5F5F5',
              color: 'var(--color-text)',
              border: '1px solid #E0E0E0',
              borderRadius: '12px',
              fontSize: 'var(--font-size-body)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Nee, ga naar dashboard
          </button>
        </div>
      ),
      isComplete: true,
    },
  ]

  const currentSlide = slides[slide]
  const isLastSlide = slide === slides.length - 1
  const canProceed = currentSlide.isComplete

  const handleNext = () => {
    if (isLastSlide) {
      onComplete(startDate, cycleLength)
    } else {
      setSlide(slide + 1)
    }
  }

  const handleBack = () => {
    if (slide > 0) {
      setSlide(slide - 1)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001,
      padding: 'var(--space-lg)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: 'var(--space-xl)',
        maxWidth: '500px',
        width: '100%',
        animation: 'slide-in 300ms ease both',
        position: 'relative',
      }}>
        {/* Close Button */}
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: 'var(--space-lg)',
            right: 'var(--space-lg)',
            padding: '4px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#999',
          }}
        >
          <X size={20} />
        </button>

        {/* Progress Bar */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: 'var(--space-lg)',
        }}>
          {slides.map((_, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: '4px',
                background: idx <= slide ? '#4F46E5' : '#E0E0E0',
                borderRadius: '2px',
                transition: 'all 300ms ease',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 style={{
            fontSize: 'var(--font-size-heading)',
            fontWeight: 'var(--font-weight-semibold)',
            margin: '0 0 var(--space-sm) 0',
            color: 'var(--color-text)',
          }}>
            {currentSlide.title}
          </h2>
          <p style={{
            fontSize: 'var(--font-size-body)',
            color: 'var(--color-secondary)',
            margin: '0 0 var(--space-lg) 0',
          }}>
            {currentSlide.subtitle}
          </p>
          {currentSlide.content}
        </div>


        <style>{`
          @keyframes slide-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  )
}
