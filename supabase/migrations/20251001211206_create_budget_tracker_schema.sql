/*
  # Budget Tracker Application Schema - 50/30/20 Rule

  ## Overview
  This migration creates a comprehensive budget tracking system based on the 50/30/20 budgeting rule:
  - 50% for Needs (essentials)
  - 30% for Wants (lifestyle)
  - 20% for Savings (financial goals)

  ## New Tables

  ### 1. `user_profiles`
  Stores extended user information and preferences
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `currency` (text, default 'USD')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `budgets`
  Stores monthly budget configurations for each user
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `month` (text, format: YYYY-MM)
  - `total_income` (numeric)
  - `needs_budget` (numeric, 50% of income)
  - `wants_budget` (numeric, 30% of income)
  - `savings_budget` (numeric, 20% of income)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `categories`
  Predefined and custom categories for transactions
  - `id` (uuid, primary key)
  - `user_id` (uuid, nullable, for custom categories)
  - `name` (text)
  - `type` (text: 'needs', 'wants', 'savings')
  - `icon` (text, lucide icon name)
  - `color` (text, hex color)
  - `is_default` (boolean)
  - `created_at` (timestamptz)

  ### 4. `transactions`
  Individual financial transactions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `budget_id` (uuid, references budgets)
  - `category_id` (uuid, references categories)
  - `amount` (numeric)
  - `description` (text)
  - `transaction_date` (date)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Default categories are readable by all authenticated users
  - Custom categories are only accessible by their creator

  ## Indexes
  - Budget lookups by user and month
  - Transaction lookups by user, budget, and date
  - Category lookups by type and user
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  currency text DEFAULT 'USD' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  month text NOT NULL,
  total_income numeric NOT NULL CHECK (total_income >= 0),
  needs_budget numeric NOT NULL CHECK (needs_budget >= 0),
  wants_budget numeric NOT NULL CHECK (wants_budget >= 0),
  savings_budget numeric NOT NULL CHECK (savings_budget >= 0),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, month)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for budget lookups
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('needs', 'wants', 'savings')),
  icon text DEFAULT 'Circle' NOT NULL,
  color text DEFAULT '#6B7280' NOT NULL,
  is_default boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view default categories"
  ON categories FOR SELECT
  TO authenticated
  USING (is_default = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_default = false)
  WITH CHECK (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_default = false);

-- Create index for category lookups
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  budget_id uuid NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  amount numeric NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  transaction_date date NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for transaction lookups
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_budget ON transactions(budget_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

-- Insert default categories
INSERT INTO categories (name, type, icon, color, is_default) VALUES
  -- Needs (50%)
  ('Housing', 'needs', 'Home', '#EF4444', true),
  ('Utilities', 'needs', 'Zap', '#F59E0B', true),
  ('Groceries', 'needs', 'ShoppingCart', '#10B981', true),
  ('Transportation', 'needs', 'Car', '#3B82F6', true),
  ('Insurance', 'needs', 'Shield', '#8B5CF6', true),
  ('Healthcare', 'needs', 'Heart', '#EC4899', true),
  ('Minimum Debt Payments', 'needs', 'CreditCard', '#6B7280', true),
  
  -- Wants (30%)
  ('Dining Out', 'wants', 'UtensilsCrossed', '#F97316', true),
  ('Entertainment', 'wants', 'Tv', '#06B6D4', true),
  ('Shopping', 'wants', 'ShoppingBag', '#A855F7', true),
  ('Hobbies', 'wants', 'Palette', '#EC4899', true),
  ('Subscriptions', 'wants', 'PlayCircle', '#6366F1', true),
  ('Travel', 'wants', 'Plane', '#14B8A6', true),
  ('Gym & Fitness', 'wants', 'Dumbbell', '#EAB308', true),
  
  -- Savings (20%)
  ('Emergency Fund', 'savings', 'Umbrella', '#10B981', true),
  ('Retirement', 'savings', 'PiggyBank', '#3B82F6', true),
  ('Investments', 'savings', 'TrendingUp', '#8B5CF6', true),
  ('Debt Repayment', 'savings', 'Target', '#EF4444', true),
  ('Future Goals', 'savings', 'Star', '#F59E0B', true)
ON CONFLICT DO NOTHING;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();