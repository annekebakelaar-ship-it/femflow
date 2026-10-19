import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link2, Trash2 } from 'react-feather'
import { getToken, haalAgentKoppelingen, trekAgentKoppelingIn } from '../../api/client'

// Overzicht van externe assistenten die toegang hebben, met intrekken.
//
// Intrekken werkt meteen: de server trekt het refreshtoken in, en elke
// tool-aanroep controleert de toestemming opnieuw. Een token dat nog niet
// verlopen is kan daarna niets meer ophalen.
export default function Koppelingen() {
  const navigate = useNavigate()
  const [koppelingen, setKoppelingen] = useState(null)
  const [fout, setFout] = useState('')

  async function laad() {
    try {
      const { koppelingen } = await haalAgentKoppelingen()
      setKoppelingen(koppelingen)
    } catch {
      setFout('De koppelingen konden niet worden geladen.')
    }
  }

  useEffect(() => {
    if (!getToken()) {
      navigate('/login')
      return
    }
    laad()
  }, [navigate])

  async function trekIn(clientId) {
    setFout('')
    try {
      await trekAgentKoppelingIn(clientId)
      await laad()
    } catch {
      setFout('Intrekken lukte niet. Probeer het opnieuw.')
    }
  }

  const kaart = {
    background: 'var(--d-card)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '12px',
  }

  return (
    <div style={{ minHeight: '100vh', padding: '28px 20px 48px', maxWidth: '520px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Link2 size={20} color="var(--d-accent)" strokeWidth={1.5} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, color: 'var(--d-ink)', margin: 0 }}>
          Koppelingen
        </h1>
      </div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--d-ink-2)', lineHeight: 1.6, margin: '0 0 18px' }}>
        Assistenten die jouw Ovari-gegevens mogen lezen. Intrekken werkt meteen.
      </p>

      {fout && <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--error)' }}>{fout}</p>}

      {koppelingen && koppelingen.length === 0 && (
        <div style={kaart}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--d-ink-2)', margin: 0 }}>
            Er is op dit moment geen assistent gekoppeld.
          </p>
        </div>
      )}

      {(koppelingen || []).map((k) => (
        <div key={k.client_id} style={kaart}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--d-ink)', margin: '0 0 6px' }}>{k.naam}</p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--d-ink-2)', lineHeight: 1.6, margin: '0 0 12px' }}>
            Toegang tot: {k.scopes.join(', ')}
          </p>
          <button
            onClick={() => trekIn(k.client_id)}
            style={{
              padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
              background: 'transparent', color: 'var(--d-ink)', border: '1px solid var(--d-border)',
              fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            <Trash2 size={14} strokeWidth={2} /> Toegang intrekken
          </button>
        </div>
      ))}
    </div>
  )
}
