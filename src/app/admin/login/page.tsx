'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { loginAdmin } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (loginAdmin(id, password)) {
      toast.success('관리자 로그인 완료');
      router.push('/admin');
    } else {
      toast.error('ID 또는 비밀번호가 올바르지 않습니다.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm"
      >
        <h1 className="mb-2 text-2xl font-bold">관리자 로그인</h1>

        <p className="mb-6 text-sm text-slate-500">
          관리자 계정으로 로그인하세요.
        </p>

        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="ID"
          className="mb-3 w-full rounded-lg border px-3 py-2"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="mb-4 w-full rounded-lg border px-3 py-2"
        />

        <button className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white">
          로그인
        </button>
      </form>
    </main>
  );
}