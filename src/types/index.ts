export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  currency: string;
  timezone: string;
  budget_rule_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  month: string;
  total_income: number;
  needs_budget: number;
  wants_budget: number;
  savings_budget: number;
  custom_rule_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type CategoryType = 'needs' | 'wants' | 'savings';

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  budget_id: string;
  category_id: string;
  amount: number;
  description: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface BudgetSummary {
  needs: {
    budget: number;
    spent: number;
    remaining: number;
    percentage: number;
  };
  wants: {
    budget: number;
    spent: number;
    remaining: number;
    percentage: number;
  };
  savings: {
    budget: number;
    spent: number;
    remaining: number;
    percentage: number;
  };
  total: {
    budget: number;
    spent: number;
    remaining: number;
  };
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  frequency: RecurringFrequency;
  start_date: string;
  end_date?: string;
  next_occurrence: string;
  is_active: boolean;
  auto_create: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface CustomBudgetRule {
  id: string;
  user_id: string;
  name: string;
  needs_percentage: number;
  wants_percentage: number;
  savings_percentage: number;
  is_active: boolean;
  created_at: string;
}

export type BillFrequency = 'once' | 'monthly' | 'quarterly' | 'yearly';

export interface BillReminder {
  id: string;
  user_id: string;
  category_id?: string;
  title: string;
  amount: number;
  due_date: string;
  frequency: BillFrequency;
  is_paid: boolean;
  reminder_days: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  category_id?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface SpendingInsight {
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  icon: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}
