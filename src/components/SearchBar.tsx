import { Search } from 'lucide-react';

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="제목, 검사명, 키워드 검색"
        className="h-11 w-full rounded-lg border bg-white pl-10 pr-3 text-sm outline-none focus:border-blue-500"
      />
    </div>
  );
}
