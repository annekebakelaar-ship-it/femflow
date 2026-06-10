import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'react-feather'
import { getSecure } from '../utils/secureStorage'
import { useState, useEffect } from 'react'

export default function MenuPage() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('Gebruiker')

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

  const handleNavigation = (path) => {
    navigate(path)
  }

  const menuItemStyle = {
    width: '100%',
    padding: 'var(--space-md)',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    fontSize: 'var(--font-size-body)',
    color: 'var(--ink)',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(232, 224, 216, 0.4)',
    transition: 'all 150ms ease',
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'var(--space-xl) var(--space-lg)',
      background: 'var(--bg)',
    }}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          padding: 0,
          marginBottom: 'var(--space-xl)',
          color: 'var(--ink)',
          cursor: 'pointer',
          fontSize: 'var(--font-size-body)',
          fontWeight: '500',
        }}
      >
        <ChevronLeft size={20} />
        Terug
      </button>

      {/* Profile Card */}
      <div style={{
        background: 'rgba(199, 154, 110, 0.1)',
        padding: 'var(--space-lg)',
        borderRadius: '12px',
        marginBottom: 'var(--space-lg)',
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
          fontWeight: '600',
          color: 'var(--ink)',
          marginBottom: 'var(--space-md)',
        }}>
          {userName}
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleNavigation('/account')}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'transparent',
              color: 'var(--accent)',
              border: '1px solid var(--accent)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: 'var(--font-size-small)',
              fontWeight: '600',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(199, 154, 110, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Instellingen
          </button>
          <button
            onClick={() => { window.location.href = 'https://youcaps.app' }}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: 'var(--font-size-small)',
              fontWeight: '600',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Word nu lid
          </button>
        </div>
      </div>

      {/* Main Menu Items */}
      <button onClick={() => handleNavigation('/health/menstruation')} style={menuItemStyle}>
        Menstruatietracker
      </button>

      <button onClick={() => handleNavigation('/health/menstruation/history')} style={menuItemStyle}>
        Geschiedenis
      </button>

      <button onClick={() => handleNavigation('/wearable')} style={menuItemStyle}>
        Wearable
      </button>

      <button onClick={() => handleNavigation('/health/symptoms')} style={menuItemStyle}>
        Symptoomlogger
      </button>

      <button onClick={() => handleNavigation('/health/cycle-analytics')} style={menuItemStyle}>
        Cyclus Analyse
      </button>

      <button onClick={() => handleNavigation('/health/wearable-cycle')} style={menuItemStyle}>
        Wearable & Cyclus
      </button>

      <button onClick={() => handleNavigation('/health/perimenopause')} style={menuItemStyle}>
        Perimenopauze Tracker
      </button>

      <button onClick={() => handleNavigation('/health/goals')} style={menuItemStyle}>
        Mijn doelen
      </button>

      <button onClick={() => handleNavigation('/health/workouts')} style={menuItemStyle}>
        Mijn trainingen
      </button>

      {/* Algemeen Section */}
      <div style={{
        padding: 'var(--space-lg) var(--space-md)',
        fontWeight: '600',
        fontSize: 'var(--font-size-small)',
        color: 'var(--ink-3)',
        marginTop: 'var(--space-lg)',
        borderBottom: '1px solid rgba(232, 224, 216, 0.4)',
      }}>
        Algemeen
      </div>

      <button onClick={() => handleNavigation('/support')} style={menuItemStyle}>
        Steun
      </button>

      <button onClick={() => handleNavigation('/legal/terms')} style={menuItemStyle}>
        Gebruikersvoorwaarden
      </button>

      <button onClick={() => handleNavigation('/legal/privacy')} style={menuItemStyle}>
        Privacybeleid
      </button>

      <button onClick={() => handleNavigation('/account/consent')} style={menuItemStyle}>
        Toestemmingen
      </button>

      <button
        onClick={() => {
          localStorage.removeItem('femflow_jwt')
          navigate('/')
        }}
        style={{
          ...menuItemStyle,
          color: '#c62828',
          fontWeight: '600',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(198, 40, 40, 0.08)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        Uitloggen
      </button>
    </div>
  )
}
