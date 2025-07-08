/*
  # Admin Auto-Approve Groups

  1. Changes
    - Add a trigger to automatically approve groups added by admins
    - Add a function to check if a user is an admin
    - Update the groups table to set approved=true for admin-added groups

  2. Security
    - Maintain RLS on all tables
    - Ensure proper access control
*/

-- Create a function to automatically approve groups added by admins
CREATE OR REPLACE FUNCTION auto_approve_admin_groups()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin_user BOOLEAN;
BEGIN
  -- Check if the user adding the group is an admin
  SELECT (role = 'admin') INTO is_admin_user
  FROM users
  WHERE id = NEW.user_id;
  
  -- If user is admin, automatically approve the group
  IF is_admin_user THEN
    NEW.approved = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create a trigger to run the function before inserting a new group
DROP TRIGGER IF EXISTS auto_approve_admin_groups_trigger ON groups;
CREATE TRIGGER auto_approve_admin_groups_trigger
BEFORE INSERT ON groups
FOR EACH ROW
EXECUTE FUNCTION auto_approve_admin_groups();

-- Create a function to automatically approve user_groups added by admins
CREATE OR REPLACE FUNCTION auto_approve_admin_user_groups()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin_user BOOLEAN;
BEGIN
  -- Check if the user adding the group is an admin
  SELECT (role = 'admin') INTO is_admin_user
  FROM users
  WHERE id = NEW.user_id;
  
  -- If user is admin, automatically approve the group
  IF is_admin_user THEN
    NEW.status = 'approved';
    NEW.reviewed_at = NOW();
    NEW.reviewed_by = 'System';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create a trigger to run the function before inserting a new user_group
DROP TRIGGER IF EXISTS auto_approve_admin_user_groups_trigger ON user_groups;
CREATE TRIGGER auto_approve_admin_user_groups_trigger
BEFORE INSERT ON user_groups
FOR EACH ROW
EXECUTE FUNCTION auto_approve_admin_user_groups();

