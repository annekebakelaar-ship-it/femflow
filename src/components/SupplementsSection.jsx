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
        background: 'var(--d-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
        borderRadius: '22px',
        border: 'none',
        padding: 'var(--space-xl) var(--space-lg)',
        minHeight: '240px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-lg)',
        textAlign: 'center',
      }}>
        <Package size={32} color="var(--d-accent)" />

        <h3 style={{
          fontSize: '18px',
          fontWeight: '500',
          color: 'var(--d-ink)',
          margin: '0',
          fontFamily: 'var(--font-display)',
        }}>
          Gepersonaliseerde Supplementen
        </h3>

        <p style={{
          fontSize: '15px',
          color: 'var(--d-ink-2)',
          margin: '0 0 var(--space-md) 0',
          maxWidth: '400px',
          lineHeight: '1.5',
          fontFamily: 'var(--font-sans)',
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
              background: 'rgba(199, 154, 110, 0.15)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '500',
              color: 'var(--d-accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontFamily: 'var(--font-sans)',
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
            background: 'var(--d-accent)',
            color: '#1B0F07',
            border: 'none',
            borderRadius: '22px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            fontFamily: 'var(--font-sans)',
          }}>
            Sluit abonnement af (€29/maand)
          </button>

          <p style={{
            fontSize: '12px',
            color: 'var(--d-ink-3)',
            margin: 0,
            fontWeight: '400',
            fontFamily: 'var(--font-sans)',
          }}>
            Eerste maand gratis • Geen verborgen kosten • Stop wanneer je wilt
          </p>
        </div>
      </div>
    </div>
  )
}
