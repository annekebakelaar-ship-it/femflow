const { chromium } = require('playwright')

function secureEncrypt(data) {
  const json = JSON.stringify(data)
  return Buffer.from(json + '::femflow_').toString('base64').split('').reverse().join('')
}
const menstruationData = {
  startDate: '2025-12-05', cycleLength: 29, bleedingDays: 5,
  entries: [
    { bleeding: true, date: '2026-01-03' },
    { bleeding: true, date: '2026-02-01' },
    { bleeding: true, date: '2026-03-10' },
    { bleeding: true, date: '2026-04-06' },
    { bleeding: true, date: '2026-06-08' },
  ],
}
;(async () => {
  const browser = await chromium.launch()
  const page = await (await browser.newContext({ viewport: { width: 480, height: 950 }, deviceScaleFactor: 2 })).newPage()
  await page.goto('http://localhost:5176/account')
  await page.evaluate(m => { localStorage.setItem('secure_menstruation_data', m); localStorage.setItem('femflow_analytics_consent', 'denied') }, secureEncrypt(menstruationData))
  await page.reload()
  await page.waitForSelector('text=Exporteer huisartsrapport')

  // De kaart = tweede ancestor-div van de h3
  const kaart = page.locator("xpath=//h3[text()='Huisartsrapport']/ancestor::div[2]")
  await kaart.scrollIntoViewIfNeeded()
  await kaart.screenshot({ path: 'rapport-knop.png' })

  // Lege state
  await page.evaluate(() => localStorage.removeItem('secure_menstruation_data'))
  await page.reload()
  await page.waitForSelector('text=Huisartsrapport')
  const legeKaart = page.locator("xpath=//h3[text()='Huisartsrapport']/ancestor::div[2]")
  await legeKaart.scrollIntoViewIfNeeded()
  await legeKaart.screenshot({ path: 'rapport-lege-state.png' })

  await browser.close()
  console.log('SHOTS KLAAR')
})().catch(e => { console.error(e); process.exit(1) })
