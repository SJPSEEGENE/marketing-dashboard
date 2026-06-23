import { supabase } from '@/lib/supabase';

export interface Category {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export async function getActiveCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data || []) as Category[];
}