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
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 FemFlow API running on port ${PORT}`)
})