-- Create a function to get user by username (for login)
CREATE OR REPLACE FUNCTION get_user_by_username(username_param TEXT)
RETURNS TABLE (
  id uuid,
  username text,
  email text,
  full_name text,
  role text,
  created_at timestamptz,
  last_login timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    u.id,
    u.username,
    u.email,
    u.full_name,
    u.role,
    u.created_at,
    u.last_login
  FROM users u
  WHERE u.username = username_param;
$$;

-- Create a function to update user last login
CREATE OR REPLACE FUNCTION update_user_last_login(user_id_param UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE users
  SET last_login = NOW()
  WHERE id = user_id_param;
$$;

-- Create a function to register a new user
CREATE OR REPLACE FUNCTION register_new_user(
  username_param TEXT,
  email_param TEXT,
  full_name_param TEXT
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
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO users (username, email, full_name, role, last_login)
  VALUES (username_param, email_param, full_name_param, 'user', NOW())
  RETURNING id, username, email, full_name, role, created_at, last_login;
$$;

-- Create a function to update user profile
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id_param UUID,
  email_param TEXT,
  full_name_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET 
    email = email_param,
    full_name = full_name_param
  WHERE id = user_id_param;
  
  RETURN FOUND;
END;
$$;

-- Create a function to delete a user
CREATE OR REPLACE FUNCTION delete_user(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM users
  WHERE id = user_id_param;
  
  RETURN FOUND;
END;
$$;

-- Create a function to update user role
CREATE OR REPLACE FUNCTION update_user_role(
  user_id_param UUID,
  role_param TEXT
)
RETURNS BOOLEAN
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

-- Create a function to add a user group
CREATE OR REPLACE FUNCTION add_user_group(
  user_id_param UUID,
  group_name_param TEXT,
  group_description_param TEXT,
  group_username_param TEXT,
  group_image_param TEXT,
  category_param TEXT,
  tags_param TEXT[],
  link_param TEXT,
  members_param INTEGER,
  status_param TEXT,
  submitted_at_param TIMESTAMPTZ,
  submission_note_param TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
  is_admin_user BOOLEAN;
BEGIN
  -- Check if the user is an admin
  SELECT (role = 'admin') INTO is_admin_user
  FROM users
  WHERE id = user_id_param;
  
  -- If user is admin, automatically approve the group
  IF is_admin_user THEN
    status_param := 'approved';
  END IF;
  
  -- Insert the group
  INSERT INTO user_groups (
    user_id,
    group_name,
    group_description,
    group_username,
    group_image,
    category,
    tags,
    link,
    members,
    status,
    submitted_at,
    submission_note,
    reviewed_at,
    reviewed_by
  )
  VALUES (
    user_id_param,
    group_name_param,
    group_description_param,
    group_username_param,
    group_image_param,
    category_param,
    tags_param,
    link_param,
    members_param,
    status_param,
    submitted_at_param,
    submission_note_param,
    CASE WHEN is_admin_user THEN NOW() ELSE NULL END,
    CASE WHEN is_admin_user THEN 'System' ELSE NULL END
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Create a function to update a user group
CREATE OR REPLACE FUNCTION update_user_group(
  group_id_param UUID,
  group_name_param TEXT,
  group_description_param TEXT,
  group_username_param TEXT,
  group_image_param TEXT,
  category_param TEXT,
  tags_param TEXT[],
  link_param TEXT,
  members_param INTEGER,
  status_param TEXT,
  reviewed_at_param TIMESTAMPTZ,
  reviewed_by_param TEXT,
  rejection_reason_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_groups
  SET
    group_name = group_name_param,
    group_description = group_description_param,
    group_username = group_username_param,
    group_image = group_image_param,
    category = category_param,
    tags = tags_param,
    link = link_param,
    members = members_param,
    status = status_param,
    reviewed_at = reviewed_at_param,
    reviewed_by = reviewed_by_param,
    rejection_reason = rejection_reason_param
  WHERE id = group_id_param;
  
  RETURN FOUND;
END;
$$;

-- Create a function to delete a user group
CREATE OR REPLACE FUNCTION delete_user_group(group_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM user_groups
  WHERE id = group_id_param;
  
  RETURN FOUND;
END;
$$;

-- Create a function to add a promotion
CREATE OR REPLACE FUNCTION add_promotion(
  group_id_param UUID,
  user_id_param UUID,
  plan_id_param TEXT,
  start_date_param TIMESTAMPTZ,
  end_date_param TIMESTAMPTZ,
  status_param TEXT,
  payment_id_param TEXT,
  amount_param NUMERIC,
  currency_param TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO promotions (
    group_id,
    user_id,
    plan_id,
    start_date,
    end_date,
    status,
    payment_id,
    amount,
    currency
  )
  VALUES (
    group_id_param,
    user_id_param,
    plan_id_param,
    start_date_param,
    end_date_param,
    status_param,
    payment_id_param,
    amount_param,
    currency_param
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Create a function to update promotion status
CREATE OR REPLACE FUNCTION update_promotion_status(
  promotion_id_param UUID,
  status_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE promotions
  SET status = status_param
  WHERE id = promotion_id_param;
  
  RETURN FOUND;
END;
$$;

-- Create a function to check expired promotions
CREATE OR REPLACE FUNCTION check_expired_promotions()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE promotions
  SET status = 'expired'
  WHERE status = 'active' AND end_date < NOW();
$$;

-- Create a function to check if a group is promoted
CREATE OR REPLACE FUNCTION is_group_promoted(group_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM promotions
    WHERE group_id = group_id_param
    AND status = 'active'
    AND end_date >= NOW()
  );
$$;

-- Create a function to get promotions
CREATE OR REPLACE FUNCTION get_promotions()
RETURNS TABLE (
  id uuid,
  group_id uuid,
  user_id uuid,
  plan_id text,
  start_date timestamptz,
  end_date timestamptz,
  status text,
  amount numeric,
  currency text,
  payment_id text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.group_id,
    p.user_id,
    p.plan_id,
    p.start_date,
    p.end_date,
    p.status,
    p.amount,
    p.currency,
    p.payment_id,
    p.created_at
  FROM promotions p
  WHERE is_admin()
  ORDER BY p.created_at DESC;
$$;

-- Create a function to get user promotions
CREATE OR REPLACE FUNCTION get_user_promotions(user_id_param UUID)
RETURNS TABLE (
  id uuid,
  group_id uuid,
  user_id uuid,
  plan_id text,
  start_date timestamptz,
  end_date timestamptz,
  status text,
  amount numeric,
  currency text,
  payment_id text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.group_id,
    p.user_id,
    p.plan_id,
    p.start_date,
    p.end_date,
    p.status,
    p.amount,
    p.currency,
    p.payment_id,
    p.created_at
  FROM promotions p
  WHERE p.user_id = user_id_param
  ORDER BY p.created_at DESC;
$$;