// Stuurt een GA4-gebeurtenis. window.gtag bestaat altijd (index.html), maar
// gtag.js laadt pas na toestemming via de cookiebanner; zonder toestemming
// wordt er dus niets verstuurd. Meten mag nooit een actie van de gebruiker
// breken, daarom alles in try/catch.
export function meet(naam, params = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', naam, params)
    }
  } catch {
    // bewust genegeerd
  }
}
