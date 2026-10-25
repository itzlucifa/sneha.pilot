-- ====================================================================
-- SNEHA Pilot Distribution — Hardened Supabase Database Schema & RLS
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- ====================================================================

-- 1. Pilot Sign-ups Table (Hardened with strict length constraints)
CREATE TABLE IF NOT EXISTS pilot_signups (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 100),
  email TEXT NOT NULL CHECK (char_length(email) <= 254 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  android_version TEXT CHECK (android_version IS NULL OR char_length(android_version) <= 60),
  device_model TEXT CHECK (device_model IS NULL OR char_length(device_model) <= 120),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Pilot Feedback Table (Hardened with strict length constraints)
CREATE TABLE IF NOT EXISTS pilot_feedback (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  what_worked TEXT NOT NULL CHECK (char_length(trim(what_worked)) >= 2 AND char_length(what_worked) <= 3000),
  what_broke TEXT NOT NULL CHECK (char_length(trim(what_broke)) >= 2 AND char_length(what_broke) <= 3000),
  what_to_add TEXT NOT NULL CHECK (char_length(trim(what_to_add)) >= 2 AND char_length(what_to_add) <= 3000),
  tester_email TEXT CHECK (tester_email IS NULL OR char_length(tester_email) <= 254),
  tester_device TEXT CHECK (tester_device IS NULL OR char_length(tester_device) <= 120),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_pilot_signups_created_at ON pilot_signups (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pilot_signups_email ON pilot_signups (email);
CREATE INDEX IF NOT EXISTS idx_pilot_feedback_created_at ON pilot_feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pilot_feedback_rating ON pilot_feedback (rating);

-- ====================================================================
-- 3. Row Level Security (RLS) Configuration - Maximum Protection
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
DROP POLICY IF EXISTS "Allow maintainer read on pilot_signups" ON pilot_signups;
DROP POLICY IF EXISTS "Allow maintainer read on pilot_feedback" ON pilot_feedback;

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

-- B. SERVICE ROLE FULL ACCESS:
-- Backend server with service role key has unrestricted admin control
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

-- C. HARDENED MAINTAINER READ ACCESS:
-- Protects tester emails & data: only requests presenting the correct Maintainer PIN header can read records
CREATE POLICY "Allow maintainer read on pilot_signups"
  ON pilot_signups
  FOR SELECT
  TO anon, authenticated
  USING (
    coalesce(current_setting('request.headers', true)::json->>'x-admin-pin', '') = 'Sneha@143'
    OR coalesce(current_setting('request.headers', true)::json->>'x-admin-token', '') = 'Sneha@143'
  );

CREATE POLICY "Allow maintainer read on pilot_feedback"
  ON pilot_feedback
  FOR SELECT
  TO anon, authenticated
  USING (
    coalesce(current_setting('request.headers', true)::json->>'x-admin-pin', '') = 'Sneha@143'
    OR coalesce(current_setting('request.headers', true)::json->>'x-admin-token', '') = 'Sneha@143'
  );

-- ====================================================================
-- 4. Enable Supabase Realtime CDC Publication
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE pilot_signups;
ALTER PUBLICATION supabase_realtime ADD TABLE pilot_feedback;
