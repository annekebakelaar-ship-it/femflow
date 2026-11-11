import { describe, it, expect, vi } from 'vitest'
import { verstuurMail, RESEND_URL, STANDAARD_AFZENDER } from './mail.js'

const antwoord = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body })
const mail = { to: 'fictief@example.invalid', subject: 'Je inlogcode', html: '<p>123456</p>', text: '123456' }

describe('verstuurMail', () => {
  it('stuurt naar Resend met de sleutel als bearer en de standaardafzender', async () => {
    const fetchFn = vi.fn(async () => antwoord(200, { id: 'fictief-id' }))
    const uit = await verstuurMail(mail, { env: { RESEND_API_KEY: 're_fictief' }, fetchFn })

    expect(uit).toEqual({ id: 'fictief-id' })
    const [url, opties] = fetchFn.mock.calls[0]
    expect(url).toBe(RESEND_URL)
    expect(opties.headers.Authorization).toBe('Bearer re_fictief')
    expect(JSON.parse(opties.body)).toEqual({
      from: STANDAARD_AFZENDER,
      to: ['fictief@example.invalid'],
      subject: 'Je inlogcode',
      html: '<p>123456</p>',
      text: '123456',
    })
  })

  it('gebruikt MAIL_FROM als die gezet is', async () => {
    const fetchFn = vi.fn(async () => antwoord(200, {}))
    await verstuurMail(mail, { env: { RESEND_API_KEY: 're_fictief', MAIL_FROM: 'Ovari <login@youcaps.app>' }, fetchFn })
    expect(JSON.parse(fetchFn.mock.calls[0][1].body).from).toBe('Ovari <login@youcaps.app>')
  })

  it('gooit zonder sleutel, zonder iets te versturen', async () => {
    const fetchFn = vi.fn()
    await expect(verstuurMail(mail, { env: {}, fetchFn })).rejects.toThrow('RESEND_API_KEY ontbreekt')
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('gooit bij een weigering, met status maar zonder de sleutel', async () => {
    const fetchFn = vi.fn(async () => antwoord(403, { name: 'validation_error', message: 'domain not verified' }))
    const fout = await verstuurMail(mail, { env: { RESEND_API_KEY: 're_geheim' }, fetchFn }).catch((e) => e)
    expect(fout.message).toContain('403')
    expect(fout.message).toContain('domain not verified')
    expect(fout.message).not.toContain('re_geheim')
  })
})
