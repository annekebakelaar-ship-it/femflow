import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'react-feather'
import { getWearableReadings } from '../api/client'
import { berekenTrend } from '../utils/trendHelper'

// Biomarker-trends over de laatste 90 dagen, volledig client-side berekend
// uit eigen wearable-readings. Neutraal gepresenteerd, zonder interpretatie.

const BIOMARKERS = [
  { veld: 'hrv_ms', label: 'HRV', eenheid: 'ms', decimalen: 0 },
  { veld: 'resting_heart_rate', label: 'Rusthartslag', eenheid: 'bpm', decimalen: 0 },
  { veld: 'sleep_duration_min', label: 'Slaapduur', eenheid: 'u', decimalen: 1, naarUren: true },
]

function TrendIcoon({ richting }) {
  if (richting === 'stijgend') return <TrendingUp size={14} strokeWidth={1.5} />
  if (richting === 'dalend') return <TrendingDown size={14} strokeWidth={1.5} />
  return <Minus size={14} strokeWidth={1.5} />
}

export default function TrendsSection() {
  const [trends, setTrends] = useState(null)

  useEffect(() => {
    getWearableReadings(90)
      .then(result => {
        if (!result.data || result.data.length < 4) return

        const berekend = BIOMARKERS.map(bm => {
          const waarden = result.data.map(r => r[bm.veld])
          const trend = berekenTrend(waarden)
          if (trend.gemiddelde == null) return null
          const gem = bm.naarUren ? trend.gemiddelde / 60 : trend.gemiddelde
          return {
            ...bm,
            richting: trend.richting,
            pctVerschil: trend.pctVerschil,
            gemiddelde: gem.toFixed(bm.decimalen),
          }
        }).filter(Boolean)

        if (berekend.length > 0) setTrends(berekend)
      })
      .catch(() => {
        // Geen wearable gekoppeld of niet ingelogd: sectie blijft verborgen
      })
  }, [])

  if (!trends) return null

  return (
    <div style={{ marginTop: 'var(--space-xl)' }}>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '18px',
        fontWeight: '500',
        color: 'var(--d-ink)',
        margin: '0 0 4px 0',
      }}>
        Trends
      </h3>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        color: 'var(--d-ink-3)',
        margin: '0 0 var(--space-md) 0',
      }}>
        Laatste 90 dagen, tweede helft vergeleken met de eerste
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 'var(--space-sm)',
      }}>
        {trends.map(t => (
          <div
            key={t.veld}
            style={{
              background: 'var(--d-card)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
              border: 'none',
              borderRadius: '22px',
              padding: 'var(--space-md)',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--d-ink-3)',
              margin: '0 0 6px 0',
            }}>
              {t.label}
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--d-ink)',
              margin: '0 0 6px 0',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {t.gemiddelde} <span style={{ fontSize: '12px', fontWeight: '400', color: 'var(--d-ink-2)' }}>{t.eenheid}</span>
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '999px',
              background: 'rgba(199, 154, 110, 0.15)',
              color: 'var(--d-ink-2)',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: '500',
            }}>
              <TrendIcoon richting={t.richting} />
              <span>
                {t.richting}
                {t.pctVerschil != null && t.richting !== 'stabiel' && t.richting !== 'onvoldoende data'
                  ? ` ${t.pctVerschil > 0 ? '+' : ''}${t.pctVerschil}%`
                  : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
