import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Scanner.module.css'
import { apiUrl, API_BASE_URL } from '../../api/config'

/**
 * Scanner.jsx
 * -----------
 * Live camera-scanner voor supplement-etiketten.
 *
 * Pipeline:
 *   1. navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
 *      → vraagt camera-toegang en pakt bij voorkeur de achterkant van de telefoon.
 *   2. <video id="webcam"> toont de live stream als "viewfinder".
 *   3. Gebruiker tikt "Maak foto" → we tekenen de huidige frame op een
 *      offscreen <canvas> en exporteren naar JPEG (toBlob).
 *   4. De Blob wordt als multipart/form-data POST naar /api/scan/upload
 *      (proxy in vite.config.js stuurt dit door naar de FastAPI backend).
 *   5. Resultaat (ingrediënten + ev. risico's) wordt onder de viewfinder
 *      getoond. Bij fouten een nette foutmelding met retry.
 *
 * Belangrijk:
 *   - getUserMedia werkt alleen op https:// of http://localhost.
 *   - We stoppen de stream netjes (track.stop()) bij unmount of nieuwe scan,
 *     anders blijft het camera-lampje branden.
 */

// Versie-gestuurde route die in de OpenAPI-docs verschijnt.
// (Backend mountt zowel /api/v1/scan als de legacy /api/scan/upload —
// zie backend/api/upload.py.)
const UPLOAD_PATH = '/api/v1/scan'

