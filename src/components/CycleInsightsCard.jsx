import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'react-feather'

export default function CycleInsightsCard({ menstrualPhase }) {
  const navigate = useNavigate()

  if (!menstrualPhase) return null

  return (
    <div
      onClick={() => navigate('/health/menstruation')}
      style={{
        width: '100%',
        maxWidth: 'calc(100vw - 16px)',
        padding: 'var(--space-md) var(--space-lg)',
        margin: '0 var(--space-lg) var(--space-lg) 0',
        minHeight: '100px',
        background: 'rgba(61, 40, 23, 0.8)',
        backgroundImage: 'url(/src/assets/hero5.png)',
        backgroundSize: '120%',
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
        e.currentTarget.style.background = 'rgba(61, 40, 23, 0.9)'
        e.currentTarget.style.borderColor = 'rgba(199, 154, 110, 0.4)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(61, 40, 23, 0.8)'
        e.currentTarget.style.borderColor = 'rgba(199, 154, 110, 0.2)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
      }}>
        <div>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: 'white',
            marginBottom: '2px',
            fontWeight: '600',
          }}>
            Dag {menstrualPhase.daysInCycle}
          </p>
          <p style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: 'white',
          }}>
            {menstrualPhase.phase}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <p style={{
            margin: 0,
            fontSize: '12px',
            color: 'white',
            fontWeight: '500',
          }}>
            Bekijk inzichten
          </p>
          <ChevronRight size={16} color="white" strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}
