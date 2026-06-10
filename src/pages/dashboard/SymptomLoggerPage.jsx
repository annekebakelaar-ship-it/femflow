import { useNavigate } from 'react-router-dom'
import SymptomQuicklog from '../../components/SymptomQuicklog'
import logo from '../../assets/YouCapsLogo.png.png'

export default function SymptomLoggerPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--space-lg) 140px var(--space-lg)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'fade-slide-up 240ms ease both',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-xl)',
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img
            src={logo}
            alt="YouCaps"
            style={{
              height: '40px',
              width: 'auto',
            }}
          />
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0',
          }}
          title="Terug naar dashboard"
        >
          ←
        </button>
      </div>

      {/* Page Title */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '26px',
        fontWeight: '500',
        color: 'var(--ink)',
        margin: '0 0 var(--space-lg) 0',
        lineHeight: '1.25',
      }}>
        Symptoomlogger
      </h1>

      {/* Symptom Logger Component */}
      <SymptomQuicklog />
    </div>
  )
}
