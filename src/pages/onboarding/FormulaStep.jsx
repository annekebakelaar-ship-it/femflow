import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { GOALS } from '../../api/mockData'
import StepIndicator from '../../components/StepIndicator'
import Button from '../../components/Button'

export default function FormulaStep() {
  const { state } = useApp()
  const navigate = useNavigate()
  const goalLabel = GOALS.find(g => g.id === state.goal)?.label || ''

  return (
    <div>
      <StepIndicator current={3} total={4} />
      <h1 style={{ fontSize: ''26px'', fontWeight: '600', letterSpacing: '-1px', marginBottom: '8px' }}>Jouw formule voor deze maand</h1>
      <p style={{ color: 'var(--ink-2)', marginBottom: 'var(--space-xl)' }}>
        Op basis van je doel ({goalLabel.toLowerCase()}) en profiel ({state.profile?.gender}, {state.profile?.age}, {state.profile?.activity} actief).
      </p>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        {state.formula?.map((s, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>{s.name}</div>
              <div style={{ fontSize: ''13px'', color: 'var(--ink-2)', marginTop: '2px' }}>{s.desc}</div>
            </div>
            <div style={{ fontSize: ''13px'', color: 'var(--ink-2)', whiteSpace: 'nowrap', marginLeft: '16px' }}>{s.dose}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: ''13px'', color: 'var(--ink-2)', marginBottom: 'var(--space-xl)' }}>
        Volgende maand wordt automatisch aangepast op basis van je voortgang.
      </p>
      <Button onClick={() => navigate('/onboarding/subscribe')}>Start abonnement</Button>
    </div>
  )
}


