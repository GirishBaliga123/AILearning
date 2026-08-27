'use client';

import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function BudgetWarnings({ warnings }) {
  if (warnings.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">\u26a0\ufe0f Budget Alerts</h2>
        <Link href="/settings/budgets" className="text-sm font-medium text-blue-600 hover:text-blue-800">Manage budgets</Link>
      </div>
      <div className="divide-y divide-gray-100">
        {warnings.map((w) => (
          <div key={w.categoryId} className="px-5 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>{w.categoryIcon}</span>
                <span className="text-sm font-medium text-gray-900">{w.categoryName}</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${w.percentage >= 100 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{w.percentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${w.percentage >= 100 ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min(w.percentage, 100)}%` }} />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">{formatCurrency(w.spent)} spent</span>
              <span className="text-xs text-gray-500">{formatCurrency(w.limit)} limit</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
