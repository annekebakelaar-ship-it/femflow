import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'react-feather'
import afb7 from '../assets/afb7.png'

export default function HRVInsightsCard({ hrvScore }) {
  const navigate = useNavigate()

  if (!hrvScore) return null

  const getHrvStatus = (score) => {
    if (score >= 80) return 'Optimaal'
    if (score >= 60) return 'Goed'
    if (score >= 40) return 'Matig'
    return 'Laag'
  }

  return (
    <div
      onClick={() => navigate('/wearable/hrv-insights')}
      style={{
        width: '100%',
        padding: 'var(--space-lg)',
        margin: '0 var(--space-lg) var(--space-lg) var(--space-lg)',
        backgroundImage: `url(${afb7})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '1px solid rgba(199, 154, 110, 0.2)',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        boxSizing: 'border-box',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(199, 154, 110, 0.05)'
        e.currentTarget.style.borderColor = 'rgba(199, 154, 110, 0.4)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'white'
        e.currentTarget.style.borderColor = 'rgba(199, 154, 110, 0.2)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'var(--ink-2)',
            marginBottom: '4px',
          }}>
            Jouw HRV score vandaag
          </p>
          <p style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '600',
            color: 'var(--ink)',
          }}>
            {hrvScore} — {getHrvStatus(hrvScore)}
          </p>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '13px',
            color: 'var(--accent)',
            fontWeight: '500',
          }}>
            Bekijk de inzichten
          </p>
        </div>
        <ChevronRight size={24} color="var(--accent)" strokeWidth={2} />
      </div>
    </div>
  )
}
