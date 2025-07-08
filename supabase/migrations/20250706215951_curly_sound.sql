/*
  # Create posts table

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `slug` (text, unique, not null)
      - `content` (text, not null)
      - `excerpt` (text, nullable)
      - `featured_image` (text, nullable)
      - `status` (text, default 'draft', not null)
      - `author` (text, not null)
      - `author_id` (uuid, not null, references users.id)
      - `category` (text, not null)
      - `tags` (text[], default '{}')
      - `views` (integer, default 0)
      - `read_time` (integer, default 5)
      - `seo` (jsonb, default '{}', not null)
      - `created_at` (timestamptz, default now(), not null)
      - `updated_at` (timestamptz, default now(), not null)
      - `published_at` (timestamptz, nullable)
  
  2. Security
    - Enable RLS on `posts` table
    - Add policies for public users to read published posts
    - Add policies for authors to manage their own posts
    - Add policies for admins to manage all posts
*/

-- Create posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image text,
  status text DEFAULT 'draft' NOT NULL,
  author text NOT NULL,
  author_id uuid NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  views integer DEFAULT 0,
  read_time integer DEFAULT 5,
  seo jsonb DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  published_at timestamptz
);

-- Add foreign key constraint only if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'posts_author_id_fkey' AND conrelid = 'posts'::regclass
  ) THEN
    ALTER TABLE posts 
    ADD CONSTRAINT posts_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES users(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON posts(author_id);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts(published_at);

-- Drop existing policies if they exist to avoid duplicates
DO $$ 
BEGIN
  -- Anyone can read published posts
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'posts' AND policyname = 'Anyone can read published posts'
  ) THEN
    DROP POLICY "Anyone can read published posts" ON posts;
  END IF;

  -- Authors can insert their own posts
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'posts' AND policyname = 'Authors can insert their own posts'
  ) THEN
    DROP POLICY "Authors can insert their own posts" ON posts;
  END IF;

  -- Authors can read their own posts
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'posts' AND policyname = 'Authors can read their own posts'
  ) THEN
    DROP POLICY "Authors can read their own posts" ON posts;
  END IF;

  -- Authors can update their own posts
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'posts' AND policyname = 'Authors can update their own posts'
  ) THEN
    DROP POLICY "Authors can update their own posts" ON posts;
  END IF;

  -- Admins can read all posts
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'posts' AND policyname = 'Admins can read all posts'
  ) THEN
    DROP POLICY "Admins can read all posts" ON posts;
  END IF;

  -- Admins can update any post
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'posts' AND policyname = 'Admins can update any post'
  ) THEN
    DROP POLICY "Admins can update any post" ON posts;
  END IF;

  -- Admins can delete posts
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'posts' AND policyname = 'Admins can delete posts'
  ) THEN
    DROP POLICY "Admins can delete posts" ON posts;
  END IF;
END $$;

-- Create RLS Policies
-- Anyone can read published posts
CREATE POLICY "Anyone can read published posts"
  ON posts
  FOR SELECT
  TO public
  USING (status = 'published');

-- Authors can insert their own posts
CREATE POLICY "Authors can insert their own posts"
  ON posts
  FOR INSERT
  TO public
  WITH CHECK (author_id = auth.uid());

-- Authors can read their own posts
CREATE POLICY "Authors can read their own posts"
  ON posts
  FOR SELECT
  TO public
  USING (author_id = auth.uid());

-- Authors can update their own posts
CREATE POLICY "Authors can update their own posts"
  ON posts
  FOR UPDATE
  TO public
  USING (author_id = auth.uid());

-- Admins can read all posts
CREATE POLICY "Admins can read all posts"
  ON posts
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admins can update any post
CREATE POLICY "Admins can update any post"
  ON posts
  FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admins can delete posts
CREATE POLICY "Admins can delete posts"
  ON posts
  FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );