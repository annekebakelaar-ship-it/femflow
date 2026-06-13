import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { alignWearableWithCycle, aggregateByDay } from '../utils/wearableCycleHelper'

export default function WearableOverlay({ menstrualData, wearableReadings }) {
  const [selectedSignal, setSelectedSignal] = useState('temperature')

  // Align data
  const alignedData = alignWearableWithCycle(menstrualData, wearableReadings)

  if (alignedData.length === 0) {
    return (
      <div style={{
        width: '100%',
        padding: '0 var(--space-lg) var(--space-lg) var(--space-lg)',
        marginTop: 'var(--space-xl)',
        opacity: 0.4,
      }}>
        <div style={{
          background: 'var(--d-card)',
          border: '1px solid var(--d-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-lg)',
        }}>
          <h3 style={{
            fontSize: '15px',
            fontFamily: 'var(--font-sans)',
            fontWeight: '600',
            margin: '0 0 var(--space-md) 0',
            color: 'var(--d-ink)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Fysiologische Signalen
          </h3>
          <p style={{
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            color: 'var(--d-ink-2)',
            margin: 0,
            lineHeight: 1.5,
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Nog geen wearable-gegevens beschikbaar. Verbind je wearable om signalen over je cyclus te zien.
          </p>
        </div>
      </div>
    )
  }

  // Check if we have at least 1 full cycle of data
  const hasFullCycle = Math.max(...alignedData.map(d => d.cycleDay)) >= 25

  if (!hasFullCycle) {
    return (
      <div style={{
        width: '100%',
        padding: '0 var(--space-lg) var(--space-lg) var(--space-lg)',
        marginTop: 'var(--space-xl)',
        opacity: 0.4,
      }}>
        <div style={{
          background: 'var(--d-card)',
          border: '1px solid var(--d-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-lg)',
        }}>
          <h3 style={{
            fontSize: '15px',
            fontFamily: 'var(--font-sans)',
            fontWeight: '600',
            margin: '0 0 var(--space-md) 0',
            color: 'var(--d-ink)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Fysiologische Signalen
          </h3>
          <p style={{
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            color: 'var(--d-ink-2)',
            margin: 0,
            lineHeight: 1.5,
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Nog te weinig wearable-data om signalen over je cyclus te leggen. Zorg ervoor dat je wearable minstens één volledige cyclus draagt.
          </p>
        </div>
      </div>
    )
  }

  // Aggregate by day
  const aggregated = aggregateByDay(alignedData)

  // Get signal config
  const signalConfig = {
    temperature: { label: 'Basale Temperatuur', key: 'temperature', unit: '°C', color: 'var(--error)' },
    hrv: { label: 'HRV', key: 'hrv', unit: 'ms', color: 'var(--success)' },
    restingHR: { label: 'Rust-hartslag', key: 'restingHR', unit: 'bpm', color: 'var(--info)' },
    sleep: { label: 'Slaap', key: 'sleep', unit: 'uur', color: 'var(--d-accent)' },
  }

  const config = signalConfig[selectedSignal]

  // Calculate observation
  const getObservation = () => {
    const firstHalf = aggregated.filter(d => d.day <= 14)
    const secondHalf = aggregated.filter(d => d.day > 14)

    const avgFirst = firstHalf.reduce((sum, d) => sum + (d[config.key] ? parseFloat(d[config.key]) : 0), 0) / (firstHalf.length || 1)
    const avgSecond = secondHalf.reduce((sum, d) => sum + (d[config.key] ? parseFloat(d[config.key]) : 0), 0) / (secondHalf.length || 1)

    const diff = avgSecond - avgFirst
    const direction = diff > 0 ? 'hoger' : diff < 0 ? 'lager' : 'gelijk'

    if (selectedSignal === 'temperature') {
      return `Je basale temperatuur ligt in de tweede helft van je cyclus gemiddeld ${Math.abs(diff).toFixed(1)}°C ${direction}. Dit patroon wordt veroorzaakt door de hormonale veranderingen na ovulatie.`
    } else if (selectedSignal === 'hrv') {
      return `Je HRV (hartslag-variabiliteit) is in de tweede helft gemiddeld ${Math.abs(diff).toFixed(0)}ms ${direction}. Variaties in HRV kunnen met hormoonfluctuaties samenhangen.`
    } else if (selectedSignal === 'restingHR') {
      return `Je rust-hartslag ligt in de tweede helft gemiddeld ${Math.abs(diff).toFixed(0)} bpm ${direction}. Dit kan reflecteren hoe je lichaam met hormonale schommelingen omgaat.`
    } else if (selectedSignal === 'sleep') {
      return `Je slaap-duur is in de tweede helft gemiddeld ${Math.abs(diff).toFixed(1)} uur ${direction}. Dit is een waarneming — hormonen beïnvloeden slaapkwaliteit.`
    }
    return ''
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null
    const data = payload[0].payload

    return (
      <div style={{
        background: 'var(--d-card)',
        border: '1px solid var(--d-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px',
        fontSize: '13px',
        fontFamily: 'var(--font-sans)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: 'var(--d-ink)' }}>Dag {data.day}</p>
        <p style={{ margin: 0, color: 'var(--d-ink-2)' }}>
          {config.label}: {data[config.key] || '—'} {config.unit}
        </p>
        {data.isPeriodDay && <p style={{ margin: '4px 0 0 0', color: 'var(--error)' }}>🩸 Menstruatie</p>}
      </div>
    )
  }

  return (
    <div style={{
      width: '100%',
      padding: '0 var(--space-lg) var(--space-lg) var(--space-lg)',
      marginTop: 'var(--space-xl)',
      opacity: 0.4,
    }}>
      <div style={{
        background: 'var(--d-card)',
        border: '1px solid var(--d-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-lg)',
      }}>

        {/* Signal Selector */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-lg)',
          flexWrap: 'wrap',
        }}>
          {Object.entries(signalConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setSelectedSignal(key)}
              style={{
                padding: '8px 16px',
                background: selectedSignal === key ? 'var(--d-accent)' : 'var(--d-page)',
                color: selectedSignal === key ? 'var(--d-card)' : 'var(--d-ink)',
                border: '1px solid var(--d-border)',
                borderRadius: 'var(--radius-pill)',
                fontSize: '13px',
                fontFamily: 'var(--font-sans)',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
              }}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={aggregated} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--d-border)" />
            <XAxis
              dataKey="day"
              label={{ value: 'Cyclus-dag', position: 'insideBottomRight', offset: -10 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: config.label, angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            {/* Period days marked with reference lines */}
            <ReferenceLine x={0} stroke="var(--error)" strokeDasharray="5 5" strokeOpacity={0.3} />
            <ReferenceLine x={5} stroke="var(--error)" strokeDasharray="5 5" strokeOpacity={0.3} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={config.key}
              stroke={config.color}
              dot={{ r: 4 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Observation */}
        <p style={{
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
          color: 'var(--d-ink-2)',
          marginTop: 'var(--space-md)',
          marginBottom: 0,
          lineHeight: 1.6,
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        }}>
          {getObservation()}
        </p>
      </div>

      {/* Disclaimer */}
      <p style={{
        fontSize: 'var(--font-size-micro)',
        color: '#999',
        marginTop: 'var(--space-sm)',
        marginBottom: 0,
        fontStyle: 'italic',
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      }}>
        ℹ️ Dit zijn waarnemingen op basis van je gemeten data. Dit is geen medische analyse of diagnose. Gaten in de grafiek betekenen dat je wearable niet werd gedragen.
      </p>
    </div>
  )
}
