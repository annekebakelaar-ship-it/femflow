import { useNavigate } from 'react-router-dom'
import { Package } from 'react-feather'

export default function SupplementsSection({ userData = {} }) {
  const navigate = useNavigate()

  const getRecommendations = () => {
    const recs = []
    if (userData.low_energy) recs.push('Magnesium & B-vitamines')
    if (userData.low_sleep) recs.push('Magnesium & Melatonine')
    if (userData.high_stress) recs.push('Adaptogenen & Zinc')
    if (userData.luteal_phase) recs.push('Magnesium & Iron')
    return recs.length > 0 ? recs : ['Personalized supplement plan']
  }

  const recommendations = getRecommendations()

  return (
    <div style={{
      width: '100%',
      padding: '0 var(--space-lg) var(--space-lg) var(--space-lg)',
      marginTop: 'var(--space-xl)',
    }}>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D4C4 100%)',
        borderRadius: '16px',
        padding: 'var(--space-xl) var(--space-lg)',
        minHeight: '240px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-lg)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}>
        <Package size={32} color="#8F847A" />

        <h3 style={{
          fontSize: 'var(--font-size-h3)',
          fontWeight: 'var(--font-weight-semibold)',
          color: '#2C2C2C',
          margin: '0',
        }}>
          Gepersonaliseerde Supplementen
        </h3>

        <p style={{
          fontSize: 'var(--font-size-body)',
          color: '#5C5C5C',
          margin: '0 0 var(--space-md) 0',
          maxWidth: '400px',
          lineHeight: '1.5',
        }}>
          Op basis van jouw cyclus, slaap en energie niveaus
        </p>

        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 'var(--space-md)',
        }}>
          {recommendations.map((rec, idx) => (
            <span key={idx} style={{
              background: 'rgba(255,255,255,0.7)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 'var(--font-weight-medium)',
              color: '#5C5C5C',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {rec}
            </span>
          ))}
        </div>

        <div style={{
          display: 'flex',
          gap: 'var(--space-md)',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '300px',
        }}>
          <button onClick={() => navigate('/dashboard/supplements')} style={{
            padding: 'var(--space-md) var(--space-lg)',
            background: '#000',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: 'var(--font-size-body)',
            fontWeight: 'var(--font-weight-semibold)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}>
            Sluit abonnement af (€29/maand)
          </button>

          <p style={{
            fontSize: '10px',
            color: '#8F847A',
            margin: 0,
            fontWeight: 'var(--font-weight-regular)',
          }}>
            Eerste maand gratis • Geen verborgen kosten • Stop wanneer je wilt
          </p>
        </div>
      </div>
    </div>
  )
}
