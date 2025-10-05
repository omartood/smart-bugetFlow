/*
  # Add Smart Recommendations and Insights System

  1. New Tables
    - `user_insights`
      - Stores calculated financial insights per user per month
      - Tracks spending patterns, averages, and trends
      - Used for historical analysis and comparison
    
    - `dismissed_recommendations`
      - Tracks which recommendations users have dismissed
      - Prevents showing the same recommendations repeatedly
      - Includes expiry dates for time-sensitive dismissals

  2. Changes
    - Add insights tracking for better recommendations
    - Store user preferences for recommendation types
    - Enable historical trend analysis

  3. Security
    - Enable RLS on all new tables
    - Users can only access their own insights
    - Users can only manage their own dismissed recommendations
*/

-- User Insights Table
CREATE TABLE IF NOT EXISTS user_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  month_year TEXT NOT NULL,
  average_daily DECIMAL(10, 2) DEFAULT 0,
  average_weekly DECIMAL(10, 2) DEFAULT 0,
  average_monthly DECIMAL(10, 2) DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  vs_previous_month DECIMAL(10, 2) DEFAULT 0,
  top_categories JSONB DEFAULT '[]'::jsonb,
  trends JSONB DEFAULT '{"increasing":[],"decreasing":[],"stable":[]}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Dismissed Recommendations Table
CREATE TABLE IF NOT EXISTS dismissed_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  recommendation_type TEXT NOT NULL,
  recommendation_key TEXT NOT NULL,
  dismissed_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(user_id, recommendation_type, recommendation_key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_insights_user_month ON user_insights(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_dismissed_recommendations_user ON dismissed_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_dismissed_recommendations_expires ON dismissed_recommendations(expires_at);

-- Enable RLS
ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE dismissed_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_insights
CREATE POLICY "Users can view own insights"
  ON user_insights
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON user_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON user_insights
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON user_insights
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for dismissed_recommendations
CREATE POLICY "Users can view own dismissed recommendations"
  ON dismissed_recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dismissed recommendations"
  ON dismissed_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dismissed recommendations"
  ON dismissed_recommendations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_insights
DROP TRIGGER IF EXISTS update_user_insights_timestamp ON user_insights;
CREATE TRIGGER update_user_insights_timestamp
  BEFORE UPDATE ON user_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_user_insights_updated_at();

-- Function to clean expired dismissed recommendations
CREATE OR REPLACE FUNCTION clean_expired_dismissed_recommendations()
RETURNS void AS $$
BEGIN
  DELETE FROM dismissed_recommendations
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$ LANGUAGE plpgsql;
