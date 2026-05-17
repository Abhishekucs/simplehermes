-- Add unique constraint on user_id so upsert ON CONFLICT works
ALTER TABLE public.telegram_configs
  ADD CONSTRAINT telegram_configs_user_id_unique UNIQUE (user_id);

-- Drop redundant non-unique index (the unique constraint creates its own)
DROP INDEX IF EXISTS idx_telegram_configs_user_id;
