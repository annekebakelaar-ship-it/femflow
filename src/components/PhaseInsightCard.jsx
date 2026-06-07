import { getPhaseByDay, getPhaseName, PHASE_GRADIENTS, PHASE_EMOJI, getDayInPhase, getPhaseLength, getPhaseInsights } from '../utils/cycleUtils'
import { Activity, Zap, Heart, Droplet, Cloud, Sun, Moon } from 'react-feather'

const getPhaseIcon = (phase) => {
  const icons = {
    menstrual: <Droplet size={20} strokeWidth={1.5} />,
    follicular: <Cloud size={20} strokeWidth={1.5} />,
    ovulatory: <Sun size={20} strokeWidth={1.5} />,
    luteal: <Moon size={20} strokeWidth={1.5} />,
  }
  return icons[phase] || null
}

const getInsightIcon = (type) => {
  const icons = {
    exercise: <Activity size={16} strokeWidth={1.5} />,
    nutrition: <Zap size={16} strokeWidth={1.5} />,
    selfcare: <Heart size={16} strokeWidth={1.5} />,
  }
  return icons[type] || null
}

export default function PhaseInsightCard({ day = 1, cycleLength = 28 }) {
  const phase = getPhaseByDay(day, cycleLength)
  const phaseName = getPhaseName(phase)
  const emoji = PHASE_EMOJI[phase]
  const dayInPhase = getDayInPhase(day, cycleLength)
  const phaseLength = getPhaseLength(phase, cycleLength)
  const insights = getPhaseInsights(phase)

  return (
    <div style={{
      width: '100%',
      padding: 'var(--space-lg)',
      background: `linear-gradient(135deg, rgba(199, 154, 110, 0.65) 0%, rgba(236, 224, 210, 0.45) 100%)`,
      borderRadius: '16px',
      color: 'var(--ink)',
      animation: 'fade-slide-up 240ms ease both',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(199, 154, 110, 0.6)',
      boxShadow: '0 12px 40px rgba(42, 33, 28, 0.15), 0 4px 12px rgba(42, 33, 28, 0.08)',
      opacity: 0.9,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        marginBottom: 'var(--space-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--ink)' }}>
          {getPhaseIcon(phase)}
        </div>
        <div>
          <h2 style={{
            fontSize: 'var(--font-size-heading)',
            fontWeight: 'var(--font-weight-semibold)',
            margin: 0,
            color: 'var(--ink)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            {phaseName}
          </h2>
          <p style={{
            fontSize: 'var(--font-size-small)',
            margin: '4px 0 0 0',
            opacity: 0.9,
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Dag {dayInPhase} van {phaseLength}
          </p>
        </div>
      </div>

      <div style={{
        padding: 'var(--space-md)',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '12px',
        marginBottom: 'var(--space-md)',
        backdropFilter: 'blur(10px)',
      }}>
        <p style={{
          margin: 0,
          fontSize: 'var(--font-size-body)',
          lineHeight: '1.6',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        }}>
          {insights.energy}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-md)',
      }}>
        <div style={{
          padding: 'var(--space-sm)',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            {getInsightIcon('exercise')}
            <p style={{
              fontSize: 'var(--font-size-micro)',
              fontWeight: 'var(--font-weight-semibold)',
              textTransform: 'uppercase',
              margin: 0,
              opacity: 0.8,
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
            }}>
              Training
            </p>
          </div>
          <p style={{
            fontSize: 'var(--font-size-small)',
            margin: 0,
            lineHeight: '1.4',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            {insights.exercise}
          </p>
        </div>

        <div style={{
          padding: 'var(--space-sm)',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            {getInsightIcon('nutrition')}
            <p style={{
              fontSize: 'var(--font-size-micro)',
              fontWeight: 'var(--font-weight-semibold)',
              textTransform: 'uppercase',
              margin: 0,
              opacity: 0.8,
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
            }}>
              Voeding
            </p>
          </div>
          <p style={{
            fontSize: 'var(--font-size-small)',
            margin: 0,
            lineHeight: '1.4',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            {insights.nutrition}
          </p>
        </div>

        <div style={{
          padding: 'var(--space-sm)',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
        }}>
          <p style={{
            fontSize: 'var(--font-size-micro)',
            fontWeight: 'var(--font-weight-semibold)',
            textTransform: 'uppercase',
            margin: '0 0 4px 0',
            opacity: 0.8,
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Slaap
          </p>
          <p style={{
            fontSize: 'var(--font-size-small)',
            margin: 0,
            lineHeight: '1.4',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            {insights.sleep}
          </p>
        </div>

        <div style={{
          padding: 'var(--space-sm)',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            {getInsightIcon('selfcare')}
            <p style={{
              fontSize: 'var(--font-size-micro)',
              fontWeight: 'var(--font-weight-semibold)',
              textTransform: 'uppercase',
              margin: 0,
              opacity: 0.8,
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
            }}>
              Zelfzorg
            </p>
          </div>
          <p style={{
            fontSize: 'var(--font-size-small)',
            margin: 0,
            lineHeight: '1.4',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Luister naar je lichaam en rust wanneer nodig
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-slide-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
