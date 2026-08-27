'use client';

import { formatCurrency } from '@/lib/utils';

export default function SummaryCards({ summary }) {
  const cards = [
    { label: 'Total Expenses', value: formatCurrency(summary.totalExpenses), icon: '💸', color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total Income', value: formatCurrency(summary.totalIncome), icon: '💵', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Net Balance', value: formatCurrency(summary.netBalance), icon: '📊', color: summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600', bg: summary.netBalance >= 0 ? 'bg-green-50' : 'bg-red-50' },
    { label: 'Transactions', value: summary.transactionCount.toString(), icon: '📝', color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">{card.label}</span>
            <span className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center text-lg`}>{card.icon}</span>
          </div>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
