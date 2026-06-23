import Link from 'next/link';
import { ArrowRight, Trash2 } from 'lucide-react';

interface Props {
  tool: any;
  isAdmin?: boolean;
  onDelete?: (tool: any) => void;
}

export function ToolCard({ tool, isAdmin = false, onDelete }: Props) {
  const imageUrl = tool.thumbnail_url || tool.file_url;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-40 items-center justify-center bg-gradient-to-b from-white to-slate-50 px-3 pb-4 pt-8 md:h-56 md:px-5 md:pb-6 md:pt-10">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={tool.title}
            className="max-h-full max-w-full object-contain transition duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            대표 이미지 없음
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col border-t bg-white p-3 md:p-5">
        <span className="mb-2 inline-flex w-fit rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-[#B5121B] md:mb-3 md:px-3 md:text-xs">
          {tool.category}
        </span>

        <h3 className="line-clamp-2 min-h-[38px] text-sm font-extrabold leading-snug text-slate-950 md:min-h-[52px] md:text-xl">
          {tool.title}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[38px] text-[11px] leading-5 text-slate-600 md:mt-3 md:min-h-[44px] md:text-sm">
          {tool.description || '등록된 마케팅 툴의 세부 자료를 확인할 수 있습니다.'}
        </p>

        {tool.keywords?.length > 0 && (
          <div className="mt-3 flex min-h-[24px] flex-wrap gap-1 md:mt-4">
            {tool.keywords.slice(0, 3).map((keyword: string) => (
              <span
                key={keyword}
                className="rounded-lg bg-slate-100 px-1.5 py-1 text-[9px] text-slate-600 md:px-2 md:text-xs"
              >
                #{keyword}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-4 md:pt-5">
          <Link
            href={`/tools/${tool.id}`}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#B5121B] px-2 py-2 text-xs font-bold text-white transition hover:bg-[#8F1118] md:gap-2 md:px-4 md:py-3 md:text-sm"
          >
            상세 보기
            <ArrowRight size={14} />
          </Link>

          {isAdmin && (
            <button
              type="button"
              onClick={() => onDelete?.(tool)}
              className="rounded-xl border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
              title="삭제"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}