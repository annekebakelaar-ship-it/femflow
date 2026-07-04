import { useNavigate, useLocation } from 'react-router-dom'
import { Home, BarChart2, BookOpen, Compass, Menu } from 'react-feather'

// Bottom-nav van het v2-dashboard: vijf tabs, gedeeld tussen de v2-home en
// de Leefstijl-hub zodat de balk nergens uit de pas loopt.

const sans = "'Hanken Grotesk', system-ui, sans-serif"

const ITEMS = [
  { icon: Home, label: 'Home', to: '/dashboard' },
  { icon: BarChart2, label: 'Stats', to: '/dashboard/progress' },
  { icon: BookOpen, label: 'Logboek', to: '/health/symptoms' },
  { icon: Compass, label: 'Leefstijl', to: '/dashboard/leefstijl' },
  { icon: Menu, label: 'Meer', to: '/menu' },
]

export default function NavV2({ actiefPad }) {
  const navigate = useNavigate()
  const location = useLocation()
  const huidig = actiefPad || location.pathname
  return (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '12px 8px 24px', background: 'rgba(26,22,20,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      {ITEMS.map(({ icon: Icon, label, to }) => {
        const actief = huidig === to || (to === '/dashboard' && huidig === '/preview-v2')
        return (
          <button key={label} onClick={() => navigate(to)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', minWidth: 56 }}>
            <div style={{ width: 40, height: 40, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: actief ? 'rgba(212,163,115,0.16)' : 'transparent' }}>
              <Icon size={19} color={actief ? '#D4A373' : '#574B41'} />
            </div>
            <span style={{ fontSize: 11, color: actief ? '#D4A373' : '#574B41', fontFamily: sans }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
