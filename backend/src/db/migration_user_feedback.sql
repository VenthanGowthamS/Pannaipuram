-- Migration: user_feedback table
-- Purpose: Store feedback and suggestions submitted by villagers from the app
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_feedback (
  id          SERIAL PRIMARY KEY,
  message     TEXT NOT NULL CHECK (length(message) >= 5),
  name_or_contact VARCHAR(100),          -- optional, anonymous if blank
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin listing (newest first, unread first)
CREATE INDEX IF NOT EXISTS idx_feedback_read_created
  ON user_feedback (is_read, created_at DESC);
