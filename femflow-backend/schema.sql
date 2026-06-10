-- FemFlow Database Schema (in shared WAB database)

-- FemFlow Users table
CREATE TABLE IF NOT EXISTS femflow_users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  birth_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- FemFlow OTP codes for email authentication
-- code bevat een sha256-hash van de 6-cijferige code (64 hex chars), nooit plaintext
CREATE TABLE IF NOT EXISTS femflow_otp_codes (
  email VARCHAR(255) PRIMARY KEY,
  code VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- FemFlow Menstruation data
CREATE TABLE IF NOT EXISTS femflow_menstruation_data (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES femflow_users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  cycle_length INT NOT NULL,
  bleeding_days INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- FemFlow Wearable Connections (Oura Ring OAuth)
CREATE TABLE IF NOT EXISTS femflow_wearable_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES femflow_users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  wearable_type VARCHAR(50) NOT NULL DEFAULT 'oura',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  connected_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_sync_at TIMESTAMP,
  UNIQUE(user_id, wearable_type)
);

-- FemFlow Biometric Readings (from Oura)
CREATE TABLE IF NOT EXISTS femflow_biometric_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES femflow_users(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL,
  sleep_duration_min INT,
  deep_sleep_min INT,
  hrv_ms FLOAT,
  resting_heart_rate INT,
  recovery_index INT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, reading_date)
);

-- FemFlow Quiz Results (saved after consent on Vraag 4)
CREATE TABLE IF NOT EXISTS femflow_quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES femflow_users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  constellation JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- FemFlow Welcome signups (interest list)
CREATE TABLE IF NOT EXISTS femflow_welcome_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMP
);

-- FemFlow Feedback (uit de FeedbackWidget; user_id optioneel)
CREATE TABLE IF NOT EXISTS femflow_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES femflow_users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  message TEXT NOT NULL,
  page_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- MIGRATIES — handmatig draaien op Neon (eenmalig, in volgorde)
-- ============================================================================

-- 2026-06-10: OTP-codes worden voortaan gehasht opgeslagen (sha256 = 64 chars)
-- [GEDRAAID 2026-06-10]
-- ALTER TABLE femflow_otp_codes ALTER COLUMN code TYPE VARCHAR(64);
-- DELETE FROM femflow_otp_codes;  -- oude plaintext codes ongeldig maken

-- 2026-06-10: feedback-tabel voor de FeedbackWidget (fase 4)
-- Draai het CREATE TABLE femflow_feedback statement hierboven op Neon.

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_femflow_otp_codes_expires_at ON femflow_otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_femflow_menstruation_data_user_id ON femflow_menstruation_data(user_id);
CREATE INDEX IF NOT EXISTS idx_femflow_quiz_results_user_id ON femflow_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_femflow_quiz_results_email ON femflow_quiz_results(email);
CREATE INDEX IF NOT EXISTS idx_femflow_welcome_signups_email ON femflow_welcome_signups(email);
CREATE INDEX IF NOT EXISTS idx_femflow_welcome_signups_subscribed ON femflow_welcome_signups(subscribed);
CREATE INDEX IF NOT EXISTS idx_femflow_wearable_connections_user_id ON femflow_wearable_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_femflow_biometric_readings_user_id ON femflow_biometric_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_femflow_biometric_readings_date ON femflow_biometric_readings(reading_date);
