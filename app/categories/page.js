'use client';

import { useState, useEffect, useCallback } from 'react';
import CategoryPieChart from '@/components/reports/CategoryPieChart';
import { formatCurrency } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CategoriesPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/categories?month=${month}&year=${year}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch {
      console.error('Failed to fetch category data');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handlePrevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function handleNextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  function getProgressColor(percentage) {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-yellow-400';
    return 'bg-green-500';
  }

  function getBadgeStyle(percentage) {
    if (percentage >= 100) return 'bg-red-100 text-red-700';
    if (percentage >= 80) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Monthly Expenses by Category</h1>
        <p className="text-sm text-gray-500 mt-1">
          See how your spending breaks down across categories
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6 bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
          {MONTHS[month - 1]} {year}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-500">Loading category data...</p>
        </div>
      ) : !data || data.totalExpenses === 0 ? (
        <EmptyState
          icon="\ud83d\udcc2"
          title="No expenses this month"
          description="Start tracking your spending to see a category breakdown."
          actionLabel="Add Transaction"
          onAction={() => (window.location.href = '/transactions/add')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Spending Distribution
            </h2>
            <CategoryPieChart chartData={data.chartData} />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(data.totalExpenses)}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Category Breakdown
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Spent</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Budget</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Usage</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.categoryBreakdown
                    .filter((c) => c.spent > 0 || c.limit > 0)
                    .sort((a, b) => b.spent - a.spent)
                    .map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{cat.icon}</span>
                            <span className="font-medium text-gray-900">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(cat.spent)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {cat.limit > 0 ? formatCurrency(cat.limit) : '\u2014'}
                        </td>
                        <td className="px-4 py-3">
                          {cat.limit > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${getProgressColor(cat.percentage)}`}
                                  style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                                />
                              </div>
                              <span
                                className={`text-xs font-semibold px-1.5 py-0.5 rounded ${getBadgeStyle(cat.percentage)}`}
                              >
                                {cat.percentage}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No budget</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {cat.limit > 0 ? (
                            <span
                              className={`font-medium ${
                                cat.spent > cat.limit ? 'text-red-600' : 'text-green-600'
                              }`}
                            >
                              {cat.spent > cat.limit
                                ? `-${formatCurrency(cat.spent - cat.limit)}`
                                : formatCurrency(cat.remaining)}
                            </span>
                          ) : (
                            <span className="text-gray-400">\u2014</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
