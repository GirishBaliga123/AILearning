'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/layout/Toast';

export default function BudgetForm({ month, year, onSaved }) {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ categoryId: '', amountLimit: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {}); }, []);

  function validate() {
    const e = {};
    if (!formData.categoryId) e.categoryId = 'Please select a category';
    if (!formData.amountLimit || parseFloat(formData.amountLimit) <= 0) e.amountLimit = 'Budget limit must be greater than 0';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault(); setErrors({});
    const v = validate(); if (Object.keys(v).length > 0) { setErrors(v); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/budgets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoryId: parseInt(formData.categoryId), amountLimit: parseFloat(formData.amountLimit), month, year }) });
      const data = await res.json();
      if (!res.ok) { if (data.errors) setErrors(data.errors); else addToast(data.error || 'Failed', 'error'); return; }
      addToast('Budget saved', 'success'); setFormData({ categoryId: '', amountLimit: '' }); onSaved?.();
    } catch { addToast('Something went wrong', 'error'); } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
      <div className="flex-1 space-y-1">
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.categoryId ? 'border-red-300' : 'border-gray-300'}`}>
          <option value="">Select category</option>
          {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
        </select>
        {errors.categoryId && <p className="text-xs text-red-600">{errors.categoryId}</p>}
      </div>
      <div className="flex-1"><Input id="amountLimit" label="Monthly Limit (\u20b9)" type="number" step="0.01" min="1" placeholder="e.g., 5000" value={formData.amountLimit} onChange={(e) => setFormData({ ...formData, amountLimit: e.target.value })} error={errors.amountLimit} /></div>
      <Button type="submit" loading={loading}>Set Budget</Button>
    </form>
  );
}
