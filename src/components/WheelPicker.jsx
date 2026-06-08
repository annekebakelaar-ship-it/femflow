import { useState, useRef, useEffect } from 'react'

const MONTHS_NL = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
]

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

function getYears(minYear, maxYear) {
  const years = []
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y)
  }
  return years
}

export default function WheelPicker({ value, onChange, minYear = 1940, maxYear = new Date().getFullYear() }) {
  let day = 1, month = 1, year = maxYear

  if (value && typeof value === 'object') {
    day = Math.max(1, Math.min(31, parseInt(value.day) || 1))
    month = Math.max(1, Math.min(12, parseInt(value.month) || 1))
    year = Math.max(minYear, Math.min(maxYear, parseInt(value.year) || maxYear))
  }

  const dayRef = useRef(null)
  const monthRef = useRef(null)
  const yearRef = useRef(null)

  const years = getYears(minYear, maxYear)

  // Scroll to center on mount
  useEffect(() => {
    setTimeout(() => scrollToValue(dayRef, day), 0)
  }, [day])

  useEffect(() => {
    setTimeout(() => scrollToValue(monthRef, month), 0)
  }, [month])

  useEffect(() => {
    setTimeout(() => scrollToValue(yearRef, year), 0)
  }, [year])

  function scrollToValue(ref, val) {
    if (!ref.current) return
    const item = ref.current.querySelector(`[data-value="${val}"]`)
    if (item) {
      item.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function handleScroll(ref, type, allValues) {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerY = rect.top + rect.height / 2

    const items = ref.current.querySelectorAll('[data-value]')
    let closest = null
    let minDist = Infinity

    items.forEach((item) => {
      const itemRect = item.getBoundingClientRect()
      const itemCenterY = itemRect.top + itemRect.height / 2
      const dist = Math.abs(itemCenterY - centerY)

      if (dist < minDist) {
        minDist = dist
        closest = item.dataset.value
      }
    })

    if (closest) {
      const newValue = {
        day: type === 'day' ? parseInt(closest) : day,
        month: type === 'month' ? parseInt(closest) : month,
        year: type === 'year' ? parseInt(closest) : year,
      }
      onChange(newValue)
    }
  }

  return (
    <div style={{
      display: 'flex',
      gap: '0px',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    }}>
      {/* Day Wheel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          position: 'relative',
          height: '140px',
          width: '60px',
          overflow: 'hidden',
          borderRadius: '8px',
          background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #f5f5f5 50%, #e8e0d8 100%)',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)',
          border: '2px solid #E8E0D8',
        }}>
          {/* Center Indicator */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '40px',
            transform: 'translateY(-50%)',
            borderTop: '2px solid #C79A6E',
            borderBottom: '2px solid #C79A6E',
            background: 'rgba(199, 154, 110, 0.1)',
            pointerEvents: 'none',
            zIndex: 10,
          }} />

          {/* Fade Overlay Top */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40px',
            background: 'linear-gradient(to bottom, #f5f5f5 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 9,
          }} />

          {/* Fade Overlay Bottom */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40px',
            background: 'linear-gradient(to top, #f5f5f5 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 9,
          }} />

          {/* Scrollable Container */}
          <div
            ref={dayRef}
            style={{
              height: '100%',
              overflowY: 'scroll',
              scrollSnapType: 'y mandatory',
              scrollBehavior: 'smooth',
              paddingTop: '50px',
              paddingBottom: '50px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              scrollbarWidth: 'none',
            }}
            onScroll={() => handleScroll(dayRef, 'day', DAYS)}
            className="wheel-scroll"
          >
            <style>{`
              .wheel-scroll::-webkit-scrollbar { display: none; }
            `}</style>
            {DAYS.map((d) => (
              <div
                key={d}
                data-value={d}
                style={{
                  scrollSnapAlign: 'center',
                  textAlign: 'center',
                  padding: '6px 2px',
                  fontSize: '14px',
                  fontWeight: day === d ? '600' : '400',
                  color: day === d ? '#2A211C' : '#A89E95',
                  transition: 'all 200ms ease',
                }}
              >
                {String(d).padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>
        <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#A89E95', fontWeight: '500' }}>Dag</p>
      </div>

      {/* Month Wheel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          position: 'relative',
          height: '140px',
          width: '60px',
          overflow: 'hidden',
          borderRadius: '8px',
          background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #f5f5f5 50%, #e8e0d8 100%)',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)',
          border: '2px solid #E8E0D8',
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '50px',
            transform: 'translateY(-50%)',
            borderTop: '2px solid #C79A6E',
            borderBottom: '2px solid #C79A6E',
            background: 'rgba(199, 154, 110, 0.1)',
            pointerEvents: 'none',
            zIndex: 10,
          }} />

          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'linear-gradient(to bottom, #f5f5f5 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 9,
          }} />

          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'linear-gradient(to top, #f5f5f5 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 9,
          }} />

          <div
            ref={monthRef}
            style={{
              height: '100%',
              overflowY: 'scroll',
              scrollSnapType: 'y mandatory',
              scrollBehavior: 'smooth',
              paddingTop: '50px',
              paddingBottom: '50px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              scrollbarWidth: 'none',
            }}
            onScroll={() => handleScroll(monthRef, 'month', MONTHS)}
            className="wheel-scroll"
          >
            {MONTHS.map((m) => (
              <div
                key={m}
                data-value={m}
                style={{
                  scrollSnapAlign: 'center',
                  textAlign: 'center',
                  padding: '8px 4px',
                  fontSize: '13px',
                  fontWeight: month === m ? '600' : '400',
                  color: month === m ? '#2A211C' : '#A89E95',
                  transition: 'all 200ms ease',
                }}
              >
                {MONTHS_NL[m - 1].slice(0, 3)}
              </div>
            ))}
          </div>
        </div>
        <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#A89E95', fontWeight: '500' }}>Maand</p>
      </div>

      {/* Year Wheel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          position: 'relative',
          height: '140px',
          width: '60px',
          overflow: 'hidden',
          borderRadius: '8px',
          background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #f5f5f5 50%, #e8e0d8 100%)',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)',
          border: '2px solid #E8E0D8',
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '50px',
            transform: 'translateY(-50%)',
            borderTop: '2px solid #C79A6E',
            borderBottom: '2px solid #C79A6E',
            background: 'rgba(199, 154, 110, 0.1)',
            pointerEvents: 'none',
            zIndex: 10,
          }} />

          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'linear-gradient(to bottom, #f5f5f5 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 9,
          }} />

          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'linear-gradient(to top, #f5f5f5 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 9,
          }} />

          <div
            ref={yearRef}
            style={{
              height: '100%',
              overflowY: 'scroll',
              scrollSnapType: 'y mandatory',
              scrollBehavior: 'smooth',
              paddingTop: '50px',
              paddingBottom: '50px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              scrollbarWidth: 'none',
            }}
            onScroll={() => handleScroll(yearRef, 'year', years)}
            className="wheel-scroll"
          >
            {years.map((y) => (
              <div
                key={y}
                data-value={y}
                style={{
                  scrollSnapAlign: 'center',
                  textAlign: 'center',
                  padding: '8px 4px',
                  fontSize: '18px',
                  fontWeight: year === y ? '600' : '400',
                  color: year === y ? '#2A211C' : '#A89E95',
                  transition: 'all 200ms ease',
                }}
              >
                {y}
              </div>
            ))}
          </div>
        </div>
        <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#A89E95', fontWeight: '500' }}>Jaar</p>
      </div>
    </div>
  )
}
