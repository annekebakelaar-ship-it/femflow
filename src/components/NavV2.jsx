import { useNavigate, useLocation } from 'react-router-dom'
import { Sun, BarChart, Disc, User } from 'react-feather'

// Bottom-nav van het ingelogde deel: vier tabs in een zwevende kaart,
// gedeeld tussen de home (Vandaag) en de Leefstijl-hub zodat de balk
// nergens uit de pas loopt. Maten en kleuren komen uit het homeontwerp
// van 13 sep 2026.

const sans = "'Hanken Grotesk', system-ui, sans-serif"
const OKER = '#EDBC8C'

const ITEMS = [
  { icon: Sun, maat: 24, label: 'Vandaag', to: '/dashboard', paden: ['/dashboard', '/preview-v2', '/dashboard/leefstijl'] },
  { icon: BarChart, maat: 24, label: 'Inzichten', to: '/dashboard/progress', paden: ['/dashboard/progress', '/health/cycle-analytics', '/wearable/hrv-insights'] },
  { icon: Disc, maat: 21, label: 'Tracken', to: '/health/menstruation', paden: ['/health/menstruation', '/health/menstruation/history', '/health/symptoms'] },
  { icon: User, maat: 22, label: 'Profiel', to: '/account', paden: ['/account', '/menu', '/consent'] },
]

export default function NavV2({ actiefPad }) {
  const navigate = useNavigate()
  const location = useLocation()
  const huidig = actiefPad || location.pathname
  return (
    <div style={{ flexShrink: 0, padding: '0 18px calc(15px + env(safe-area-inset-bottom))' }}>
      <nav style={{ display: 'flex', height: 66, borderRadius: 12, background: '#1D1812', border: '1px solid #2D241C', boxSizing: 'border-box' }}>
        {ITEMS.map(({ icon: Icon, maat, label, to, paden }) => {
          const actief = paden.includes(huidig)
          return (
            <button key={label} onClick={() => navigate(to)} aria-current={actief ? 'page' : undefined}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8.5, background: 'none', border: 'none', cursor: 'pointer' }}>
              <span style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={maat} strokeWidth={1.5} color={actief ? OKER : '#BEB8B2'} /></span>
              <span style={{ marginTop: 7.4, fontSize: 11.7, lineHeight: 1, fontWeight: 300, color: actief ? OKER : '#CEC8C2', fontFamily: sans }}>{label}</span>
              <span style={{ marginTop: 4.2, width: 25, height: 2, borderRadius: 1, background: actief ? OKER : 'transparent' }} />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
