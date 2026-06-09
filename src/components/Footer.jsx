import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, BarChart2, BookOpen, Menu } from 'react-feather'

export default function Footer() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')
  const iconColor = (path) => isActive(path) ? 'var(--ink)' : 'var(--ink-2)'

  useEffect(() => {
    const stored = localStorage.getItem('dashboardMenuOpen')
    if (stored) {
      setMenuOpen(JSON.parse(stored))
    }

    const interval = setInterval(() => {
      const updated = localStorage.getItem('dashboardMenuOpen')
      if (updated) {
        setMenuOpen(JSON.parse(updated))
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const buttonStyle = (path) => ({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: iconColor(path),
    borderRadius: '10px',
    transition: 'all 150ms ease',
    backgroundColor: isActive(path) ? 'rgba(199, 154, 110, 0.1)' : 'transparent',
  })

  const handleButtonHover = (isHover, isActivePath) => (e) => {
    if (isHover) {
      e.currentTarget.style.backgroundColor = 'rgba(199, 154, 110, 0.08)'
      e.currentTarget.style.transform = 'scale(1.05)'
    } else {
      e.currentTarget.style.backgroundColor = isActivePath ? 'rgba(199, 154, 110, 0.1)' : 'transparent'
      e.currentTarget.style.transform = 'scale(1)'
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: 'var(--space-lg)',
      right: 'var(--space-lg)',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '18px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '10px 0',
      zIndex: 100,
      margin: '0 auto',
      opacity: menuOpen ? 0 : 1,
      pointerEvents: menuOpen ? 'none' : 'auto',
      transition: 'opacity 150ms ease',
      boxShadow: '0 12px 32px rgba(42, 33, 28, 0.12), 0 4px 12px rgba(199, 154, 110, 0.08)',
      maxWidth: 'calc(100% - var(--space-lg) * 2)',
    }}>
      {/* Home */}
      <button
        onClick={() => navigate('/dashboard')}
        style={buttonStyle('/dashboard')}
        title="Home"
        onMouseEnter={handleButtonHover(true, isActive('/dashboard'))}
        onMouseLeave={handleButtonHover(false, isActive('/dashboard'))}
      >
        <Home size={20} strokeWidth={1.5} />
      </button>

      {/* Voortgang */}
      <button
        onClick={() => navigate('/dashboard/progress')}
        style={buttonStyle('/dashboard/progress')}
        title="Voortgang"
        onMouseEnter={handleButtonHover(true, isActive('/dashboard/progress'))}
        onMouseLeave={handleButtonHover(false, isActive('/dashboard/progress'))}
      >
        <BarChart2 size={20} strokeWidth={1.5} />
      </button>

      {/* Kennis */}
      <button
        onClick={() => navigate('/dashboard/learning')}
        style={buttonStyle('/dashboard/learning')}
        title="Kennis"
        onMouseEnter={handleButtonHover(true, isActive('/dashboard/learning'))}
        onMouseLeave={handleButtonHover(false, isActive('/dashboard/learning'))}
      >
        <BookOpen size={20} strokeWidth={1.5} />
      </button>

      {/* Menu Button (navigates to MenuPage) */}
      <button
        onClick={() => navigate('/menu')}
        style={buttonStyle(null)}
        title="Menu"
        onMouseEnter={handleButtonHover(true, false)}
        onMouseLeave={handleButtonHover(false, false)}
      >
        <Menu size={20} strokeWidth={1.5} />
      </button>
    </div>
  )
}