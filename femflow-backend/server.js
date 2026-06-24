import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import { Pool } from 'pg'
import { randomInt, createHash } from 'crypto'
import jwtPkg from 'jsonwebtoken'
import sgMail from '@sendgrid/mail'
import axios from 'axios'
import { OAuth2Client } from 'google-auth-library'
import { v4 as uuidv4 } from 'uuid'
import { generateSleepRange } from './utils/synthDataGenerator.js'

const { sign, verify } = jwtPkg

dotenv.config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set — refusing to start')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 5000

// Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Render zit achter een proxy; nodig zodat rate limiting het echte client-IP ziet
app.set('trust proxy', 1)

// Middleware
const allowedOrigins = [
  ...new Set([
    process.env.FRONTEND_URL,
    'https://femflow.youcaps.app',
    'https://femflow-two.vercel.app',
    'http://localhost:5175',
    'http://localhost:5173',
  ].filter(Boolean)),
]
app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

// Email setup

// Rate limiters voor publieke endpoints
// - OTP aanvragen: max 5 per kwartier per IP (voorkomt e-mail-bombing via SendGrid)
// - OTP verifiëren: max 5 pogingen per e-mailadres per 10 min (code is 6 cijfers,
//   10 min geldig — zonder limiet is brute force haalbaar)
// - Overige publieke writes: ruime spamrem per IP
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many code requests — try again in 15 minutes' },
})

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.body?.email ? String(req.body.email).toLowerCase() : ipKeyGenerator(req.ip),
  message: { error: 'Too many attempts — request a new code' },
})

const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — try again later' },
})

// Verify DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err)
  } else {
    console.log('Database connected')
  }
})

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

function hashOtp(code) {
  return createHash('sha256').update(code).digest('hex')
}

// Leest het JWT uit de Authorization header als dat er is; null bij afwezig/ongeldig.
// Voor endpoints die zowel anoniem als ingelogd werken (quiz/save, feedback).
function getOptionalUserId(req) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return null
  try {
    return verify(token, JWT_SECRET).userId
  } catch {
    return null
  }
}

// Haalt bestaande user op of maakt er een aan; geeft userId terug
async function findOrCreateUser(email, name = null) {
  const existing = await pool.query('SELECT id FROM femflow_users WHERE email = $1', [email])
  if (existing.rows.length > 0) return existing.rows[0].id
  const created = await pool.query(
    'INSERT INTO femflow_users (id, email, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
    [uuidv4(), email, name]
  )
  return created.rows[0].id
}

// Request OTP code
app.post('/api/v1/auth/request-code', otpRequestLimiter, async (req, res) => {
  try {
    const { email } = req.body

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' })
    }

    // Generate 6-digit code
    const code = String(randomInt(100000, 999999))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    // Opportunistic cleanup van verlopen codes
    await pool.query('DELETE FROM femflow_otp_codes WHERE expires_at < NOW()')

    // Store hashed code in DB (plaintext codes horen niet in de database)
    const codeHash = hashOtp(code)
    await pool.query(
      'INSERT INTO femflow_otp_codes (email, code, expires_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET code=$2, expires_at=$3',
      [email, codeHash, expiresAt]
    )

    // Send email via SendGrid
    await sgMail.send({
      to: email,
      from: { email: process.env.SENDGRID_FROM_EMAIL || 'noreply@femflow.youcaps.app', name: 'FemFlow' },
      subject: 'Je FemFlow inlogcode',
      // Plain-text alternatief naast HTML = multipart, lagere spam-score.
      text: `Je FemFlow inlogcode is ${code}\n\nDe code is 10 minuten geldig.\n\nHeb je dit niet aangevraagd? Dan kun je deze e-mail negeren.`,
      html: `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#2A211C">
        <p style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#A89E95;margin:0 0 8px">FemFlow</p>
        <h2 style="font-size:18px;font-weight:600;margin:0 0 14px">Je inlogcode</h2>
        <p style="font-size:34px;font-weight:700;letter-spacing:6px;margin:8px 0;color:#2A211C">${code}</p>
        <p style="font-size:14px;color:#6E635B;margin:10px 0 0">De code is 10 minuten geldig.</p>
        <p style="font-size:12px;color:#A89E95;margin:18px 0 0;line-height:1.5">Heb je dit niet aangevraagd? Dan kun je deze e-mail negeren.</p>
      </div>`,
    })

    res.json({ success: true, message: 'Code sent to email' })
  } catch (err) {
    console.error('Request code error:', err)
    res.status(500).json({ error: 'Failed to send code' })
  }
})

