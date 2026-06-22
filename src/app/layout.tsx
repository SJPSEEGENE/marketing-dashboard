import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: '씨젠의료재단 마케팅 툴 대시보드',
  description: '혈액검사 수탁기관 마케팅 자료 관리 시스템'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
