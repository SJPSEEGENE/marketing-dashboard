'use client';

import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PdfPreviewProps {
  url: string;
  mode?: 'thumbnail' | 'full';
}

export function PdfPreview({ url, mode = 'thumbnail' }: PdfPreviewProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [width, setWidth] = useState(mode === 'thumbnail' ? 180 : 320);

  useEffect(() => {
    function updateWidth() {
      if (!wrapRef.current) return;

      const containerWidth = wrapRef.current.clientWidth;

      if (mode === 'thumbnail') {
        setWidth(Math.min(containerWidth - 16, 180));
      } else {
        setWidth(Math.min(containerWidth - 16, 760));
      }
    }

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, [mode]);

  return (
    <div ref={wrapRef} className="w-full">
      <Document
        file={url}
        loading={
          <div className="flex h-40 items-center justify-center text-xs text-slate-400">
            PDF 불러오는 중
          </div>
        }
        error={
          <div className="flex h-40 items-center justify-center text-xs text-red-500">
            PDF 미리보기를 불러오지 못했습니다.
          </div>
        }
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {mode === 'thumbnail' ? (
          <div className="flex justify-center">
            <Page
              pageNumber={1}
              width={width}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </div>
        ) : (
          <div className="space-y-5">
            {Array.from(new Array(numPages), (_, index) => (
              <div
                key={`page_${index + 1}`}
                className="rounded-xl border bg-white p-2 shadow-sm"
              >
                <p className="mb-2 text-center text-xs font-semibold text-slate-500">
                  {index + 1} / {numPages} page
                </p>

                <div className="flex justify-center overflow-hidden">
                  <Page
                    pageNumber={index + 1}
                    width={width}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Document>
    </div>
  );
}