// Verify OTP code
app.post('/api/v1/auth/verify-code', otpVerifyLimiter, async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code required' })
    }

    // Check code (vergelijk op hash)
    const result = await pool.query(
      'SELECT * FROM femflow_otp_codes WHERE email = $1 AND code = $2 AND expires_at > NOW()',
      [email, hashOtp(String(code))]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired code' })
    }

    // Delete used code
    await pool.query('DELETE FROM femflow_otp_codes WHERE email = $1', [email])

    // Create or get user
    const userId = await findOrCreateUser(email)

    // Generate JWT
    const token = sign({ userId, email }, JWT_SECRET, {
      expiresIn: '30d',
    })

    res.json({ success: true, token, userId })
  } catch (err) {
    console.error('Verify code error:', err)
    res.status(500).json({ error: 'Verification failed' })
  }
})

// Google sign-in: valideer het ID-token tegen Google's publieke keys
const googleOAuthClient = new OAuth2Client()

app.post('/api/v1/auth/google-signin', publicWriteLimiter, async (req, res) => {
  try {
    const { token } = req.body
    if (!token) {
      return res.status(400).json({ error: 'Google token required' })
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ error: 'Google sign-in not configured' })
    }

    let payload
    try {
      const ticket = await googleOAuthClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      payload = ticket.getPayload()
    } catch {
      return res.status(401).json({ error: 'Invalid Google token' })
    }

    if (!payload.email || !payload.email_verified) {
      return res.status(401).json({ error: 'Google account email not verified' })
    }

    const userId = await findOrCreateUser(payload.email, payload.name || null)
    const jwtToken = sign({ userId, email: payload.email }, JWT_SECRET, { expiresIn: '30d' })

    res.json({
      success: true,
      access_token: jwtToken,
      userId,
      user: { id: userId, email: payload.email },
    })
  } catch (err) {
    console.error('Google sign-in error:', err)
    res.status(500).json({ error: 'Google sign-in failed' })
  }
})

// Save welcome signup (interest list)
app.post('/api/v1/welcome/signup', publicWriteLimiter, async (req, res) => {
  try {
    const { email } = req.body

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' })
    }

    // Save to interest list
    await pool.query(
      'INSERT INTO femflow_welcome_signups (email, subscribed) VALUES ($1, true) ON CONFLICT (email) DO UPDATE SET subscribed = true, unsubscribed_at = NULL',
      [email]
    )

    // Send welcome email
    const unsubscribeLink = `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`
    await sgMail.send({
      to: email,
      from: { email: process.env.SENDGRID_FROM_EMAIL || 'noreply@femflow.youcaps.app', name: 'FemFlow' },
      subject: 'Welkom bij FemFlow 🌿',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333; line-height: 1.6;">
          <h2 style="font-size: 24px; margin-bottom: 20px; color: #1a1a1a;">Fijn dat je je hebt aangemeld voor FemFlow.</h2>

          <p>We bouwen aan een app die je cyclus en wearable-data omzet in inzicht — zonder labels, zonder oordeel. Gewoon jouw patronen, helder in beeld.</p>

          <p>Je hoort van ons zodra we live gaan. Tot die tijd: geen spam, beloofd.</p>

          <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            Liefs,<br>
            Het Youcaps-team
          </p>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 13px;">
            Liever geen mails meer? Je kunt je <a href="${unsubscribeLink}" style="color: #999; text-decoration: underline;">hier op elk moment uitschrijven</a>.
          </p>
        </div>
      `,
    })

    res.json({ success: true, message: 'Email saved and welcome email sent' })
  } catch (err) {
    console.error('Welcome signup error:', err)
    res.status(500).json({ error: 'Failed to save email' })
  }
})

// Unsubscribe from interest list
app.post('/api/v1/welcome/unsubscribe', publicWriteLimiter, async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email required' })
    }

    await pool.query(
      'UPDATE femflow_welcome_signups SET subscribed = false, unsubscribed_at = NOW() WHERE email = $1',
      [email]
    )

    res.json({ success: true, message: 'Unsubscribed' })
  } catch (err) {
    console.error('Unsubscribe error:', err)
    res.status(500).json({ error: 'Failed to unsubscribe' })
  }
})

// Nieuwsbriefvoorkeur van de ingelogde gebruiker (accountinstellingen).
// Bewust geen publieke status-lookup op e-mailadres: dat zou het bestaan
// van inschrijvingen lekken. Identiteit komt uit het JWT.
app.get('/api/v1/users/me/newsletter', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.subscribed FROM femflow_welcome_signups s
       JOIN femflow_users u ON u.email = s.email
       WHERE u.id = $1`,
      [req.userId]
    )
    res.json({ subscribed: result.rows.length > 0 && result.rows[0].subscribed === true })
  } catch (err) {
    console.error('Newsletter status error:', err)
    res.status(500).json({ error: 'Failed to fetch newsletter status' })
  }
})

