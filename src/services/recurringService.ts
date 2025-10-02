import { supabase } from '../lib/supabase';
import { RecurringTransaction, RecurringFrequency } from '../types';

export const recurringService = {
  async createRecurring(
    userId: string,
    categoryId: string,
    amount: number,
    description: string,
    frequency: RecurringFrequency,
    startDate: string,
    endDate: string | undefined,
    autoCreate: boolean
  ): Promise<RecurringTransaction> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert({
        user_id: userId,
        category_id: categoryId,
        amount,
        description,
        frequency,
        start_date: startDate,
        end_date: endDate,
        next_occurrence: startDate,
        auto_create: autoCreate,
        is_active: true,
      })
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async updateRecurring(
    recurringId: string,
    categoryId: string,
    amount: number,
    description: string,
    frequency: RecurringFrequency,
    startDate: string,
    endDate: string | undefined,
    autoCreate: boolean,
    isActive: boolean
  ): Promise<RecurringTransaction> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .update({
        category_id: categoryId,
        amount,
        description,
        frequency,
        start_date: startDate,
        end_date: endDate,
        auto_create: autoCreate,
        is_active: isActive,
      })
      .eq('id', recurringId)
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRecurring(recurringId: string): Promise<void> {
    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', recurringId);

    if (error) throw error;
  },

  async getUserRecurringTransactions(userId: string): Promise<RecurringTransaction[]> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .order('next_occurrence', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getActiveRecurring(userId: string): Promise<RecurringTransaction[]> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('next_occurrence', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async toggleActive(recurringId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('recurring_transactions')
      .update({ is_active: isActive })
      .eq('id', recurringId);

    if (error) throw error;
  },
};
