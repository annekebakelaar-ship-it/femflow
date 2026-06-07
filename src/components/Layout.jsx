import { useNavigate, useLocation } from 'react-router-dom'
import styles from './Layout.module.css'

export default function Layout({ children, showNav }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className={styles.layout}>
      {showNav && (
        <nav className={styles.nav}>
          <button className={styles.brand} onClick={() => navigate('/dashboard')}>
            YOUCAPS
          </button>
          <button className={styles.navLink} onClick={() => navigate('/advies')}>
            Advies
          </button>
          <button className={styles.navLink} onClick={() => navigate('/connect')}>
            Wearable
          </button>
          <button className={styles.navLink} onClick={() => navigate('/account/profile')}>
            Account
          </button>
        </nav>
      )}
      <div key={pathname} style={{ animation: 'fade-slide-up 220ms ease both' }}>
        {children}
      </div>
    </div>
  )
}