app.put('/api/v1/users/me/newsletter', authenticateToken, async (req, res) => {
  try {
    const { subscribed } = req.body
    if (typeof subscribed !== 'boolean') {
      return res.status(400).json({ error: 'subscribed (boolean) required' })
    }

    const userResult = await pool.query('SELECT email FROM femflow_users WHERE id = $1', [req.userId])
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    const email = userResult.rows[0].email

    if (subscribed) {
      await pool.query(
        `INSERT INTO femflow_welcome_signups (email, subscribed) VALUES ($1, true)
         ON CONFLICT (email) DO UPDATE SET subscribed = true, unsubscribed_at = NULL`,
        [email]
      )
    } else {
      await pool.query(
        'UPDATE femflow_welcome_signups SET subscribed = false, unsubscribed_at = NOW() WHERE email = $1',
        [email]
      )
    }

    res.json({ success: true, subscribed })
  } catch (err) {
    console.error('Newsletter toggle error:', err)
    res.status(500).json({ error: 'Failed to update newsletter preference' })
  }
})

// ============================================================================
// FEEDBACK
// ============================================================================

// Feedback uit de FeedbackWidget; werkt anoniem en ingelogd
app.post('/api/v1/feedback', publicWriteLimiter, async (req, res) => {
  try {
    const { feedback, email, url } = req.body

    if (!feedback || feedback.trim().length < 10) {
      return res.status(400).json({ error: 'Feedback of at least 10 characters required' })
    }

    const userId = getOptionalUserId(req)
    await pool.query(
      'INSERT INTO femflow_feedback (user_id, email, message, page_url) VALUES ($1, $2, $3, $4)',
      [userId, email || null, feedback.trim().slice(0, 500), (url || '').slice(0, 500) || null]
    )

    res.json({ success: true })
  } catch (err) {
    console.error('Feedback error:', err)
    res.status(500).json({ error: 'Failed to save feedback' })
  }
})

// ============================================================================
// AUTH MIDDLEWARE
// ============================================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch {
    res.status(403).json({ error: 'Invalid token' })
  }
}

// ============================================================================
// USER ENDPOINTS
// ============================================================================

