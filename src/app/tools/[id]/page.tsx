'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function getPdfViewerUrl(url: string) {
  return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
}

export default function ToolDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [tool, setTool] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      const { data: toolData, error: toolError } = await supabase
        .from('marketing_tools')
        .select('*')
        .eq('id', id)
        .single();

      if (toolError) {
        console.error(toolError);
        setLoading(false);
        return;
      }

      const { data: fileData, error: fileError } = await supabase
        .from('marketing_tool_files')
        .select('*')
        .eq('tool_id', id)
        .order('sort_order', { ascending: true });

      if (fileError) {
        console.error(fileError);
      }

      setTool(toolData);
      setFiles(fileData || []);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-gray-500">자료를 불러오는 중입니다.</p>
      </main>
    );
  }

  if (!tool) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/" className="text-sm font-semibold text-[#B5121B]">
          ← 목록으로
        </Link>
        <p className="mt-8 text-gray-600">자료를 찾을 수 없습니다.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <Link href="/" className="text-sm font-semibold text-[#B5121B]">
        ← 목록으로
      </Link>

      <section className="mt-4 rounded-2xl border bg-white p-5 shadow-sm">
        <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-[#B5121B]">
          {tool.category}
        </span>

        <h1 className="mt-3 text-2xl font-bold text-gray-900 md:text-3xl">
          {tool.title}
        </h1>

        {tool.description && (
          <p className="mt-2 text-sm text-gray-600 md:text-base">
            {tool.description}
          </p>
        )}
      </section>

      <section className="mt-5 rounded-2xl border bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 md:text-xl">
            {tool.category === '검사홍보'
              ? '제공 가능한 마케팅 툴'
              : '세부 미리보기'}
          </h2>

          <p className="mt-1 text-xs text-gray-500 md:text-sm">
            등록된 자료를 미리보기 형태로 확인할 수 있습니다.
          </p>
        </div>

        {files.length === 0 ? (
          <div className="rounded-xl border bg-gray-50 p-6 text-sm text-gray-500">
            등록된 세부 파일이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {files.map((file, index) => {
              const label =
                tool.category === '검사홍보'
                  ? file.file_label || '기타'
                  : `세부 자료 ${index + 1}`;

              return (
                <div
                  key={file.id}
                  className="overflow-hidden rounded-xl border bg-white"
                >
                  <div className="bg-[#B5121B] px-2 py-2">
                    <p className="truncate text-xs font-semibold text-white md:text-sm">
                      {label}
                    </p>
                  </div>

                  <div
                    className="relative flex h-44 cursor-zoom-in items-center justify-center overflow-hidden bg-gray-50"
                    onClick={() => {
                      if (file.file_type === 'image') {
                        setSelectedImage(file.file_url);
                      } else {
                        setSelectedPdf(file.file_url);
                      }
                    }}
                  >
                    {file.file_type === 'image' ? (
                      <img
                        src={file.file_url}
                        alt={file.file_name}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <iframe
                        src={getPdfViewerUrl(file.file_url)}
                        className="pointer-events-none h-[520px] w-[360px] scale-[0.34] origin-center rounded border bg-white"
                      />
                    )}
                  </div>

                  <div className="border-t bg-white p-2">
                    <p className="truncate text-[11px] text-gray-500">
                      {file.file_name}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        if (file.file_type === 'image') {
                          setSelectedImage(file.file_url);
                        } else {
                          setSelectedPdf(file.file_url);
                        }
                      }}
                      className="mt-2 w-full rounded-md border px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      크게보기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-5 rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 md:text-xl">
          마케팅 툴 설명
        </h2>

        <div className="mt-3 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
          {tool.description ? (
            <p>{tool.description}</p>
          ) : (
            <p>
              해당 마케팅 툴의 활용 목적, 권장 사용 상황, 대상 의료기관,
              주요 안내 포인트 등을 입력할 수 있는 영역입니다.
            </p>
          )}
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-[95vh] max-w-[95vw]">
            <button
              type="button"
              className="absolute -right-3 -top-3 rounded-full bg-white px-3 py-1 text-sm font-bold text-gray-900 shadow"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              ✕
            </button>

            <img
              src={selectedImage}
              alt="확대 이미지"
              className="max-h-[90vh] max-w-[90vw] rounded-lg bg-white object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {selectedPdf && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPdf(null)}
        >
          <div
            className="relative h-[88vh] w-[94vw] overflow-hidden rounded-xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="font-semibold text-gray-900">PDF 미리보기</p>

              <button
                type="button"
                onClick={() => setSelectedPdf(null)}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-gray-700"
              >
                ✕
              </button>
            </div>

            <iframe
              src={getPdfViewerUrl(selectedPdf)}
              className="h-[calc(88vh-52px)] w-full"
            />
          </div>
        </div>
      )}
    </main>
  );
}