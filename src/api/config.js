/**
 * frontend/src/api/config.js
 * --------------------------
 * Centrale plek voor de API-base URL.
 *
 * Waarom:
 *   - Op desktop draait de frontend op http://localhost:5174 en gebruikt
 *     Vite's proxy (vite.config.js) om /api/... door te sturen naar
 *     http://localhost:8000.
 *   - Op een telefoon via devtunnel/ngrok werkt die proxy NIET (de tunnel
 *     stuurt direct naar de Vite-server, niet naar FastAPI). Daardoor krijg
 *     je een HTTP 404 op /api/scan/upload — Vite kent dat pad niet.
 *   - Oplossing: zet een absolute URL in .env.local (VITE_API_BASE_URL) die
 *     wijst naar de PUBLIEKE devtunnel-URL van poort 8000.
 *
 * Gebruik:
 *   import { apiUrl } from '@/api/config'
 *   const url = apiUrl('/api/scan/upload')  // → absoluut of relatief
 */

const RAW_BASE = (import.meta.env?.VITE_API_BASE_URL || '').trim()

/**
 * Genormaliseerde basis-URL zonder trailing slash.
 * Lege string betekent: gebruik relatieve paden (Vite-proxy / same-origin).
 */
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, '')

/**
 * Bouw een volledige URL voor een API-pad.
 * @param {string} path Bijv. "/api/scan/upload"
 * @returns {string} Absoluut (bij devtunnel) of relatief pad.
 */
export function apiUrl(path) {
  if (!path.startsWith('/')) path = `/${path}`
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path
}
