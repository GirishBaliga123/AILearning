'use client';

import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function RecentTransactions({ transactions }) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <p className="text-sm text-gray-500 text-center py-4">No transactions this month. Add your first expense!</p>
        <div className="text-center"><Link href="/transactions/add" className="text-sm font-medium text-blue-600 hover:text-blue-800">+ Add Transaction</Link></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        <Link href="/transactions" className="text-sm font-medium text-blue-600 hover:text-blue-800">View all</Link>
      </div>
      <div className="divide-y divide-gray-100">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">{t.category?.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{t.description}</p>
                <p className="text-xs text-gray-500">{t.category?.name} \u00b7 {formatDate(t.date)}</p>
              </div>
            </div>
            <span className={`text-sm font-semibold ${t.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'}`}>
              {t.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(t.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
