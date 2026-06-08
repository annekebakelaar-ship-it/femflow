import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, BarChart2, BookOpen, Users, Menu } from 'react-feather'
import { getSecure } from '../utils/secureStorage'

export default function Footer() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userName, setUserName] = useState('Gebruiker')
  const dropdownRef = useRef(null)

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
    try {
      const data = getSecure('menstruation_data')
      if (data && data.name) {
        setUserName(data.name)
      }
    } catch (err) {
      console.error('Failed to load user name')
    }
  }, [])

  useEffect(() => {
    if (!dropdownOpen) return

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [dropdownOpen])

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

      {/* Dropdown Menu (right) */}
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            ...buttonStyle(null),
            color: dropdownOpen ? 'var(--ink)' : 'var(--ink-2)',
            backgroundColor: dropdownOpen ? 'rgba(199, 154, 110, 0.1)' : 'transparent',
          }}
          title="Menu"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(199, 154, 110, 0.08)'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = dropdownOpen ? 'rgba(199, 154, 110, 0.1)' : 'transparent'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>

        {dropdownOpen && (
          <div style={{
            position: 'absolute',
            bottom: '48px',
            right: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 12px 32px rgba(42, 33, 28, 0.15), 0 4px 12px rgba(199, 154, 110, 0.08)',
            minWidth: '360px',
            zIndex: 200,
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
          }}>
            {/* Profile Card */}
            <div style={{
              padding: 'var(--space-md)',
              borderBottom: '1px solid rgba(232, 224, 216, 0.4)',
              marginBottom: 'var(--space-md)',
            }}>
              <div style={{
                background: 'rgba(199, 154, 110, 0.1)',
                padding: 'var(--space-md)',
                borderRadius: '12px',
              }}>
                <p style={{
                  margin: 0,
                  fontSize: 'var(--font-size-small)',
                  color: 'var(--ink-3)',
                  marginBottom: '4px',
                }}>
                  Welkom
                </p>
                <p style={{
                  margin: 0,
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--ink)',
                  marginBottom: 'var(--space-md)',
                }}>
                  {userName}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => { navigate('/account'); setDropdownOpen(false); }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'transparent',
                      color: 'var(--accent)',
                      border: '1px solid var(--accent)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-small)',
                      fontWeight: 'var(--font-weight-semibold)',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(199, 154, 110, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Instellingen
                  </button>
                  <button
                    onClick={() => { navigate('/dashboard/supplements'); setDropdownOpen(false); }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'var(--accent)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-small)',
                      fontWeight: 'var(--font-weight-semibold)',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Word nu lid
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => { navigate('/health/menstruation'); setDropdownOpen(false); }}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(232, 224, 216, 0.4)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(199, 154, 110, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Menstruatietracker
            </button>

            <button
              onClick={() => { navigate('/health/symptoms'); setDropdownOpen(false); }}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(232, 224, 216, 0.4)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(199, 154, 110, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Symptoomlogger
            </button>

            <button
              onClick={() => { navigate('/health/cycle-analytics'); setDropdownOpen(false); }}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(232, 224, 216, 0.4)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(199, 154, 110, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Cyclus Analyse
            </button>

            <button
              onClick={() => { navigate('/health/wearable-cycle'); setDropdownOpen(false); }}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(232, 224, 216, 0.4)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(199, 154, 110, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Wearable & Cyclus
            </button>

            <button
              onClick={() => { navigate('/health/perimenopause'); setDropdownOpen(false); }}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(232, 224, 216, 0.4)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(199, 154, 110, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Perimenopauze Tracker
            </button>

            <button
              onClick={() => { navigate('/health/goals'); setDropdownOpen(false); }}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(232, 224, 216, 0.4)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(199, 154, 110, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Mijn doelen
            </button>

            <button
              onClick={() => { navigate('/health/workouts'); setDropdownOpen(false); }}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(232, 224, 216, 0.4)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(199, 154, 110, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Mijn trainingen
            </button>

            {/* Algemeen Section */}
            <div style={{
              padding: 'var(--space-md)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--font-size-small)',
              color: 'var(--color-label)',
              borderBottom: '1px solid rgba(232, 224, 216, 0.4)',
            }}>
              Algemeen:
            </div>

            <button
              onClick={() => { navigate('/support'); setDropdownOpen(false); }}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(232, 224, 216, 0.4)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(199, 154, 110, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Steun
            </button>

            <button
              onClick={() => { navigate('/legal/terms'); setDropdownOpen(false); }}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(232, 224, 216, 0.4)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(199, 154, 110, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Gebruikersvoorwaarden
            </button>

            <button
              onClick={() => { navigate('/legal/privacy'); setDropdownOpen(false); }}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(232, 224, 216, 0.4)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(199, 154, 110, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Privacybeleid
            </button>

            <button
              onClick={() => { navigate('/account/consent'); setDropdownOpen(false); }}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(232, 224, 216, 0.4)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(199, 154, 110, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Toestemmingen
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('wab_jwt')
                navigate('/')
                setDropdownOpen(false)
              }}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: 'var(--font-size-body)',
                color: '#c62828',
                cursor: 'pointer',
                fontWeight: 'var(--font-weight-semibold)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(198, 40, 40, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Uitloggen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}