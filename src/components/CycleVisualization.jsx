import CycleDay from './CycleDay'

export default function CycleVisualization({ currentDay = 1, cycleLength = 28, onDaySelect }) {
  const days = Array.from({ length: cycleLength }, (_, i) => i + 1)

  return (
    <div style={{
      width: '100%',
      padding: 'var(--space-lg)',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 12px 40px rgba(42, 33, 28, 0.15), 0 4px 12px rgba(42, 33, 28, 0.08)',
      opacity: 0.7,
    }}>
      <h3 style={{
        fontSize: 'var(--font-size-small)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-label)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        margin: '0 0 var(--space-md) 0',
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      }}>
        Jouw Cyclus Timeline
      </h3>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '4px',
        flexWrap: 'wrap',
        minHeight: '48px',
      }}>
        {days.map((day) => (
          <CycleDay
            key={day}
            day={day}
            currentDay={currentDay}
            cycleLength={cycleLength}
            onClick={onDaySelect}
            isSelectable={true}
          />
        ))}
      </div>

      <p style={{
        fontSize: 'var(--font-size-micro)',
        color: 'var(--color-label)',
        margin: 'var(--space-md) 0 0 0',
        textAlign: 'center',
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      }}>
        Klik op een dag voor meer informatie
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 12px rgba(0,0,0,0.2);
          }
          50% {
            box-shadow: 0 0 24px rgba(0,0,0,0.4);
          }
        }
      `}</style>
    </div>
  )
}
