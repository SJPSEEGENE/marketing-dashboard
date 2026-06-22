'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AdminForm } from '@/components/AdminForm';
import { isAdminLoggedIn } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { MarketingTool } from '@/types/tool';

export default function AdminEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [tool, setTool] = useState<MarketingTool | null>(null);
  const [detailFiles, setDetailFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace('/admin/login');
      return;
    }

    async function load() {
      setLoading(true);

      const { data: toolData, error: toolError } = await supabase
        .from('marketing_tools')
        .select('*')
        .eq('id', params.id)
        .single();

      if (toolError) {
        console.error(toolError);
        toast.error('자료 정보를 불러오지 못했습니다.');
        setLoading(false);
        return;
      }

      const { data: fileData, error: fileError } = await supabase
        .from('marketing_tool_files')
        .select('*')
        .eq('tool_id', params.id)
        .order('sort_order', { ascending: true });

      if (fileError) {
        console.error(fileError);
        toast.error('세부 자료를 불러오지 못했습니다.');
      }

      setTool(toolData as MarketingTool);
      setDetailFiles(fileData || []);
      setLoading(false);
    }

    load();
  }, [params.id, router]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/admin"
        className="text-sm font-semibold text-blue-700"
      >
        ← 관리자 화면
      </Link>

      <div className="mb-6 mt-4">
        <h1 className="text-3xl font-bold">자료 수정</h1>
        <p className="mt-2 text-sm text-slate-500">
          기본 정보, 대표 이미지, 세부 이미지를 수정합니다.
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">
          자료를 불러오는 중입니다.
        </div>
      )}

      {!loading && tool && (
        <AdminForm
          initialTool={tool}
          initialDetailFiles={detailFiles}
          onSaved={() => router.push('/admin')}
        />
      )}

      {!loading && !tool && (
        <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">
          자료를 찾을 수 없습니다.
        </div>
      )}
    </main>
  );
}