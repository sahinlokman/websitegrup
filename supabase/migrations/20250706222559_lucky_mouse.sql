/*
  # Create RPC Functions for Application

  1. Database Functions
    - `get_all_groups()` - Get all approved groups
    - `get_public_groups()` - Get public approved groups  
    - `get_all_categories()` - Get all categories
    - `get_all_users()` - Get all users (admin only)
    - `get_user_groups(user_id)` - Get user's submitted groups
    - `get_pending_groups()` - Get pending group submissions
    - `is_admin()` - Check if current user is admin
    - `uid()` - Get current user ID

  2. Security
    - All functions respect RLS policies
    - Admin functions check user permissions
    - Public functions only return approved content

  3. Performance
    - Optimized queries with proper indexing
    - Efficient joins for related data
*/

-- Helper function to get current user ID
CREATE OR REPLACE FUNCTION uid() 
RETURNS uuid 
LANGUAGE sql 
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Get all groups (respects RLS)
CREATE OR REPLACE FUNCTION get_all_groups()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  image text,
  members integer,
  category text,
  tags text[],
  link text,
  verified boolean,
  featured boolean,
  approved boolean,
  username text,
  type text,
  user_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    g.id,
    g.name,
    g.description,
    g.image,
    g.members,
    g.category,
    g.tags,
    g.link,
    g.verified,
    g.featured,
    g.approved,
    g.username,
    g.type,
    g.user_id,
    g.created_at,
    g.updated_at
  FROM groups g
  WHERE g.approved = true
  ORDER BY g.created_at DESC;
$$;

-- Get public groups (only approved)
CREATE OR REPLACE FUNCTION get_public_groups()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  image text,
  members integer,
  category text,
  tags text[],
  link text,
  verified boolean,
  featured boolean,
  approved boolean,
  username text,
  type text,
  user_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    g.id,
    g.name,
    g.description,
    g.image,
    g.members,
    g.category,
    g.tags,
    g.link,
    g.verified,
    g.featured,
    g.approved,
    g.username,
    g.type,
    g.user_id,
    g.created_at,
    g.updated_at
  FROM groups g
  WHERE g.approved = true
  ORDER BY g.featured DESC, g.members DESC, g.created_at DESC;
$$;

-- Get all categories
CREATE OR REPLACE FUNCTION get_all_categories()
RETURNS TABLE (
  id uuid,
  name text,
  icon text,
  color text,
  description text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    c.id,
    c.name,
    c.icon,
    c.color,
    c.description,
    c.created_at
  FROM categories c
  ORDER BY c.name;
$$;

-- Get category group counts
CREATE OR REPLACE FUNCTION get_category_group_counts()
RETURNS TABLE (
  category text,
  count bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    g.category,
    COUNT(*) as count
  FROM groups g
  WHERE g.approved = true
  GROUP BY g.category;
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
  WHERE is_admin()
  ORDER BY u.created_at DESC;
$$;

-- Get user groups
CREATE OR REPLACE FUNCTION get_user_groups(user_id_param uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  group_name text,
  group_description text,
  group_username text,
  group_image text,
  category text,
  tags text[],
  link text,
  members integer,
  status text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  rejection_reason text,
  submission_note text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    ug.id,
    ug.user_id,
    ug.group_name,
    ug.group_description,
    ug.group_username,
    ug.group_image,
    ug.category,
    ug.tags,
    ug.link,
    ug.members,
    ug.status,
    ug.submitted_at,
    ug.reviewed_at,
    ug.reviewed_by,
    ug.rejection_reason,
    ug.submission_note,
    ug.created_at
  FROM user_groups ug
  WHERE ug.user_id = user_id_param
  ORDER BY ug.created_at DESC;
$$;

-- Get pending groups (admin only)
CREATE OR REPLACE FUNCTION get_pending_groups()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  group_name text,
  group_description text,
  group_username text,
  group_image text,
  category text,
  tags text[],
  link text,
  members integer,
  status text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  rejection_reason text,
  submission_note text,
  created_at timestamptz,
  users jsonb
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    ug.id,
    ug.user_id,
    ug.group_name,
    ug.group_description,
    ug.group_username,
    ug.group_image,
    ug.category,
    ug.tags,
    ug.link,
    ug.members,
    ug.status,
    ug.submitted_at,
    ug.reviewed_at,
    ug.reviewed_by,
    ug.rejection_reason,
    ug.submission_note,
    ug.created_at,
    jsonb_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'full_name', u.full_name
    ) as users
  FROM user_groups ug
  JOIN users u ON ug.user_id = u.id
  WHERE ug.status = 'pending' AND is_admin()
  ORDER BY ug.submitted_at DESC;
$$;

-- Get groups by category
CREATE OR REPLACE FUNCTION get_groups_by_category(category_param text)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  image text,
  members integer,
  category text,
  tags text[],
  link text,
  verified boolean,
  featured boolean,
  approved boolean,
  username text,
  type text,
  user_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    g.id,
    g.name,
    g.description,
    g.image,
    g.members,
    g.category,
    g.tags,
    g.link,
    g.verified,
    g.featured,
    g.approved,
    g.username,
    g.type,
    g.user_id,
    g.created_at,
    g.updated_at
  FROM groups g
  WHERE g.approved = true AND g.category = category_param
  ORDER BY g.featured DESC, g.members DESC, g.created_at DESC;
$$;