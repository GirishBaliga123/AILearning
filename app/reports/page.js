'use client';

import { useState, useEffect, useCallback } from 'react';
import MonthlyTrendChart from '@/components/reports/MonthlyTrendChart';
import DailySpendingChart from '@/components/reports/DailySpendingChart';
import CategoryPieChart from '@/components/reports/CategoryPieChart';
import { formatCurrency } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { exportMonthlyReportPDF } from '@/services/exportService';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function ReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?month=${month}&year=${year}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch {
      console.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handlePrevMonth() {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else { setMonth(month - 1); }
  }

  function handleNextMonth() {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else { setMonth(month + 1); }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spending Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visual analytics and insights into your spending habits
          </p>
        </div>
        {data && data.summary.totalExpenses > 0 && (
          <Button
            variant="outline"
            onClick={() =>
              exportMonthlyReportPDF({
                summary: data.summary,
                categoryBreakdown: data.categoryBreakdown,
                monthlyTrend: data.monthlyTrend,
                month,
                year,
              })
            }
          >
            \ud83d\udcc4 Export PDF
          </Button>
        )}
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
          <p className="text-sm text-gray-500">Loading report data...</p>
        </div>
      ) : !data || data.summary.totalExpenses === 0 ? (
        <EmptyState
          icon="\ud83d\udcc8"
          title="No expense data for this month"
          description="Add some transactions to see your spending reports and analytics."
          actionLabel="Add Transaction"
          onAction={() => (window.location.href = '/transactions/add')}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Total Spent"
              value={formatCurrency(data.summary.totalExpenses)}
              sub={
                data.summary.monthChange !== 0
                  ? `${data.summary.monthChange > 0 ? '\u2191' : '\u2193'} ${Math.abs(data.summary.monthChange)}% vs last month`
                  : 'Same as last month'
              }
              subColor={data.summary.monthChange > 0 ? 'text-red-500' : 'text-green-500'}
            />
            <SummaryCard
              label="Transactions"
              value={data.summary.transactionCount.toString()}
              sub={`${formatCurrency(data.summary.averagePerTransaction)} avg per transaction`}
            />
            <SummaryCard
              label="Daily Average"
              value={formatCurrency(data.summary.averagePerDay)}
              sub="Average spending per day"
            />
            <SummaryCard
              label="Highest Day"
              value={formatCurrency(data.summary.highestDay.amount)}
              sub={`Day ${data.summary.highestDay.day} of the month`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Trend (Last 6 Months)
              </h2>
              <MonthlyTrendChart trendData={data.monthlyTrend} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Category Split
              </h2>
              <CategoryPieChart chartData={data.categoryBreakdown} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Daily Spending \u2014 {MONTHS[month - 1]} {year}
            </h2>
            <DailySpendingChart dailyData={data.dailySpending} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Category Summary
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.categoryBreakdown.map((cat) => {
                    const pct = data.summary.totalExpenses > 0
                      ? Math.round((cat.total / data.summary.totalExpenses) * 100)
                      : 0;
                    return (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-lg">{cat.icon}</span>
                            <span className="font-medium text-gray-900">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(cat.total)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${pct}%`, backgroundColor: cat.color }}
                              />
                            </div>
                            <span className="text-gray-600 w-8 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub, subColor = 'text-gray-500' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
    </div>
  );
}
