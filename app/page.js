'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SummaryCards from '@/components/dashboard/SummaryCards';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import BudgetWarnings from '@/components/dashboard/BudgetWarnings';
import Button from '@/components/ui/Button';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DashboardPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/dashboard?month=${month}&year=${year}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    async function processRecurring() {
      try {
        await fetch('/api/recurring/process', { method: 'POST' });
      } catch {
        // Silent fail
      }
    }
    processRecurring();
  }, []);

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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your monthly expense overview
          </p>
        </div>
        <Link href="/transactions/add">
          <Button>+ Add Expense</Button>
        </Link>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6 bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Previous month"
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
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6">
          <SummaryCards summary={data.summary} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetWarnings warnings={data.budgetWarnings} />

            {data.topCategories.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Top Spending Categories
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {data.topCategories.map((cat, index) => (
                    <div
                      key={cat.categoryId}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-400 w-5">
                          {index + 1}.
                        </span>
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        \u20B9{cat.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <RecentTransactions transactions={data.recentTransactions} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-500">Failed to load dashboard data.</p>
        </div>
      )}
    </div>
  );
}
