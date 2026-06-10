import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import { Pool } from 'pg'
import { randomInt, createHash } from 'crypto'
import jwtPkg from 'jsonwebtoken'
import sgMail from '@sendgrid/mail'
import axios from 'axios'
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
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@femflow.youcaps.app',
      subject: 'FemFlow Login Code',
      html: `<h2>Your FemFlow Login Code</h2><p style="font-size: 24px; font-weight: bold;">${code}</p><p>Valid for 10 minutes</p>`,
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
    let userResult = await pool.query('SELECT id FROM femflow_users WHERE email = $1', [email])
    let userId

    if (userResult.rows.length === 0) {
      const newUserResult = await pool.query(
        'INSERT INTO femflow_users (id, email, created_at) VALUES ($1, $2, NOW()) RETURNING id',
        [uuidv4(), email]
      )
      userId = newUserResult.rows[0].id
    } else {
      userId = userResult.rows[0].id
    }

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

// Google OAuth (placeholder - requires Google token validation)
app.post('/api/v1/auth/google-signin', async (req, res) => {
  try {
    const { token } = req.body
    if (!token) {
      return res.status(400).json({ error: 'Google token required' })
    }

    // TODO: Validate token with Google API
    // For now, return placeholder response
    res.json({
      success: true,
      message: 'Google OAuth not yet configured on backend',
      token: 'placeholder',
    })
  } catch (err) {
    console.error('Google sign-in error:', err)
    res.status(500).json({ error: 'Google sign-in failed' })
  }
})

// Apple OAuth (placeholder)
app.post('/api/v1/auth/apple-signin', async (req, res) => {
  try {
    const { token } = req.body
    if (!token) {
      return res.status(400).json({ error: 'Apple token required' })
    }

    // TODO: Validate token with Apple API
    res.json({
      success: true,
      message: 'Apple OAuth not yet configured on backend',
      token: 'placeholder',
    })
  } catch (err) {
    console.error('Apple sign-in error:', err)
    res.status(500).json({ error: 'Apple sign-in failed' })
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
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@femflow.youcaps.app',
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
  } catch (err) {
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

    let userId = null
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token) {
      try {
        userId = verify(token, JWT_SECRET).userId
      } catch {
        // Ongeldig token negeren: quiz opslaan mag ook anoniem
      }
    }

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

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://api.ouraring.com/oauth/token', {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.OURA_REDIRECT_URI,
      client_id: process.env.OURA_CLIENT_ID,
      client_secret: process.env.OURA_CLIENT_SECRET,
    })

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

// Get wearable connection status
app.get('/api/v1/wearable/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId

    const result = await pool.query(
      'SELECT wearable_type, connected_at, last_sync_at FROM femflow_wearable_connections WHERE user_id = $1 AND wearable_type = $2',
      [userId, 'oura']
    )

    if (result.rows.length === 0) {
      return res.json({ connected: false })
    }

    res.json({
      connected: true,
      wearable_type: 'oura',
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

// Fetch and save Oura data
app.post('/api/v1/wearable/pull', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId

    // Get valid access token
    const tokenResult = await pool.query(
      'SELECT access_token, token_expires_at FROM femflow_wearable_connections WHERE user_id = $1 AND wearable_type = $2',
      [userId, 'oura']
    )

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ error: 'Wearable not connected' })
    }

    let { access_token, token_expires_at } = tokenResult.rows[0]

    // Check if token expired and refresh if needed
    if (new Date(token_expires_at) < new Date()) {
      // Token refresh logic would go here (for now, just error)
      return res.status(401).json({ error: 'Token expired - please reconnect' })
    }

    // Fetch last 7 days of data from Oura
    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startDate = sevenDaysAgo.toISOString().split('T')[0]
    const endDate = today.toISOString().split('T')[0]

    const ouraResponse = await axios.get('https://api.ouraring.com/v2/usercollection/daily_summaries', {
      headers: { Authorization: `Bearer ${access_token}` },
      params: { start_date: startDate, end_date: endDate },
    })

    // Save readings to database
    for (const reading of ouraResponse.data.data) {
      await pool.query(
        `INSERT INTO femflow_biometric_readings (user_id, reading_date, sleep_duration_min, deep_sleep_min, hrv_ms, resting_heart_rate, recovery_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, reading_date) DO UPDATE SET
         sleep_duration_min = $3, deep_sleep_min = $4, hrv_ms = $5, resting_heart_rate = $6, recovery_index = $7`,
        [
          userId,
          reading.day,
          reading.sleep?.total_sleep_duration ? Math.round(reading.sleep.total_sleep_duration / 60) : null,
          reading.sleep?.deep_sleep_duration ? Math.round(reading.sleep.deep_sleep_duration / 60) : null,
          reading.heart_rate?.variability || null,
          reading.heart_rate?.resting || null,
          reading.readiness?.score || null,
        ]
      )
    }

    // Update last_sync_at
    await pool.query(
      'UPDATE femflow_wearable_connections SET last_sync_at = NOW() WHERE user_id = $1 AND wearable_type = $2',
      [userId, 'oura']
    )

    res.json({ success: true, readings_synced: ouraResponse.data.data.length })
  } catch (err) {
    console.error('Oura pull error:', err)
    res.status(500).json({ error: 'Failed to fetch Oura data' })
  }
})

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`FemFlow API running on port ${PORT}`)
})
