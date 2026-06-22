import Link from 'next/link';
import { Download, Trash2 } from 'lucide-react';

interface Props {
  tool: any;
  isAdmin?: boolean;
  onDelete?: (tool: any) => void;
}

export function ToolCard({ tool, isAdmin = false, onDelete }: Props) {
  const imageUrl = tool.thumbnail_url || tool.file_url;

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="aspect-[4/3] bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={tool.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            대표 이미지 없음
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-[#B5121B]">
          {tool.category}
        </span>

        <h3 className="text-lg font-bold text-gray-900">
          {tool.title}
        </h3>

        {tool.description && (
          <p className="line-clamp-2 text-sm text-gray-600">
            {tool.description}
          </p>
        )}

        {tool.keywords?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tool.keywords.map((keyword: string) => (
              <span
                key={keyword}
                className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                #{keyword}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Link
            href={`/tools/${tool.id}`}
            className="flex-1 rounded-lg bg-[#B5121B] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[#8F1118]"
          >
            상세 보기
          </Link>

          {tool.file_url && (
            <a
              href={tool.file_url}
              download
              className="rounded-lg border px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              <Download size={16} />
            </a>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => onDelete?.(tool)}
              className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
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