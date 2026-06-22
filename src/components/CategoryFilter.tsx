import { CATEGORIES } from '@/lib/constants';

export function CategoryFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-lg border bg-white px-3 text-sm">
      <option value="">전체 카테고리</option>
      {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
    </select>
  );
}