// Get user profile
app.get('/api/v1/users/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, birth_date, created_at FROM femflow_users WHERE id = $1', [
      req.userId,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('Get user error:', err)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Update user profile
app.put('/api/v1/users/me', authenticateToken, async (req, res) => {
  try {
    const { name, birth_date } = req.body

    const result = await pool.query(
      'UPDATE femflow_users SET name = $1, birth_date = $2 WHERE id = $3 RETURNING id, email, name, birth_date',
      [name, birth_date, req.userId]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error('Update user error:', err)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// ============================================================================
// MENSTRUATION DATA ENDPOINTS
// ============================================================================

// Get menstruation data
app.get('/api/v1/menstruation', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, user_id, start_date, cycle_length, bleeding_days, created_at, updated_at FROM femflow_menstruation_data WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.userId]
    )

    if (result.rows.length === 0) {
      return res.json({ data: null })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('Get menstruation error:', err)
    res.status(500).json({ error: 'Failed to fetch data' })
  }
})

// Create/update menstruation data
app.post('/api/v1/menstruation', authenticateToken, async (req, res) => {
  try {
    const { start_date, cycle_length, bleeding_days } = req.body

    // Check if exists
    const existing = await pool.query('SELECT id FROM femflow_menstruation_data WHERE user_id = $1', [req.userId])

    let result
    if (existing.rows.length === 0) {
      result = await pool.query(
        'INSERT INTO femflow_menstruation_data (id, user_id, start_date, cycle_length, bleeding_days, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
        [uuidv4(), req.userId, start_date, cycle_length, bleeding_days]
      )
    } else {
      result = await pool.query(
        'UPDATE femflow_menstruation_data SET start_date = $1, cycle_length = $2, bleeding_days = $3, updated_at = NOW() WHERE user_id = $4 RETURNING *',
        [start_date, cycle_length, bleeding_days, req.userId]
      )
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('Save menstruation error:', err)
    res.status(500).json({ error: 'Failed to save data' })
  }
})

// Delete user & data (GDPR)
app.delete('/api/v1/users/me', authenticateToken, async (req, res) => {
  // Transactie vereist één dedicated client: pool.query('BEGIN') geeft geen
  // garantie dat vervolgqueries op dezelfde connectie landen
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // Alle tabellen met persoonsgegevens, ook die zonder ON DELETE CASCADE
    // of die op e-mail in plaats van user_id sleutelen
    await client.query('DELETE FROM femflow_menstruation_data WHERE user_id = $1', [req.userId])
    await client.query('DELETE FROM femflow_biometric_readings WHERE user_id = $1', [req.userId])
    await client.query('DELETE FROM femflow_wearable_connections WHERE user_id = $1', [req.userId])
    await client.query('DELETE FROM femflow_quiz_results WHERE user_id = $1 OR email = (SELECT email FROM femflow_users WHERE id = $1)', [req.userId])
    await client.query('DELETE FROM femflow_welcome_signups WHERE email = (SELECT email FROM femflow_users WHERE id = $1)', [req.userId])
    await client.query('DELETE FROM femflow_otp_codes WHERE email = (SELECT email FROM femflow_users WHERE id = $1)', [req.userId])
    await client.query('DELETE FROM femflow_users WHERE id = $1', [req.userId])
    await client.query('COMMIT')

    res.json({ success: true, message: 'Account deleted' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Delete user error:', err)
    res.status(500).json({ error: 'Failed to delete account' })
  } finally {
    client.release()
  }
})

// ============================================================================
// QUIZ RESULTS ENDPOINTS
// ============================================================================

// Save quiz results (pre-login or post-login)
// Optionele auth: zonder middleware was req.userId hier altijd null, waardoor
// resultaten nooit aan een account gekoppeld werden
app.post('/api/v1/quiz/save', publicWriteLimiter, async (req, res) => {
  try {
    const { email, constellation } = req.body
    const userId = getOptionalUserId(req)

    if (!email || !constellation) {
      return res.status(400).json({ error: 'Email and constellation required' })
    }

    const result = await pool.query(
      'INSERT INTO femflow_quiz_results (user_id, email, constellation, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
      [userId, email, JSON.stringify(constellation)]
    )

    res.json({ success: true, id: result.rows[0].id })
  } catch (err) {
    console.error('Save quiz error:', err)
    res.status(500).json({ error: 'Failed to save quiz results' })
  }
})

// Get quiz results (after login)
app.get('/api/v1/quiz/results', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, constellation, created_at FROM femflow_quiz_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.userId]
    )

    if (result.rows.length === 0) {
      return res.json({ data: null })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('Get quiz results error:', err)
    res.status(500).json({ error: 'Failed to fetch quiz results' })
  }
})

// ============================================================================
// WEARABLE (OURA) ENDPOINTS
// ============================================================================

// Request Oura OAuth URL
app.post('/api/v1/wearable/request-connect', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId

    // Oura OAuth URL
    const ouraAuthUrl = new URL('https://cloud.ouraring.com/oauth/authorize')
    ouraAuthUrl.searchParams.append('client_id', process.env.OURA_CLIENT_ID)
    ouraAuthUrl.searchParams.append('redirect_uri', process.env.OURA_REDIRECT_URI)
    ouraAuthUrl.searchParams.append('response_type', 'code')
    ouraAuthUrl.searchParams.append('scope', 'personal daily')
    // Signed state: voorkomt dat iemand de callback met een willekeurig userId aanroept
    const state = sign({ userId, purpose: 'oura_oauth' }, JWT_SECRET, { expiresIn: '10m' })
    ouraAuthUrl.searchParams.append('state', state)

    res.json({ auth_url: ouraAuthUrl.toString() })
  } catch (err) {
    console.error('Oura auth URL error:', err)
    res.status(500).json({ error: 'Failed to generate Oura auth URL' })
  }
})

