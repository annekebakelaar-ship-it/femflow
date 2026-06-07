import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getHormoneData } from '../utils/hormoneCalculator'
import { getPhaseByDay } from '../utils/cycleUtils'

export default function HormoneChart({ cycleLength = 28 }) {
  const data = getHormoneData(cycleLength)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload
      const phase = getPhaseByDay(entry.day, cycleLength)
      const phaseNames = {
        menstruation: 'Menstruatie',
        follicular: 'Folliculair',
        ovulatory: 'Ovulatie',
        luteal: 'Luteaal',
      }
      return (
        <div style={{
          background: 'white',
          padding: '8px 12px',
          border: '1px solid #E0E0E0',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600' }}>
            Dag {entry.day} — {phaseNames[phase]}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '2px 0', fontSize: '11px', color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div style={{
      width: '100%',
      height: '420px',
      padding: 'var(--space-lg)',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 12px 40px rgba(42, 33, 28, 0.15), 0 4px 12px rgba(42, 33, 28, 0.08)',
      opacity: 0.85,
    }}>
      <h3 style={{
        fontSize: 'var(--font-size-small)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-label)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        margin: '0 0 var(--space-md) 0',
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      }}>
        Hormoonkaart — 28 Dagen
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: '#999' }}
            stroke="#E0E0E0"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#999' }}
            stroke="#E0E0E0"
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="estrogen"
            stroke="#C79A6E"
            strokeWidth={2}
            dot={false}
            name="Estrogeen"
          />
          <Line
            type="monotone"
            dataKey="progesterone"
            stroke="#5B7C99"
            strokeWidth={2}
            dot={false}
            name="Progesterone"
          />
          <Line
            type="monotone"
            dataKey="fsh"
            stroke="#9B8BC9"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="5 5"
            name="FSH"
          />
          <Line
            type="monotone"
            dataKey="lh"
            stroke="#86B96A"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="5 5"
            name="LH"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
