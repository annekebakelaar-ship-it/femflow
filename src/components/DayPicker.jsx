import { useState, useRef, useEffect } from 'react'

export default function DayPicker({ value = 28, onChange, minDay = 10, maxDay = 50 }) {
  const wheelRef = useRef(null)

  const days = Array.from({ length: maxDay - minDay + 1 }, (_, i) => minDay + i)

  useEffect(() => {
    setTimeout(() => scrollToValue(value), 0)
  }, [value])

  function scrollToValue(val) {
    if (!wheelRef.current) return
    const item = wheelRef.current.querySelector(`[data-value="${val}"]`)
    if (item) {
      item.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function handleScroll() {
    if (!wheelRef.current) return

    const rect = wheelRef.current.getBoundingClientRect()
    const centerY = rect.top + rect.height / 2

    const items = wheelRef.current.querySelectorAll('[data-value]')
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
      onChange(parseInt(closest))
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    }}>
      <div style={{
        position: 'relative',
        height: '200px',
        width: '80px',
        overflow: 'hidden',
        borderRadius: '50%',
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
          height: '50px',
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
          height: '60px',
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
          height: '60px',
          background: 'linear-gradient(to top, #f5f5f5 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 9,
        }} />

        {/* Scrollable Container */}
        <div
          ref={wheelRef}
          style={{
            height: '100%',
            overflowY: 'scroll',
            scrollSnapType: 'y mandatory',
            scrollBehavior: 'smooth',
            paddingTop: '75px',
            paddingBottom: '75px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            scrollbarWidth: 'none',
          }}
          onScroll={handleScroll}
          className="day-wheel"
        >
          <style>{`
            .day-wheel::-webkit-scrollbar { display: none; }
          `}</style>
          {days.map((d) => (
            <div
              key={d}
              data-value={d}
              style={{
                scrollSnapAlign: 'center',
                textAlign: 'center',
                padding: '8px 4px',
                fontSize: '20px',
                fontWeight: value === d ? '600' : '400',
                color: value === d ? '#2A211C' : '#A89E95',
                transition: 'all 200ms ease',
              }}
            >
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
