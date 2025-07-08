/*
  # Fix Recursion Issues and Create Missing Tables

  1. Changes
    - Fix infinite recursion in user policies
    - Ensure all required tables exist
    - Simplify RLS policies to avoid circular dependencies
    - Add missing indexes for performance
    - Insert sample data with valid foreign keys

  2. Security
    - Maintain RLS on all tables
    - Ensure proper access control
*/

-- Create is_admin function if it doesn't exist
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

-- Fix users table policies
DO $$ 
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Users can read their own data" ON users;
  DROP POLICY IF EXISTS "Users can update their own data" ON users;
  DROP POLICY IF EXISTS "Admins can read all users" ON users;
  DROP POLICY IF EXISTS "Admins can update all users" ON users;
  
  -- Create new simplified policies
  CREATE POLICY "Users can read their own data" 
    ON users FOR SELECT 
    USING (auth.uid() = id);

  CREATE POLICY "Users can update their own data" 
    ON users FOR UPDATE 
    USING (auth.uid() = id);

  CREATE POLICY "Admins can read all users" 
    ON users FOR SELECT 
    USING (is_admin());

  CREATE POLICY "Admins can update all users" 
    ON users FOR UPDATE 
    USING (is_admin());
END $$;

-- Ensure posts table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') THEN
    CREATE TABLE posts (
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

    -- Add foreign key if users table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
      ALTER TABLE posts 
      ADD CONSTRAINT posts_author_id_fkey 
      FOREIGN KEY (author_id) REFERENCES users(id);
    END IF;

    -- Enable RLS
    ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

    -- Create indexes
    CREATE INDEX posts_status_idx ON posts(status);
    CREATE INDEX posts_author_id_idx ON posts(author_id);
    CREATE INDEX posts_category_idx ON posts(category);
    CREATE INDEX posts_published_at_idx ON posts(published_at);

    -- Create policies
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
  END IF;
END $$;

-- Ensure pages table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pages') THEN
    CREATE TABLE pages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      slug text UNIQUE NOT NULL,
      content text NOT NULL,
      excerpt text,
      status text DEFAULT 'draft' NOT NULL,
      author text NOT NULL,
      template text,
      featured_image text,
      seo jsonb DEFAULT '{}' NOT NULL,
      created_at timestamptz DEFAULT now() NOT NULL,
      updated_at timestamptz DEFAULT now() NOT NULL,
      published_at timestamptz
    );

    -- Enable RLS
    ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

    -- Create policies
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
  END IF;
END $$;

-- Fix categories table policies
DO $$ 
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
  DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
  DROP POLICY IF EXISTS "Admins can update categories" ON categories;
  
  -- Create new simplified policies
  CREATE POLICY "Admins can delete categories" 
    ON categories FOR DELETE 
    USING (is_admin());

  CREATE POLICY "Admins can insert categories" 
    ON categories FOR INSERT 
    WITH CHECK (is_admin());

  CREATE POLICY "Admins can update categories" 
    ON categories FOR UPDATE 
    USING (is_admin());
END $$;

-- Fix groups table policies
DO $$ 
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Admins can delete groups" ON groups;
  DROP POLICY IF EXISTS "Admins can update any group" ON groups;
  
  -- Create new simplified policies
  CREATE POLICY "Admins can delete groups" 
    ON groups FOR DELETE 
    USING (is_admin());

  CREATE POLICY "Admins can update any group" 
    ON groups FOR UPDATE 
    USING (is_admin());
END $$;

-- Fix user_groups table policies
DO $$ 
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Admins can read all user groups" ON user_groups;
  DROP POLICY IF EXISTS "Admins can update any user group" ON user_groups;
  
  -- Create new simplified policies
  CREATE POLICY "Admins can read all user groups" 
    ON user_groups FOR SELECT 
    USING (is_admin());

  CREATE POLICY "Admins can update any user group" 
    ON user_groups FOR UPDATE 
    USING (is_admin());
END $$;

-- Fix promotions table policies
DO $$ 
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Admins can read all promotions" ON promotions;
  
  -- Create new simplified policies
  CREATE POLICY "Admins can read all promotions" 
    ON promotions FOR SELECT 
    USING (is_admin());
END $$;

-- Insert sample data for testing, but only if admin user exists
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- First check if we have an admin user
  SELECT id INTO admin_id FROM users WHERE username = 'admin' LIMIT 1;
  
  -- Only insert sample data if we have an admin user
  IF admin_id IS NOT NULL THEN
    -- Insert sample blog post
    INSERT INTO posts (title, slug, content, excerpt, status, author, author_id, category, tags, views, read_time, seo, published_at)
    VALUES 
    ('Telegram Gruplarında Güvenlik İpuçları', 'telegram-gruplarinda-guvenlik-ipuclari', 
    '# Telegram Gruplarında Güvenlik İpuçları

    Telegram gruplarında güvenliğinizi sağlamak için dikkat etmeniz gereken önemli noktalar...

    ## 1. Kişisel Bilgilerinizi Paylaşmayın

    Telegram gruplarında asla kişisel bilgilerinizi paylaşmayın. Bu bilgiler arasında:

    - Telefon numaranız
    - Adresiniz
    - Kredi kartı bilgileriniz
    - Şifreleriniz

    ## 2. Şüpheli Linklere Tıklamayın

    Bilinmeyen kaynaklardan gelen linklere tıklamaktan kaçının.', 
    'Telegram gruplarında güvenliğinizi sağlamak için bilmeniz gereken önemli ipuçları ve dikkat edilmesi gereken noktalar.', 
    'published', 'Admin', admin_id, 'Teknoloji', 
    ARRAY['güvenlik', 'telegram', 'ipuçları', 'gizlilik'], 
    1250, 5, 
    '{"metaTitle": "Telegram Gruplarında Güvenlik İpuçları - Telegram Grupları", "metaDescription": "Telegram gruplarında güvenliğinizi sağlamak için bilmeniz gereken önemli ipuçları ve dikkat edilmesi gereken noktalar.", "keywords": ["telegram güvenlik", "telegram ipuçları", "online güvenlik", "gizlilik"]}',
    NOW())
    ON CONFLICT (slug) DO NOTHING;

    -- Insert sample page
    INSERT INTO pages (title, slug, content, excerpt, status, author, template, seo, published_at)
    VALUES 
    ('Hakkımızda', 'hakkimizda', 
    E'# Hakkımızda\n\nTelegram Grupları, Türkiye''nin en kapsamlı Telegram grupları dizinidir.', 
    'Telegram Grupları hakkında bilgi edinin', 
    'published', 'Admin', 'default', 
    '{"metaTitle": "Hakkımızda - Telegram Grupları", "metaDescription": "Telegram Grupları platformu hakkında detaylı bilgi edinin.", "keywords": ["hakkımızda", "telegram grupları", "platform"]}',
    NOW())
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;