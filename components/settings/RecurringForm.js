'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/layout/Toast';

export default function RecurringForm({ onSaved }) {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ description: '', amount: '', categoryId: '', dayOfMonth: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {}); }, []);

  function validate() {
    const e = {};
    if (!formData.description?.trim()) e.description = 'Description is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) e.amount = 'Amount must be greater than 0';
    if (!formData.categoryId) e.categoryId = 'Please select a category';
    if (!formData.dayOfMonth || parseInt(formData.dayOfMonth) < 1 || parseInt(formData.dayOfMonth) > 28) e.dayOfMonth = 'Day must be between 1 and 28';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault(); setErrors({});
    const v = validate(); if (Object.keys(v).length > 0) { setErrors(v); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/recurring', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: formData.description.trim(), amount: parseFloat(formData.amount), categoryId: parseInt(formData.categoryId), dayOfMonth: parseInt(formData.dayOfMonth) }) });
      const data = await res.json();
      if (!res.ok) { if (data.errors) setErrors(data.errors); else addToast(data.error || 'Failed', 'error'); return; }
      addToast('Recurring expense added', 'success'); setFormData({ description: '', amount: '', categoryId: '', dayOfMonth: '' }); onSaved?.();
    } catch { addToast('Something went wrong', 'error'); } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="description" label="Description" placeholder="e.g., Monthly rent" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} error={errors.description} />
        <Input id="amount" label="Amount (\u20b9)" type="number" step="0.01" min="1" placeholder="e.g., 15000" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} error={errors.amount} />
        <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Category</label><select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.categoryId ? 'border-red-300' : 'border-gray-300'}`}><option value="">Select category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select>{errors.categoryId && <p className="text-xs text-red-600">{errors.categoryId}</p>}</div>
        <Input id="dayOfMonth" label="Day of Month (1-28)" type="number" min="1" max="28" placeholder="e.g., 1" value={formData.dayOfMonth} onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })} error={errors.dayOfMonth} />
      </div>
      <Button type="submit" loading={loading}>Add Recurring Expense</Button>
    </form>
  );
}
