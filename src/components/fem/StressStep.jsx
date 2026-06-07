import { Moon, Frown, Circle, Zap, HelpCircle, AlertCircle, Heart, TrendingDown, CheckCircle, Clock, Plus, Save } from 'react-feather'
import hero from '../../assets/hero1.png'

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

const options = [
  { value: 'langer', label: 'Het kost me langer', icon: 'clock' },
  { value: 'lichamelijk', label: 'Ik voel het meer in mijn lichaam', icon: 'alert' },
  { value: 'hetzelfde', label: 'Ongeveer hetzelfde', icon: 'check' },
]

export default function StressStep({ value, onChange, onNext, onBack, step = 4, totalSteps = 7 }) {
  return (
    <div style={{
      minHeight: '100vh',
      padding: 'var(--space-lg) var(--space-sm) var(--space-xxl)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
            width: `${(step / totalSteps) * 100}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>
        <p style={{ fontSize: '11px', color: 'var(--ink-3)', margin: 0 }}>
          Vraag {step} van {totalSteps}
        </p>
      </div>

      {/* Question */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '26px',
        fontWeight: '500',
        color: 'var(--ink)',
        marginBottom: 'var(--space-md)',
        lineHeight: 1.25,
      }}>
        Hoe herstel je van een stressvolle dag?
      </h1>

      {/* Supporting text */}
      <p style={{
        fontSize: 'var(--font-size-body)',
        color: 'var(--ink-2)',
        marginBottom: 'var(--space-xl)',
      }}>
        Vergeleken met vroeger.
      </p>

      {/* Answer cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '12px 16px',
              border: `2px solid ${value === opt.value ? 'var(--accent)' : 'var(--border)'}`,
              background: value === opt.value ? 'var(--accent-soft)' : 'var(--surface)',
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
            }}
            onMouseEnter={(e) => {
              if (value !== opt.value) {
                e.target.style.background = 'var(--surface-warm)'
                e.target.style.borderColor = 'var(--accent)'
              }
            }}
            onMouseLeave={(e) => {
              if (value !== opt.value) {
                e.target.style.background = 'var(--surface)'
                e.target.style.borderColor = 'var(--border)'
              }
            }}
          >
            <span style={{ flexShrink: 0, color: 'var(--ink-2)' }}>{getIcon(opt.icon)}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: 'var(--space-sm) var(--space-lg)',
            background: 'transparent',
            border: `1px solid var(--border)`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--ink)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-body)',
            fontFamily: 'var(--font-sans)',
            fontWeight: '500',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => e.target.style.background = 'var(--surface-warm)'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          ← Terug
        </button>
        <button
          onClick={onNext}
          disabled={!value}
          style={{
            flex: 1,
            padding: 'var(--space-sm) var(--space-lg)',
            background: value ? 'var(--ink)' : 'var(--ink-3)',
            color: 'var(--surface)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: value ? 'pointer' : 'not-allowed',
            fontSize: 'var(--font-size-body)',
            fontFamily: 'var(--font-sans)',
            fontWeight: '600',
            transition: 'all 150ms ease',
            opacity: value ? 1 : 0.6,
          }}
          onMouseEnter={(e) => {
            if (value) e.target.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            if (value) e.target.style.opacity = '1'
          }}
        >
          Volgende →
        </button>
      </div>
      </div>
    </div>
  )
}
