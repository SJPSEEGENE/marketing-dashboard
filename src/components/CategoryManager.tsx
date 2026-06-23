'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/categories';

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error(error);
      toast.error('분류 목록을 불러오지 못했습니다.');
      return;
    }

    setCategories((data || []) as Category[]);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function notifyCategoryChanged() {
    window.dispatchEvent(new Event('categories-updated'));
  }

  async function handleAdd() {
    const name = newName.trim();

    if (!name) {
      toast.error('추가할 분류명을 입력하세요.');
      return;
    }

    const duplicated = categories.some((item) => item.name === name);

    if (duplicated) {
      toast.error('이미 존재하는 분류입니다.');
      return;
    }

    setLoading(true);

    try {
      const maxOrder =
        categories.length > 0
          ? Math.max(...categories.map((item) => item.sort_order || 0))
          : 0;

      const { error } = await supabase.from('categories').insert({
        name,
        sort_order: maxOrder + 1,
        is_active: true
      });

      if (error) throw error;

      toast.success('분류가 추가되었습니다.');
      setNewName('');
      await loadCategories();
      notifyCategoryChanged();
    } catch (error) {
      console.error(error);
      toast.error('분류 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
  }

  function cancelEdit() {
    setEditingId('');
    setEditingName('');
  }

  async function handleUpdate(category: Category) {
    const name = editingName.trim();

    if (!name) {
      toast.error('분류명을 입력하세요.');
      return;
    }

    const duplicated = categories.some(
      (item) => item.id !== category.id && item.name === name
    );

    if (duplicated) {
      toast.error('이미 존재하는 분류명입니다.');
      return;
    }

    setLoading(true);

    try {
      const oldName = category.name;

      const { error: categoryError } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', category.id);

      if (categoryError) throw categoryError;

      const { error: toolError } = await supabase
        .from('marketing_tools')
        .update({ category: name })
        .eq('category', oldName);

      if (toolError) throw toolError;

      toast.success('분류명이 수정되었습니다.');
      cancelEdit();
      await loadCategories();
      notifyCategoryChanged();
    } catch (error) {
      console.error(error);
      toast.error('분류 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(category: Category) {
    const ok = confirm(
`분류를 삭제하시겠습니까?

분류명 : ${category.name}

※ 실제 삭제가 아니라 화면에서 숨김 처리됩니다.
※ 기존 자료의 카테고리 값은 유지됩니다.`
    );

    if (!ok) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', category.id);

      if (error) throw error;

      toast.success('분류가 숨김 처리되었습니다.');
      await loadCategories();
      notifyCategoryChanged();
    } catch (error) {
      console.error(error);
      toast.error('분류 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function moveCategory(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const current = categories[index];
    const target = categories[targetIndex];

    setLoading(true);

    try {
      const { error: error1 } = await supabase
        .from('categories')
        .update({ sort_order: target.sort_order })
        .eq('id', current.id);

      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from('categories')
        .update({ sort_order: current.sort_order })
        .eq('id', target.id);

      if (error2) throw error2;

      await loadCategories();
      notifyCategoryChanged();
    } catch (error) {
      console.error(error);
      toast.error('순서 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold">분류 관리</h2>
        <p className="mt-1 text-sm text-slate-500">
          자료 등록 시 사용하는 분류를 추가, 수정, 숨김 처리합니다.
        </p>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="새 분류명 입력"
          className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
        />

        <button
          type="button"
          onClick={handleAdd}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg bg-[#B5121B] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          추가
        </button>
      </div>

      <div className="space-y-2">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className="flex items-center gap-2 rounded-xl border bg-slate-50 p-3"
          >
            <div className="w-8 text-center text-xs font-semibold text-slate-400">
              {index + 1}
            </div>

            <div className="min-w-0 flex-1">
              {editingId === category.id ? (
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full rounded-lg border px-2 py-1 text-sm"
                />
              ) : (
                <p className="truncate text-sm font-semibold text-slate-800">
                  {category.name}
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={index === 0 || loading}
              onClick={() => moveCategory(index, 'up')}
              className="rounded border bg-white px-2 py-1 text-xs disabled:opacity-30"
            >
              위
            </button>

            <button
              type="button"
              disabled={index === categories.length - 1 || loading}
              onClick={() => moveCategory(index, 'down')}
              className="rounded border bg-white px-2 py-1 text-xs disabled:opacity-30"
            >
              아래
            </button>

            {editingId === category.id ? (
              <>
                <button
                  type="button"
                  onClick={() => handleUpdate(category)}
                  disabled={loading}
                  className="rounded-lg border bg-white p-2 text-blue-700 hover:bg-blue-50"
                  title="저장"
                >
                  <Save className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={loading}
                  className="rounded-lg border bg-white p-2 text-slate-600 hover:bg-slate-50"
                  title="취소"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => startEdit(category)}
                disabled={loading}
                className="rounded-lg border bg-white p-2 hover:bg-slate-50"
                title="수정"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleDelete(category)}
              disabled={loading}
              className="rounded-lg border bg-white p-2 text-red-600 hover:bg-red-50"
              title="삭제"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {categories.length === 0 && (
          <p className="rounded-xl border bg-slate-50 p-4 text-center text-sm text-slate-500">
            등록된 분류가 없습니다.
          </p>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
        <p className="font-semibold">운영 기준</p>
        <p>- 삭제는 실제 삭제가 아니라 숨김 처리됩니다.</p>
        <p>- 분류명을 수정하면 기존 자료의 분류명도 함께 변경됩니다.</p>
        <p>- 순서를 변경하면 대시보드와 등록 화면 순서도 함께 변경됩니다.</p>
      </div>
    </div>
  );
}