// Oura OAuth callback
app.get('/api/v1/wearable/callback', async (req, res) => {
  try {
    const { code, state } = req.query

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state' })
    }

    let userId
    try {
      const decoded = verify(state, JWT_SECRET)
      if (decoded.purpose !== 'oura_oauth') throw new Error('wrong purpose')
      userId = decoded.userId
    } catch {
      return res.status(403).json({ error: 'Invalid or expired state' })
    }

    // Exchange code for tokens (Oura verwacht application/x-www-form-urlencoded)
    const tokenResponse = await axios.post(
      'https://api.ouraring.com/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.OURA_REDIRECT_URI,
        client_id: process.env.OURA_CLIENT_ID,
        client_secret: process.env.OURA_CLIENT_SECRET,
      })
    )

    const { access_token, refresh_token, expires_in } = tokenResponse.data
    const expiresAt = new Date(Date.now() + expires_in * 1000)

    // Save tokens to database
    await pool.query(
      `INSERT INTO femflow_wearable_connections (user_id, wearable_type, access_token, refresh_token, token_expires_at)
       VALUES ($1, 'oura', $2, $3, $4)
       ON CONFLICT (user_id, wearable_type) DO UPDATE SET
       access_token = $2, refresh_token = $3, token_expires_at = $4`,
      [userId, access_token, refresh_token, expiresAt]
    )

    // Redirect back to wearable page with success
    res.redirect(`${process.env.FRONTEND_URL}/wearable?oura_connected=true`)
  } catch (err) {
    console.error('Oura callback error:', err)
    res.redirect(`${process.env.FRONTEND_URL}/wearable?oura_error=true`)
  }
})

// Get biometric readings for user
app.get('/api/v1/wearable/readings', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId
    const { days = 90 } = req.query

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    const result = await pool.query(
      `SELECT reading_date, sleep_duration_min, deep_sleep_min, hrv_ms, resting_heart_rate, recovery_index
       FROM femflow_biometric_readings
       WHERE user_id = $1 AND reading_date >= $2
       ORDER BY reading_date ASC`,
      [userId, startDate.toISOString().split('T')[0]]
    )

    res.json({
      data: result.rows,
      count: result.rows.length,
      date_range: {
        from: startDate.toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
      },
    })
  } catch (err) {
    console.error('Readings fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch readings' })
  }
})

// Get wearable connection status (alle providers)
app.get('/api/v1/wearable/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId

    const result = await pool.query(
      'SELECT wearable_type, connected_at, last_sync_at FROM femflow_wearable_connections WHERE user_id = $1',
      [userId]
    )

    const providers = {}
    for (const row of result.rows) providers[row.wearable_type] = true

    if (result.rows.length === 0) {
      return res.json({ connected: false, providers })
    }

    res.json({
      connected: true,
      providers,
      wearable_type: result.rows[0].wearable_type,
      connected_at: result.rows[0].connected_at,
      last_sync_at: result.rows[0].last_sync_at,
    })
  } catch (err) {
    console.error('Wearable status error:', err)
    res.status(500).json({ error: 'Failed to fetch status' })
  }
})

// Seed synthetic Oura data (for demo/testing)
app.post('/api/v1/wearable/seed', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId
    const { days = 60, scenario = 'stable' } = req.body

    // Generate synthetic data
    const synthData = generateSleepRange(userId, days, scenario)

    // Save to database
    for (const reading of synthData.data) {
      await pool.query(
        `INSERT INTO femflow_biometric_readings (user_id, reading_date, sleep_duration_min, deep_sleep_min, hrv_ms, resting_heart_rate, recovery_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, reading_date) DO UPDATE SET
         sleep_duration_min = $3, deep_sleep_min = $4, hrv_ms = $5, resting_heart_rate = $6, recovery_index = $7`,
        [
          userId,
          reading.day,
          Math.round(reading.total_sleep_duration / 60),
          Math.round(reading.deep_sleep_duration / 60),
          reading.average_hrv,
          reading.lowest_heart_rate,
          reading.readiness_score,
        ]
      )
    }

    res.json({ success: true, readings_created: synthData.data.length, scenario })
  } catch (err) {
    console.error('Seed data error:', err)
    res.status(500).json({ error: 'Failed to seed synthetic data' })
  }
})

