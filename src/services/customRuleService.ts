import { supabase } from '../lib/supabase';
import { CustomBudgetRule } from '../types';

export const customRuleService = {
  async createRule(
    userId: string,
    name: string,
    needsPercentage: number,
    wantsPercentage: number,
    savingsPercentage: number
  ): Promise<CustomBudgetRule> {
    if (needsPercentage + wantsPercentage + savingsPercentage !== 100) {
      throw new Error('Percentages must add up to 100');
    }

    const { data, error } = await supabase
      .from('custom_budget_rules')
      .insert({
        user_id: userId,
        name,
        needs_percentage: needsPercentage,
        wants_percentage: wantsPercentage,
        savings_percentage: savingsPercentage,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRule(
    ruleId: string,
    name: string,
    needsPercentage: number,
    wantsPercentage: number,
    savingsPercentage: number
  ): Promise<CustomBudgetRule> {
    if (needsPercentage + wantsPercentage + savingsPercentage !== 100) {
      throw new Error('Percentages must add up to 100');
    }

    const { data, error } = await supabase
      .from('custom_budget_rules')
      .update({
        name,
        needs_percentage: needsPercentage,
        wants_percentage: wantsPercentage,
        savings_percentage: savingsPercentage,
      })
      .eq('id', ruleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRule(ruleId: string): Promise<void> {
    const { error } = await supabase
      .from('custom_budget_rules')
      .delete()
      .eq('id', ruleId);

    if (error) throw error;
  },

  async getUserRules(userId: string): Promise<CustomBudgetRule[]> {
    const { data, error } = await supabase
      .from('custom_budget_rules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActiveRule(userId: string): Promise<CustomBudgetRule | null> {
    const { data, error } = await supabase
      .from('custom_budget_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async setActiveRule(userId: string, ruleId: string): Promise<void> {
    await supabase
      .from('custom_budget_rules')
      .update({ is_active: false })
      .eq('user_id', userId);

    const { error } = await supabase
      .from('custom_budget_rules')
      .update({ is_active: true })
      .eq('id', ruleId);

    if (error) throw error;
  },
};
