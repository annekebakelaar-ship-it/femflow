import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function BiometricChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: 'var(--space-lg)',
        textAlign: 'center',
        color: 'var(--ink-2)',
        fontSize: '14px',
      }}>
        Geen data beschikbaar
      </div>
    )
  }

  // Format data for charts
  const chartData = data.map(row => ({
    date: row.reading_date,
    hrv: row.hrv_ms,
    rhr: row.resting_heart_rate,
    sleep: Math.round(row.sleep_duration_min / 60), // convert to hours
    deepSleep: Math.round(row.deep_sleep_min / 60),
    recovery: row.recovery_index,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* HRV & Recovery Trend */}
      <div style={{
        background: 'white',
        padding: 'var(--space-lg)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: 'var(--ink)',
          marginBottom: 'var(--space-md)',
        }}>
          HRV & Herstelscore
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval={Math.floor(chartData.length / 7)}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="hrv"
              stroke="var(--accent)"
              dot={false}
              name="HRV (ms)"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="recovery"
              stroke="var(--success)"
              dot={false}
              name="Herstelscore"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sleep Duration */}
      <div style={{
        background: 'white',
        padding: 'var(--space-lg)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: 'var(--ink)',
          marginBottom: 'var(--space-md)',
        }}>
          Slaappatroon
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval={Math.floor(chartData.length / 7)}
            />
            <YAxis tick={{ fontSize: 12 }} label={{ value: 'Uren', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="deepSleep" stackId="a" fill="var(--accent)" name="Diepe slaap" />
            <Bar dataKey="sleep" stackId="a" fill="var(--accent-soft)" name="Totaal slaap" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* RHR Trend */}
      <div style={{
        background: 'white',
        padding: 'var(--space-lg)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: 'var(--ink)',
          marginBottom: 'var(--space-md)',
        }}>
          Rusthartsslag (RHR)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval={Math.floor(chartData.length / 7)}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="rhr"
              stroke="var(--error)"
              dot={false}
              name="RHR (bpm)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
