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
CREATE TABLE IF NOT EXISTS femflow_otp_codes (
  email VARCHAR(255) PRIMARY KEY,
  code VARCHAR(6) NOT NULL,
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_femflow_otp_codes_expires_at ON femflow_otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_femflow_menstruation_data_user_id ON femflow_menstruation_data(user_id);
CREATE INDEX IF NOT EXISTS idx_femflow_quiz_results_user_id ON femflow_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_femflow_quiz_results_email ON femflow_quiz_results(email);
CREATE INDEX IF NOT EXISTS idx_femflow_welcome_signups_email ON femflow_welcome_signups(email);
CREATE INDEX IF NOT EXISTS idx_femflow_welcome_signups_subscribed ON femflow_welcome_signups(subscribed);
