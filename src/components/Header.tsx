'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isAdminLoggedIn, logoutAdmin } from '@/lib/auth';

export function Header() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminLoggedIn());
  }, []);

  function handleLogout() {
    logoutAdmin();
    setIsAdmin(false);
    location.href = '/';
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="씨젠의료재단 로고"
            className="h-10 w-10 object-contain"
          />

          <div>
            <p className="text-sm font-semibold text-[#B5121B]">
              씨젠의료재단
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              마케팅 툴 대시보드
            </h1>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <Link
                href="/admin"
                className="rounded-lg bg-[#B5121B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8F1118]"
              >
                관리자 화면
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/admin"
              className="rounded-lg border border-[#B5121B] px-4 py-2 text-sm font-semibold text-[#B5121B] hover:bg-red-50"
            >
              관리자
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}