// Geeft een geldig Oura access token voor deze user; ververst het automatisch
// via het refresh token als het (bijna) verlopen is. Null = niet verbonden of
// refresh onmogelijk (dan moet de user opnieuw koppelen).
async function getValidOuraToken(userId) {
  const result = await pool.query(
    'SELECT access_token, refresh_token, token_expires_at FROM femflow_wearable_connections WHERE user_id = $1 AND wearable_type = $2',
    [userId, 'oura']
  )
  if (result.rows.length === 0) return null

  const { access_token, refresh_token, token_expires_at } = result.rows[0]

  // Nog minstens een minuut geldig: gewoon gebruiken
  if (token_expires_at && new Date(token_expires_at) > new Date(Date.now() + 60 * 1000)) {
    return access_token
  }

  if (!refresh_token) return null

  const tokenResponse = await axios.post(
    'https://api.ouraring.com/oauth/token',
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
      client_id: process.env.OURA_CLIENT_ID,
      client_secret: process.env.OURA_CLIENT_SECRET,
    })
  )

  const fresh = tokenResponse.data
  const expiresAt = new Date(Date.now() + fresh.expires_in * 1000)
  await pool.query(
    `UPDATE femflow_wearable_connections SET access_token = $1, refresh_token = $2, token_expires_at = $3
     WHERE user_id = $4 AND wearable_type = $5`,
    [fresh.access_token, fresh.refresh_token || refresh_token, expiresAt, userId, 'oura']
  )

  return fresh.access_token
}

// Fetch and save Oura data
app.post('/api/v1/wearable/pull', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId

    let accessToken
    try {
      accessToken = await getValidOuraToken(userId)
    } catch (err) {
      console.error('Oura token refresh failed:', err.response?.data || err.message)
      return res.status(401).json({ error: 'Token refresh failed - please reconnect' })
    }
    if (!accessToken) {
      return res.status(401).json({ error: 'Wearable not connected - please reconnect' })
    }

    // Fetch last 7 days of data from Oura v2
    // (er bestaat geen daily_summaries endpoint; slaap en readiness zijn aparte collecties)
    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const params = {
      start_date: sevenDaysAgo.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0],
    }
    const headers = { Authorization: `Bearer ${accessToken}` }

    const [sleepResponse, readinessResponse] = await Promise.all([
      axios.get('https://api.ouraring.com/v2/usercollection/sleep', { headers, params }),
      axios.get('https://api.ouraring.com/v2/usercollection/daily_readiness', { headers, params }),
    ])

    // Merge per dag: slaapsessies (alleen de hoofdslaap, geen naps) + readiness score
    const byDay = {}
    for (const s of sleepResponse.data.data) {
      if (s.type && s.type !== 'long_sleep') continue
      byDay[s.day] = {
        sleep_min: s.total_sleep_duration ? Math.round(s.total_sleep_duration / 60) : null,
        deep_min: s.deep_sleep_duration ? Math.round(s.deep_sleep_duration / 60) : null,
        hrv: s.average_hrv ?? null,
        rhr: s.lowest_heart_rate ?? null,
      }
    }
    for (const r of readinessResponse.data.data) {
      byDay[r.day] = { ...(byDay[r.day] || {}), readiness: r.score ?? null }
    }

    const days = Object.keys(byDay)
    for (const day of days) {
      const d = byDay[day]
      await pool.query(
        `INSERT INTO femflow_biometric_readings (user_id, reading_date, sleep_duration_min, deep_sleep_min, hrv_ms, resting_heart_rate, recovery_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, reading_date) DO UPDATE SET
         sleep_duration_min = $3, deep_sleep_min = $4, hrv_ms = $5, resting_heart_rate = $6, recovery_index = $7`,
        [userId, day, d.sleep_min ?? null, d.deep_min ?? null, d.hrv ?? null, d.rhr ?? null, d.readiness ?? null]
      )
    }

    // Update last_sync_at
    await pool.query(
      'UPDATE femflow_wearable_connections SET last_sync_at = NOW() WHERE user_id = $1 AND wearable_type = $2',
      [userId, 'oura']
    )

    res.json({ success: true, readings_synced: days.length })
  } catch (err) {
    console.error('Oura pull error:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to fetch Oura data' })
  }
})

