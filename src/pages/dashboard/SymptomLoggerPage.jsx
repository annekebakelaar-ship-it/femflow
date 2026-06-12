import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'react-feather'
import SymptomQuicklog from '../../components/SymptomQuicklog'
import { pagina, kolom, kop, subtekst, terugKnop } from '../../styles/donker'

export default function SymptomLoggerPage() {
  const navigate = useNavigate()

  return (
    <div style={pagina}>
      <div style={kolom}>
        <button onClick={() => navigate('/dashboard')} style={terugKnop}>
          <ArrowLeft size={16} strokeWidth={1.5} /> Dashboard
        </button>

        <h1 style={kop}>Symptoomlogger</h1>
        <p style={subtekst}>
          Tik wat je vandaag voelt — meerdere keren per dag kan.
        </p>

        <SymptomQuicklog />
      </div>
    </div>
  )
}
