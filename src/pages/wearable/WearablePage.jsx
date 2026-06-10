import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getToken, seedWearableData, getWearableReadings, getWearableStatus, pullWearableData, requestWearableConnect } from '../../api/client'
import WearableConsentModal from '../../components/WearableConsentModal'
import BiometricChart from '../../components/BiometricChart'
import Footer from '../../components/Footer'
import hero from '../../assets/hero1.png'

const SCENARIOS = ['stable', 'declining', 'recovering', 'dip']

export default function WearablePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [consentGiven, setConsentGiven] = useState(false)
  const [consentType, setConsentType] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [scenario, setScenario] = useState('stable')
  const [days, setDays] = useState(60)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [biometricData, setBiometricData] = useState(null)
  const [loadingData, setLoadingData] = useState(false)
  const [wearableStatus, setWearableStatus] = useState(null)
  const [, setCheckingStatus] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    if (!getToken()) {
      navigate('/login')
      return
    }
    setIsLoggedIn(true)
  }, [])

  useEffect(() => {
    // Load biometric data and status when consent is given
    if (!consentGiven) return

    async function loadData() {
      setLoadingData(true)
      try {
        const result = await getWearableReadings(90)
        setBiometricData(result.data)
      } catch (err) {
        console.error('Failed to load biometric data:', err)
      } finally {
        setLoadingData(false)
      }
    }

    async function loadStatus() {
      setCheckingStatus(true)
      try {
        const status = await getWearableStatus()
        setWearableStatus(status)
      } catch (err) {
        console.error('Failed to load wearable status:', err)
      } finally {
        setCheckingStatus(false)
      }
    }

    loadData()
    if (consentType === 'real') {
      loadStatus()
    }
  }, [consentGiven, consentType])

  useEffect(() => {
    const consent = localStorage.getItem('wearable_consent')
    if (consent) {
      setConsentGiven(true)
      setConsentType(consent)
    }

    // Handle OAuth callback messages
    const ouraConnected = searchParams.get('oura_connected')
    const ouraError = searchParams.get('oura_error')

    if (ouraConnected) {
      setSuccess('Oura Ring verbonden! Je data wordt nu gesynchroniseerd.')
      setTimeout(() => setSuccess(null), 5000)
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (ouraError) {
      setError('Oura verbinding mislukt. Probeer het opnieuw.')
      setTimeout(() => setError(null), 5000)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [searchParams])

  function handleConsentGiven(choice) {
    setConsentType(choice)
    setConsentGiven(true)
  }

  async function handleGenerateTestData() {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await seedWearableData(days, scenario)
      setSuccess(`Generated ${result.readings_created} days of ${scenario} data`)

      // Reload data
      const newData = await getWearableReadings(90)
      setBiometricData(newData.data)

      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to generate test data')
    } finally {
      setLoading(false)
    }
  }

  async function handleConnectOura() {
    try {
      setError(null)
      const result = await requestWearableConnect()
      if (result.auth_url) {
        window.location.href = result.auth_url
      } else {
        setError('Failed to get Oura authentication URL')
      }
    } catch (err) {
      setError(err.message || 'Failed to connect Oura')
    }
  }

  async function handleSyncOuraData() {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await pullWearableData()
      setSuccess(`${result.readings_synced} dagen data gesynchroniseerd van Oura`)

      // Reload status and biometric data
      const status = await getWearableStatus()
      setWearableStatus(status)

      const newData = await getWearableReadings(90)
      setBiometricData(newData.data)

      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      setError(err.message || 'Failed to sync Oura data')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return null
  }

  if (!consentGiven) {
    return <WearableConsentModal onConsent={handleConsentGiven} />
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'var(--space-lg)',
      background: '#F5EFEB',
      backgroundImage: `url(${hero})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            marginBottom: 'var(--space-lg)',
            color: 'var(--ink)',
          }}
        >
          ←
        </button>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: '500',
          marginBottom: 'var(--space-lg)',
          color: 'var(--ink)',
        }}>
          Wearable
        </h1>

        {consentType === 'real' && (
          <div style={{
            background: 'white',
            padding: 'var(--space-lg)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--ink)',
              }}>
                Oura Ring verbinden
              </h2>
              {wearableStatus && wearableStatus.connected && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: 'var(--success)',
                  fontWeight: '500',
                }}>
                  <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></span>
                  Verbonden
                </div>
              )}
            </div>
            {wearableStatus ? (
              wearableStatus.connected ? (
                <div style={{
                  background: 'rgba(79, 140, 90, 0.1)',
                  border: '1px solid rgba(79, 140, 90, 0.3)',
                  padding: 'var(--space-md)',
                  borderRadius: '8px',
                  marginBottom: 'var(--space-lg)',
                  fontSize: '14px',
                  color: 'var(--ink)',
                }}>
                  <p style={{ margin: '0 0 8px 0' }}>Je Oura Ring is verbonden.</p>
                  {wearableStatus.last_sync_at && (
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-2)' }}>
                      Laatste synchronisatie: {new Date(wearableStatus.last_sync_at).toLocaleDateString('nl-NL')}
                    </p>
                  )}
                </div>
              ) : (
                <p style={{
                  fontSize: '15px',
                  color: 'var(--ink-2)',
                  lineHeight: 1.6,
                  marginBottom: 'var(--space-lg)',
                }}>
                  Klik om je Oura Ring te verbinden via OAuth.
                </p>
              )
            ) : (
              <p style={{
                fontSize: '15px',
                color: 'var(--ink-2)',
                lineHeight: 1.6,
                marginBottom: 'var(--space-lg)',
              }}>
                Klik om je Oura Ring te verbinden via OAuth.
              </p>
            )}
            {success && (
              <div style={{
                background: 'rgba(79, 140, 90, 0.1)',
                border: '1px solid rgba(79, 140, 90, 0.3)',
                padding: 'var(--space-md)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--success)',
                marginBottom: 'var(--space-lg)',
              }}>
                {success}
              </div>
            )}
            {error && (
              <div style={{
                background: 'rgba(192, 73, 45, 0.1)',
                border: '1px solid rgba(192, 73, 45, 0.3)',
                padding: 'var(--space-md)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--error)',
                marginBottom: 'var(--space-lg)',
              }}>
                {error}
              </div>
            )}
            {!wearableStatus || !wearableStatus.connected ? (
              <button
                onClick={handleConnectOura}
                style={{
                  padding: '12px 24px',
                  background: 'var(--ink)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'opacity 200ms ease',
                }}
                onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.target.style.opacity = '1')}
              >
                Verbind Oura
              </button>
            ) : (
              <button
                onClick={handleSyncOuraData}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: loading ? 'rgba(199, 154, 110, 0.5)' : 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  transition: 'opacity 200ms ease',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.9')}
                onMouseLeave={(e) => !loading && (e.target.style.opacity = '1')}
              >
                {loading ? 'Synchroniseren...' : 'Gegevens synchroniseren'}
              </button>
            )}
          </div>
        )}

        {consentType === 'test' && (
          <div style={{
            background: 'rgba(199, 154, 110, 0.1)',
            padding: 'var(--space-lg)',
            borderRadius: '12px',
            border: '2px solid rgba(199, 154, 110, 0.3)',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: 'var(--space-md)',
              color: 'var(--ink)',
            }}>
              Testdata Mode
            </h2>
            <p style={{
              fontSize: '15px',
              color: 'var(--ink-2)',
              lineHeight: 1.6,
              marginBottom: 'var(--space-lg)',
            }}>
              Genereer realistische slaap- en hersteldata voor testen zonder Oura device.
            </p>

            {/* Scenario selector */}
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '8px',
              }}>
                Scenario
              </label>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid rgba(199, 154, 110, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'var(--font-sans)',
                  background: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <option value="stable">Stabiel (consistent)</option>
                <option value="declining">Afnemend (verslechtering)</option>
                <option value="recovering">Herstellend (verbetering)</option>
                <option value="dip">Dip (acute verslechtering)</option>
              </select>
            </div>

            {/* Days input */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <label style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '8px',
              }}>
                Aantal dagen: {days}
              </label>
              <input
                type="range"
                min="7"
                max="180"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                disabled={loading}
                style={{
                  width: '100%',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              />
              <div style={{
                fontSize: '12px',
                color: 'var(--ink-3)',
                marginTop: '4px',
              }}>
                {days} dagen data genereren
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                background: 'rgba(192, 73, 45, 0.1)',
                border: '1px solid rgba(192, 73, 45, 0.3)',
                padding: 'var(--space-md)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--error)',
                marginBottom: 'var(--space-md)',
              }}>
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div style={{
                background: 'rgba(79, 140, 90, 0.1)',
                border: '1px solid rgba(79, 140, 90, 0.3)',
                padding: 'var(--space-md)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--success)',
                marginBottom: 'var(--space-md)',
              }}>
                {success}
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerateTestData}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: loading ? 'rgba(199, 154, 110, 0.5)' : 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                transition: 'all 200ms ease',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.9')}
              onMouseLeave={(e) => !loading && (e.target.style.opacity = '1')}
            >
              {loading ? 'Genereren...' : 'Genereer Testdata'}
            </button>

            <p style={{
              fontSize: '12px',
              color: 'var(--ink-3)',
              marginTop: 'var(--space-md)',
            }}>
              Later kun je naar Oura Ring overschakelen in Instellingen.
            </p>
          </div>
        )}

        <button
          onClick={() => {
            localStorage.removeItem('wearable_consent')
            setConsentGiven(false)
          }}
          style={{
            marginTop: 'var(--space-xl)',
            padding: '10px 16px',
            background: 'transparent',
            color: 'var(--ink-3)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            textDecoration: 'underline',
          }}
        >
          Consent intrekken
        </button>
      </div>

      {/* Biometric Charts */}
      {biometricData && biometricData.length > 0 && (
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            fontWeight: '500',
            marginBottom: 'var(--space-lg)',
            color: 'var(--ink)',
          }}>
            Jouw data
          </h2>
          <BiometricChart data={biometricData} />
        </div>
      )}

      {loadingData && (
        <div style={{
          padding: 'var(--space-lg)',
          textAlign: 'center',
          color: 'var(--ink-2)',
        }}>
          Data laden...
        </div>
      )}

      <Footer />
    </div>
  )
}
