-- First, delete orphaned records with NULL user_id
DELETE FROM income_sources WHERE user_id IS NULL;

-- Then alter the column to NOT NULL
ALTER TABLE income_sources ALTER COLUMN user_id SET NOT NULL;