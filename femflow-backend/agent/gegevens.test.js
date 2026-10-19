import { describe, it, expect } from 'vitest'
import { vatCyclusSamen, vatHerstelSamen, vatProfielSamen, REDENEN } from './gegevens.js'

// Alle gegevens hieronder zijn verzonnen: een niet-bestaande testgebruiker
// met ronde getallen, zodat elke verwachting met de hand na te rekenen is.
const NU = new Date('2026-10-19T09:00:00.000Z')

describe('vatCyclusSamen', () => {
  it('rekent cyclusdag en verwachte volgende start uit de opgegeven lengte', () => {
    const uit = vatCyclusSamen({ rij: { start_date: '2026-10-05', cycle_length: 28, bleeding_days: 5, updated_at: '2026-10-05' }, nu: NU })
    expect(uit.beschikbaar).toBe(true)
    expect(uit.dagen_sinds_laatste_start).toBe(14)
    expect(uit.cyclusdag).toBe(15)
    expect(uit.verwachte_volgende_start).toBe('2026-11-02')
  })

  it('weigert te rekenen als er niets is ingevuld', () => {
    expect(vatCyclusSamen({ rij: null, nu: NU })).toEqual({ beschikbaar: false, reden: REDENEN.GEEN_CYCLUSGEGEVENS })
  })

  it('noemt gegevens verouderd na meer dan twee cycluslengtes zonder invoer', () => {
    const uit = vatCyclusSamen({ rij: { start_date: '2026-07-01', cycle_length: 28 }, nu: NU })
    expect(uit.beschikbaar).toBe(false)
    expect(uit.reden).toBe(REDENEN.VEROUDERD)
    expect(uit.cyclusdag).toBeNull()
    expect(uit.verwachte_volgende_start).toBeNull()
  })

  it('zegt expliciet waarop de uitkomst gebaseerd is', () => {
    const uit = vatCyclusSamen({ rij: { start_date: '2026-10-05', cycle_length: 28 }, nu: NU })
    expect(uit.basis).toMatch(/geen gemeten reeks/)
  })
})

describe('vatHerstelSamen', () => {
  const verbonden = [{ wearable_type: 'oura', last_sync_at: '2026-10-19' }]
  // Nacht n dagen geleden, met vaste waarden zodat gemiddelden exact uitkomen.
  const nacht = (dagenGeleden, extra = {}) => ({
    reading_date: new Date(NU.getTime() - dagenGeleden * 86400000).toISOString().slice(0, 10),
    sleep_duration_min: 420,
    deep_sleep_min: 70,
    hrv_ms: 40,
    resting_heart_rate: 60,
    recovery_index: 75,
    ...extra,
  })

  it('zegt dat er geen wearable is in plaats van lege getallen te geven', () => {
    expect(vatHerstelSamen({ metingen: [], verbindingen: [], nu: NU }).reden).toBe(REDENEN.GEEN_WEARABLE)
  })

  it('onderscheidt gekoppeld-maar-niets-gemeten van niet-gekoppeld', () => {
    expect(vatHerstelSamen({ metingen: [], verbindingen: verbonden, nu: NU }).reden).toBe(REDENEN.GEEN_METINGEN)
  })

  it('weigert conclusies bij te weinig gedragen nachten', () => {
    const uit = vatHerstelSamen({ metingen: [nacht(1), nacht(2), nacht(3)], verbindingen: verbonden, nu: NU })
    expect(uit.reden).toBe(REDENEN.TE_WEINIG_METINGEN)
    expect(uit.nachten_gemeten).toBe(3)
  })

  it('noemt oude metingen verouderd in plaats van ze als nu te presenteren', () => {
    const oud = [12, 13, 14, 15, 16].map((d) => nacht(d))
    expect(vatHerstelSamen({ metingen: oud, verbindingen: verbonden, nu: NU }).reden).toBe(REDENEN.VEROUDERD)
  })

  it('vergelijkt de laatste zeven nachten met de drie weken daarvoor', () => {
    const recent = [0, 1, 2, 3].map((d) => nacht(d, { hrv_ms: 50, resting_heart_rate: 58 }))
    const ervoor = [10, 14, 20, 25].map((d) => nacht(d, { hrv_ms: 40, resting_heart_rate: 60 }))
    const uit = vatHerstelSamen({ metingen: [...recent, ...ervoor], verbindingen: verbonden, nu: NU })
    expect(uit.beschikbaar).toBe(true)
    expect(uit.nachten_gemeten).toBe(8)
    expect(uit.laatste_zeven_dagen.hrv_ms).toBe(50)
    expect(uit.drie_weken_daarvoor.hrv_ms).toBe(40)
    expect(uit.richting.hrv_ms).toBe('hoger')
    expect(uit.richting.rust_hartslag).toBe('gelijk') // 58 tegen 60 is minder dan 5 procent
  })

  it('telt nachten zonder enige meetwaarde niet mee', () => {
    const leeg = { sleep_duration_min: null, deep_sleep_min: null, hrv_ms: null, resting_heart_rate: null, recovery_index: null }
    const uit = vatHerstelSamen({
      metingen: [nacht(1), nacht(2), { ...nacht(3), ...leeg }],
      verbindingen: verbonden,
      nu: NU,
    })
    expect(uit.nachten_gemeten).toBe(2)
  })
})

