import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'react-feather'
import hero from '../assets/hero6.webp'

export default function CycleInsightsCard({ menstrualPhase }) {
  const navigate = useNavigate()

  if (!menstrualPhase) return null

  return (
    <div
      onClick={() => navigate('/health/menstruation')}
      style={{
        width: '100%',
        
        padding: 'var(--space-md) var(--space-lg)',
        margin: '0 0 var(--space-lg) 0',
        minHeight: '100px',
        backgroundImage: `linear-gradient(rgba(27, 15, 7, 0.45), rgba(27, 15, 7, 0.65)), url(${hero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: 'none',
        borderRadius: '22px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
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
