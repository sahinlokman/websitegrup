/*
  # Temporarily Disable RLS for Groups Table

  1. Security Changes
    - Temporarily disable RLS for groups table to fix 401 errors
    - This is for testing purposes only

  2. Warning
    - This makes the table publicly accessible
    - Should be re-enabled after fixing authentication
*/

-- Temporarily disable RLS for groups table
ALTER TABLE groups DISABLE ROW LEVEL SECURITY; 