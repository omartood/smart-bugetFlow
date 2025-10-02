import { supabase } from '../lib/supabase';
import { BillReminder, BillFrequency } from '../types';

export const billService = {
  async createBill(
    userId: string,
    title: string,
    amount: number,
    dueDate: string,
    frequency: BillFrequency,
    categoryId: string | undefined,
    reminderDays: number,
    notes: string | undefined
  ): Promise<BillReminder> {
    const { data, error } = await supabase
      .from('bill_reminders')
      .insert({
        user_id: userId,
        title,
        amount,
        due_date: dueDate,
        frequency,
        category_id: categoryId,
        reminder_days: reminderDays,
        notes,
        is_paid: false,
      })
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async updateBill(
    billId: string,
    title: string,
    amount: number,
    dueDate: string,
    frequency: BillFrequency,
    categoryId: string | undefined,
    reminderDays: number,
    notes: string | undefined
  ): Promise<BillReminder> {
    const { data, error } = await supabase
      .from('bill_reminders')
      .update({
        title,
        amount,
        due_date: dueDate,
        frequency,
        category_id: categoryId,
        reminder_days: reminderDays,
        notes,
      })
      .eq('id', billId)
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBill(billId: string): Promise<void> {
    const { error } = await supabase
      .from('bill_reminders')
      .delete()
      .eq('id', billId);

    if (error) throw error;
  },

  async getUserBills(userId: string): Promise<BillReminder[]> {
    const { data, error } = await supabase
      .from('bill_reminders')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getUpcomingBills(userId: string, days: number = 7): Promise<BillReminder[]> {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('bill_reminders')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .eq('is_paid', false)
      .gte('due_date', today)
      .lte('due_date', futureDateStr)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async markAsPaid(billId: string, isPaid: boolean): Promise<void> {
    const { error } = await supabase
      .from('bill_reminders')
      .update({ is_paid: isPaid })
      .eq('id', billId);

    if (error) throw error;
  },
};
