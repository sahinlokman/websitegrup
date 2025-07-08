/*
  # Real-time User Data Implementation

  1. Changes
    - Add user_stats table to store real-time user statistics
    - Add user_activity table to track user actions
    - Add functions to update user statistics automatically
    - Add triggers to maintain real-time data consistency

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for data access
*/

-- Create user_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY REFERENCES users(id),
  total_groups INTEGER DEFAULT 0,
  approved_groups INTEGER DEFAULT 0,
  pending_groups INTEGER DEFAULT 0,
  rejected_groups INTEGER DEFAULT 0,
  total_members INTEGER DEFAULT 0,
  featured_groups INTEGER DEFAULT 0,
  total_promotions INTEGER DEFAULT 0,
  active_promotions INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_activity table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action_type TEXT NOT NULL,
  action_details JSONB DEFAULT '{}',
  entity_type TEXT NOT NULL,
  entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Create policies for user_stats
CREATE POLICY "Users can read their own stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all user stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (is_admin());

-- Create policies for user_activity
CREATE POLICY "Users can read their own activity"
  ON user_activity FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all user activity"
  ON user_activity FOR SELECT
  TO authenticated
  USING (is_admin());

-- Create function to update user stats when groups change
CREATE OR REPLACE FUNCTION update_user_stats_on_group_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create user stats record if it doesn't exist
  INSERT INTO user_stats (id)
  VALUES (NEW.user_id)
  ON CONFLICT (id) DO NOTHING;

  -- Update user stats
  UPDATE user_stats
  SET 
    total_groups = (SELECT COUNT(*) FROM user_groups WHERE user_id = NEW.user_id),
    approved_groups = (SELECT COUNT(*) FROM user_groups WHERE user_id = NEW.user_id AND status = 'approved'),
    pending_groups = (SELECT COUNT(*) FROM user_groups WHERE user_id = NEW.user_id AND status = 'pending'),
    rejected_groups = (SELECT COUNT(*) FROM user_groups WHERE user_id = NEW.user_id AND status = 'rejected'),
    last_updated = now()
  WHERE id = NEW.user_id;

  -- Log activity
  INSERT INTO user_activity (user_id, action_type, entity_type, entity_id, action_details)
  VALUES (
    NEW.user_id,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'create'
      WHEN TG_OP = 'UPDATE' THEN 'update'
      ELSE TG_OP
    END,
    'group',
    NEW.id,
    jsonb_build_object(
      'group_name', NEW.group_name,
      'status', NEW.status
    )
  );

  RETURN NEW;
END;
$$;

-- Create function to update user stats when promotions change
CREATE OR REPLACE FUNCTION update_user_stats_on_promotion_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create user stats record if it doesn't exist
  INSERT INTO user_stats (id)
  VALUES (NEW.user_id)
  ON CONFLICT (id) DO NOTHING;

  -- Update user stats
  UPDATE user_stats
  SET 
    total_promotions = (SELECT COUNT(*) FROM promotions WHERE user_id = NEW.user_id),
    active_promotions = (SELECT COUNT(*) FROM promotions WHERE user_id = NEW.user_id AND status = 'active' AND end_date > now()),
    total_spent = (SELECT COALESCE(SUM(amount), 0) FROM promotions WHERE user_id = NEW.user_id),
    last_updated = now()
  WHERE id = NEW.user_id;

  -- Log activity
  INSERT INTO user_activity (user_id, action_type, entity_type, entity_id, action_details)
  VALUES (
    NEW.user_id,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'create'
      WHEN TG_OP = 'UPDATE' THEN 'update'
      ELSE TG_OP
    END,
    'promotion',
    NEW.id,
    jsonb_build_object(
      'group_id', NEW.group_id,
      'plan_id', NEW.plan_id,
      'amount', NEW.amount,
      'status', NEW.status
    )
  );

  RETURN NEW;
END;
$$;

