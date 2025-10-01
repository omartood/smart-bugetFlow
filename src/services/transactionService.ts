import { supabase } from '../lib/supabase';
import { Transaction } from '../types';

export const transactionService = {
  async createTransaction(
    userId: string,
    budgetId: string,
    categoryId: string,
    amount: number,
    description: string,
    transactionDate: string
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        budget_id: budgetId,
        category_id: categoryId,
        amount,
        description,
        transaction_date: transactionDate,
      })
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async updateTransaction(
    transactionId: string,
    categoryId: string,
    amount: number,
    description: string,
    transactionDate: string
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        category_id: categoryId,
        amount,
        description,
        transaction_date: transactionDate,
      })
      .eq('id', transactionId)
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTransaction(transactionId: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) throw error;
  },

  async getTransactionsByBudget(budgetId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('budget_id', budgetId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getRecentTransactions(userId: string, limit: number = 10): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};
