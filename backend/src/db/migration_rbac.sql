-- RBAC Migration for Admin Users
-- Adds role, name, and is_active columns to admin_users table

ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update created_at constraint if it doesn't have timezone
ALTER TABLE admin_users
  ALTER COLUMN created_at SET DEFAULT NOW();

-- Set existing users as super_admin (they had implicit full access before)
UPDATE admin_users SET role = 'super_admin' WHERE role = 'admin' OR role IS NULL;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Create index on is_active for user listing
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Add check constraint on role values
ALTER TABLE admin_users
  ADD CONSTRAINT valid_admin_role
  CHECK (role IN ('super_admin', 'admin', 'viewer'))
  NOT VALID;

-- Validate constraint (non-blocking on existing data)
ALTER TABLE admin_users
  VALIDATE CONSTRAINT valid_admin_role;