describe('vatProfielSamen', () => {
  const gebruiker = { birth_date: '1979-06-01', created_at: '2026-04-01', email: 'test@example.com', name: 'Testpersoon' }

  it('rekent leeftijd uit de geboortedatum', () => {
    expect(vatProfielSamen({ gebruiker, nu: NU }).leeftijd).toBe(47)
  })

  it('geeft nooit naam of e-mailadres terug', () => {
    const uit = JSON.stringify(vatProfielSamen({ gebruiker, nu: NU }))
    expect(uit).not.toMatch(/test@example.com/)
    expect(uit).not.toMatch(/Testpersoon/)
  })

  it('markeert check-ins als niet beschikbaar, want die staan op het toestel', () => {
    expect(vatProfielSamen({ gebruiker, nu: NU }).check_ins_beschikbaar).toBe(false)
  })

  it('vat samen wat er gekoppeld en ingevuld is', () => {
    const uit = vatProfielSamen({
      gebruiker,
      quiz: { constellation: { fase: 'vroege perimenopauze' }, created_at: '2026-05-02' },
      verbindingen: [{ wearable_type: 'fitbit', last_sync_at: '2026-10-18' }],
      cyclusRij: { start_date: '2026-10-05' },
      nu: NU,
    })
    expect(uit.quiz_gedaan).toBe(true)
    expect(uit.gekoppelde_wearables).toEqual([{ provider: 'fitbit', laatste_synchronisatie: '2026-10-18' }])
    expect(uit.gegevens).toEqual({ cyclus_ingevuld: true, wearable_gekoppeld: true })
  })
})

describe('regressies uit de Neon-test', () => {
  // BUG 1: node-postgres geeft een DATE terug als JS-Date op LOKALE
  // middernacht. Rekenen op UTC-dagniveau gaf dan cyclusdag 16 in plaats van
  // 15 voor iedereen ten oosten van Greenwich.
  it('rekent een DATE uit de database als kalenderdag, niet als tijdstip', () => {
    const startAlsDatabaseDate = new Date(2026, 9, 5) // 5 oktober, lokale middernacht
    const nu = new Date(2026, 9, 19, 9, 0, 0)
    const uit = vatCyclusSamen({ rij: { start_date: startAlsDatabaseDate, cycle_length: 28 }, nu })
    expect(uit.dagen_sinds_laatste_start).toBe(14)
    expect(uit.cyclusdag).toBe(15)
    expect(uit.laatste_start).toBe('2026-10-05')
  })

  it('geeft hetzelfde antwoord of de datum nu een string of een Date is', () => {
    const nu = new Date(2026, 9, 19, 9, 0, 0)
    const alsString = vatCyclusSamen({ rij: { start_date: '2026-10-05', cycle_length: 28 }, nu })
    const alsDate = vatCyclusSamen({ rij: { start_date: new Date(2026, 9, 5), cycle_length: 28 }, nu })
    expect(alsDate.cyclusdag).toBe(alsString.cyclusdag)
    expect(alsDate.verwachte_volgende_start).toBe(alsString.verwachte_volgende_start)
  })

  it('telt nachten op kalenderdag, ook als de database Date-objecten teruggeeft', () => {
    const nu = new Date(2026, 9, 19, 9, 0, 0)
    const nacht = (dagenGeleden) => ({
      reading_date: new Date(2026, 9, 19 - dagenGeleden),
      sleep_duration_min: 420, deep_sleep_min: 70, hrv_ms: 45, resting_heart_rate: 60, recovery_index: 75,
    })
    const uit = vatHerstelSamen({
      metingen: [0, 1, 2, 3, 4, 5, 6].map(nacht),
      verbindingen: [{ wearable_type: 'oura' }],
      nu,
    })
    expect(uit.beschikbaar).toBe(true)
    expect(uit.nachten_gemeten).toBe(7)
    expect(uit.dagen_sinds_laatste_meting).toBe(0)
  })

  it('rekent leeftijd uit een geboortedatum die als Date binnenkomt', () => {
    const uit = vatProfielSamen({ gebruiker: { birth_date: new Date(1979, 5, 1) }, nu: new Date(2026, 9, 19) })
    expect(uit.leeftijd).toBe(47)
  })
})
