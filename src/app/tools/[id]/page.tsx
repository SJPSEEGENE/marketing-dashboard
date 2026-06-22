'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { supabase } from '@/lib/supabase';

export default function ToolDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [tool, setTool] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      const { data: toolData } = await supabase
        .from('marketing_tools')
        .select('*')
        .eq('id', id)
        .single();

      const { data: fileData } = await supabase
        .from('marketing_tool_files')
        .select('*')
        .eq('tool_id', id)
        .order('sort_order', { ascending: true });

      setTool(toolData);
      setFiles(fileData || []);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  function toggleSelect(fileId: string) {
    setSelectedIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  }

  function getSelectedFiles() {
    return files.filter((file) => selectedIds.includes(file.id));
  }

  async function imageToPdfDownload(file: any) {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = file.file_url;

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const pdf = new jsPDF({
      orientation: image.width > image.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [image.width, image.height]
    });

    pdf.addImage(image, 'JPEG', 0, 0, image.width, image.height);

    const label = file.file_label || file.file_name || 'marketing-tool';
    pdf.save(`${label}.pdf`);
  }

  async function downloadSelectedAsPdf() {
    const selectedFiles = getSelectedFiles();

    if (selectedFiles.length === 0) {
      alert('다운로드할 자료를 선택하세요.');
      return;
    }

    setDownloading(true);

    try {
      for (const file of selectedFiles) {
        if (file.file_type === 'image') {
          await imageToPdfDownload(file);
        } else {
          window.open(file.file_url, '_blank');
        }
      }
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-gray-500">자료를 불러오는 중입니다.</p>
      </main>
    );
  }

  if (!tool) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/" className="text-sm font-semibold text-blue-700">
          ← 목록으로
        </Link>
        <p className="mt-8 text-gray-600">자료를 찾을 수 없습니다.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <Link href="/" className="text-sm font-semibold text-blue-700">
        ← 목록으로
      </Link>

      <section className="mt-5 rounded-2xl border bg-white p-6 shadow-sm">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {tool.category}
        </span>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          {tool.title}
        </h1>

        {tool.description && (
          <p className="mt-3 text-gray-600">{tool.description}</p>
        )}
      </section>

      <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {tool.category === '검사홍보'
                ? '제공 가능한 마케팅 툴'
                : '세부 미리보기'}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              필요한 자료를 선택하여 PDF 형식으로 다운로드할 수 있습니다.
            </p>
          </div>

          <button
            type="button"
            onClick={downloadSelectedAsPdf}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Download size={16} />
            {downloading ? '다운로드 중...' : '선택 자료 PDF 다운로드'}
          </button>
        </div>

        {files.length === 0 ? (
          <div className="rounded-xl border bg-gray-50 p-6 text-sm text-gray-500">
            등록된 세부 파일이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {files.map((file, index) => {
              const label =
                tool.category === '검사홍보'
                  ? file.file_label || '기타'
                  : `세부 자료 ${index + 1}`;

              const checked = selectedIds.includes(file.id);

              return (
                <div
                  key={file.id}
                  className={`overflow-hidden rounded-xl border bg-gray-50 ${
                    checked ? 'ring-2 ring-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between border-b bg-slate-900 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-white">
                      {label}
                    </p>

                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(file.id)}
                    />
                  </div>

                  <div className="flex h-48 items-center justify-center bg-white">
                    {file.file_type === 'image' ? (
                      <img
                        src={file.file_url}
                        alt={file.file_name}
                        onClick={() => setSelectedImage(file.file_url)}
                        className="max-h-44 max-w-full cursor-zoom-in object-contain transition hover:scale-105"
                      />
                    ) : (
                      <div className="px-4 text-center text-sm text-gray-600">
                        PDF 파일
                        <br />
                        {file.file_name}
                      </div>
                    )}
                  </div>

                  <div className="border-t bg-white p-3">
                    <p className="truncate text-xs text-gray-500">
                      {file.file_name}
                    </p>

                    <button
                      type="button"
                      onClick={() => imageToPdfDownload(file)}
                      className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                    >
                      <Download size={13} />
                      PDF 다운로드
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          마케팅 툴 설명
        </h2>

        <div className="mt-4 rounded-xl bg-gray-50 p-5 text-sm leading-6 text-gray-600">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
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
    </main>
  );
}