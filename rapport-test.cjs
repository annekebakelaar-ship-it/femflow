// E2E-verificatie Huisartsrapport: seedt demo-data, screenshot de exportknop,
// klikt op exporteren en vangt de gedownloade PDF op. Alleen voor lokale test.
const { chromium } = require('playwright')
const path = require('path')

// Zelfde obfuscatie als src/utils/secureStorage.js
function secureEncrypt(data) {
  const json = JSON.stringify(data)
  return Buffer.from(json + '::femflow_').toString('base64').split('').reverse().join('')
}

const menstruationData = {
  name: 'Demo',
  startDate: '2025-12-05',
  cycleLength: 29,
  bleedingDays: 5,
  entries: [
    { bleeding: true, date: '2026-01-03' }, // 29 dagen
    { bleeding: true, date: '2026-02-01' }, // 29 dagen
    { bleeding: true, date: '2026-03-10' }, // 37 dagen -> sprongmarker
    { bleeding: true, date: '2026-04-06' }, // 27 dagen
    { bleeding: true, date: '2026-06-08' }, // 63 dagen -> lange-cyclusmarker
  ],
}

const symptomLog = []
const sympts = [
  ['hot_flash', 'Opvlieger', 7],
  ['brain_fog', 'Brain fog', 4],
  ['mood_swing', 'Stemming', 2],
]
for (const [id, label, n] of sympts) {
  for (let i = 0; i < n; i++) {
    const d = new Date('2026-01-15')
    d.setDate(d.getDate() + i * 17)
    symptomLog.push({ symptom: id, label, date: d.toISOString() })
  }
}

// 180 dagen synthetische wearable-readings met licht dalende HRV
const readings = []
for (let i = 0; i < 180; i++) {
  const d = new Date('2025-12-13')
  d.setDate(d.getDate() + i)
  readings.push({
    reading_date: d.toISOString().split('T')[0],
    sleep_duration_min: Math.round(430 + 25 * Math.sin(i / 9) - i * 0.1),
    deep_sleep_min: Math.round(85 + 10 * Math.sin(i / 7)),
    hrv_ms: Math.round(52 - i * 0.04 + 4 * Math.sin(i / 5)),
    resting_heart_rate: Math.round(57 + 2 * Math.sin(i / 11)),
    recovery_index: Math.round(70 + 12 * Math.sin(i / 13)),
  })
}

;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 480, height: 900 } })
  const page = await ctx.newPage()

  await page.route('**/api/v1/wearable/readings**', route =>
    route.fulfill({ json: { data: readings, count: readings.length } })
  )

  await page.goto('http://localhost:5176/account')
  await page.evaluate(([m, s]) => {
    localStorage.setItem('secure_menstruation_data', m)
    localStorage.setItem('secure_symptom_log', s)
  }, [secureEncrypt(menstruationData), secureEncrypt(symptomLog)])
  await page.reload()
  await page.waitForSelector('text=Huisartsrapport')

  // Screenshot 1: de kaart met exportknop
  const kaart = page.locator('div', { has: page.locator('h3', { hasText: 'Huisartsrapport' }) }).last()
  await kaart.screenshot({ path: 'rapport-knop.png' })

  // Screenshot 2: hele account-pagina rond de kaart
  await page.locator('text=Exporteer huisartsrapport').scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'rapport-accountpagina.png' })

  // Klik en vang de download
  const downloadPromise = page.waitForEvent('download', { timeout: 30000 })
  await page.click('text=Exporteer huisartsrapport')
  const download = await downloadPromise
  const pdfPath = path.resolve('huisartsrapport-demo.pdf')
  await download.saveAs(pdfPath)
  console.log('PDF opgeslagen:', pdfPath, 'als', download.suggestedFilename())

  // Lege-data-state: zelfde pagina zonder cyclusdata
  await page.evaluate(() => localStorage.removeItem('secure_menstruation_data'))
  await page.reload()
  await page.waitForSelector('text=Huisartsrapport')
  const legeKaart = page.locator('div', { has: page.locator('h3', { hasText: 'Huisartsrapport' }) }).last()
  await legeKaart.screenshot({ path: 'rapport-lege-state.png' })

  await browser.close()
  console.log('KLAAR')
})().catch(err => { console.error(err); process.exit(1) })
