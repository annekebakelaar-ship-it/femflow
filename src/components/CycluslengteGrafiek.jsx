import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getCycleLengths, hasEarlyTransitionMarker, hasLateTransitionMarker } from '../utils/cycleHelper'

export default function CycluslengteGrafiek({ menstrualData }) {
  const [showInfo, setShowInfo] = useState(false)

  // Get completed cycle lengths
  const cycleLengths = getCycleLengths(menstrualData)

  // Show message if not enough data
  if (cycleLengths.length < 3) {
    return (
      <div style={{
        width: '100%',
        padding: '0 var(--space-lg) var(--space-lg) var(--space-lg)',
        marginTop: 'var(--space-xl)',
        opacity: 0.4,
      }}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-lg)',
        }}>
          <h3 style={{
            fontSize: '15px',
            fontFamily: 'var(--font-sans)',
            fontWeight: '600',
            margin: '0 0 var(--space-md) 0',
            color: 'var(--ink)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Cycluslengtepatroon
          </h3>
          <p style={{
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            color: 'var(--ink-2)',
            margin: 0,
            lineHeight: 1.5,
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Nog te weinig cycli om een patroon te tonen ({cycleLengths.length} van 3). Voeg meer periodes toe om je patroon te zien.
          </p>
        </div>
      </div>
    )
  }

  // Prepare data for chart
  const chartData = cycleLengths.map((cycle, i) => ({
    name: `C${i + 1}`,
    length: cycle.length,
    early: hasEarlyTransitionMarker(cycleLengths, i),
    late: hasLateTransitionMarker(cycle),
    index: i,
  }))

  // Color logic
  const getBarColor = (dataPoint) => {
    if (dataPoint.late) return '#E85D75' // Red for ≥60 days
    if (dataPoint.early) return '#FFD93D' // Gold for ≥7 day jump
    return '#D9B48F' // Warm beige default
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null
    const data = payload[0].payload
    const diff = data.index > 0 ? data.length - chartData[data.index - 1].length : null

    return (
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px',
        fontSize: '13px',
        fontFamily: 'var(--font-sans)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: 'var(--ink)' }}>Cyclus {data.index + 1}</p>
        <p style={{ margin: '0 0 4px 0', color: 'var(--ink)' }}>{data.length} dagen</p>
        {diff !== null && (
          <p style={{ margin: 0, color: data.early ? 'var(--info)' : 'var(--ink-3)' }}>
            {diff > 0 ? '+' : ''}{diff} t.o.v. vorige
            {data.early && ' ⚠️'}
          </p>
        )}
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
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-lg)',
      }}>
        {/* Title added for improved structure */}
        <h3 style={{
          fontSize: '15px',
          fontFamily: 'var(--font-sans)',
          fontWeight: '600',
          margin: '0 0 var(--space-md) 0',
          color: 'var(--ink)',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        }}>
          Cycluslengtepatroon
        </h3>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <button
            onClick={() => setShowInfo(!showInfo)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
            title="Meer informatie"
          >
            ℹ️
          </button>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              label={{ value: 'Cyclus (chronologisch)', position: 'insideBottomRight', offset: -10 }}
            />
            <YAxis
              label={{ value: 'Lengte (dagen)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="length" fill="var(--accent)">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-lg)',
          marginTop: 'var(--space-md)',
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '16px', background: 'var(--accent)', borderRadius: '2px' }} />
            <span style={{ color: 'var(--ink)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>Normaal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '16px', background: 'var(--info)', borderRadius: '2px' }} />
            <span style={{ color: 'var(--ink)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>±7 dagen verschil</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '16px', background: 'var(--error)', borderRadius: '2px' }} />
            <span style={{ color: 'var(--ink)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>≥60 dagen</span>
          </div>
        </div>

        {/* Info section */}
        {showInfo && (
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-md)',
            marginTop: 'var(--space-md)',
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            color: 'var(--ink-2)',
            lineHeight: 1.6,
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'var(--ink)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>
              ℹ️ Dit patroon tonen we alleen ter observatie.
            </p>
            <p style={{ margin: '0 0 8px 0', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>
              <strong>Blauwe markeringen (±7 dagen):</strong> Grotere veranderingen in cycluslengtes kunnen erop duiden dat je cyclus begint te veranderen. Dit kan een teken zijn van verschillende fasen in de vrouwelijke gezondheid.
            </p>
            <p style={{ margin: '0 0 8px 0', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>
              <strong>Rode markeringen (≥60 dagen):</strong> Langere cycli (twee maanden of meer) kunnen voorkomen, maar let op als dit vaker gebeurt.
            </p>
            <p style={{ margin: 0, color: 'var(--error)', fontStyle: 'italic', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>
              ⚠️ <strong>Dit is geen medische diagnose.</strong> Deze observaties zijn alleen voor je persoonlijke tracking. Bespreek aanhoudende veranderingen altijd met je huisarts.
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: 'var(--ink-3)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>
              🔒 Deze gegevens zijn alleen voor jou zichtbaar en worden niet gedeeld.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
