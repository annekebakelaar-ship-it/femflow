import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Pool } from 'pg'
import { randomInt } from 'crypto'
import jwtPkg from 'jsonwebtoken'
import sgMail from '@sendgrid/mail'
import { v4 as uuidv4 } from 'uuid'

const { sign, verify } = jwtPkg
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Middleware
app.use(cors())
app.use(express.json())

// Email setup

// Verify DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err)
  } else {
    console.log('✅ Database connected')
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

// Request OTP code
app.post('/api/v1/auth/request-code', async (req, res) => {
  try {
    const { email } = req.body

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' })
    }

    // Generate 6-digit code
    const code = String(randomInt(100000, 999999))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    // Store code in DB
    await pool.query(
      'INSERT INTO femflow_otp_codes (email, code, expires_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET code=$2, expires_at=$3',
      [email, code, expiresAt]
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
app.post('/api/v1/auth/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code required' })
    }

    // Check code
    const result = await pool.query(
      'SELECT * FROM femflow_otp_codes WHERE email = $1 AND code = $2 AND expires_at > NOW()',
      [email, code]
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
    const token = sign({ userId, email }, process.env.JWT_SECRET || 'dev-secret', {
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
app.post('/api/v1/welcome/signup', async (req, res) => {
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
app.post('/api/v1/welcome/unsubscribe', async (req, res) => {
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
    const decoded = verify(token, process.env.JWT_SECRET || 'dev-secret')
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
  try {
    await pool.query('BEGIN')
    await pool.query('DELETE FROM femflow_menstruation_data WHERE user_id = $1', [req.userId])
    await pool.query('DELETE FROM femflow_otp_codes WHERE email = (SELECT email FROM femflow_users WHERE id = $1)', [req.userId])
    await pool.query('DELETE FROM femflow_users WHERE id = $1', [req.userId])
    await pool.query('COMMIT')

    res.json({ success: true, message: 'Account deleted' })
  } catch (err) {
    await pool.query('ROLLBACK')
    console.error('Delete user error:', err)
    res.status(500).json({ error: 'Failed to delete account' })
  }
})

// ============================================================================
// QUIZ RESULTS ENDPOINTS
// ============================================================================

// Save quiz results (pre-login or post-login)
app.post('/api/v1/quiz/save', async (req, res) => {
  try {
    const { email, constellation } = req.body
    const userId = req.userId || null // Only set if authenticated (post-login)

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
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 FemFlow API running on port ${PORT}`)
})