// ============================================================================
// WEARABLE: FITBIT
// Fitbit is van Google: OAuth loopt via accounts.google.com (offline access
// voor refresh tokens), de data-API blijft api.fitbit.com. Zelfde
// Google Cloud-client als de andere YouCaps-koppelingen.
// ============================================================================

const FITBIT_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.fitbit.com/api/activity',
  'https://www.fitbit.com/api/heartrate',
  'https://www.fitbit.com/api/sleep',
].join(' ')

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const FITBIT_API = 'https://api.fitbit.com'

// Start Fitbit OAuth: geeft de Google-consent-URL terug
app.post('/api/v1/wearable/fitbit/request-connect', authenticateToken, async (req, res) => {
  try {
    if (!process.env.FITBIT_CLIENT_ID || !process.env.FITBIT_REDIRECT_URI) {
      return res.status(503).json({ error: 'Fitbit not configured' })
    }

    const state = sign({ userId: req.userId, purpose: 'fitbit_oauth' }, JWT_SECRET, { expiresIn: '10m' })
    const url = new URL(GOOGLE_AUTH_URL)
    url.searchParams.append('client_id', process.env.FITBIT_CLIENT_ID)
    url.searchParams.append('redirect_uri', process.env.FITBIT_REDIRECT_URI)
    url.searchParams.append('response_type', 'code')
    url.searchParams.append('scope', FITBIT_SCOPES)
    url.searchParams.append('access_type', 'offline')   // refresh token meekrijgen
    url.searchParams.append('prompt', 'consent')        // anders geen refresh token bij herkoppeling
    url.searchParams.append('state', state)

    res.json({ auth_url: url.toString() })
  } catch (err) {
    console.error('Fitbit auth URL error:', err)
    res.status(500).json({ error: 'Failed to generate Fitbit auth URL' })
  }
})

// Fitbit OAuth callback
app.get('/api/v1/wearable/fitbit/callback', async (req, res) => {
  try {
    const { code, state } = req.query
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state' })
    }

    let userId
    try {
      const decoded = verify(state, JWT_SECRET)
      if (decoded.purpose !== 'fitbit_oauth') throw new Error('wrong purpose')
      userId = decoded.userId
    } catch {
      return res.status(403).json({ error: 'Invalid or expired state' })
    }

    const tokenResponse = await axios.post(
      GOOGLE_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.FITBIT_REDIRECT_URI,
        client_id: process.env.FITBIT_CLIENT_ID,
        client_secret: process.env.FITBIT_CLIENT_SECRET,
      })
    )

    const { access_token, refresh_token, expires_in } = tokenResponse.data
    const expiresAt = new Date(Date.now() + expires_in * 1000)

    await pool.query(
      `INSERT INTO femflow_wearable_connections (user_id, wearable_type, access_token, refresh_token, token_expires_at)
       VALUES ($1, 'fitbit', $2, $3, $4)
       ON CONFLICT (user_id, wearable_type) DO UPDATE SET
       access_token = $2, refresh_token = COALESCE($3, femflow_wearable_connections.refresh_token), token_expires_at = $4`,
      [userId, access_token, refresh_token || null, expiresAt]
    )

    res.redirect(`${process.env.FRONTEND_URL}/wearable?fitbit_connected=true`)
  } catch (err) {
    console.error('Fitbit callback error:', err.response?.data || err.message)
    res.redirect(`${process.env.FRONTEND_URL}/wearable?fitbit_error=true`)
  }
})

