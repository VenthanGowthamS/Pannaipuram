-- Migration: Create announcements table
-- Run in Supabase SQL Editor
-- Date: March 2026

CREATE TABLE IF NOT EXISTS announcements (
  id             SERIAL PRIMARY KEY,
  message_tamil  TEXT NOT NULL,
  message_english TEXT,
  type           TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'urgent', 'event')),
  priority       INT DEFAULT 0,
  is_active      BOOLEAN DEFAULT TRUE,
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, expires_at);

-- Sample announcement
-- INSERT INTO announcements (message_tamil, message_english, type, priority)
-- VALUES ('நாளை காலை 6 மணி முதல் 12 மணி வரை கரண்ட் கட் இருக்கும்', 'Power cut tomorrow 6 AM - 12 PM', 'warning', 1);

COMMENT ON TABLE announcements IS 'Community announcements shown as banner in the app home screen';
