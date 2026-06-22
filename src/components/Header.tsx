import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
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

        <Link
          href="/admin"
          className="rounded-lg border border-[#B5121B] px-4 py-2 text-sm font-semibold text-[#B5121B] hover:bg-red-50"
        >
          관리자
        </Link>
      </div>
    </header>
  );
}