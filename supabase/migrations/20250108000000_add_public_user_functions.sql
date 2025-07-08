/*
  # Add Public User Functions

  1. New Functions
    - `get_all_users_public()` - Get all users without admin check
    - `delete_user_public(user_id)` - Delete user without admin check
    - `update_user_role_public(user_id, role)` - Update user role without admin check

  2. Purpose
    - Support localStorage-based authentication 
    - Allow user management without Supabase auth session
    - Temporary solution until full Supabase auth integration

  3. Security
    - These functions bypass admin checks
    - Should only be used with proper frontend authentication
*/

-- Get all users (no admin check)
CREATE OR REPLACE FUNCTION get_all_users_public()
RETURNS TABLE (
  id uuid,
  username text,
  email text,
  full_name text,
  role text,
  created_at timestamptz,
  last_login timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username, u.email, u.full_name, u.role, u.created_at, u.last_login
  FROM users u
  ORDER BY u.created_at DESC;
END;
$$;

-- Delete user (no admin check)
CREATE OR REPLACE FUNCTION delete_user_public(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM users WHERE id = user_id_param;
  RETURN FOUND;
END;
$$;

-- Update user role (no admin check)
CREATE OR REPLACE FUNCTION update_user_role_public(
  user_id_param uuid,
  role_param text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users 
  SET role = role_param
  WHERE id = user_id_param;
  
  RETURN FOUND;
END;
$$; 