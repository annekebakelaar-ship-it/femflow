# Bouwnotitie

Kort: hoe je de web-build en de Android-bundel maakt, en welke inputs
bewust niet in Git staan.

## Versies

| Onderdeel | Versie | Waar vastgelegd |
|---|---|---|
| Node | 24 (gebouwd met 24.16.0, npm 11.13.0) | `.node-version` |
| Node voor de MCP-dienst | 24 | `ovari-mcp/.node-version` |
| Gradle | 8.14.3 | `android/gradle/wrapper/gradle-wrapper.properties` |
| Android Gradle Plugin | 8.13.0 | `android/build.gradle` |
| compileSdk / targetSdk / minSdk | 36 / 36 / 24 | `android/variables.gradle` |
| JDK | 21 (Android Studio jbr) | niet in de repo, zie hieronder |

## Web

```bash
npm ci
npm run lint
npm test
npm run build
```

`npm run build` draait twee generatoren mee via `vite.config.js`: de
kennisbank (`scripts/bouw-kennis.js`, levert `dist/kennis.html`,
`dist/kennis/<id>.html` en `dist/sitemap.xml`) en de juridische pagina's
(`scripts/bouw-juridisch.js`, levert `dist/privacy.html`, `terms.html`,
`support.html`). Controleer na een build dat die bestanden er zijn: de
privacy-URL uit de Play-listing wijst erheen.

## Android-bundel

```bash
npm run build
npx cap sync android
cd android
JAVA_HOME="C:/Program Files/Android/Android Studio/jbr" ./gradlew bundleRelease
```

Zonder `JAVA_HOME` vindt `gradlew` geen Java en stopt hij meteen.

Volgorde is dwingend: eerst `npm run build`, dan `cap sync`. Andersom kopieer
je de vorige web-assets de app in.

Resultaat: `android/app/build/outputs/bundle/release/app-release.aab`.

### Controleren voor je uploadt

```bash
JH="C:/Program Files/Android/Android Studio/jbr"
"$JH/bin/jarsigner" -verify app/build/outputs/bundle/release/app-release.aab   # "jar verified."
grep -o 'versionCode="[0-9]*"\|versionName="[^"]*"' \
  app/build/intermediates/bundle_manifest/release/*/AndroidManifest.xml
```

`versionCode` moet hoger zijn dan de vorige upload. De waarde staat in
`android/app/build.gradle`.

## Wat bewust niet in Git staat

| Input | Waar het wel staat |
|---|---|
| `android/key.properties` | lokaal, genegeerd via `android/.gitignore` |
| Upload-keystore | `C:\Users\danib\femflow-keys\femflow-upload.keystore` |
| `dist/` | gegenereerd |
| `android/app/src/main/assets/public/` | gegenereerd door `cap sync`, genegeerd |
| `android/app/build/` | gegenereerd |
| JDK-pad | machinegebonden, zie het commando hierboven |

Een bundel kan daardoor niet uit de repository alleen worden herbouwd zonder
de keystore. Bovendien is een AAB nooit bit-identiek te reproduceren:
zip-tijdstempels, het ART-profiel en het handtekeningblok verschillen per
build. Reken op een functioneel gelijkwaardige herbouw, niet op dezelfde
checksum. Noteer bij een release dus de `versionCode` en de SHA-256 van de
bundel die je werkelijk hebt geüpload.
