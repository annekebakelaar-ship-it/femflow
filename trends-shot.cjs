const { chromium } = require('playwright')

const readings = []
for (let i = 0; i < 90; i++) {
  const d = new Date('2026-03-12')
  d.setDate(d.getDate() + i)
  readings.push({
    reading_date: d.toISOString().split('T')[0],
    sleep_duration_min: Math.round(435 + 20 * Math.sin(i / 8) - i * 0.3),
    deep_sleep_min: 85,
    hrv_ms: Math.round(50 - i * 0.06 + 3 * Math.sin(i / 5)),
    resting_heart_rate: Math.round(57 + Math.sin(i / 11)),
    recovery_index: 72,
  })
}

;(async () => {
  const browser = await chromium.launch()
  const page = await (await browser.newContext({ viewport: { width: 480, height: 950 }, deviceScaleFactor: 2 })).newPage()
  await page.route('**/api/v1/users/me', r => r.fulfill({ json: { id: 'demo', email: 'demo@test.nl' } }))
  await page.route('**/api/v1/wearable/readings**', r => r.fulfill({ json: { data: readings, count: readings.length } }))
  await page.goto('http://localhost:5175/')
  await page.evaluate(() => {
    localStorage.setItem('femflow_jwt', 'demo-token')
    localStorage.setItem('femflow_analytics_consent', 'denied')
  })
  await page.goto('http://localhost:5175/dashboard/tracker')
  await page.waitForSelector('text=Trends', { timeout: 20000 })
  const sectie = page.locator("xpath=//h3[text()='Trends']/ancestor::div[1]")
  await sectie.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await sectie.screenshot({ path: 'trends-sectie.png' })
  await browser.close()
  console.log('TRENDS SHOT KLAAR')
})().catch(e => { console.error(String(e).slice(0, 300)); process.exit(1) })
