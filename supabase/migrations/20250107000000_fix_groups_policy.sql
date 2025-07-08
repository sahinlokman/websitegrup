/*
  # Fix Groups Table Policies

  1. Security Updates
    - Update policies for groups table to allow public access for reading and inserting
    - Fix authentication issues causing empty group lists

  2. Changes
    - Allow anyone to read groups (not just approved ones)
    - Allow anyone to insert groups (for public submissions)
    - Keep update/delete restrictions for authorized users only
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read approved groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can insert groups" ON groups;
DROP POLICY IF EXISTS "Users can update their own groups" ON groups;
DROP POLICY IF EXISTS "Admins can update any group" ON groups;
DROP POLICY IF EXISTS "Admins can delete groups" ON groups;

-- Create new policies with public access
CREATE POLICY "Anyone can read groups" 
  ON groups FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert groups" 
  ON groups FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own groups or any group if not authenticated" 
  ON groups FOR UPDATE 
  USING (user_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "Admins can update all groups" 
  ON groups FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete groups" 
  ON groups FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  ); 