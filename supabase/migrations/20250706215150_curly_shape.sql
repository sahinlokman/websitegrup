/*
  # Initial Schema Setup

  1. New Tables
    - `users` - Stores user account information
    - `groups` - Stores Telegram group information
    - `categories` - Stores category information for groups
    - `user_groups` - Stores groups submitted by users
    - `promotions` - Stores group promotion information
    - `pages` - Stores static page content
    - `posts` - Stores blog post content

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_login TIMESTAMPTZ
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  members INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL REFERENCES categories(name),
  tags TEXT[] DEFAULT '{}',
  link TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  username TEXT,
  type TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ
);

-- Create user_groups table
CREATE TABLE IF NOT EXISTS user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  group_name TEXT NOT NULL,
  group_description TEXT NOT NULL,
  group_username TEXT NOT NULL,
  group_image TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  link TEXT NOT NULL,
  members INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  rejection_reason TEXT,
  submission_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  group_id UUID NOT NULL REFERENCES groups(id),
  plan_id TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  author TEXT NOT NULL,
  template TEXT,
  featured_image TEXT,
  seo JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  published_at TIMESTAMPTZ
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  author TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  read_time INTEGER DEFAULT 5,
  seo JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  published_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read their own data" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" 
  ON users FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users" 
  ON users FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for categories table
CREATE POLICY "Anyone can read categories" 
  ON categories FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert categories" 
  ON categories FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update categories" 
  ON categories FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete categories" 
  ON categories FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for groups table
CREATE POLICY "Anyone can read approved groups" 
  ON groups FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert groups" 
  ON groups FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own groups" 
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

-- Create policies for user_groups table
CREATE POLICY "Users can read their own submitted groups" 
  ON user_groups FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all user groups" 
  ON user_groups FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own groups" 
  ON user_groups FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending groups" 
  ON user_groups FOR UPDATE 
  USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can update any user group" 
  ON user_groups FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for promotions table
CREATE POLICY "Users can read their own promotions" 
  ON promotions FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all promotions" 
  ON promotions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own promotions" 
  ON promotions FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Create policies for pages table
CREATE POLICY "Anyone can read published pages" 
  ON pages FOR SELECT 
  USING (status = 'published');

CREATE POLICY "Admins can read all pages" 
  ON pages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert pages" 
  ON pages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update pages" 
  ON pages FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete pages" 
  ON pages FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for posts table
CREATE POLICY "Anyone can read published posts" 
  ON posts FOR SELECT 
  USING (status = 'published');

CREATE POLICY "Authors can read their own posts" 
  ON posts FOR SELECT 
  USING (author_id = auth.uid());

CREATE POLICY "Admins can read all posts" 
  ON posts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authors can insert their own posts" 
  ON posts FOR INSERT 
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update their own posts" 
  ON posts FOR UPDATE 
  USING (author_id = auth.uid());

CREATE POLICY "Admins can update any post" 
  ON posts FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete posts" 
  ON posts FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default categories
INSERT INTO categories (name, icon, color, description)
VALUES
  ('Teknoloji', 'Code', 'from-blue-500 to-cyan-500', 'Yazılım, donanım, yapay zeka ve teknoloji ile ilgili gruplar'),
  ('Finans', 'TrendingUp', 'from-green-500 to-emerald-500', 'Finans, ekonomi, kripto para ve yatırım grupları'),
  ('Sanat', 'Camera', 'from-pink-500 to-rose-500', 'Sanat, tasarım, fotoğrafçılık ve yaratıcı içerik grupları'),
  ('İş', 'Briefcase', 'from-orange-500 to-amber-500', 'İş, kariyer, girişimcilik ve profesyonel ağ grupları'),
  ('Oyun', 'Gamepad2', 'from-violet-500 to-purple-500', 'Video oyunları, mobil oyunlar ve oyun geliştirme grupları'),
  ('Müzik', 'Music', 'from-red-500 to-pink-500', 'Müzik, enstrüman, prodüksiyon ve ses tasarımı grupları'),
  ('Eğitim', 'Book', 'from-indigo-500 to-blue-500', 'Eğitim, kurslar, öğrenme ve akademik gruplar')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin user
INSERT INTO users (username, email, full_name, role, created_at)
VALUES ('admin', 'admin@telegramgruplari.com', 'Site Yöneticisi', 'admin', '2023-01-01T00:00:00Z')
ON CONFLICT (username) DO NOTHING;

-- Insert default demo user
INSERT INTO users (username, email, full_name, role, created_at)
VALUES ('demo', 'demo@example.com', 'Demo Kullanıcı', 'user', '2023-06-15T00:00:00Z')
ON CONFLICT (username) DO NOTHING;