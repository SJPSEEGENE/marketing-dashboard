'use client';

import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PromotionalItem {
  id: string;
  name: string;
  category: string;
  specification: string | null;
  stock_quantity: number;
  stock_unit: string;
  note: string | null;
  is_active: boolean;
}

export function PromotionalItemManager() {
  const [items, setItems] = useState<PromotionalItem[]>([]);
  const [name, setName] = useState('');
  const [specification, setSpecification] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [stockUnit, setStockUnit] = useState('개');
  const [note, setNote] = useState('');
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('판촉물명을 입력하세요.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('promotional_items').insert({
        name: name.trim(),
        category: '판촉물',
        specification: specification.trim() || null,
        stock_quantity: Number(stockQuantity) || 0,
        stock_unit: stockUnit.trim() || '개',
        note: note.trim() || null,
        is_active: true
      });

      if (error) throw error;

      toast.success('판촉물이 등록되었습니다.');

      setName('');
      setSpecification('');
      setStockQuantity('0');
      setStockUnit('개');
      setNote('');

      loadItems();
    } catch (error) {
      console.error(error);
      toast.error('판촉물 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function updateStock(item: PromotionalItem, value: string) {
    const nextStock = Number(value) || 0;

    const { error } = await supabase
      .from('promotional_items')
      .update({ stock_quantity: nextStock })
      .eq('id', item.id);

    if (error) {
      console.error(error);
      toast.error('재고 수정 중 오류가 발생했습니다.');
      return;
    }

    setItems((prev) =>
      prev.map((target) =>
        target.id === item.id
          ? { ...target, stock_quantity: nextStock }
          : target
      )
    );
  }

  async function updateNote(item: PromotionalItem, value: string) {
    const { error } = await supabase
      .from('promotional_items')
      .update({ note: value })
      .eq('id', item.id);

    if (error) {
      console.error(error);
      toast.error('비고 수정 중 오류가 발생했습니다.');
      return;
    }

    setItems((prev) =>
      prev.map((target) =>
        target.id === item.id ? { ...target, note: value } : target
      )
    );
  }

  async function handleDelete(item: PromotionalItem) {
    const ok = confirm(
`판촉물을 삭제하시겠습니까?

품목명 : ${item.name}

※ 실제 삭제가 아니라 숨김 처리됩니다.`
    );

    if (!ok) return;

    const { error } = await supabase
      .from('promotional_items')
      .update({ is_active: false })
      .eq('id', item.id);

    if (error) {
      console.error(error);
      toast.error('삭제 중 오류가 발생했습니다.');
      return;
    }

    toast.success('판촉물이 숨김 처리되었습니다.');
    loadItems();
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold">판촉물 현황 및 재고 관리</h2>
        <p className="mt-1 text-sm text-slate-500">
          관리자 화면에서만 확인되는 판촉물 재고 관리 영역입니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-5 space-y-3 rounded-xl border bg-slate-50 p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="판촉물명"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />

        <input
          value={specification}
          onChange={(e) => setSpecification(e.target.value)}
          placeholder="규격 / 설명"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            placeholder="재고 수량"
            className="rounded-lg border px-3 py-2 text-sm"
          />

          <input
            value={stockUnit}
            onChange={(e) => setStockUnit(e.target.value)}
            placeholder="단위 예: 개, 부, 박스"
            className="rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="비고"
          className="min-h-20 w-full rounded-lg border px-3 py-2 text-sm"
        />

        <button
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#B5121B] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          판촉물 등록
        </button>
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border p-3">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{item.name}</p>
                {item.specification && (
                  <p className="mt-1 text-xs text-slate-500">
                    {item.specification}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDelete(item)}
                className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                title="삭제"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-[1fr_70px] gap-2">
              <input
                type="number"
                value={item.stock_quantity}
                onChange={(e) => updateStock(item, e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm"
              />

              <div className="flex items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
                {item.stock_unit || '개'}
              </div>
            </div>

            <textarea
              value={item.note || ''}
              onChange={(e) => updateNote(item, e.target.value)}
              placeholder="비고"
              className="mt-2 min-h-16 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        ))}

        {items.length === 0 && (
          <p className="rounded-xl border bg-slate-50 p-4 text-center text-sm text-slate-500">
            등록된 판촉물이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}