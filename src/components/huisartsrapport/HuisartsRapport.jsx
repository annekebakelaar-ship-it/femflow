import { useState } from 'react'
import { FileText } from 'react-feather'
import { getSecure } from '../../utils/secureStorage'
import { getWearableReadings } from '../../api/client'
import { buildCyclusOverzicht, buildWearablePerMaand, buildSymptoomFrequenties } from '../../utils/rapportData'

// Huisartsrapport: exporteert 6 maanden cyclus- en wearable-data als PDF.
// AVG: alles gebeurt client-side — de PDF wordt op het apparaat gegenereerd,
// nergens opgeslagen, en deze feature stuurt bewust geen analytics events.
export default function HuisartsRapport() {
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')

  const menstrualData = getSecure('menstruation_data')
  const overzicht = buildCyclusOverzicht(menstrualData)

  async function handleExport() {
    setBezig(true)
    setFout('')
    try {
      // Wearable-data is optioneel: niet gekoppeld of niet ingelogd -> sectie vervalt
      let wearable = null
      try {
        const readings = await getWearableReadings(190)
        wearable = buildWearablePerMaand(readings.data)
      } catch {
        wearable = null
      }

      const symptomen = buildSymptoomFrequenties(getSecure('symptom_log'))

      // PDF-renderer pas laden bij gebruik (houdt de hoofdbundel klein)
      const { genereerRapportBlob } = await import('./HuisartsRapportPDF')
      const blob = await genereerRapportBlob({
        overzicht,
        wearable,
        symptomen,
        exportDatum: new Date(),
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `femflow-cyclusrapport-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Rapport genereren mislukt:', err)
      setFout('Het rapport kon niet worden gegenereerd. Probeer het opnieuw.')
    } finally {
      setBezig(false)
    }
  }

  return (
    <div style={{
      background: 'var(--d-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
      border: '1px solid var(--d-border)',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <FileText size={18} color="var(--d-accent)" strokeWidth={1.5} />
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          fontWeight: '500',
          color: 'var(--d-ink)',
          margin: 0,
        }}>
          Huisartsrapport
        </h3>
      </div>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        color: 'var(--d-ink-2)',
        lineHeight: 1.5,
        margin: '0 0 16px 0',
      }}>
        Een neutraal PDF-overzicht van je laatste zes maanden cyclus- en wearable-data,
        om mee te nemen naar je huisarts. Het rapport wordt op je eigen apparaat gemaakt
        en nergens opgeslagen of verstuurd.
      </p>

      {overzicht.voldoendeData ? (
        <button
          onClick={handleExport}
          disabled={bezig}
          style={{
            padding: '12px 20px',
            background: 'var(--d-ink)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: bezig ? 'wait' : 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: '600',
            opacity: bezig ? 0.7 : 1,
          }}
        >
          {bezig ? 'Rapport wordt gemaakt...' : 'Exporteer huisartsrapport'}
        </button>
      ) : (
        <div style={{
          background: 'var(--d-card-solid)',
          border: '1px solid var(--d-border)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--d-ink-2)',
          lineHeight: 1.5,
        }}>
          Het rapport is beschikbaar zodra er minstens twee volledige cycli zijn gelogd
          (nu {overzicht.rijen.length} van 2). Log je menstruatiestarts in de tracker om
          dit overzicht op te bouwen.
        </div>
      )}

      {fout && (
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--error)',
          margin: '12px 0 0 0',
        }}>
          {fout}
        </p>
      )}
    </div>
  )
}
