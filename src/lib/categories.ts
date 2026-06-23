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
  console.error('카테고리 불러오기 실패:', error);
  return [];
}

console.log('카테고리:', data);

  return (data || []) as Category[];
}