// Geldig Fitbit access token, automatisch ververst via Google
async function getValidFitbitToken(userId) {
  const result = await pool.query(
    'SELECT access_token, refresh_token, token_expires_at FROM femflow_wearable_connections WHERE user_id = $1 AND wearable_type = $2',
    [userId, 'fitbit']
  )
  if (result.rows.length === 0) return null

  const { access_token, refresh_token, token_expires_at } = result.rows[0]

  if (token_expires_at && new Date(token_expires_at) > new Date(Date.now() + 60 * 1000)) {
    return access_token
  }
  if (!refresh_token) return null

  const tokenResponse = await axios.post(
    GOOGLE_TOKEN_URL,
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
      client_id: process.env.FITBIT_CLIENT_ID,
      client_secret: process.env.FITBIT_CLIENT_SECRET,
    })
  )

  const fresh = tokenResponse.data
  const expiresAt = new Date(Date.now() + fresh.expires_in * 1000)
  await pool.query(
    `UPDATE femflow_wearable_connections SET access_token = $1, refresh_token = $2, token_expires_at = $3
     WHERE user_id = $4 AND wearable_type = $5`,
    [fresh.access_token, fresh.refresh_token || refresh_token, expiresAt, userId, 'fitbit']
  )
  return fresh.access_token
}

// Haal Fitbit-data op (laatste 7 dagen) en sla op als biometric readings
app.post('/api/v1/wearable/fitbit/pull', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId

    let accessToken
    try {
      accessToken = await getValidFitbitToken(userId)
    } catch (err) {
      console.error('Fitbit token refresh failed:', err.response?.data || err.message)
      return res.status(401).json({ error: 'Token refresh failed - please reconnect' })
    }
    if (!accessToken) {
      return res.status(401).json({ error: 'Fitbit not connected - please reconnect' })
    }

    const today = new Date()
    const weekTerug = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const start = weekTerug.toISOString().split('T')[0]
    const end = today.toISOString().split('T')[0]
    const headers = { Authorization: `Bearer ${accessToken}` }

    // Range-endpoints: drie calls voor de hele week i.p.v. drie per dag.
    // HRV kan ontbreken (niet elk device meet het) — dan null.
    const [sleepRes, heartRes, hrvRes] = await Promise.all([
      axios.get(`${FITBIT_API}/1.2/user/-/sleep/date/${start}/${end}.json`, { headers }),
      axios.get(`${FITBIT_API}/1/user/-/activities/heart/date/${start}/${end}.json`, { headers }),
      axios.get(`${FITBIT_API}/1/user/-/hrv/date/${start}/${end}.json`, { headers }).catch(() => null),
    ])

    const byDay = {}
    for (const s of sleepRes.data.sleep || []) {
      if (!s.isMainSleep) continue
      byDay[s.dateOfSleep] = {
        sleep_min: s.minutesAsleep ?? null,
        deep_min: s.levels?.summary?.deep?.minutes ?? null,
      }
    }
    for (const h of heartRes.data['activities-heart'] || []) {
      byDay[h.dateTime] = {
        ...(byDay[h.dateTime] || {}),
        rhr: h.value?.restingHeartRate ?? null,
      }
    }
    for (const v of hrvRes?.data?.hrv || []) {
      byDay[v.dateTime] = {
        ...(byDay[v.dateTime] || {}),
        hrv: v.value?.dailyRmssd ?? null,
      }
    }

    const days = Object.keys(byDay)
    for (const day of days) {
      const d = byDay[day]
      await pool.query(
        `INSERT INTO femflow_biometric_readings (user_id, reading_date, sleep_duration_min, deep_sleep_min, hrv_ms, resting_heart_rate, recovery_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, reading_date) DO UPDATE SET
         sleep_duration_min = COALESCE($3, femflow_biometric_readings.sleep_duration_min),
         deep_sleep_min = COALESCE($4, femflow_biometric_readings.deep_sleep_min),
         hrv_ms = COALESCE($5, femflow_biometric_readings.hrv_ms),
         resting_heart_rate = COALESCE($6, femflow_biometric_readings.resting_heart_rate)`,
        [userId, day, d.sleep_min ?? null, d.deep_min ?? null, d.hrv ?? null, d.rhr ?? null, null]
      )
    }

    await pool.query(
      'UPDATE femflow_wearable_connections SET last_sync_at = NOW() WHERE user_id = $1 AND wearable_type = $2',
      [userId, 'fitbit']
    )

    res.json({ success: true, readings_synced: days.length })
  } catch (err) {
    console.error('Fitbit pull error:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to fetch Fitbit data' })
  }
})

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`FemFlow API running on port ${PORT}`)
})
