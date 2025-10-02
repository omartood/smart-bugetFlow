import { supabase } from '../lib/supabase';
import { SavingsGoal } from '../types';

export const goalsService = {
  async createGoal(
    userId: string,
    title: string,
    targetAmount: number,
    deadline: string | undefined,
    categoryId: string | undefined
  ): Promise<SavingsGoal> {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: userId,
        title,
        target_amount: targetAmount,
        current_amount: 0,
        deadline,
        category_id: categoryId,
        is_completed: false,
      })
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async updateGoal(
    goalId: string,
    title: string,
    targetAmount: number,
    currentAmount: number,
    deadline: string | undefined,
    categoryId: string | undefined
  ): Promise<SavingsGoal> {
    const { data, error } = await supabase
      .from('savings_goals')
      .update({
        title,
        target_amount: targetAmount,
        current_amount: currentAmount,
        deadline,
        category_id: categoryId,
        is_completed: currentAmount >= targetAmount,
      })
      .eq('id', goalId)
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async updateProgress(goalId: string, amount: number): Promise<SavingsGoal> {
    const { data: goal, error: fetchError } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', goalId)
      .single();

    if (fetchError) throw fetchError;

    const newAmount = Number(goal.current_amount) + amount;
    const isCompleted = newAmount >= Number(goal.target_amount);

    const { data, error } = await supabase
      .from('savings_goals')
      .update({
        current_amount: newAmount,
        is_completed: isCompleted,
      })
      .eq('id', goalId)
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async deleteGoal(goalId: string): Promise<void> {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', goalId);

    if (error) throw error;
  },

  async getUserGoals(userId: string): Promise<SavingsGoal[]> {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActiveGoals(userId: string): Promise<SavingsGoal[]> {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('deadline', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async toggleComplete(goalId: string, isCompleted: boolean): Promise<void> {
    const { error } = await supabase
      .from('savings_goals')
      .update({ is_completed: isCompleted })
      .eq('id', goalId);

    if (error) throw error;
  },
};
