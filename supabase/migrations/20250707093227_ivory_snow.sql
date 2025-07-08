/*
  # Add Group Reports Table

  1. New Tables
    - `group_reports` - Stores reports submitted by users about groups
      - `id` (uuid, primary key)
      - `group_id` (text, not null)
      - `user_id` (text, not null)
      - `reason` (text, not null)
      - `group_name` (text, not null)
      - `reported_at` (timestamptz, default now(), not null)
      - `status` (text, default 'pending', not null)
      - `reviewed_by` (text)
      - `reviewed_at` (timestamptz)
      - `notes` (text)

  2. Security
    - Enable RLS on the table
    - Add policies for authenticated users to create reports
    - Add policies for admins to manage reports
*/

-- Create group_reports table
CREATE TABLE IF NOT EXISTS group_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  group_name TEXT NOT NULL,
  reported_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE group_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for group_reports
CREATE POLICY "Users can create reports"
  ON group_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read all reports"
  ON group_reports
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update reports"
  ON group_reports
  FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete reports"
  ON group_reports
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS group_reports_status_idx ON group_reports(status);
CREATE INDEX IF NOT EXISTS group_reports_reported_at_idx ON group_reports(reported_at);
CREATE INDEX IF NOT EXISTS group_reports_group_id_idx ON group_reports(group_id);