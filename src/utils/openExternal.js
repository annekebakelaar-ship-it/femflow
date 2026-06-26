import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'

// Open een externe URL. In de native app (Capacitor) via de systeembrowser
// (Android Custom Tab / iOS SFSafariViewController), zodat de gebruiker de
// in-app webview niet verlaat en niet "vast" komt te zitten op een website.
// Op web gewoon een nieuw tabblad. Gebruik dit voor ALLE links naar een ander
// domein (youcaps.app, wa.me, instagram, etc.).
export async function openExternal(url) {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url })
  } else {
    window.open(url, '_blank', 'noopener')
  }
}
