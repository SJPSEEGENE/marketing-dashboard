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
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#B5121B] via-[#A31119] to-[#7F0E15] p-7 text-white shadow-lg">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white p-3 shadow-md">
              <img
                src="/logo.png"
                alt="?¨ì  ?˜ë£Œ?¬ë‹¨ ë¡œê³ "
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-red-100">
                SEEGENE MEDICAL FOUNDATION
              </p>

              <h2 className="text-3xl font-bold">
                ?¨ì  ?˜ë£Œ?¬ë‹¨ ?™ìˆ Â·ë§ˆì???ì§€???Œë«??              </h2>

              <p className="mt-3 text-sm leading-6 text-red-100">
                ?¨ì  ?˜ë£Œ?¬ë‹¨?ì„œ ?œê³µ?˜ëŠ” ?¤ì–‘???™ìˆ Â·ë§ˆì???ì§€???ë£Œë¥?                ?•ì¸?˜ì‹¤ ???ˆìŠµ?ˆë‹¤.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">?„ì²´ ?ë£Œ</p>
            <p className="mt-1 text-2xl font-bold text-[#B5121B]">
              {tools.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">ê²€?¬í™ë³?/p>
            <p className="mt-1 text-2xl font-bold text-[#B5121B]">
              {categoryCounts['ê²€?¬í™ë³?] || 0}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">?™ìˆ ?„ìƒ</p>
            <p className="mt-1 text-2xl font-bold text-[#B5121B]">
              {categoryCounts['?™ìˆ ?„ìƒ'] || 0}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">?ì—…?œì•ˆ</p>
            <p className="mt-1 text-2xl font-bold text-[#B5121B]">
              {categoryCounts['?ì—…?œì•ˆ'] || 0}
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
              <option value="latest">ìµœì‹ ??/option>
              <option value="oldest">?¤ë˜?œìˆœ</option>
              <option value="title">?œëª©??/option>
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
              ?„ì²´ {tools.length}
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
                {item} {categoryCounts[item] || 0}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            ì´?' '}
            <span className="font-semibold text-slate-900">
              {filtered.length}
            </span>
            ê°??ë£Œê°€ ê²€?‰ë˜?ˆìŠµ?ˆë‹¤.
          </p>

          {category && (
            <button
              type="button"
              onClick={() => setCategory('')}
              className="text-sm font-semibold text-[#B5121B]"
            >
              ?„í„° ì´ˆê¸°??            </button>
          )}
        </div>

        {loading && (
          <p className="text-sm text-slate-500">
            ?ë£Œë¥?ë¶ˆëŸ¬?¤ëŠ” ì¤‘ì…?ˆë‹¤.
          </p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="rounded-2xl border bg-white p-8 text-center text-slate-500">
            ì¡°ê±´??ë§ëŠ” ?ë£Œê°€ ?†ìŠµ?ˆë‹¤.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        <footer className="mt-10 rounded-2xl border bg-white p-5 text-center text-sm text-slate-600 shadow-sm">
          <p className="font-semibold text-slate-800">
            ë³??Œë«?¼ì? ?¨ì  ?˜ë£Œ?¬ë‹¨ ?™ìˆ ê¸°íš?€?ì„œ ?œì‘Â·?´ì˜?©ë‹ˆ??
          </p>

          <p className="mt-2">
            ?™ìˆ ë¬¸ì˜ :{' '}
            <span className="font-semibold text-[#B5121B]">
              1566-6500
            </span>
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Â© Seegene Medical Foundation Academic Planning Team
          </p>
        </footer>
      </section>
    </main>
  );
}