-- Create function to update total members in user stats
CREATE OR REPLACE FUNCTION update_user_total_members()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update total members for the user
  UPDATE user_stats
  SET 
    total_members = (
      SELECT COALESCE(SUM(members), 0) 
      FROM user_groups 
      WHERE user_id = NEW.user_id AND status = 'approved'
    ),
    last_updated = now()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Create function to update featured groups count
CREATE OR REPLACE FUNCTION update_user_featured_groups()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update featured groups count for the user
  UPDATE user_stats
  SET 
    featured_groups = (
      SELECT COUNT(*) 
      FROM groups g
      JOIN user_groups ug ON g.id = ug.id
      WHERE ug.user_id = NEW.user_id AND g.featured = true
    ),
    last_updated = now()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Create triggers for user_groups table
DROP TRIGGER IF EXISTS user_groups_stats_trigger ON user_groups;
CREATE TRIGGER user_groups_stats_trigger
AFTER INSERT OR UPDATE ON user_groups
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_group_change();

DROP TRIGGER IF EXISTS user_groups_members_trigger ON user_groups;
CREATE TRIGGER user_groups_members_trigger
AFTER UPDATE OF members ON user_groups
FOR EACH ROW
WHEN (NEW.members IS DISTINCT FROM OLD.members)
EXECUTE FUNCTION update_user_total_members();

-- Create trigger for promotions table
DROP TRIGGER IF EXISTS promotions_stats_trigger ON promotions;
CREATE TRIGGER promotions_stats_trigger
AFTER INSERT OR UPDATE ON promotions
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_promotion_change();

-- Create trigger for groups table to track featured status
DROP TRIGGER IF EXISTS groups_featured_trigger ON groups;
CREATE TRIGGER groups_featured_trigger
AFTER UPDATE OF featured ON groups
FOR EACH ROW
WHEN (NEW.featured IS DISTINCT FROM OLD.featured)
EXECUTE FUNCTION update_user_featured_groups();

-- Function to record user login activity
CREATE OR REPLACE FUNCTION record_user_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log login activity
  INSERT INTO user_activity (user_id, action_type, entity_type, entity_id, action_details)
  VALUES (
    NEW.id,
    'login',
    'user',
    NEW.id,
    jsonb_build_object(
      'last_login', NEW.last_login
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger for user login
DROP TRIGGER IF EXISTS user_login_trigger ON users;
CREATE TRIGGER user_login_trigger
AFTER UPDATE OF last_login ON users
FOR EACH ROW
WHEN (NEW.last_login IS DISTINCT FROM OLD.last_login)
EXECUTE FUNCTION record_user_login();

-- Initialize user_stats for existing users
INSERT INTO user_stats (id)
SELECT id FROM users
ON CONFLICT (id) DO NOTHING;

-- Update stats for existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM users LOOP
    -- Update group stats
    UPDATE user_stats
    SET 
      total_groups = (SELECT COUNT(*) FROM user_groups WHERE user_id = user_record.id),
      approved_groups = (SELECT COUNT(*) FROM user_groups WHERE user_id = user_record.id AND status = 'approved'),
      pending_groups = (SELECT COUNT(*) FROM user_groups WHERE user_id = user_record.id AND status = 'pending'),
      rejected_groups = (SELECT COUNT(*) FROM user_groups WHERE user_id = user_record.id AND status = 'rejected'),
      total_members = (
        SELECT COALESCE(SUM(members), 0) 
        FROM user_groups 
        WHERE user_id = user_record.id AND status = 'approved'
      ),
      featured_groups = (
        SELECT COUNT(*) 
        FROM groups g
        JOIN user_groups ug ON g.id = ug.id
        WHERE ug.user_id = user_record.id AND g.featured = true
      ),
      total_promotions = (SELECT COUNT(*) FROM promotions WHERE user_id = user_record.id),
      active_promotions = (SELECT COUNT(*) FROM promotions WHERE user_id = user_record.id AND status = 'active' AND end_date > now()),
      total_spent = (SELECT COALESCE(SUM(amount), 0) FROM promotions WHERE user_id = user_record.id),
      last_updated = now()
    WHERE id = user_record.id;
  END LOOP;
END $$;