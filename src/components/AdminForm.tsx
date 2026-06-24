'use client';

import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { STORAGE_BUCKET } from '@/lib/constants';
import { getActiveCategories, type Category } from '@/lib/categories';
import { FileUploader } from './FileUploader';
import type { MarketingTool } from '@/types/tool';

const PROMOTION_TYPES = [
  '리플렛',
  '브로슈어',
  '뉴스레터',
  '1P 안내자료',
  '배너',
  '탁상배너',
  '포스터',
  '기타'
];

export function AdminForm({
  initialTool,
  initialDetailFiles = [],
  onSaved
}: {
  initialTool?: MarketingTool;
  initialDetailFiles?: any[];
  onSaved?: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(initialTool?.title || '');
  const [category, setCategory] = useState(initialTool?.category || '');
  const [keywords, setKeywords] = useState((initialTool?.keywords || []).join(', '));
  const [description, setDescription] = useState(initialTool?.description || '');

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [detailFiles, setDetailFiles] = useState<File[]>([]);
  const [fileLabels, setFileLabels] = useState<string[]>([]);
  const [fileStocks, setFileStocks] = useState<string[]>([]);
  const [fileUnits, setFileUnits] = useState<string[]>([]);
  const [existingFiles, setExistingFiles] = useState<any[]>(initialDetailFiles);

  const [loading, setLoading] = useState(false);

  async function loadCategories() {
    const categoryList = await getActiveCategories();
    setCategories(categoryList);

    if (!initialTool && !category && categoryList.length > 0) {
      setCategory(categoryList[0].name);
    }
  }

  useEffect(() => {
    loadCategories();

    function handleCategoriesUpdated() {
      loadCategories();
    }

    window.addEventListener('categories-updated', handleCategoriesUpdated);

    return () => {
      window.removeEventListener('categories-updated', handleCategoriesUpdated);
    };
  }, []);

  function handleDetailFiles(files: File[]) {
    const maxNewFiles = 5 - existingFiles.length;
    const nextFiles = [...detailFiles, ...files].slice(0, maxNewFiles);

    if (existingFiles.length + detailFiles.length + files.length > 5) {
      toast.error('세부 자료는 대표 이미지를 제외하고 최대 5개까지 등록할 수 있습니다.');
    }

    setDetailFiles(nextFiles);

    setFileLabels((prev) => {
      const next = [...prev];
      while (next.length < nextFiles.length) next.push('기타');
      return next.slice(0, nextFiles.length);
    });

    setFileStocks((prev) => {
      const next = [...prev];
      while (next.length < nextFiles.length) next.push('0');
      return next.slice(0, nextFiles.length);
    });

    setFileUnits((prev) => {
      const next = [...prev];
      while (next.length < nextFiles.length) next.push('부');
      return next.slice(0, nextFiles.length);
    });
  }

  function removeDetailFile(index: number) {
    setDetailFiles((prev) => prev.filter((_, i) => i !== index));
    setFileLabels((prev) => prev.filter((_, i) => i !== index));
    setFileStocks((prev) => prev.filter((_, i) => i !== index));
    setFileUnits((prev) => prev.filter((_, i) => i !== index));
  }

  function moveDetailFile(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= detailFiles.length) return;

    const newFiles = [...detailFiles];
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];

    const newLabels = [...fileLabels];
    [newLabels[index], newLabels[targetIndex]] = [newLabels[targetIndex], newLabels[index]];

    const newStocks = [...fileStocks];
    [newStocks[index], newStocks[targetIndex]] = [newStocks[targetIndex], newStocks[index]];

    const newUnits = [...fileUnits];
    [newUnits[index], newUnits[targetIndex]] = [newUnits[targetIndex], newUnits[index]];

    setDetailFiles(newFiles);
    setFileLabels(newLabels);
    setFileStocks(newStocks);
    setFileUnits(newUnits);
  }

  function moveExistingFile(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= existingFiles.length) return;

    const next = [...existingFiles];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setExistingFiles(next);
  }

  async function updateExistingFileStock(file: any, value: string) {
    const nextStock = Number(value) || 0;

    const { error } = await supabase
      .from('marketing_tool_files')
      .update({ stock_quantity: nextStock })
      .eq('id', file.id);

    if (error) {
      console.error(error);
      toast.error('재고 수정 중 오류가 발생했습니다.');
      return;
    }

    setExistingFiles((prev) =>
      prev.map((item) =>
        item.id === file.id ? { ...item, stock_quantity: nextStock } : item
      )
    );
  }

  async function updateExistingFileUnit(file: any, value: string) {
    const { error } = await supabase
      .from('marketing_tool_files')
      .update({ stock_unit: value || '부' })
      .eq('id', file.id);

    if (error) {
      console.error(error);
      toast.error('단위 수정 중 오류가 발생했습니다.');
      return;
    }

    setExistingFiles((prev) =>
      prev.map((item) =>
        item.id === file.id ? { ...item, stock_unit: value || '부' } : item
      )
    );
  }

  async function removeExistingFile(fileId: string) {
    const ok = confirm('해당 세부 자료를 삭제하시겠습니까?');
    if (!ok) return;

    try {
      const target = existingFiles.find((item) => item.id === fileId);

      if (target?.file_path) {
        await supabase.storage.from(STORAGE_BUCKET).remove([target.file_path]);
      }

      const { error } = await supabase
        .from('marketing_tool_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      setExistingFiles((prev) => prev.filter((item) => item.id !== fileId));
      toast.success('세부 자료가 삭제되었습니다.');
    } catch (error) {
      console.error(error);
      toast.error('삭제 중 오류가 발생했습니다.');
    }
  }

  async function uploadFile(file: File, folder: string) {
    const ext = file.name.split('.').pop() || 'png';
    const safePath = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(safePath, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(safePath);

    return {
      url: data.publicUrl,
      path: safePath,
      name: file.name,
      type: file.type === 'application/pdf' ? 'pdf' : 'image'
    };
  }

  async function updateExistingFileOrder() {
    for (let i = 0; i < existingFiles.length; i++) {
      const { error } = await supabase
        .from('marketing_tool_files')
        .update({ sort_order: i + 1 })
        .eq('id', existingFiles[i].id);

      if (error) throw error;
    }
  }

  async function checkDuplicateTitle() {
    const trimmedTitle = title.trim();

    let query = supabase
      .from('marketing_tools')
      .select('id')
      .eq('title', trimmedTitle)
      .limit(1);

    if (initialTool?.id) {
      query = query.neq('id', initialTool.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return Boolean(data && data.length > 0);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const totalDetailCount = existingFiles.length + detailFiles.length;

    if (!trimmedTitle) {
      toast.error('자료 제목을 입력하세요.');
      return;
    }

    if (!category) {
      toast.error('카테고리를 선택하세요.');
      return;
    }

    if (!initialTool && !thumbnailFile) {
      toast.error('대표 이미지를 첨부하세요.');
      return;
    }

    if (totalDetailCount < 1) {
      toast.error('세부 자료를 최소 1개 이상 등록하세요.');
      return;
    }

    if (totalDetailCount > 5) {
      toast.error('세부 자료는 최대 5개까지 등록할 수 있습니다.');
      return;
    }

    setLoading(true);

    try {
      const duplicated = await checkDuplicateTitle();

      if (duplicated) {
        toast.error('동일한 자료 제목이 이미 등록되어 있습니다.');
        setLoading(false);
        return;
      }

      let thumbnailUrl = initialTool?.thumbnail_url || '';
      let thumbnailPath = initialTool?.thumbnail_path || '';
      let thumbnailName = initialTool?.thumbnail_name || '';

      if (thumbnailFile) {
        if (initialTool?.thumbnail_path) {
          await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([initialTool.thumbnail_path]);
        }

        const uploaded = await uploadFile(thumbnailFile, 'thumbnails');
        thumbnailUrl = uploaded.url;
        thumbnailPath = uploaded.path;
        thumbnailName = uploaded.name;
      }

      const payload = {
        title: trimmedTitle,
        category,
        keywords: keywords
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        description: description.trim() || null,
        thumbnail_url: thumbnailUrl,
        thumbnail_path: thumbnailPath,
        thumbnail_name: thumbnailName
      };

      let toolId = initialTool?.id;

      if (initialTool) {
        const { error } = await supabase
          .from('marketing_tools')
          .update(payload)
          .eq('id', initialTool.id);

        if (error) throw error;

        toolId = initialTool.id;
        await updateExistingFileOrder();
      } else {
        const { data, error } = await supabase
          .from('marketing_tools')
          .insert(payload)
          .select('id')
          .single();

        if (error) throw error;

        toolId = data.id;
      }

      if (toolId && detailFiles.length > 0) {
        const currentCount = existingFiles.length;
        const uploadedFiles = [];

        for (let i = 0; i < detailFiles.length; i++) {
          const uploaded = await uploadFile(detailFiles[i], 'details');

          uploadedFiles.push({
            tool_id: toolId,
            file_name: uploaded.name,
            file_path: uploaded.path,
            file_url: uploaded.url,
            file_type: uploaded.type,
            sort_order: currentCount + i + 1,
            file_label: category === '검사홍보' ? fileLabels[i] || '기타' : null,
            stock_quantity: category === '검사홍보' ? Number(fileStocks[i]) || 0 : 0,
            stock_unit: category === '검사홍보' ? fileUnits[i] || '부' : null,
            stock_note: null
          });
        }

        const { error: fileInsertError } = await supabase
          .from('marketing_tool_files')
          .insert(uploadedFiles);

        if (fileInsertError) throw fileInsertError;
      }

      toast.success(initialTool ? '수정되었습니다.' : '등록되었습니다.');

      if (!initialTool) {
        setTitle('');
        setKeywords('');
        setDescription('');
        setThumbnailFile(null);
        setDetailFiles([]);
        setFileLabels([]);
        setFileStocks([]);
        setFileUnits([]);

        if (categories.length > 0) {
          setCategory(categories[0].name);
        }
      }

      onSaved?.();
    } catch (error) {
      console.error(error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="자료 제목"
        className="w-full rounded-lg border px-3 py-2"
      />

      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setFileLabels(detailFiles.map(() => '기타'));
        }}
        className="w-full rounded-lg border px-3 py-2"
      >
        {categories.length === 0 && (
          <option value="">등록된 분류가 없습니다.</option>
        )}

        {categories.map((item) => (
          <option key={item.id} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>

      <input
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder="키워드 (쉼표로 구분)"
        className="w-full rounded-lg border px-3 py-2"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="마케팅 툴 설명"
        className="min-h-24 w-full rounded-lg border px-3 py-2"
      />

      {initialTool?.thumbnail_url && !thumbnailFile && (
        <div className="rounded-lg border bg-white p-3">
          <p className="mb-2 text-sm font-semibold text-gray-700">
            현재 대표 이미지
          </p>
          <img
            src={initialTool.thumbnail_url}
            alt="대표 이미지"
            className="h-40 rounded border object-contain"
          />
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-semibold text-gray-700">
          {initialTool ? '대표 이미지 변경' : '대표 이미지'}
        </p>
        <FileUploader file={thumbnailFile} onChange={setThumbnailFile} />
      </div>

      {existingFiles.length > 0 && (
        <div className="space-y-3 rounded-xl border bg-slate-50 p-4">
          <p className="font-semibold">현재 등록된 세부 자료</p>

          <div className="space-y-2">
            {existingFiles.map((file, index) => (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg border bg-white p-3"
              >
                <div className="h-16 w-16 overflow-hidden rounded border bg-gray-100">
                  {file.file_type === 'image' ? (
                    <img
                      src={file.file_url}
                      alt={file.file_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-500">
                      PDF
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {file.file_label || `세부 자료 ${index + 1}`}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {file.file_name}
                  </p>

                  {category === '검사홍보' && (
                    <div className="mt-2 grid grid-cols-[1fr_70px] gap-2">
                      <input
                        type="number"
                        value={file.stock_quantity || 0}
                        onChange={(e) => updateExistingFileStock(file, e.target.value)}
                        className="rounded border px-2 py-1 text-xs"
                        placeholder="재고"
                      />

                      <input
                        value={file.stock_unit || '부'}
                        onChange={(e) => updateExistingFileUnit(file, e.target.value)}
                        className="rounded border px-2 py-1 text-xs"
                        placeholder="단위"
                      />
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveExistingFile(index, 'up')}
                    className="rounded bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 disabled:opacity-30"
                  >
                    앞으로
                  </button>

                  <button
                    type="button"
                    disabled={index === existingFiles.length - 1}
                    onClick={() => moveExistingFile(index, 'down')}
                    className="rounded bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 disabled:opacity-30"
                  >
                    뒤로
                  </button>

                  <button
                    type="button"
                    onClick={() => removeExistingFile(file.id)}
                    className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            순서 또는 재고를 변경한 뒤 아래의 수정 저장 버튼을 누르면 반영됩니다.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">
          세부 이미지 일괄 등록
        </p>

        <FileUploader
          multiple
          files={detailFiles}
          onFilesChange={handleDetailFiles}
        />

        {detailFiles.length > 0 && (
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="mb-2 text-sm font-semibold text-gray-700">
              미리보기 및 순서 배치
            </p>

            <div className="space-y-2">
              {detailFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 rounded border bg-white p-2 text-sm"
                >
                  <div className="h-14 w-14 overflow-hidden rounded border bg-gray-100">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-500">
                        PDF
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {index + 1}. {file.name}
                    </p>

                    {category === '검사홍보' && (
                      <div className="mt-2 space-y-2">
                        <select
                          value={fileLabels[index] || '기타'}
                          onChange={(e) => {
                            const next = [...fileLabels];
                            next[index] = e.target.value;
                            setFileLabels(next);
                          }}
                          className="w-full rounded border px-2 py-1 text-xs"
                        >
                          {PROMOTION_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>

                        <div className="grid grid-cols-[1fr_70px] gap-2">
                          <input
                            type="number"
                            value={fileStocks[index] || '0'}
                            onChange={(e) => {
                              const next = [...fileStocks];
                              next[index] = e.target.value;
                              setFileStocks(next);
                            }}
                            className="rounded border px-2 py-1 text-xs"
                            placeholder="재고"
                          />

                          <input
                            value={fileUnits[index] || '부'}
                            onChange={(e) => {
                              const next = [...fileUnits];
                              next[index] = e.target.value;
                              setFileUnits(next);
                            }}
                            className="rounded border px-2 py-1 text-xs"
                            placeholder="단위"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => moveDetailFile(index, 'up')}
                    className="rounded bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    앞으로
                  </button>

                  <button
                    type="button"
                    onClick={() => moveDetailFile(index, 'down')}
                    className="rounded bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    뒤로
                  </button>

                  <button
                    type="button"
                    onClick={() => removeDetailFile(index)}
                    className="rounded border px-2 py-1 text-xs text-red-600"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-800">
        <p>등록 조건</p>
        <p>- 자료 제목, 대표 이미지, 세부 자료 1개 이상 필수</p>
        <p>- 세부 자료는 최대 5개까지 등록 가능</p>
        <p>- 동일한 자료 제목은 중복 등록할 수 없음</p>
        <p>- 검사홍보 자료는 세부 자료별 재고 수량을 입력할 수 있음</p>
      </div>

      <button
        disabled={loading}
        className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? '저장 중...' : initialTool ? '수정 저장' : '신규 등록'}
      </button>
    </form>
  );
}