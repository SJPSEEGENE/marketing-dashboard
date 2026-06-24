'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Check, Edit3, ImagePlus, Plus, Save, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { STORAGE_BUCKET } from '@/lib/constants';

interface PromotionalItem {
  id: string;
  name: string;
  category: string;
  specification: string | null;
  usage: string | null;
  image_url: string | null;
  image_path: string | null;
  stock_quantity: number;
  stock_unit: string;
  note: string | null;
  is_active: boolean;
}

export function PromotionalItemManager() {
  const [items, setItems] = useState<PromotionalItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<PromotionalItem | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editPreviewImage, setEditPreviewImage] = useState('');

  const [name, setName] = useState('');
  const [usage, setUsage] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [stockUnit, setStockUnit] = useState('개');
  const [note, setNote] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState('');

  const [loading, setLoading] = useState(false);

  async function loadItems() {
    const { data, error } = await supabase
      .from('promotional_items')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      toast.error('판촉물 목록을 불러오지 못했습니다.');
      return;
    }

    setItems((data || []) as PromotionalItem[]);
  }

  useEffect(() => {
    loadItems();
  }, []);

  const stats = useMemo(() => {
    const totalStock = items.reduce(
      (sum, item) => sum + (Number(item.stock_quantity) || 0),
      0
    );

    const lowStock = items.filter(
      (item) => Number(item.stock_quantity) <= 10
    ).length;

    return {
      count: items.length,
      totalStock,
      lowStock,
      selected: selectedIds.length
    };
  }, [items, selectedIds]);

  function getStockStatus(quantity: number) {
    if (quantity <= 10) {
      return {
        label: '재고 부족',
        className: 'bg-red-50 text-red-700 border-red-100'
      };
    }

    if (quantity <= 50) {
      return {
        label: '재고 주의',
        className: 'bg-amber-50 text-amber-700 border-amber-100'
      };
    }

    return {
      label: '재고 충분',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    };
  }

  async function uploadImage(file: File) {
    const ext = file.name.split('.').pop() || 'png';
    const path = `promotional/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

    return {
      image_url: data.publicUrl,
      image_path: path
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('판촉물명을 입력하세요.');
      return;
    }

    setLoading(true);

    try {
      let image_url = null;
      let image_path = null;

      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        image_url = uploaded.image_url;
        image_path = uploaded.image_path;
      }

      const { error } = await supabase.from('promotional_items').insert({
        name: name.trim(),
        category: '판촉물',
        specification: usage.trim() || null,
        usage: usage.trim() || null,
        image_url,
        image_path,
        stock_quantity: Number(stockQuantity) || 0,
        stock_unit: stockUnit.trim() || '개',
        note: note.trim() || null,
        is_active: true
      });

      if (error) throw error;

      toast.success('판촉물이 등록되었습니다.');

      setName('');
      setUsage('');
      setStockQuantity('0');
      setStockUnit('개');
      setNote('');
      setImageFile(null);
      setPreviewImage('');

      await loadItems();
    } catch (error) {
      console.error(error);
      toast.error('판촉물 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  }

  function startEdit(item: PromotionalItem) {
    setEditingId(item.id);
    setEditItem({ ...item });
    setEditImageFile(null);
    setEditPreviewImage(item.image_url || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditItem(null);
    setEditImageFile(null);
    setEditPreviewImage('');
  }

  function updateEditItem(key: keyof PromotionalItem, value: any) {
    if (!editItem) return;

    setEditItem({
      ...editItem,
      [key]: value
    });
  }

  async function saveEdit() {
    if (!editItem) return;

    if (!editItem.name.trim()) {
      toast.error('판촉물명을 입력하세요.');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = editItem.image_url;
      let imagePath = editItem.image_path;

      if (editImageFile) {
        if (editItem.image_path) {
          await supabase.storage.from(STORAGE_BUCKET).remove([editItem.image_path]);
        }

        const uploaded = await uploadImage(editImageFile);
        imageUrl = uploaded.image_url;
        imagePath = uploaded.image_path;
      }

      const { error } = await supabase
        .from('promotional_items')
        .update({
          name: editItem.name.trim(),
          specification: editItem.usage?.trim() || null,
          usage: editItem.usage?.trim() || null,
          image_url: imageUrl,
          image_path: imagePath,
          stock_quantity: Number(editItem.stock_quantity) || 0,
          stock_unit: editItem.stock_unit?.trim() || '개',
          note: editItem.note?.trim() || null
        })
        .eq('id', editItem.id);

      if (error) throw error;

      toast.success('수정사항이 저장되었습니다.');
      cancelEdit();
      await loadItems();
    } catch (error) {
      console.error(error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function softDelete(ids: string[]) {
    if (ids.length === 0) {
      toast.error('삭제할 판촉물을 선택하세요.');
      return;
    }

    const ok = confirm(
`선택한 판촉물 ${ids.length}개를 삭제하시겠습니까?

※ 실제 삭제가 아니라 숨김 처리됩니다.`
    );

    if (!ok) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('promotional_items')
        .update({ is_active: false })
        .in('id', ids);

      if (error) throw error;

      toast.success('삭제 처리되었습니다.');
      setSelectedIds([]);
      cancelEdit();
      await loadItems();
    } catch (error) {
      console.error(error);
      toast.error('삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">등록 품목</p>
          <p className="mt-1 text-3xl font-extrabold text-[#B5121B]">
            {stats.count}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">총 재고 수량</p>
          <p className="mt-1 text-3xl font-extrabold text-[#B5121B]">
            {stats.totalStock}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">재고 10개 이하</p>
          <p className="mt-1 text-3xl font-extrabold text-[#B5121B]">
            {stats.lowStock}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">선택 품목</p>
          <p className="mt-1 text-3xl font-extrabold text-[#B5121B]">
            {stats.selected}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">판촉물 신규 등록</h2>

        <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="rounded-2xl border border-dashed bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              대표 이미지
            </p>

            <div className="flex h-56 items-center justify-center overflow-hidden rounded-xl bg-white">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="판촉물 미리보기"
                  className="h-full w-full object-contain p-3"
                />
              ) : (
                <div className="text-center text-sm text-slate-400">
                  <ImagePlus className="mx-auto mb-2 h-8 w-8" />
                  이미지 첨부
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              className="mt-3 w-full text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setImageFile(file);
                setPreviewImage(URL.createObjectURL(file));
              }}
            />
          </div>

          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="판촉물명"
                className="rounded-lg border px-3 py-3 text-sm"
              />

              <input
                value={usage}
                onChange={(e) => setUsage(e.target.value)}
                placeholder="용도 예: 거래처 증정용"
                className="rounded-lg border px-3 py-3 text-sm"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_120px]">
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="재고 수량"
                className="rounded-lg border px-3 py-3 text-sm"
              />

              <input
                value={stockUnit}
                onChange={(e) => setStockUnit(e.target.value)}
                placeholder="단위"
                className="rounded-lg border px-3 py-3 text-center text-sm font-semibold"
              />
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="비고"
              className="min-h-28 w-full rounded-lg border px-3 py-3 text-sm"
            />

            <button
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B5121B] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              판촉물 등록
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">판촉물 재고 현황</h2>
            <p className="mt-1 text-sm text-slate-500">
              기본 화면은 조회 전용입니다. 편집 버튼을 눌러 수정 후 저장하세요.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              <Check className="h-4 w-4" />
              {selectedIds.length === items.length && items.length > 0
                ? '전체 해제'
                : '전체 선택'}
            </button>

            <button
              type="button"
              onClick={() => softDelete(selectedIds)}
              disabled={loading || selectedIds.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
              선택 삭제
            </button>

            <button
              type="button"
              onClick={() => softDelete(items.map((item) => item.id))}
              disabled={loading || items.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
              전체 삭제
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const status = getStockStatus(Number(item.stock_quantity) || 0);
            const isEditing = editingId === item.id;
            const source = isEditing && editItem ? editItem : item;

            return (
              <div
                key={item.id}
                className="flex overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex w-full flex-col">
                  <div className="relative flex h-44 items-center justify-center bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="absolute left-3 top-3 h-4 w-4"
                    />

                    {source.image_url || editPreviewImage ? (
                      <img
                        src={isEditing ? editPreviewImage : source.image_url || ''}
                        alt={source.name}
                        className="h-full w-full object-contain p-4"
                      />
                    ) : (
                      <div className="text-center text-xs text-slate-400">
                        <ImagePlus className="mx-auto mb-2 h-7 w-7" />
                        이미지 없음
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    {isEditing && editItem ? (
                      <>
                        <input
                          value={editItem.name}
                          onChange={(e) => updateEditItem('name', e.target.value)}
                          className="mb-2 rounded-lg border px-3 py-2 text-sm font-bold"
                          placeholder="판촉물명"
                        />

                        <input
                          value={editItem.usage || ''}
                          onChange={(e) => updateEditItem('usage', e.target.value)}
                          className="mb-2 rounded-lg border px-3 py-2 text-sm"
                          placeholder="용도"
                        />

                        <div className="mb-2 grid grid-cols-[1fr_70px] gap-2">
                          <input
                            type="number"
                            value={editItem.stock_quantity}
                            onChange={(e) =>
                              updateEditItem(
                                'stock_quantity',
                                Number(e.target.value) || 0
                              )
                            }
                            className="min-w-0 rounded-lg border px-3 py-2 text-sm font-bold text-[#B5121B]"
                            placeholder="재고"
                          />

                          <input
                            value={editItem.stock_unit || '개'}
                            onChange={(e) =>
                              updateEditItem('stock_unit', e.target.value)
                            }
                            className="rounded-lg border bg-slate-50 px-2 py-2 text-center text-sm font-semibold"
                            placeholder="단위"
                          />
                        </div>

                        <textarea
                          value={editItem.note || ''}
                          onChange={(e) => updateEditItem('note', e.target.value)}
                          className="mb-2 min-h-20 rounded-lg border px-3 py-2 text-sm"
                          placeholder="비고"
                        />

                        <input
                          type="file"
                          accept="image/*"
                          className="mb-3 text-xs"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setEditImageFile(file);
                            setEditPreviewImage(URL.createObjectURL(file));
                          }}
                        />

                        <div className="mt-auto grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
                          >
                            <Save className="h-4 w-4" />
                            저장
                          </button>

                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold"
                          >
                            <X className="h-4 w-4" />
                            취소
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-bold ${status.className}`}
                          >
                            {status.label}
                          </span>

                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold hover:bg-slate-50"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            편집
                          </button>
                        </div>

                        <h3 className="line-clamp-2 min-h-[48px] text-lg font-extrabold text-slate-950">
                          {item.name}
                        </h3>

                        <p className="mt-2 min-h-[40px] text-sm leading-5 text-slate-600">
                          {item.usage || item.specification || '용도 미입력'}
                        </p>

                        <div className="mt-4 rounded-xl bg-red-50 p-3">
                          <p className="text-xs font-semibold text-red-700">
                            현재 재고
                          </p>
                          <p className="mt-1 text-2xl font-extrabold text-[#B5121B]">
                            {Number(item.stock_quantity) || 0}
                            <span className="ml-1 text-sm font-bold">
                              {item.stock_unit || '개'}
                            </span>
                          </p>
                        </div>

                        <p className="mt-3 line-clamp-3 min-h-[48px] text-xs leading-5 text-slate-500">
                          {item.note || '비고 없음'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="col-span-full rounded-xl border bg-slate-50 p-10 text-center text-sm text-slate-500">
              등록된 판촉물이 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}