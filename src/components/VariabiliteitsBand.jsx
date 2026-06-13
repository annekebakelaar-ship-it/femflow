import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function VariabiliteitsBand({ menstrualData }) {
  const navigate = useNavigate()
  const [bandData, setBandData] = useState(null)

  useEffect(() => {
    if (!menstrualData?.startDate) {
      setBandData(null)
      return
    }

    // Get cycle lengths (historical + current)
    const cycleLengths = menstrualData.cycleLengths || []

    // If no history, add current cycleLength as a data point
    if (cycleLengths.length === 0) {
      cycleLengths.push(menstrualData.cycleLength)
    }

    // Check if we have minimum data (3 cycles)
    if (cycleLengths.length < 3) {
      setBandData({
        hasEnoughData: false,
        cyclesNeeded: 3,
        cyclesAvailable: cycleLengths.length,
        nextPeriodStart: null,
        probabilistic: null,
      })
      return
    }

    // Calculate statistics
    const n = cycleLengths.length
    const mean = cycleLengths.reduce((a, b) => a + b, 0) / n
    const variance = cycleLengths.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n
    const stdDev = Math.sqrt(variance)

    // Calculate next period start
    const lastStart = new Date(menstrualData.startDate)
    const today = new Date()
    const DAY_MS = 1000 * 60 * 60 * 24

    // Find how many days into current cycle
    const daysSinceStart = Math.floor((today - lastStart) / DAY_MS)
    const currentCycleLength = menstrualData.cycleLength
    const daysIntoCurrentCycle = daysSinceStart % currentCycleLength
    const daysUntilNextPeriod = currentCycleLength - daysIntoCurrentCycle

    // Expected next period start (without uncertainty)
    const expectedNextPeriod = new Date(today)
    expectedNextPeriod.setDate(expectedNextPeriod.getDate() + daysUntilNextPeriod)

    // Expand uncertainty bands if < 5 cycles (small sample)
    let expandFactor = 1
    if (n < 5) {
      expandFactor = 1.2 // 20% wider band for small samples
    }

    // Calculate bands in days
    const innerBandDays = stdDev * expandFactor
    const outerBandDays = 2 * stdDev * expandFactor

    // Window: earliest to latest possible next period dates
    const nextPeriodWindow = {
      earliestInner: new Date(expectedNextPeriod.getTime() - innerBandDays * DAY_MS),
      latestInner: new Date(expectedNextPeriod.getTime() + innerBandDays * DAY_MS),
      earliestOuter: new Date(expectedNextPeriod.getTime() - outerBandDays * DAY_MS),
      latestOuter: new Date(expectedNextPeriod.getTime() + outerBandDays * DAY_MS),
    }

    const innerBand = {
      min: Math.round(innerBandDays),
      max: Math.round(innerBandDays),
      confidence: '68%'
    }

    const outerBand = {
      min: Math.round(outerBandDays),
      max: Math.round(outerBandDays),
      confidence: '95%'
    }

    setBandData({
      hasEnoughData: true,
      cyclesAvailable: n,
      mean: Math.round(mean),
      stdDev: Math.round(stdDev * 10) / 10,
      isPreliminary: n < 5,
      innerBand,
      outerBand,
      nextPeriodDate: expectedNextPeriod,
      nextPeriodWindow,
      daysUntilNextPeriod,
      today,
    })
  }, [menstrualData])

  if (!bandData || !bandData.hasEnoughData) {
    return (
      <div
        onClick={() => navigate('/health/perimenopause')}
        style={{
          width: '100%',
          padding: '0 0 var(--space-sm) 0',
          marginTop: '0',
          cursor: 'pointer',
        }}>
        <div style={{
          background: 'var(--d-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: 'none',
          borderRadius: '22px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09), inset 0 0 30px rgba(199, 154, 110, 0.08)',
          padding: 'var(--space-lg)',
          transition: 'all 150ms ease',
        }}>
          <h3 style={{
            fontSize: '15px',
            fontFamily: 'var(--font-sans)',
            fontWeight: '600',
            margin: '0 0 var(--space-md) 0',
            color: 'var(--d-ink)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            Onzekerheidsvenster
          </h3>
          <p style={{
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            color: 'var(--d-ink-2)',
            margin: 0,
            lineHeight: 1.5,
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}>
            {bandData ? `Nog te weinig data voor een betrouwbaar venster. Je hebt ${3 - bandData.cyclesAvailable} meer ${3 - bandData.cyclesAvailable === 1 ? 'cyclus' : 'cycli'} nodig.` : 'Laden...'}
          </p>
        </div>
      </div>
    )
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('nl-NL', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const DAY_MS = 1000 * 60 * 60 * 24
  const daysUntilInnerMin = Math.round((bandData.nextPeriodWindow.earliestInner - bandData.today) / DAY_MS)
  const daysUntilInnerMax = Math.round((bandData.nextPeriodWindow.latestInner - bandData.today) / DAY_MS)
  const daysUntilOuterMin = Math.round((bandData.nextPeriodWindow.earliestOuter - bandData.today) / DAY_MS)
  const daysUntilOuterMax = Math.round((bandData.nextPeriodWindow.latestOuter - bandData.today) / DAY_MS)

  // Timeline visualization
  const timelineWidth = 340
  const daysToShow = 60
  const pixelsPerDay = timelineWidth / daysToShow

  // Calculate positions on timeline (centered at ~day 28-32)
  const innerMinPos = daysUntilInnerMin * pixelsPerDay
  const innerMaxPos = daysUntilInnerMax * pixelsPerDay
  const outerMinPos = daysUntilOuterMin * pixelsPerDay
  const outerMaxPos = daysUntilOuterMax * pixelsPerDay

  return (
    <div
      onClick={() => navigate('/health/perimenopause')}
      style={{
        width: '100%',
        padding: '0 0 var(--space-sm) 0',
        marginTop: '0',
        cursor: 'pointer',
        opacity: 0.4,
      }}>
      <div style={{
        background: 'var(--d-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: 'none',
        borderRadius: '22px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09), inset 0 0 30px rgba(199, 154, 110, 0.08)',
        padding: 'var(--space-lg)',
        transition: 'all 150ms ease',
      }}>

        {/* Preliminary badge */}
        {bandData.isPreliminary && (
          <div style={{
            display: 'inline-block',
            background: 'var(--info)',
            color: '#1B0F07',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            fontFamily: 'var(--font-sans)',
            fontWeight: '500',
            marginBottom: 'var(--space-md)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            ⚠ Voorlopig ({bandData.cyclesAvailable} van 5 cycli)
          </div>
        )}

        {/* Timeline */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <svg
            width={timelineWidth}
            height={80}
            style={{ display: 'block', margin: '0 auto' }}
          >
            {/* Outer band (light) */}
            <rect
              x={Math.max(0, outerMinPos)}
              y={28}
              width={Math.max(0, Math.min(timelineWidth, outerMaxPos) - Math.max(0, outerMinPos))}
              height={24}
              fill="var(--d-accent)"
              opacity={0.2}
            />

            {/* Inner band (darker) */}
            <rect
              x={Math.max(0, innerMinPos)}
              y={28}
              width={Math.max(0, Math.min(timelineWidth, innerMaxPos) - Math.max(0, innerMinPos))}
              height={24}
              fill="var(--d-accent)"
              opacity={0.5}
            />

            {/* Timeline axis */}
            <line
              x1={0}
              y1={40}
              x2={timelineWidth}
              y2={40}
              stroke="var(--d-border)"
              strokeWidth={1}
            />

            {/* Today marker */}
            <circle cx={0} cy={40} r={4} fill="var(--d-ink)" />
            <text x={0} y={60} fontSize={10} textAnchor="middle" fill="var(--d-ink-3)">
              Vandaag
            </text>

            {/* Window labels */}
            <text
              x={Math.max(10, Math.min(timelineWidth - 10, (innerMinPos + innerMaxPos) / 2))}
              y={22}
              fontSize={11}
              textAnchor="middle"
              fill="var(--d-ink-2)"
              fontWeight="bold"
              style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}
            >
              Waarschijnlijk
            </text>
          </svg>
        </div>

        {/* Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-lg)',
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
        }}>
          <div>
            <span style={{ color: 'var(--d-ink-2)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>Gemiddelde cyclus</span>
            <br />
            <strong style={{ color: 'var(--d-ink)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>{bandData.mean} dagen</strong>
          </div>
          <div>
            <span style={{ color: 'var(--d-ink-2)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>Variabiliteit (σ)</span>
            <br />
            <strong style={{ color: 'var(--d-ink)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>{bandData.stdDev} dagen</strong>
          </div>
        </div>

        {/* Text description */}
        <p style={{
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
          color: 'var(--d-ink)',
          margin: 0,
          lineHeight: 1.6,
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        }}>
          Je menstruatie zal <strong>waarschijnlijk</strong> beginnen tussen{' '}
          <strong>{formatDate(bandData.nextPeriodWindow.earliestInner)}</strong> en{' '}
          <strong>{formatDate(bandData.nextPeriodWindow.latestInner)}</strong>.
          <br />
          <br />
          <span style={{ color: 'var(--d-ink-2)', fontSize: '11px' }}>
            (Mogelijk tussen {formatDate(bandData.nextPeriodWindow.earliestOuter)} en {formatDate(bandData.nextPeriodWindow.latestOuter)})
          </span>
        </p>
      </div>
    </div>
  )
}
