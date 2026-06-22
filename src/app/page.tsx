'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { ToolCard } from '@/components/ToolCard';
import { CATEGORIES } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import type { MarketingTool } from '@/types/tool';

type SortType = 'latest' | 'oldest' | 'title';

export default function HomePage() {
  const [tools, setTools] = useState<MarketingTool[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sortType, setSortType] = useState<SortType>('latest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('marketing_tools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setTools((data || []) as MarketingTool[]);
      setLoading(false);
    }

    load();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    CATEGORIES.forEach((item) => {
      counts[item] = 0;
    });

    tools.forEach((tool) => {
      if (tool.category) {
        counts[tool.category] = (counts[tool.category] || 0) + 1;
      }
    });

    return counts;
  }, [tools]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const result = tools.filter((tool) => {
      const matchesCategory = !category || tool.category === category;
      const keywordText = (tool.keywords || []).join(' ').toLowerCase();
      const descriptionText = (tool.description || '').toLowerCase();
      const target = `${tool.title} ${keywordText} ${descriptionText}`.toLowerCase();

      return matchesCategory && (!q || target.includes(q));
    });

    return [...result].sort((a: any, b: any) => {
      if (sortType === 'title') {
        return String(a.title || '').localeCompare(String(b.title || ''), 'ko');
      }

      const aTime = new Date(a.created_at || 0).getTime();
      const bTime = new Date(b.created_at || 0).getTime();

      if (sortType === 'oldest') {
        return aTime - bTime;
      }

      return bTime - aTime;
    });
  }, [tools, query, category, sortType]);

  return (
    <main>
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 rounded-2xl bg-slate-900 p-7 text-white">
          <p className="mb-2 text-sm font-semibold text-blue-200">
            SEEGENE MEDICAL FOUNDATION
          </p>

          <h2 className="text-3xl font-bold">
            씨젠의료재단 학술·마케팅 지원 플랫폼
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            씨젠의료재단에서 제공하는 다양한 학술·마케팅 지원 자료를
            확인하실 수 있습니다.
          </p>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">전체 자료</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {tools.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">검사홍보</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {categoryCounts['검사홍보'] || 0}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">학술임상</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {categoryCounts['학술임상'] || 0}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">영업제안</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {categoryCounts['영업제안'] || 0}
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <SearchBar value={query} onChange={setQuery} />
            </div>

            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="title">제목순</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory('')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                category === ''
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              전체 {tools.length}
            </button>

            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  category === item
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                {item} {categoryCounts[item] || 0}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            총 <span className="font-semibold text-slate-900">{filtered.length}</span>개 자료가 검색되었습니다.
          </p>

          {category && (
            <button
              type="button"
              onClick={() => setCategory('')}
              className="text-sm font-semibold text-blue-700"
            >
              필터 초기화
            </button>
          )}
        </div>

        {loading && (
          <p className="text-sm text-slate-500">
            자료를 불러오는 중입니다.
          </p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="rounded-2xl border bg-white p-8 text-center text-slate-500">
            조건에 맞는 자료가 없습니다.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </main>
  );
}