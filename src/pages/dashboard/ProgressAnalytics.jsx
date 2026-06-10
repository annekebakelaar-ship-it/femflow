import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getWearableReadings } from "../../api/client"
import { getSecure } from "../../utils/secureStorage"
import { berekenTrend, gemiddelde as avg } from "../../utils/trendHelper"

// Bouwt de 90-dagensamenvatting client-side uit eigen readings + symptoomlog.
// Verving de call naar een niet-bestaand WAB-endpoint, waardoor deze pagina
// voor elke gebruiker "Kan gegevens niet laden" toonde.
function buildSummary(readings, symptomLog) {
  const trend = arr => berekenTrend(arr).richting

  const slaap = readings.map(r => r.sleep_duration_min).filter(v => v != null)
  const hrv = readings.map(r => r.hrv_ms).filter(v => v != null)
  const rhr = readings.map(r => r.resting_heart_rate).filter(v => v != null)

  const frequency = {}
  const drieMaandenTerug = new Date()
  drieMaandenTerug.setDate(drieMaandenTerug.getDate() - 90)
  for (const entry of symptomLog || []) {
    if (!entry.date || new Date(entry.date) < drieMaandenTerug) continue
    const label = entry.label || entry.symptom
    frequency[label] = (frequency[label] || 0) + 1
  }
  const totalLogged = Object.values(frequency).reduce((a, b) => a + b, 0)

  const insights = []
  if (slaap.length) insights.push(`Gemiddeld ${(avg(slaap) / 60).toFixed(1)} uur slaap over ${slaap.length} geregistreerde nachten`)
  if (hrv.length >= 4) insights.push(`Je HRV-verloop over deze periode is ${trend(hrv)}`)
  if (totalLogged > 0) insights.push(`Je logde ${totalLogged} symptomen in 90 dagen`)

  const recommendations = []
  if (slaap.length && avg(slaap) < 7 * 60) recommendations.push("Je gemiddelde slaapduur ligt onder de 7 uur; let op je slaapritme")
  recommendations.push("Bespreek aanhoudende of opvallende veranderingen met je huisarts")

  return {
    sleep: {
      average_hours: slaap.length ? (avg(slaap) / 60).toFixed(1) : "-",
      entries: slaap.length,
    },
    hrv: {
      average: hrv.length ? Math.round(avg(hrv)) : "-",
      trend: trend(hrv),
    },
    rhr: {
      average_bpm: rhr.length ? Math.round(avg(rhr)) : "-",
      trend: trend(rhr),
    },
    symptoms: { total_logged: totalLogged, frequency },
    insights,
    recommendations,
  }
}

