import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'react-feather'
import afb12 from '../assets/afb12.png'

export default function CycleInsightsCard({ menstrualPhase }) {
  const navigate = useNavigate()

  if (!menstrualPhase) return null

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'Menstruatie':
        return 'rgba(192, 73, 45, 0.1)'
      case 'Folliculair':
        return 'rgba(79, 140, 90, 0.1)'
      case 'Ovulatie':
        return 'rgba(199, 154, 110, 0.1)'
      case 'Luteaal':
        return 'rgba(139, 97, 73, 0.1)'
      default:
        return 'rgba(199, 154, 110, 0.1)'
    }
  }

  return (
    <div
      onClick={() => navigate('/health/menstruation')}
      style={{
        width: '100%',
        padding: 'var(--space-md) var(--space-lg)',
        margin: 'var(--space-lg)',
        minHeight: '100px',
        backgroundImage: `url(${afb12})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '1px solid rgba(199, 154, 110, 0.2)',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(199, 154, 110, 0.05)'
        e.currentTarget.style.borderColor = 'rgba(199, 154, 110, 0.4)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'rgba(199, 154, 110, 0.2)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 'var(--space-md)' }}>
        <div>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: 'var(--ink-2)',
            marginBottom: '2px',
          }}>
            Dag {menstrualPhase.daysInCycle}
          </p>
          <p style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: 'var(--ink)',
          }}>
            {menstrualPhase.phase}
          </p>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '12px',
            color: 'var(--accent)',
            fontWeight: '500',
          }}>
            Bekijk inzichten
          </p>
        </div>
        <ChevronRight size={20} color="var(--accent)" strokeWidth={2} />
      </div>
    </div>
  )
}
