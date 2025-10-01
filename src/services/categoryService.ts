import { supabase } from '../lib/supabase';
import { Category, CategoryType } from '../types';

export const categoryService = {
  async getAllCategories(userId?: string): Promise<Category[]> {
    let query = supabase
      .from('categories')
      .select('*')
      .order('type')
      .order('name');

    if (userId) {
      query = query.or(`is_default.eq.true,user_id.eq.${userId}`);
    } else {
      query = query.eq('is_default', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getCategoriesByType(type: CategoryType, userId?: string): Promise<Category[]> {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('type', type)
      .order('name');

    if (userId) {
      query = query.or(`is_default.eq.true,user_id.eq.${userId}`);
    } else {
      query = query.eq('is_default', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async createCategory(
    userId: string,
    name: string,
    type: CategoryType,
    icon: string,
    color: string
  ): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name,
        type,
        icon,
        color,
        is_default: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCategory(
    categoryId: string,
    name: string,
    icon: string,
    color: string
  ): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update({ name, icon, color })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  },
};
