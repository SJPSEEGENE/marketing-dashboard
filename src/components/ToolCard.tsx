import Link from 'next/link';
import { Trash2 } from 'lucide-react';

interface Props {
  tool: any;
  isAdmin?: boolean;
  compact?: boolean;
  onDelete?: (tool: any) => void;
}

export function ToolCard({
  tool,
  isAdmin = false,
  compact = false,
  onDelete
}: Props) {
  const imageUrl = tool.thumbnail_url || tool.file_url;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div
        className={`flex items-center justify-center bg-white ${
          compact ? 'h-44 px-4 py-5' : 'h-56 px-5 py-6'
        }`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={tool.title}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            대표 이미지 없음
          </div>
        )}
      </div>

      <div
        className={`flex flex-1 flex-col border-t bg-white ${
          compact ? 'space-y-2 p-3' : 'space-y-3 p-4'
        }`}
      >
        <span className="inline-flex w-fit rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-[#B5121B]">
          {tool.category}
        </span>

        <h3
          className={`font-bold text-gray-900 ${
            compact ? 'line-clamp-2 min-h-[40px] text-sm' : 'text-lg'
          }`}
        >
          {tool.title}
        </h3>

        {!compact && tool.description && (
          <p className="line-clamp-2 text-sm text-gray-600">
            {tool.description}
          </p>
        )}

        {tool.keywords?.length > 0 && (
          <div className="flex min-h-[24px] flex-wrap gap-1">
            {tool.keywords.slice(0, compact ? 2 : 5).map((keyword: string) => (
              <span
                key={keyword}
                className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-600"
              >
                #{keyword}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-1">
          <Link
            href={`/tools/${tool.id}`}
            className="flex-1 rounded-lg bg-[#B5121B] px-3 py-2 text-center text-xs font-semibold text-white hover:bg-[#8F1118]"
          >
            상세 보기
          </Link>

          {isAdmin && (
            <button
              type="button"
              onClick={() => onDelete?.(tool)}
              className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
              title="삭제"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}