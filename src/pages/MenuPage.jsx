import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'react-feather'
import { getSecure } from '../utils/secureStorage'
import { openExternal } from '../utils/openExternal'
import { useState, useEffect } from 'react'
import { pagina, kolom } from '../styles/donker'
import hero from '../assets/hero4.png'

// Menu in de donkere huisstijl: knoppen in de achtergrondkleur (alleen
// tekst, subtiele scheidingslijn), het gebruikersvak met foto erachter.
export default function MenuPage() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('Gebruiker')

  useEffect(() => {
    try {
      const data = getSecure('menstruation_data')
      if (data && data.name) {
        setUserName(data.name)
      }
    } catch {
      console.error('Failed to load user name')
    }
  }, [])

  const handleNavigation = (path) => {
    navigate(path)
  }

  const menuItemStyle = {
    width: '100%',
    padding: '16px 4px',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    fontSize: 'var(--font-size-body)',
    fontFamily: 'var(--font-sans)',
    color: 'var(--d-ink)',
    cursor: 'pointer',
    borderBottom: '1px solid var(--d-border)',
    transition: 'all 150ms ease',
  }

  return (
    <div style={pagina}>
      <div style={kolom}>
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
            marginBottom: '24px',
            color: 'var(--d-ink-2)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-small)',
            fontFamily: 'var(--font-sans)',
            fontWeight: '500',
          }}
        >
          <ChevronLeft size={18} />
          Terug
        </button>

        {/* Profile Card — foto erachter, donkere overlay voor leesbaarheid */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '22px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        }}>
          <img
            src={hero}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 30%',
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(27, 15, 7, 0.25) 0%, rgba(27, 15, 7, 0.78) 100%)',
          }} />
          <div style={{ position: 'relative', padding: '24px 20px 20px' }}>
            <p style={{
              margin: 0,
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(244, 236, 227, 0.75)',
              fontFamily: 'var(--font-sans)',
            }}>
              Welkom
            </p>
            <p style={{
              margin: '4px 0 16px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--d-ink)',
              fontFamily: 'var(--font-display)',
            }}>
              {userName}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleNavigation('/account')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: 'rgba(244, 236, 227, 0.12)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  color: 'var(--d-ink)',
                  border: 'none',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-small)',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: '600',
                }}
              >
                Instellingen
              </button>
              <button
                onClick={() => openExternal('https://youcaps.app/?utm_source=femflow&utm_medium=referral&utm_campaign=menu')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: 'var(--d-accent)',
                  color: '#1B0F07',
                  border: 'none',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-small)',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: '600',
                }}
              >
                Word nu lid
              </button>
            </div>
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

        <button onClick={() => handleNavigation('/dashboard/learning')} style={menuItemStyle}>
          Kennisbank
        </button>

        {/* Algemeen Section */}
        <div style={{
          padding: '24px 4px 12px',
          fontWeight: '600',
          fontSize: '11px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-sans)',
          color: 'var(--d-ink-3)',
          marginTop: '16px',
          borderBottom: '1px solid var(--d-border)',
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

        <button onClick={() => handleNavigation('/consent')} style={menuItemStyle}>
          Toestemmingen
        </button>

        <button
          onClick={() => {
            localStorage.removeItem('femflow_jwt')
            navigate('/')
          }}
          style={{
            ...menuItemStyle,
            color: '#E08A8A',
            fontWeight: '600',
            borderBottom: 'none',
          }}
        >
          Uitloggen
        </button>
      </div>
    </div>
  )
}
