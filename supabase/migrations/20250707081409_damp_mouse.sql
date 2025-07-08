-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For now, check if user has admin role
  -- In production, you'd check against auth.users() or similar
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Update user's last login timestamp
CREATE OR REPLACE FUNCTION update_user_last_login(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users 
  SET last_login = now()
  WHERE id = user_id_param;
END;
$$;

-- Get user by username for login
CREATE OR REPLACE FUNCTION get_user_by_username(username_param text)
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
  WHERE u.username = username_param;
END;
$$;

-- Register new user
CREATE OR REPLACE FUNCTION register_new_user(
  username_param text,
  email_param text,
  full_name_param text
)
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
DECLARE
  new_user_id uuid;
BEGIN
  INSERT INTO users (username, email, full_name, role)
  VALUES (username_param, email_param, full_name_param, 'user')
  RETURNING users.id INTO new_user_id;
  
  -- Create user stats record
  INSERT INTO user_stats (id) VALUES (new_user_id);
  
  RETURN QUERY
  SELECT u.id, u.username, u.email, u.full_name, u.role, u.created_at, u.last_login
  FROM users u
  WHERE u.id = new_user_id;
END;
$$;

-- First drop the existing function if it exists
DROP FUNCTION IF EXISTS update_user_profile(uuid, text, text);

-- Update user profile with boolean return type
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id_param uuid,
  email_param text DEFAULT NULL,
  full_name_param text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users 
  SET 
    email = COALESCE(email_param, email),
    full_name = COALESCE(full_name_param, full_name)
  WHERE id = user_id_param AND (id = auth.uid() OR is_admin());
  
  RETURN FOUND;
END;
$$;

-- Get all users (admin only)
CREATE OR REPLACE FUNCTION get_all_users()
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
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  RETURN QUERY
  SELECT u.id, u.username, u.email, u.full_name, u.role, u.created_at, u.last_login
  FROM users u
  ORDER BY u.created_at DESC;
END;
$$;

-- Delete user
CREATE OR REPLACE FUNCTION delete_user(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  DELETE FROM users WHERE id = user_id_param;
  RETURN FOUND;
END;
$$;

-- Update user role
CREATE OR REPLACE FUNCTION update_user_role(
  user_id_param uuid,
  role_param text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  UPDATE users 
  SET role = role_param
  WHERE id = user_id_param;
  
  RETURN FOUND;
END;
$$;