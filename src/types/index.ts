export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  currency: string;
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
