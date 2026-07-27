-- Migration: Add PayPal subscription support
-- Adds metadata JSON column to subscriptions
-- Note: DB uses text columns for plan/status/type, no enum types to alter

-- 1. Add metadata JSONB column to subscriptions (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- 2. paypal_sub_id already exists (verified on 2026-07-27)
-- No new enum types needed — DB stores plan/status/type as text
