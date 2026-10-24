-- Run this SQL in your Supabase SQL Editor to create the tables

CREATE TABLE pilot_signups (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  android_version TEXT,
  device_model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pilot_feedback (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  what_worked TEXT NOT NULL,
  what_broke TEXT NOT NULL,
  what_to_add TEXT NOT NULL,
  tester_email TEXT,
  tester_device TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anonymous inserts (public forms, no auth needed)
ALTER TABLE pilot_signups DISABLE ROW LEVEL SECURITY;
ALTER TABLE pilot_feedback DISABLE ROW LEVEL SECURITY;