import { getPhaseByDay, PHASE_COLORS, getDayInPhase } from '../utils/cycleUtils'

export default function CycleDay({ day, currentDay, cycleLength = 28, onClick, isSelectable = true }) {
  const phase = getPhaseByDay(day, cycleLength)
  const isToday = day === currentDay
  const isPast = day < currentDay
  const isFuture = day > currentDay

  const size = isToday ? 32 : 24
  const isOpaque = isFuture ? 0.3 : 1

  return (
    <button
      onClick={() => isSelectable && onClick?.(day)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: PHASE_COLORS[phase],
        border: isToday ? `3px solid #000` : 'none',
        cursor: isSelectable ? 'pointer' : 'default',
        opacity: isOpaque,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'white',
        transition: 'all 200ms ease',
        boxShadow: isToday ? '0 0 12px rgba(0,0,0,0.2)' : 'none',
        animation: isToday ? 'pulse 2s infinite' : 'none',
        padding: 0,
        margin: '0 4px',
      }}
      title={`Dag ${day} (${getPhaseName(phase)})`}
    >
      {isToday && '●'}
    </button>
  )
}

function getPhaseName(phase) {
  const names = {
    menstruation: 'Menstruatie',
    follicular: 'Folliculair',
    ovulatory: 'Ovulatie',
    luteal: 'Luteaal',
  }
  return names[phase] || phase
}
