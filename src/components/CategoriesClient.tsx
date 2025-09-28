"use client";

import React from 'react';
import { useCategoriesStore } from '@/stores/useCategoriesStore';

export default function CategoriesClient() {
  const categories = useCategoriesStore(state => state.categories);
  const createCategory = useCategoriesStore(state => state.createCategory);
  const createSubcategory = useCategoriesStore(state => state.createSubcategory);
  const deleteSubcategory = useCategoriesStore(state => state.deleteSubcategory);

  const [newCatName, setNewCatName] = React.useState('');
  const [newSubName, setNewSubName] = React.useState('');
  const [activeCat, setActiveCat] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (categories.length > 0 && activeCat === null) setActiveCat(categories[0].id);
  }, [categories, activeCat]);

  function onAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    createCategory({ name: newCatName.trim() });
    setNewCatName('');
    persist()
  }

  function onAddSubcategory(e: React.FormEvent) {
    e.preventDefault();
    if (!activeCat || !newSubName.trim()) return;
    createSubcategory(activeCat, { name: newSubName.trim() });
    setNewSubName('');
    persist()
  }

  async function persist() {
    try {
      await fetch('/api/categories', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(categories) })
    } catch {
      // ignore persistence errors for now
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Categories</h2>

      <form onSubmit={onAddCategory} className="flex gap-2 mb-4">
        <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="New main category" className="border px-3 py-2 rounded flex-1" />
        <button type="submit" className="bg-samsung-blue text-white px-4 py-2 rounded">Add</button>
      </form>

      <div className="flex gap-4">
        <div className="w-1/3">
          <ul>
            {categories.map(c => (
              <li key={c.id} className={`p-2 cursor-pointer rounded ${activeCat === c.id ? 'bg-gray-100' : ''}`} onClick={() => setActiveCat(c.id)}>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-gray-600">{c.subcategories.length} subcategories</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold">Subcategories</h3>
          <form onSubmit={onAddSubcategory} className="flex gap-2 my-2">
            <input value={newSubName} onChange={e => setNewSubName(e.target.value)} placeholder="New subcategory" className="border px-3 py-2 rounded flex-1" />
            <button type="submit" className="bg-samsung-blue text-white px-4 py-2 rounded">Add Subcategory</button>
          </form>

          <ul>
            {categories.find(c => c.id === activeCat)?.subcategories.map(s => (
              <li key={s.id} className="px-2 py-1 border rounded mb-2 flex items-center justify-between">
                <span>{s.name}</span>
                <button className="text-red-500 text-sm" onClick={() => { if (activeCat) { deleteSubcategory(activeCat, s.id); persist(); } }}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
