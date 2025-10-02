/*
  # Advanced Budget Tracker Features

  ## Overview
  This migration adds comprehensive enhancements to the budget tracker:
  - Recurring transactions for automated expense tracking
  - Custom budget rules allowing flexible percentage allocations
  - Bill reminders for upcoming payments
  - Budget goals for savings targets
  - Enhanced analytics capabilities

  ## New Tables

  ### 1. `recurring_transactions`
  Automated recurring expenses and income
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `category_id` (uuid, references categories)
  - `amount` (numeric)
  - `description` (text)
  - `frequency` (text: 'daily', 'weekly', 'monthly', 'yearly')
  - `start_date` (date)
  - `end_date` (date, nullable)
  - `next_occurrence` (date)
  - `is_active` (boolean)
  - `auto_create` (boolean, auto-create transactions)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `custom_budget_rules`
  Allow users to customize budget percentages
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `name` (text)
  - `needs_percentage` (numeric)
  - `wants_percentage` (numeric)
  - `savings_percentage` (numeric)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 3. `bill_reminders`
  Track upcoming bills and payment reminders
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `category_id` (uuid, references categories)
  - `title` (text)
  - `amount` (numeric)
  - `due_date` (date)
  - `frequency` (text: 'once', 'monthly', 'quarterly', 'yearly')
  - `is_paid` (boolean)
  - `reminder_days` (integer)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `savings_goals`
  Track savings targets and progress
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `title` (text)
  - `target_amount` (numeric)
  - `current_amount` (numeric, default 0)
  - `deadline` (date, nullable)
  - `category_id` (uuid, references categories, nullable)
  - `is_completed` (boolean, default false)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Schema Modifications

  ### Update `user_profiles`
  - Add `default_currency` with more options
  - Add `timezone` for better date handling
  - Add `budget_rule_id` for custom budget rules

  ### Update `budgets`
  - Add `custom_rule_id` to support custom percentages
  - Add `notes` field for budget comments

  ## Security
  - Enable RLS on all new tables
  - Users can only access their own data
  - Proper policies for insert, update, delete operations

  ## Indexes
  - Performance indexes for recurring transaction lookups
  - Bill reminder date-based queries
  - Goals progress tracking
*/

-- Add new columns to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN timezone text DEFAULT 'UTC' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'budget_rule_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN budget_rule_id uuid;
  END IF;
END $$;

-- Create custom_budget_rules table
CREATE TABLE IF NOT EXISTS custom_budget_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  needs_percentage numeric NOT NULL CHECK (needs_percentage >= 0 AND needs_percentage <= 100),
  wants_percentage numeric NOT NULL CHECK (wants_percentage >= 0 AND wants_percentage <= 100),
  savings_percentage numeric NOT NULL CHECK (savings_percentage >= 0 AND savings_percentage <= 100),
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_percentages CHECK (needs_percentage + wants_percentage + savings_percentage = 100)
);

ALTER TABLE custom_budget_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budget rules"
  ON custom_budget_rules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget rules"
  ON custom_budget_rules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget rules"
  ON custom_budget_rules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget rules"
  ON custom_budget_rules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add foreign key for budget_rule_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_profiles_budget_rule_id_fkey'
  ) THEN
    ALTER TABLE user_profiles
    ADD CONSTRAINT user_profiles_budget_rule_id_fkey
    FOREIGN KEY (budget_rule_id) REFERENCES custom_budget_rules(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add new columns to budgets table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'budgets' AND column_name = 'custom_rule_id'
  ) THEN
    ALTER TABLE budgets ADD COLUMN custom_rule_id uuid REFERENCES custom_budget_rules(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'budgets' AND column_name = 'notes'
  ) THEN
    ALTER TABLE budgets ADD COLUMN notes text;
  END IF;
END $$;

-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  amount numeric NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date date NOT NULL,
  end_date date,
  next_occurrence date NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  auto_create boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recurring transactions"
  ON recurring_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring transactions"
  ON recurring_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring transactions"
  ON recurring_transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring transactions"
  ON recurring_transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_next_occurrence ON recurring_transactions(next_occurrence) WHERE is_active = true;

-- Create bill_reminders table
CREATE TABLE IF NOT EXISTS bill_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  due_date date NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('once', 'monthly', 'quarterly', 'yearly')),
  is_paid boolean DEFAULT false NOT NULL,
  reminder_days integer DEFAULT 3 NOT NULL CHECK (reminder_days >= 0),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE bill_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bill reminders"
  ON bill_reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bill reminders"
  ON bill_reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bill reminders"
  ON bill_reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bill reminders"
  ON bill_reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bill_reminders_user ON bill_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_reminders_due_date ON bill_reminders(due_date) WHERE is_paid = false;

-- Create savings_goals table
CREATE TABLE IF NOT EXISTS savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  target_amount numeric NOT NULL CHECK (target_amount > 0),
  current_amount numeric DEFAULT 0 NOT NULL CHECK (current_amount >= 0),
  deadline date,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_completed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings goals"
  ON savings_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings goals"
  ON savings_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals"
  ON savings_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings goals"
  ON savings_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_deadline ON savings_goals(deadline) WHERE is_completed = false;

-- Create triggers for updated_at
CREATE TRIGGER update_recurring_transactions_updated_at
  BEFORE UPDATE ON recurring_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bill_reminders_updated_at
  BEFORE UPDATE ON bill_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();