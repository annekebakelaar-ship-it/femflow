import { useNavigate, useLocation } from 'react-router-dom'
import { Sun, BarChart, Disc, User } from 'react-feather'
import LotusIcoon from './LotusIcoon'

// Bottom-nav van het ingelogde deel: vijf tabs in een zwevende kaart,
// onderaan de kolom van de home en de Leefstijl-hub; op de overige ingelogde
// pagina's zet App hem vast onderin (prop vast). Maten en kleuren komen uit het homeontwerp
// van 13 sep 2026.

const sans = "'Hanken Grotesk', system-ui, sans-serif"
const OKER = '#EDBC8C'

const ITEMS = [
  { icon: Sun, maat: 24, label: 'Vandaag', to: '/dashboard', paden: ['/dashboard', '/preview-v2'] },
  { icon: BarChart, maat: 24, label: 'Inzichten', to: '/dashboard/progress', paden: ['/dashboard/progress', '/health/cycle-analytics', '/health/perimenopause', '/health/wearable-cycle', '/wearable/hrv-insights', '/dashboard/wearable', '/dashboard/learning'] },
  { icon: Disc, maat: 21, label: 'Tracken', to: '/health/menstruation', paden: ['/health/menstruation', '/health/menstruation/history', '/health/symptoms', '/health/lifestyle-check'] },
  { icon: LotusIcoon, maat: 24, label: 'Leefstijl', to: '/dashboard/leefstijl', paden: ['/dashboard/leefstijl', '/dashboard/supplements'] },
  { icon: User, maat: 22, label: 'Profiel', to: '/menu', paden: ['/menu', '/account', '/consent', '/wearable', '/support'] },
]

export default function NavV2({ actiefPad, vast = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const huidig = actiefPad || location.pathname
  const balk = (
    <div style={{ flexShrink: 0, width: '100%', maxWidth: 430, boxSizing: 'border-box', padding: '0 18px calc(15px + env(safe-area-inset-bottom))', pointerEvents: 'auto' }}>
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
  if (!vast) return balk
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      {balk}
    </div>
  )
}
