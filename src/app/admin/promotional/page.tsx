'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, LogOut } from 'lucide-react';
import { PromotionalItemManager } from '@/components/PromotionalItemManager';
import { isAdminLoggedIn, logoutAdmin } from '@/lib/auth';

export default function PromotionalPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace('/admin/login');
    }
  }, [router]);

  function handleLogout() {
    logoutAdmin();
    router.push('/');
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/admin"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#B5121B]"
          >
            <ArrowLeft className="h-4 w-4" />
            관리자 화면으로
          </Link>

          <h1 className="text-3xl font-bold">판촉물 현황 및 재고 관리</h1>

          <p className="mt-1 text-sm text-slate-500">
            관리자만 확인 가능한 판촉물 재고 관리 페이지입니다.
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

      <PromotionalItemManager />
    </main>
  );
}