export default function Scanner() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [phase, setPhase] = useState('live') // 'live' | 'captured' | 'analyzing' | 'success' | 'error'
  const [previewUrl, setPreviewUrl] = useState(null)
  const [capturedBlob, setCapturedBlob] = useState(null)
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  /* ------------------------------------------------------------------ */
  /* Camera lifecycle                                                    */
  /* ------------------------------------------------------------------ */

  const stopStream = useCallback(() => {
    const stream = streamRef.current
    if (stream) {
      stream.getTracks().forEach((t) => {
        try { t.stop() } catch {}
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraReady(false)
  }, [])

  const startCamera = useCallback(async () => {
    setCameraError('')
    setCameraReady(false)

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera-API niet beschikbaar in deze browser.')
      return
    }

    try {
      // Vraag de achterkant-camera (environment). Browsers mogen dit weigeren
      // op desktops (geen rear-cam) en pakken dan de standaard camera.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Wacht tot metadata bekend is voordat we 'ready' zeggen
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {})
          setCameraReady(true)
        }
      }
    } catch (err) {
      const msg =
        err && err.name === 'NotAllowedError'
          ? 'Camera-toegang geweigerd. Sta het toe in je browser-instellingen.'
          : err && err.name === 'NotFoundError'
          ? 'Geen camera gevonden op dit apparaat.'
          : `Kon camera niet starten: ${err?.message || err}`
      setCameraError(msg)
    }
  }, [])

  // Start camera bij mount, stop bij unmount
  useEffect(() => {
    startCamera()
    return () => stopStream()
  }, [startCamera, stopStream])

  /* ------------------------------------------------------------------ */
  /* Capture: video → canvas → JPEG Blob                                 */
  /* ------------------------------------------------------------------ */

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !cameraReady) return

    const w = video.videoWidth || 1280
    const h = video.videoHeight || 960
    canvas.width = w
    canvas.height = h

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, w, h)

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setErrorMsg('Kon foto niet maken.')
          setPhase('error')
          return
        }
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setCapturedBlob(blob)
        setPreviewUrl(URL.createObjectURL(blob))
        setPhase('captured')
        // Stop de stream zodra we een foto hebben — bespaart batterij + privacy
        stopStream()
      },
      'image/jpeg',
      0.92,
    )
  }, [cameraReady, previewUrl, stopStream])

  const retake = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setCapturedBlob(null)
    setResult(null)
    setErrorMsg('')
    setPhase('live')
    startCamera()
  }, [previewUrl, startCamera])

  /* ------------------------------------------------------------------ */
  /* Upload naar backend                                                 */
  /* ------------------------------------------------------------------ */

  const analyze = useCallback(async () => {
    if (!capturedBlob) return
    setPhase('analyzing')
    setErrorMsg('')

    const form = new FormData()
    form.append('image', capturedBlob, 'scan.jpg')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    // Bouw de volledige URL. Op desktop is dit een relatief pad
    // (Vite-proxy → localhost:8000); via devtunnel/ngrok is dit een
    // absolute URL naar de PUBLIEKE backend.
    const fullUrl = apiUrl(UPLOAD_PATH)
    // Gevraagd debug-log: zo zie je in DevTools/USB-debug exact waar
    // de POST naartoe gaat. Handig bij 404's via tunnels.
    // eslint-disable-next-line no-console
    console.log('Verzenden naar:', fullUrl, '(API_BASE_URL=', API_BASE_URL || '(relatief/proxy)', ')')

    try {
      const res = await fetch(fullUrl, {
        method: 'POST',
        body: form,
        signal: controller.signal,
        cache: 'no-store',
        credentials: 'omit',
      })
      const isJson = (res.headers.get('content-type') || '').includes('application/json')
      const body = isJson ? await res.json() : null

      if (!res.ok || !body || body.success !== true) {
        const message = (body && body.message) || `HTTP ${res.status}`
        setErrorMsg(message)
        setPhase('error')
        return
      }
      setResult(body)
      setPhase('success')
    } catch (err) {
      const msg =
        err?.name === 'AbortError'
          ? 'Analyse duurde te lang. Probeer het opnieuw.'
          : 'Kon de server niet bereiken. Controleer je verbinding.'
      setErrorMsg(msg)
      setPhase('error')
    } finally {
      clearTimeout(timeoutId)
    }
  }, [capturedBlob])

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  const ingredients = result?.extraction?.ingredients || []
  const productName = result?.extraction?.product_name
  const brand = result?.extraction?.brand

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.heading}>Scan Supplement</h1>
        <p className={styles.subtitle}>
          Richt de camera op het etiket. We lezen ingrediënten en doseringen.
        </p>
      </div>

      {/* ---------------- Viewfinder / Preview ---------------- */}
      <div className={styles.glass}>
        <div className={styles.viewfinder}>
          {/* De video is áltijd in de DOM zodat de ref stabiel blijft;
              we hide hem alleen met display als we een preview tonen. */}
          <video
            id="webcam"
            ref={videoRef}
            className={styles.video}
            playsInline
            muted
            autoPlay
            style={{ display: phase === 'live' ? 'block' : 'none' }}
          />

          {phase !== 'live' && previewUrl && (
            <img
              src={previewUrl}
              alt="Gemaakte foto"
              className={styles.previewImg}
            />
          )}

          {phase === 'live' && !cameraReady && !cameraError && (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>📷</div>
              <div>Camera starten…</div>
            </div>
          )}

          {phase === 'live' && cameraError && (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>⚠️</div>
              <div>{cameraError}</div>
            </div>
          )}

          {phase === 'live' && cameraReady && <div className={styles.reticle} />}
          <div className={styles.viewfinderOverlay} />
        </div>

        {/* Hidden canvas voor de capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* ---------------- Action buttons per phase ---------------- */}
        <div style={{ marginTop: 'var(--space-md)' }}>
          {phase === 'live' && (
            <>
              <button
                type="button"
                className={styles.scanButton}
                onClick={capturePhoto}
                disabled={!cameraReady}
              >
                <span className={styles.scanIcon} aria-hidden="true">📸</span>
                <span>Maak foto</span>
              </button>
              {cameraError && (
                <div style={{ marginTop: 12 }} className={styles.actions}>
                  <button type="button" className={styles.ghostBtn} onClick={startCamera}>
                    Probeer opnieuw
                  </button>
                  <button type="button" className={styles.ghostBtn} onClick={() => navigate('/dashboard')}>
                    Terug
                  </button>
                </div>
              )}
            </>
          )}

          {phase === 'captured' && (
            <>
              <button type="button" className={styles.scanButton} onClick={analyze}>
                <span className={styles.scanIcon} aria-hidden="true">🤖</span>
                <span>Analyseer met AI</span>
              </button>
              <div style={{ marginTop: 12 }} className={styles.actions}>
                <button type="button" className={styles.ghostBtn} onClick={retake}>
                  Opnieuw fotograferen
                </button>
                <button type="button" className={styles.ghostBtn} onClick={() => navigate('/dashboard')}>
                  Annuleren
                </button>
              </div>
            </>
          )}

          {phase === 'analyzing' && (
            <div className={styles.status}>
              <span className={styles.spinner} aria-hidden="true" />
              <span>AI analyseert je foto… (5–10 sec)</span>
            </div>
          )}

          {phase === 'error' && (
            <>
              <div className={`${styles.status} ${styles.statusError}`}>
                <span aria-hidden="true">⚠️</span>
                <span>{errorMsg || 'Er ging iets mis.'}</span>
              </div>
              <div style={{ marginTop: 12 }} className={styles.actions}>
                <button type="button" className={styles.ghostBtn} onClick={analyze}>
                  Opnieuw proberen
                </button>
                <button type="button" className={styles.ghostBtn} onClick={retake}>
                  Nieuwe foto
                </button>
              </div>
            </>
          )}

          {phase === 'success' && (
            <div style={{ marginTop: 12 }} className={styles.actions}>
              <button type="button" className={styles.ghostBtn} onClick={retake}>
                Nieuwe scan
              </button>
              <button type="button" className={styles.ghostBtn} onClick={() => navigate('/dashboard')}>
                Naar dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Result card ---------------- */}
      {phase === 'success' && result && (
        <div className={styles.glass}>
          <h2 className={styles.resultTitle}>{productName || 'Onbekend product'}</h2>
          {brand && <div className={styles.resultBrand}>{brand}</div>}

          {ingredients.length > 0 ? (
            <ul className={styles.ingredientList}>
              {ingredients.map((ing, i) => (
                <li key={i} className={styles.ingredient}>
                  <span className={styles.ingredientName}>{ing.name}</span>
                  <span className={styles.ingredientDose}>
                    {[ing.dosage, ing.unit].filter(Boolean).join(' ') || '—'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.disclaimer}>
              Geen ingrediënten herkend. Probeer een scherpere foto.
            </p>
          )}

          {result.disclaimer && (
            <p className={styles.disclaimer}>{result.disclaimer}</p>
          )}
        </div>
      )}
    </div>
  )
}
