/*
  # Fix entity_id column type in user_activity table

  1. Changes
    - Change `entity_id` column type from `uuid` to `text` in `user_activity` table
    - This allows storing string-generated IDs instead of requiring UUID format

  2. Security
    - Maintains existing RLS policies
    - No changes to security model
*/

-- Change entity_id column from uuid to text to allow string IDs
ALTER TABLE user_activity 
ALTER COLUMN entity_id TYPE text USING entity_id::text;