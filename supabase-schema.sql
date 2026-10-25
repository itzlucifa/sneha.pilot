-- ====================================================================
-- SNEHA Pilot Distribution — Supabase Database Schema & RLS Security
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- ====================================================================

-- 1. Pilot Sign-ups Table
CREATE TABLE IF NOT EXISTS pilot_signups (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2),
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  android_version TEXT,
  device_model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Pilot Feedback Table
CREATE TABLE IF NOT EXISTS pilot_feedback (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  what_worked TEXT NOT NULL CHECK (char_length(trim(what_worked)) >= 2),
  what_broke TEXT NOT NULL CHECK (char_length(trim(what_broke)) >= 2),
  what_to_add TEXT NOT NULL CHECK (char_length(trim(what_to_add)) >= 2),
  tester_email TEXT,
  tester_device TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_pilot_signups_created_at ON pilot_signups (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pilot_signups_email ON pilot_signups (email);
CREATE INDEX IF NOT EXISTS idx_pilot_feedback_created_at ON pilot_feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pilot_feedback_rating ON pilot_feedback (rating);

-- ====================================================================
-- 3. Row Level Security (RLS) Configuration
-- ====================================================================

-- Enable RLS to prevent public data scraping
ALTER TABLE pilot_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilot_feedback ENABLE ROW LEVEL SECURITY;

-- Clean up any legacy or duplicate policies
DROP POLICY IF EXISTS "Allow anonymous insert on pilot_signups" ON pilot_signups;
DROP POLICY IF EXISTS "Allow anonymous insert on pilot_feedback" ON pilot_feedback;
DROP POLICY IF EXISTS "Allow service role full access on pilot_signups" ON pilot_signups;
DROP POLICY IF EXISTS "Allow service role full access on pilot_feedback" ON pilot_feedback;
DROP POLICY IF EXISTS "Allow public read on pilot_signups" ON pilot_signups;
DROP POLICY IF EXISTS "Allow public read on pilot_feedback" ON pilot_feedback;

-- A. PUBLIC INSERT POLICIES:
-- Anyone (anonymous tester) can submit pilot signups and feedback
CREATE POLICY "Allow anonymous insert on pilot_signups"
  ON pilot_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert on pilot_feedback"
  ON pilot_feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- B. RESTRICT SELECT/UPDATE/DELETE:
-- By NOT granting SELECT, UPDATE, or DELETE to 'anon', regular public visitors
-- cannot read or tamper with any tester data or emails.
-- Service role (server-side admin key) automatically retains full access.

-- C. (Optional) Authenticated Admin Read Policy:
-- If using Supabase Auth for maintainer login:
CREATE POLICY "Allow service role full access on pilot_signups"
  ON pilot_signups
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access on pilot_feedback"
  ON pilot_feedback
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
