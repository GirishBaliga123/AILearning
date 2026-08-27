'use client';

import { useState, useEffect } from 'react';

export default function TransactionFilters({ filters, onFilterChange }) {
  const [categories, setCategories] = useState([]);
  useEffect(() => { fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {}); }, []);

  function handleChange(key, value) { onFilterChange({ ...filters, [key]: value }); }
  function handleReset() { onFilterChange({ search: '', categoryId: '', type: '', startDate: '', endDate: '' }); }
  const hasActive = filters.search || filters.categoryId || filters.type || filters.startDate || filters.endDate;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <input type="text" placeholder="Search description..." value={filters.search} onChange={(e) => handleChange('search', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={filters.categoryId} onChange={(e) => handleChange('categoryId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">All Categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select>
        <select value={filters.type} onChange={(e) => handleChange('type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">All Types</option><option value="EXPENSE">Expense</option><option value="INCOME">Income</option></select>
        <input type="date" value={filters.startDate} onChange={(e) => handleChange('startDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="date" value={filters.endDate} onChange={(e) => handleChange('endDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      {hasActive && <div className="mt-3 flex justify-end"><button onClick={handleReset} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Clear all filters</button></div>}
    </div>
  );
}
