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

      if (sortType === 'oldest') return aTime - bTime;
      return bTime - aTime;
    });
  }, [tools, query, category, sortType]);

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#B5121B] via-[#A31119] to-[#6F0B12] p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white p-3 shadow-lg">
                <img
                  src="/logo.png"
                  alt="씨젠의료재단 로고"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold tracking-wide text-red-100">
                  SEEGENE MEDICAL FOUNDATION
                </p>

                <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                  씨젠의료재단 학술·마케팅 지원 플랫폼
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-red-100">
                  영업 현장에서 활용 가능한 다양한 학술·마케팅 자료를
                  쉽고 빠르게 조회·활용할 수 있도록 구축한 지원 플랫폼입니다.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4 text-sm backdrop-blur">
              <p className="font-semibold">학술문의</p>
              <p className="mt-1 text-2xl font-bold">1566-6500</p>
            </div>
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['전체 자료', tools.length],
            ['검사홍보', categoryCounts['검사홍보'] || 0],
            ['학술임상', categoryCounts['학술임상'] || 0],
            ['영업제안', categoryCounts['영업제안'] || 0]
          ].map(([label, count]) => (
            <div
              key={String(label)}
              className="rounded-2xl border bg-white p-4 shadow-sm"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-extrabold text-[#B5121B]">
                {count}
              </p>
            </div>
          ))}
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
                  ? 'bg-[#B5121B] text-white'
                  : 'bg-red-50 text-[#B5121B] hover:bg-red-100'
              }`}
            >
              전체
            </button>

            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  category === item
                    ? 'bg-[#B5121B] text-white'
                    : 'bg-red-50 text-[#B5121B] hover:bg-red-100'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            총{' '}
            <span className="font-semibold text-slate-900">
              {filtered.length}
            </span>
            개 자료가 검색되었습니다.
          </p>

          {category && (
            <button
              type="button"
              onClick={() => setCategory('')}
              className="text-sm font-semibold text-[#B5121B]"
            >
              필터 초기화
            </button>
          )}
        </div>

        {loading && (
          <p className="text-sm text-slate-500">자료를 불러오는 중입니다.</p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="rounded-2xl border bg-white p-8 text-center text-slate-500">
            조건에 맞는 자료가 없습니다.
          </p>
        )}

        <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        <footer className="mt-10 rounded-2xl border bg-white p-5 text-center text-sm text-slate-600 shadow-sm">
          <p className="font-semibold text-slate-800">
            본 플랫폼은 씨젠의료재단 학술기획팀에서 제작·운영합니다.
          </p>

          <p className="mt-2">
            학술문의 :{' '}
            <span className="font-semibold text-[#B5121B]">1566-6500</span>
          </p>

          <p className="mt-2 text-xs text-slate-400">
            © Seegene Medical Foundation Academic Planning Team
          </p>
        </footer>
      </section>
    </main>
  );
}