'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
  const [originalItems, setOriginalItems] = useState<PromotionalItem[]>([]);

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

    const list = (data || []) as PromotionalItem[];

    setItems(list);
    setOriginalItems(JSON.parse(JSON.stringify(list)));
  }

  useEffect(() => {
    loadItems();
  }, []);

  const changedCount = useMemo(() => {
    return items.filter((item) => {
      const origin = originalItems.find((origin) => origin.id === item.id);
      if (!origin) return false;

      return (
        origin.name !== item.name ||
        origin.specification !== item.specification ||
        origin.stock_quantity !== item.stock_quantity ||
        origin.stock_unit !== item.stock_unit ||
        origin.note !== item.note
      );
    }).length;
  }, [items, originalItems]);

async function handleSubmit(e: FormEvent) {
  e.preventDefault();

  if (!name.trim()) {
    toast.error('판촉물명을 입력하세요.');
    return;
  }

  setLoading(true);

  try {
    let imageUrl = null;
    let imagePath = null;

    if (imageFile) {
      const ext = imageFile.name.split('.').pop();

      imagePath = `promotional/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('marketing_tools')
        .upload(imagePath, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('marketing_tools')
        .getPublicUrl(imagePath);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from('promotional_items')
      .insert({
        name: name.trim(),
        category: '판촉물',

        usage: usage.trim() || null,

        image_url: imageUrl,
        image_path: imagePath,

        stock_quantity: Number(stockQuantity) || 0,
        stock_unit: stockUnit || '개',

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

    loadItems();
  } catch (error) {
    console.error(error);
    toast.error('등록 중 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
}

  function updateItem(id: string, key: keyof PromotionalItem, value: any) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]: value
            }
          : item
      )
    );
  }

  async function handleSaveAll() {
    const changedItems = items.filter((item) => {
      const origin = originalItems.find((origin) => origin.id === item.id);
      if (!origin) return false;

      return (
        origin.name !== item.name ||
        origin.specification !== item.specification ||
        origin.stock_quantity !== item.stock_quantity ||
        origin.stock_unit !== item.stock_unit ||
        origin.note !== item.note
      );
    });

    if (changedItems.length === 0) {
      toast.message('저장할 변경사항이 없습니다.');
      return;
    }

    setLoading(true);

    try {
      for (const item of changedItems) {
        const { error } = await supabase
          .from('promotional_items')
          .update({
            name: item.name.trim(),
            specification: item.specification?.trim() || null,
            stock_quantity: Number(item.stock_quantity) || 0,
            stock_unit: item.stock_unit?.trim() || '개',
            note: item.note?.trim() || null
          })
          .eq('id', item.id);

        if (error) throw error;
      }

      toast.success('변경사항이 저장되었습니다.');
      await loadItems();
    } catch (error) {
      console.error(error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item: PromotionalItem) {
    const ok = confirm(
`판촉물을 삭제하시겠습니까?

품목명 : ${item.name}

※ 실제 삭제가 아니라 숨김 처리됩니다.
※ 저장 버튼 없이 즉시 반영됩니다.`
    );

    if (!ok) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('promotional_items')
        .update({ is_active: false })
        .eq('id', item.id);

      if (error) throw error;

      toast.success('판촉물이 삭제 처리되었습니다.');
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
            {items.length}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">총 재고 수량</p>
          <p className="mt-1 text-3xl font-extrabold text-[#B5121B]">
            {items.reduce(
              (sum, item) => sum + (Number(item.stock_quantity) || 0),
              0
            )}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">재고 10개 이하</p>
          <p className="mt-1 text-3xl font-extrabold text-[#B5121B]">
            {items.filter((item) => Number(item.stock_quantity) <= 10).length}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">수정 대기</p>
          <p className="mt-1 text-3xl font-extrabold text-[#B5121B]">
            {changedCount}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">판촉물 신규 등록</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

  <div className="grid gap-4 md:grid-cols-2">

    <div className="rounded-xl border border-dashed p-4">

      <p className="mb-3 text-sm font-semibold">
        대표 이미지
      </p>

      {previewImage ? (
        <img
          src={previewImage}
          className="h-48 w-full rounded-lg object-contain"
        />
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-400">
          이미지 미리보기
        </div>
      )}

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

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="판촉물명"
        className="w-full rounded-lg border px-3 py-3"
      />

      <input
        value={usage}
        onChange={(e) => setUsage(e.target.value)}
        placeholder="용도 (예: 거래처 증정용)"
        className="w-full rounded-lg border px-3 py-3"
      />

      <div className="grid grid-cols-2 gap-3">

        <input
          type="number"
          value={stockQuantity}
          onChange={(e) => setStockQuantity(e.target.value)}
          placeholder="재고"
          className="rounded-lg border px-3 py-3"
        />

        <input
          value={stockUnit}
          onChange={(e) => setStockUnit(e.target.value)}
          placeholder="단위"
          className="rounded-lg border px-3 py-3"
        />

      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="비고"
        className="min-h-28 w-full rounded-lg border px-3 py-3"
      />

      <button
        className="w-full rounded-xl bg-[#B5121B] py-3 font-semibold text-white"
      >
        <Plus className="mr-2 inline h-4 w-4" />
        판촉물 등록
      </button>

    </div>

  </div>

</form>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">판촉물 재고 현황</h2>
            <p className="mt-1 text-sm text-slate-500">
              카드에서 내용을 수정한 뒤 저장 버튼을 눌러야 반영됩니다.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={loading || changedCount === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            변경사항 저장
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex min-h-[260px] flex-col rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <input
                  value={item.name}
                  onChange={(e) =>
                    updateItem(item.id, 'name', e.target.value)
                  }
                  className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm font-bold text-slate-900"
                  placeholder="판촉물명"
                />

                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={loading}
                  className="rounded-lg border p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
                  title="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <input
                value={item.specification || ''}
                onChange={(e) =>
                  updateItem(item.id, 'specification', e.target.value)
                }
                className="mb-3 rounded-lg border px-3 py-2 text-sm"
                placeholder="규격 / 설명"
              />

              <div className="mb-3 grid grid-cols-[1fr_70px] gap-2">
                <input
                  type="number"
                  value={item.stock_quantity}
                  onChange={(e) =>
                    updateItem(
                      item.id,
                      'stock_quantity',
                      Number(e.target.value) || 0
                    )
                  }
                  className="rounded-lg border px-3 py-2 text-sm font-bold text-[#B5121B]"
                  placeholder="재고"
                />

                <input
                  value={item.stock_unit || '개'}
                  onChange={(e) =>
                    updateItem(item.id, 'stock_unit', e.target.value)
                  }
                  className="rounded-lg border bg-slate-50 px-3 py-2 text-center text-sm font-semibold"
                  placeholder="단위"
                />
              </div>

              <textarea
                value={item.note || ''}
                onChange={(e) =>
                  updateItem(item.id, 'note', e.target.value)
                }
                placeholder="비고"
                className="mt-auto min-h-24 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          ))}

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