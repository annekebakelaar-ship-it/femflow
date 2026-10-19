import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { bouwKennis } from './scripts/bouw-kennis.js'
import { bouwJuridisch } from './scripts/bouw-juridisch.js'

/**
 * Vite-config
 * -----------
 * - `host: true` zorgt dat Vite ook luistert op 0.0.0.0, wat nodig is om
 *   via een VS Code Dev Tunnel of LAN-IP de frontend te bereiken.
 * - `allowedHosts: 'all'` voorkomt Vite's "Blocked request. This host is
 *   not allowed" error op dev-tunnel hosts.
 * - De `/api`-proxy werkt alleen voor desktops die op localhost de
 *   frontend openen. Op een telefoon via tunnel gebruik je
 *   VITE_API_BASE_URL (.env.local) voor de absolute backend-URL.
 */
// Bouwbewaking voor testomgevingen.
//
// Een testbouw moet naar een testbackend wijzen. Vergeet je VITE_API_URL,
// dan valt de app terug op productie en praat een testfrontend stilletjes
// tegen echte gebruikersgegevens. Met VITE_OMGEVING=test faalt de bouw dan
// meteen, met een duidelijke reden, in plaats van stil goed te gaan.
const PRODUCTIE_API = 'https://femflow-api.onrender.com'
if (process.env.VITE_OMGEVING === 'test') {
  const api = (process.env.VITE_API_URL || '').replace(/\/$/, '')
  if (!api) {
    throw new Error('VITE_OMGEVING=test maar VITE_API_URL ontbreekt: deze bouw zou tegen productie praten')
  }
  if (api === PRODUCTIE_API) {
    throw new Error('VITE_OMGEVING=test wijst naar de productie-API')
  }
  console.log(`testbouw: API-adres ${api}`)
}
export default defineConfig({
  plugins: [
    react(),
    // Statische kennisbank op /kennis, statische juridische pagina's en
    // sitemap.xml, alleen bij vite build
    (() => {
      let outDir = 'dist'
      return {
        name: 'ovari-kennisbank',
        apply: 'build',
        configResolved(config) { outDir = path.resolve(config.root, config.build.outDir) },
        async closeBundle() {
          const r = bouwKennis(outDir)
          console.log(`kennisbank: ${r.artikelen} artikelen, sitemap met ${r.urls} adressen`)
          const j = await bouwJuridisch(outDir)
          console.log(`juridisch: ${j.paginas} statische pagina's`)
        },
      }
    })(),
  ],
  server: {
    host: true,           // luister ook op 0.0.0.0 (LAN/tunnel)
    port: 5175,
    strictPort: false,
    open: true,
    allowedHosts: 'all',  // sta arbitrary hostnames toe (devtunnels)
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
})