export default function ProgressAnalytics() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("femflow_jwt")
        if (!token) {
          setError("Niet ingelogd")
          setLoading(false)
          return
        }

        const result = await getWearableReadings(90)
        const symptomLog = getSecure("symptom_log") || []

        if ((!result.data || result.data.length === 0) && symptomLog.length === 0) {
          setError("Nog geen data om samen te vatten. Koppel een wearable of log symptomen.")
          return
        }

        setData(buildSummary(result.data || [], symptomLog))
      } catch (err) {
        console.error("Failed to load analytics:", err)
        setError("Kan gegevens niet laden. Probeer later opnieuw.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div style={{
    padding: "var(--space-lg)",
    textAlign: "center",
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    color: 'var(--ink)',
  }}>Laden...</div>

  if (error) return <div style={{
    padding: "var(--space-lg)",
    textAlign: "center",
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    color: '#C62828',
  }}>
    {error}
    <br /><br />
    <button
      onClick={() => navigate('/dashboard')}
      style={{
        background: 'var(--accent)',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
      }}
    >
      Terug naar Dashboard
    </button>
  </div>

  if (!data) return <div style={{
    padding: "var(--space-lg)",
    textAlign: "center",
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    color: 'var(--ink-2)',
  }}>Nog geen gegevens</div>

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "var(--space-lg) 0 140px 0" }}>
      <button onClick={() => navigate("/dashboard")} style={{
        background: "none",
        border: "none",
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: 400,
        color: "var(--ink-2)",
        cursor: "pointer",
        marginBottom: "var(--space-lg)",
        marginLeft: "var(--space-lg)",
      }}>← Terug</button>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: "26px",
        fontWeight: 500,
        lineHeight: 1.25,
        padding: "0 var(--space-lg)",
        marginBottom: "var(--space-md)",
        color: 'var(--ink)',
      }}>90-Dagen Voortgang</h1>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: "15px",
        fontWeight: 400,
        color: "var(--ink-2)",
        padding: "0 var(--space-lg)",
        marginBottom: "var(--space-lg)",
      }}>Jouw gezondheidspatronen en inzichten</p>

      <div style={{ padding: "0 var(--space-lg)", marginBottom: "var(--space-lg)" }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: "20px",
          fontWeight: 500,
          marginBottom: "var(--space-md)",
          color: 'var(--ink)',
        }}>Slaap</h2>
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-md)",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-md)" }}>
            <div style={{ textAlign: "center" }}><p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: "20px",
              fontWeight: 600,
              color: "var(--accent)",
              margin: "0 0 4px 0",
              fontFeatureSettings: "'tnum'",
            }}>{data.sleep.average_hours}h</p><p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: "11px",
              fontWeight: 400,
              color: "var(--ink-3)",
              margin: 0,
            }}>Gemiddeld</p></div>
            <div style={{ textAlign: "center" }}><p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: "20px",
              fontWeight: 600,
              color: "var(--accent)",
              margin: "0 0 4px 0",
              fontFeatureSettings: "'tnum'",
            }}>{data.sleep.entries}</p><p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: "11px",
              fontWeight: 400,
              color: "var(--ink-3)",
              margin: 0,
            }}>Loggingen</p></div>
            <div style={{ textAlign: "center" }}><p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: "20px",
              fontWeight: 600,
              color: "var(--success)",
              margin: "0 0 4px 0",
            }}>✓</p><p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: "11px",
              fontWeight: 400,
              color: "var(--ink-3)",
              margin: 0,
            }}>Stabiel</p></div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 var(--space-lg)", marginBottom: "var(--space-lg)" }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: "20px",
          fontWeight: 500,
          marginBottom: "var(--space-md)",
          color: 'var(--ink)',
        }}>Hartslag</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-md)",
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--ink-3)",
              marginBottom: "8px",
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>HRV</p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: "20px",
              fontWeight: 600,
              color: "var(--accent)",
              margin: "0 0 4px 0",
              fontFeatureSettings: "'tnum'",
            }}>{data.hrv.average}ms</p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: "11px",
              fontWeight: 400,
              color: "var(--ink-3)",
            }}>Trend: {data.hrv.trend}</p>
          </div>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-md)",
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--ink-3)",
              marginBottom: "8px",
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>RHR</p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: "20px",
              fontWeight: 600,
              color: "var(--accent)",
              margin: "0 0 4px 0",
              fontFeatureSettings: "'tnum'",
            }}>{data.rhr.average_bpm} bpm</p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: "11px",
              fontWeight: 400,
              color: "var(--ink-3)",
            }}>Trend: {data.rhr.trend}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 var(--space-lg)", marginBottom: "var(--space-lg)" }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: "20px",
          fontWeight: 500,
          marginBottom: "var(--space-md)",
          color: 'var(--ink)',
        }}>Symptomen</h2>
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-md)",
        }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: "13px",
            fontWeight: 400,
            color: "var(--ink-3)",
            marginBottom: "var(--space-md)",
          }}>{data.symptoms.total_logged} symptomen gelogd</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
            {Object.entries(data.symptoms.frequency).map(([s, c]) => (
              <div key={s} style={{
                background: "var(--surface-warm)",
                padding: "var(--space-sm)",
                borderRadius: "var(--radius-md)",
              }}>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  margin: "0 0 4px 0",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: 'var(--ink)',
                  textTransform: "capitalize",
                }}>
                  {s.replace(/_/g, " ")}
                </p>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "var(--accent)",
                  fontFeatureSettings: "'tnum'",
                }}>{c}x</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 var(--space-lg)", marginBottom: "var(--space-lg)" }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: "20px",
          fontWeight: 500,
          marginBottom: "var(--space-md)",
          color: 'var(--ink)',
        }}>Inzichten</h2>
        {data.insights.map((i, idx) => (
          <div key={idx} style={{
            background: "rgba(79, 140, 90, 0.08)",
            border: "1px solid var(--success)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-md)",
            marginBottom: "var(--space-sm)",
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: "15px",
              fontWeight: 400,
              margin: 0,
              color: "var(--success)",
            }}>✓ {i}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 var(--space-lg)" }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: "20px",
          fontWeight: 500,
          marginBottom: "var(--space-md)",
          color: 'var(--ink)',
        }}>Aanbevelingen</h2>
        {data.recommendations.map((r, idx) => (
          <div key={idx} style={{
            background: "rgba(91, 124, 153, 0.08)",
            border: "1px solid var(--info)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-md)",
            marginBottom: "var(--space-sm)",
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: "15px",
              fontWeight: 400,
              margin: 0,
              color: "var(--info)",
            }}>→ {r}</p>
          </div>
        ))}
      </div>

      <div style={{ height: "60px" }} />
    </div>
  )
}