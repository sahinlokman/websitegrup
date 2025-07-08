/*
  # Fix RLS Policy Infinite Recursion

  1. Problem
    - Infinite recursion detected in policy for relation "users"
    - Policies are creating circular dependencies when accessing posts and pages

  2. Solution
    - Simplify user policies to avoid recursive calls
    - Update posts and pages policies to use direct user ID checks
    - Remove complex EXISTS subqueries that cause recursion

  3. Changes
    - Recreate users table policies with simpler logic
    - Update posts table policies to avoid user table joins
    - Update pages table policies to avoid user table joins
    - Ensure admin checks use auth.uid() directly
*/

-- Drop existing problematic policies on users table
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Drop existing problematic policies on posts table
DROP POLICY IF EXISTS "Admins can read all posts" ON posts;
DROP POLICY IF EXISTS "Admins can update any post" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;
DROP POLICY IF EXISTS "Anyone can read published posts" ON posts;
DROP POLICY IF EXISTS "Authors can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Authors can read their own posts" ON posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;

-- Drop existing problematic policies on pages table
DROP POLICY IF EXISTS "Admins can read all pages" ON pages;
DROP POLICY IF EXISTS "Admins can insert pages" ON pages;
DROP POLICY IF EXISTS "Admins can update pages" ON pages;
DROP POLICY IF EXISTS "Admins can delete pages" ON pages;
DROP POLICY IF EXISTS "Anyone can read published pages" ON pages;

-- Create simplified users table policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create a function to check if current user is admin (to avoid recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Create admin policies for users using the function
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Create simplified posts table policies
CREATE POLICY "Anyone can read published posts"
  ON posts
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Authors can read their own posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Admins can read all posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Authors can insert their own posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update their own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Admins can update any post"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Create simplified pages table policies
CREATE POLICY "Anyone can read published pages"
  ON pages
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Admins can read all pages"
  ON pages
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert pages"
  ON pages
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update pages"
  ON pages
  FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete pages"
  ON pages
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Update user_groups policies to use the admin function
DROP POLICY IF EXISTS "Admins can read all user groups" ON user_groups;
DROP POLICY IF EXISTS "Admins can update any user group" ON user_groups;

CREATE POLICY "Admins can read all user groups"
  ON user_groups
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update any user group"
  ON user_groups
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Update groups policies to use the admin function
DROP POLICY IF EXISTS "Admins can delete groups" ON groups;
DROP POLICY IF EXISTS "Admins can update any group" ON groups;

CREATE POLICY "Admins can delete groups"
  ON groups
  FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update any group"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Update categories policies to use the admin function
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;

CREATE POLICY "Admins can delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Update promotions policies to use the admin function
DROP POLICY IF EXISTS "Admins can read all promotions" ON promotions;

CREATE POLICY "Admins can read all promotions"
  ON promotions
  FOR SELECT
  TO authenticated
  USING (is_admin());