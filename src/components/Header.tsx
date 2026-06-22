import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="space-y-1">
          <p className="text-sm font-medium text-blue-700">씨젠의료재단</p>
          <h1 className="text-2xl font-bold tracking-tight">마케팅 툴 대시보드</h1>
        </Link>
        <Link href="/admin/login" className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50">
          관리자
        </Link>
      </div>
    </header>
  );
}
