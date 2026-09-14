import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { bouwKennis } from './scripts/bouw-kennis.js'

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
export default defineConfig({
  plugins: [
    react(),
    // Statische kennisbank op /kennis plus sitemap.xml, alleen bij vite build
    (() => {
      let outDir = 'dist'
      return {
        name: 'ovari-kennisbank',
        apply: 'build',
        configResolved(config) { outDir = path.resolve(config.root, config.build.outDir) },
        closeBundle() {
          const r = bouwKennis(outDir)
          console.log(`kennisbank: ${r.artikelen} artikelen, sitemap met ${r.urls} adressen`)
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
