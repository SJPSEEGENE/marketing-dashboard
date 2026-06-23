'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Home, LogOut, Pencil, Search, Trash2 } from 'lucide-react';
import { AdminForm } from '@/components/AdminForm';
import { isAdminLoggedIn, logoutAdmin } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { STORAGE_BUCKET } from '@/lib/constants';
import type { MarketingTool } from '@/types/tool';

export default function AdminPage() {
  const router = useRouter();
  const [tools, setTools] = useState<MarketingTool[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from('marketing_tools')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      toast.error('자료 목록을 불러오지 못했습니다.');
      return;
    }

    setTools((data || []) as MarketingTool[]);
  }

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace('/admin/login');
      return;
    }

    load();
  }, [router]);

  const filteredTools = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    if (!q) return tools;

    return tools.filter((tool: any) => {
      const keywordText = (tool.keywords || []).join(' ').toLowerCase();
      const target = `${tool.title || ''} ${tool.category || ''} ${tool.description || ''} ${keywordText}`.toLowerCase();

      return target.includes(q);
    });
  }, [tools, searchText]);

  async function handleDelete(tool: MarketingTool) {
    try {
      const { data: detailFiles, error: detailCountError } = await supabase
        .from('marketing_tool_files')
        .select('id, file_path')
        .eq('tool_id', tool.id);

      if (detailCountError) throw detailCountError;

      const detailCount = detailFiles?.length || 0;

      const ok = confirm(
`정말 삭제하시겠습니까?

자료명 : ${tool.title}
카테고리 : ${tool.category}
세부자료 : ${detailCount}개

※ 대표 이미지와 세부 자료가 모두 삭제됩니다.
※ 이 작업은 되돌릴 수 없습니다.`
      );

      if (!ok) return;

      setLoading(true);

      const storagePaths: string[] = [];

      if ((tool as any).thumbnail_path) {
        storagePaths.push((tool as any).thumbnail_path);
      }

      if ((tool as any).file_path) {
        storagePaths.push((tool as any).file_path);
      }

      if (detailFiles && detailFiles.length > 0) {
        detailFiles.forEach((file: any) => {
          if (file.file_path) {
            storagePaths.push(file.file_path);
          }
        });
      }

      if (storagePaths.length > 0) {
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(storagePaths);
      }

      const { error: deleteError } = await supabase
        .from('marketing_tools')
        .delete()
        .eq('id', tool.id);

      if (deleteError) throw deleteError;

      toast.success('자료가 삭제되었습니다.');
      load();
    } catch (error) {
      console.error(error);
      toast.error('삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logoutAdmin();
    router.push('/');
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">관리자 화면</h1>
          <p className="mt-1 text-sm text-slate-500">
            자료 등록, 수정, 삭제를 관리합니다.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            <Home className="h-4 w-4" />
            대시보드 보기
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <AdminForm onSaved={load} />

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-bold">등록 자료</h2>
            <p className="mt-1 text-sm text-slate-500">
              총 {tools.length}개 중 {filteredTools.length}개 표시
            </p>
          </div>

          <div className="mb-4 flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="자료명, 카테고리, 키워드, 설명 검색"
              className="w-full text-sm outline-none"
            />

            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText('')}
                className="text-xs font-semibold text-slate-500"
              >
                초기화
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredTools.map((tool) => {
              const imageUrl =
                (tool as any).thumbnail_url || (tool as any).file_url;

              return (
                <div
                  key={tool.id}
                  className="flex items-center justify-between gap-3 rounded-xl border p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-lg border bg-slate-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={tool.title}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          이미지 없음
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold">{tool.title}</p>

                      <p className="mt-1 text-sm text-slate-500">
                        {tool.category}
                      </p>

                      {(tool as any).keywords?.length > 0 && (
                        <p className="mt-1 truncate text-xs text-slate-400">
                          {(tool as any).keywords
                            .map((keyword: string) => `#${keyword}`)
                            .join(' ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/admin/edit/${tool.id}`}
                      className="rounded-lg border p-2 hover:bg-slate-50"
                      title="수정"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(tool)}
                      disabled={loading}
                      className="rounded-lg border p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {tools.length === 0 && (
              <p className="text-sm text-slate-500">
                등록된 자료가 없습니다.
              </p>
            )}

            {tools.length > 0 && filteredTools.length === 0 && (
              <p className="rounded-xl border bg-slate-50 p-6 text-center text-sm text-slate-500">
                검색 결과가 없습니다.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}