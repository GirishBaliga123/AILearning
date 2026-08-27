'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/layout/Toast';

export default function TransactionForm({ transaction, isEdit = false }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    amount: transaction?.amount || '', description: transaction?.description || '',
    categoryId: transaction?.categoryId || '',
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    type: transaction?.type || 'EXPENSE',
  });

  useEffect(() => { fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {}); }, []);

  function validate() {
    const e = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) e.amount = 'Amount must be greater than 0';
    if (!formData.description?.trim()) e.description = 'Description is required';
    if (!formData.categoryId) e.categoryId = 'Please select a category';
    if (!formData.date) e.date = 'Date is required';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault(); setErrors({});
    const v = validate(); if (Object.keys(v).length > 0) { setErrors(v); return; }
    setLoading(true);
    try {
      const url = isEdit ? `/api/transactions/${transaction.id}` : '/api/transactions';
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount), categoryId: parseInt(formData.categoryId) }) });
      const data = await res.json();
      if (!res.ok) { if (data.errors) setErrors(data.errors); else addToast(data.error || 'Something went wrong', 'error'); return; }
      addToast(isEdit ? 'Transaction updated' : 'Transaction added', 'success');
      router.push('/transactions'); router.refresh();
    } catch { addToast('Something went wrong', 'error'); } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button type="button" onClick={() => setFormData({ ...formData, type: 'EXPENSE' })} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${formData.type === 'EXPENSE' ? 'bg-red-50 text-red-700 border-r border-gray-300' : 'text-gray-600 hover:bg-gray-50 border-r border-gray-300'}`}>\ud83d\udcb8 Expense</button>
          <button type="button" onClick={() => setFormData({ ...formData, type: 'INCOME' })} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${formData.type === 'INCOME' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>\ud83d\udcb5 Income</button>
        </div>
      </div>
      <Input id="amount" label="Amount (\u20b9)" type="number" step="0.01" min="0.01" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} error={errors.amount} />
      <Input id="description" label="Description" placeholder="e.g., Grocery shopping" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} error={errors.description} />
      <div className="space-y-1">
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Category</label>
        <select id="categoryId" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.categoryId ? 'border-red-300' : 'border-gray-300'}`}>
          <option value="">Select a category</option>
          {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
        </select>
        {errors.categoryId && <p className="text-sm text-red-600">{errors.categoryId}</p>}
      </div>
      <Input id="date" label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} error={errors.date} />
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={loading}>{isEdit ? 'Update Transaction' : 'Add Transaction'}</Button>
        <Button type="button" variant="secondary" onClick={() => router.push('/transactions')}>Cancel</Button>
      </div>
    </form>
  );
}
