// Vervangt @capacitor/core en @capacitor/browser tijdens het bouwen van de
// statische juridische pagina's. Die pakketten verwachten een browser en zijn
// bij het renderen naar HTML niet nodig: openExternal wordt alleen aangeroepen
// als iemand op een link klikt, nooit tijdens het renderen zelf.
export const Capacitor = { isNativePlatform: () => false, getPlatform: () => 'web' }
export const Browser = { open: async () => {} }
