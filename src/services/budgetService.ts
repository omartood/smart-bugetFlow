import { supabase } from '../lib/supabase';
import { Budget, Transaction, Category, BudgetSummary } from '../types';

export const budgetService = {
  async createBudget(userId: string, month: string, totalIncome: number): Promise<Budget> {
    const needsBudget = totalIncome * 0.5;
    const wantsBudget = totalIncome * 0.3;
    const savingsBudget = totalIncome * 0.2;

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        month,
        total_income: totalIncome,
        needs_budget: needsBudget,
        wants_budget: wantsBudget,
        savings_budget: savingsBudget,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBudget(budgetId: string, totalIncome: number): Promise<Budget> {
    const needsBudget = totalIncome * 0.5;
    const wantsBudget = totalIncome * 0.3;
    const savingsBudget = totalIncome * 0.2;

    const { data, error } = await supabase
      .from('budgets')
      .update({
        total_income: totalIncome,
        needs_budget: needsBudget,
        wants_budget: wantsBudget,
        savings_budget: savingsBudget,
      })
      .eq('id', budgetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getBudgetByMonth(userId: string, month: string): Promise<Budget | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAllBudgets(userId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async deleteBudget(budgetId: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId);

    if (error) throw error;
  },

  async getBudgetSummary(budgetId: string): Promise<BudgetSummary> {
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single();

    if (budgetError) throw budgetError;

    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('budget_id', budgetId);

    if (transError) throw transError;

    const needsSpent = transactions
      .filter((t: Transaction & { category: Category }) => t.category?.type === 'needs')
      .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

    const wantsSpent = transactions
      .filter((t: Transaction & { category: Category }) => t.category?.type === 'wants')
      .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

    const savingsSpent = transactions
      .filter((t: Transaction & { category: Category }) => t.category?.type === 'savings')
      .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

    const totalSpent = needsSpent + wantsSpent + savingsSpent;

    return {
      needs: {
        budget: Number(budget.needs_budget),
        spent: needsSpent,
        remaining: Number(budget.needs_budget) - needsSpent,
        percentage: 50,
      },
      wants: {
        budget: Number(budget.wants_budget),
        spent: wantsSpent,
        remaining: Number(budget.wants_budget) - wantsSpent,
        percentage: 30,
      },
      savings: {
        budget: Number(budget.savings_budget),
        spent: savingsSpent,
        remaining: Number(budget.savings_budget) - savingsSpent,
        percentage: 20,
      },
      total: {
        budget: Number(budget.total_income),
        spent: totalSpent,
        remaining: Number(budget.total_income) - totalSpent,
      },
    };
  },
};
