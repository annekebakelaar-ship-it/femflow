import { useState, useEffect, useRef } from 'react'
import { X, Camera, Search, RefreshCw } from 'react-feather'
import { duidProduct, voedingstabel, isBarcode } from '../utils/voeding'

// Voedingsscanner: barcode via de camera (BarcodeDetector, werkt op Android/
// Chrome) met handmatige invoer als vangnet (iOS Safari kent de API nog niet).
// Productdata komt live van Open Food Facts; de duiding is beschrijvend en
// eerlijk (utils/voeding.js). AI-fotoscan is een bewuste latere fase.

const serif = "'Playfair Display', Georgia, serif"
const sans = "'Hanken Grotesk', system-ui, sans-serif"

const KAART = { borderRadius: 16, background: 'rgba(20,8,4,0.38)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }
const TOON_KLEUR = { goed: '#8fae72', 'let-op': '#d4a96a', neutraal: '#a08070' }

async function haalProduct(code) {
  const velden = 'product_name,brands,quantity,nutriments,nutriscore_grade,image_front_small_url'
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}?fields=${velden}`)
  if (!res.ok) throw new Error('offline')
  const json = await res.json()
  if (json.status !== 1 || !json.product) return null
  return { code, ...json.product }
}

export default function VoedingScanner({ onSluit }) {
  const [modus, setModus] = useState('scan')       // scan | laden | product | niet-gevonden | fout
  const [product, setProduct] = useState(null)
  const [handmatig, setHandmatig] = useState('')
  const [cameraFout, setCameraFout] = useState(false)
  const videoRef = useRef(null)
  const stopRef = useRef(null)

  const kanScannen = typeof window !== 'undefined' && 'BarcodeDetector' in window

  // Camera + detectielus (alleen in scan-modus en als de API bestaat)
  useEffect(() => {
    if (modus !== 'scan' || !kanScannen) return
    let gestopt = false
    let stream = null
    let timer = null

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, audio: false,
        })
        if (gestopt) { stream.getTracks().forEach(t => t.stop()); return }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
        const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] })
        timer = setInterval(async () => {
          if (gestopt || !videoRef.current || videoRef.current.readyState < 2) return
          try {
            const codes = await detector.detect(videoRef.current)
            const code = codes?.[0]?.rawValue
            if (code && isBarcode(code)) {
              clearInterval(timer)
              zoek(code)
            }
          } catch { /* frame overslaan */ }
        }, 350)
      } catch {
        if (!gestopt) setCameraFout(true)
      }
    }
    start()

    stopRef.current = () => {
      gestopt = true
      if (timer) clearInterval(timer)
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
    return () => stopRef.current?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modus, kanScannen])

  async function zoek(code) {
    stopRef.current?.()
    setModus('laden')
    try {
      const p = await haalProduct(code)
      if (!p) { setModus('niet-gevonden'); return }
      setProduct(p)
      setModus('product')
      bewaarScan(p)
    } catch {
      setModus('fout')
    }
  }

  function bewaarScan(p) {
    try {
      const lijst = JSON.parse(localStorage.getItem('femflow_voeding_scans') || '[]')
      const nieuw = [{ code: p.code, naam: p.product_name || '', datum: new Date().toISOString() },
        ...lijst.filter(x => x.code !== p.code)].slice(0, 20)
      localStorage.setItem('femflow_voeding_scans', JSON.stringify(nieuw))
    } catch { /* */ }
  }

  function handmatigZoeken(e) {
    e.preventDefault()
    const code = handmatig.trim()
    if (isBarcode(code)) zoek(code)
  }

  const duiding = product ? duidProduct(product.nutriments || {}) : null
  const tabel = product ? voedingstabel(product.nutriments || {}) : []

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', background: '#0a0402', fontFamily: sans }}>
      {/* Kop */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 8px' }}>
        <p style={{ fontSize: 12, letterSpacing: '0.22em', color: '#a08070', margin: 0 }}>VOEDINGSSCANNER</p>
        <button onClick={() => { stopRef.current?.(); onSluit() }} style={{ background: 'rgba(196,137,106,0.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={16} color="#a08070" />
        </button>
      </div>

      <div className="fp-noscroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 32px' }}>
        {modus === 'scan' && (
          <>
            {kanScannen && !cameraFout ? (
              <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#000', marginBottom: 14 }}>
                <video ref={videoRef} playsInline muted style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ width: '72%', height: 110, border: '1.5px solid rgba(212,169,106,0.8)', borderRadius: 12, boxShadow: '0 0 0 2000px rgba(0,0,0,0.35)' }} />
                </div>
                <p style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', fontSize: 12, color: '#f5ede8', margin: 0, textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
                  Richt op de streepjescode
                </p>
              </div>
            ) : (
              <div style={{ ...KAART, padding: 18, marginBottom: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Camera size={16} color="#c4896a" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 13, lineHeight: 1.6, color: '#a08070', margin: 0 }}>
                  {cameraFout
                    ? 'Geen toegang tot de camera. Typ de streepjescode hieronder in.'
                    : 'Live scannen wordt op dit toestel nog niet ondersteund. Typ de streepjescode van het etiket hieronder in.'}
                </p>
              </div>
            )}

            {/* Handmatige invoer: altijd beschikbaar als vangnet */}
            <form onSubmit={handmatigZoeken} style={{ display: 'flex', gap: 8 }}>
              <input
                value={handmatig}
                onChange={e => setHandmatig(e.target.value.replace(/\D/g, ''))}
                placeholder="Streepjescode, bijv. 8712345678906"
                inputMode="numeric"
                style={{ flex: 1, padding: '13px 14px', borderRadius: 12, border: '1px solid rgba(196,137,106,0.25)', background: 'rgba(20,8,4,0.5)', color: '#f5ede8', fontSize: 14, fontFamily: sans, outline: 'none' }}
              />
              <button type="submit" disabled={!isBarcode(handmatig)} style={{ padding: '0 18px', borderRadius: 12, border: 'none', cursor: isBarcode(handmatig) ? 'pointer' : 'default', background: isBarcode(handmatig) ? 'linear-gradient(135deg, #d4a96a, #c4896a)' : 'rgba(196,137,106,0.15)', color: isBarcode(handmatig) ? '#1a0d08' : '#5a3020' }}>
                <Search size={16} />
              </button>
            </form>

            <p style={{ fontSize: 11, lineHeight: 1.6, color: '#5a3020', margin: '14px 2px 0' }}>
              Productdata: Open Food Facts (open database, kan onvolledig zijn). Wij kijken naar eiwit, vezels, suiker, verzadigd vet en zout — beschrijvend, geen dieetadvies.
            </p>
          </>
        )}

        {modus === 'laden' && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#a08070', fontSize: 13 }}>Product opzoeken...</div>
        )}

        {(modus === 'niet-gevonden' || modus === 'fout') && (
          <div style={{ ...KAART, padding: 20, textAlign: 'center' }}>
            <p style={{ fontFamily: serif, fontSize: 18, color: '#f5ede8', margin: '0 0 8px' }}>
              {modus === 'fout' ? 'Even geen verbinding' : 'Niet gevonden'}
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#a08070', margin: '0 0 18px' }}>
              {modus === 'fout'
                ? 'De productdatabase is nu niet bereikbaar. Probeer het zo nog eens.'
                : 'Dit product staat (nog) niet in Open Food Facts. Vers en onverpakt heeft geen barcode; merkproducten staan er meestal wel in.'}
            </p>
            <button onClick={() => { setProduct(null); setHandmatig(''); setModus('scan') }} style={{ padding: '11px 24px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: sans, fontSize: 13, fontWeight: 600, color: '#1a0d08', background: 'linear-gradient(135deg, #d4a96a, #c4896a)' }}>
              Opnieuw scannen
            </button>
          </div>
        )}

        {modus === 'product' && product && (
          <>
            <div style={{ ...KAART, padding: 18, marginBottom: 12, display: 'flex', gap: 14, alignItems: 'center' }}>
              {product.image_front_small_url && (
                <img src={product.image_front_small_url} alt="" style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 10, background: 'rgba(245,237,232,0.06)', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: serif, fontSize: 17, color: '#f5ede8', margin: 0, lineHeight: 1.3 }}>{product.product_name || 'Onbekende naam'}</p>
                <p style={{ fontSize: 12, color: '#a08070', margin: '3px 0 0' }}>
                  {[product.brands, product.quantity].filter(Boolean).join(' · ')}
                </p>
              </div>
              {product.nutriscore_grade && (
                <span style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: '#f5ede8', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: { a: '#4d7c43', b: '#7ea05a', c: '#c9a53f', d: '#c07c3a', e: '#b0503c' }[product.nutriscore_grade] || 'rgba(196,137,106,0.2)', textTransform: 'uppercase' }}>
                  {product.nutriscore_grade}
                </span>
              )}
            </div>

            {/* FemFlow-duiding: beschrijvend, met de echte cijfers */}
            <div style={{ ...KAART, padding: 18, marginBottom: 12 }}>
              <p style={{ fontSize: 12, letterSpacing: '0.14em', color: '#a08070', margin: '0 0 10px' }}>WAT WIJ ZIEN</p>
              {duiding.regels.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < duiding.regels.length - 1 ? 10 : 0 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: TOON_KLEUR[r.toon], flexShrink: 0, marginTop: 6 }} />
                  <p style={{ fontSize: 13, lineHeight: 1.55, color: '#f5ede8', margin: 0 }}>{r.tekst}</p>
                </div>
              ))}
            </div>

            {/* Voedingswaarden per 100 g */}
            <div style={{ ...KAART, padding: 18, marginBottom: 14 }}>
              <p style={{ fontSize: 12, letterSpacing: '0.14em', color: '#a08070', margin: '0 0 10px' }}>PER 100 G</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {tabel.map(({ label, waarde, eenheid }) => (
                  <div key={label}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#f5ede8', margin: 0, fontFamily: sans }}>
                      {waarde == null ? '—' : `${waarde}${eenheid === 'kcal' ? '' : ' ' + eenheid}`}
                      {waarde != null && eenheid === 'kcal' && <span style={{ fontSize: 11, color: '#a08070' }}> kcal</span>}
                    </p>
                    <p style={{ fontSize: 11, color: '#a08070', margin: '2px 0 0' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => { setProduct(null); setHandmatig(''); setModus('scan') }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: sans, fontSize: 14, fontWeight: 600, color: '#1a0d08', background: 'linear-gradient(135deg, #d4a96a, #c4896a)' }}>
              <RefreshCw size={14} /> Volgend product
            </button>
          </>
        )}
      </div>
    </div>
  )
}
