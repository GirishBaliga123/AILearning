'use client';

import { useState, useEffect, useCallback } from 'react';
import BudgetForm from '@/components/settings/BudgetForm';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/layout/Toast';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function BudgetsPage() {
  const now = new Date();
  const { addToast } = useToast();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets?month=${month}&year=${year}`);
      const data = await res.json();
      if (res.ok) {
        setBudgets(data.budgets);
      }
    } catch {
      console.error('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/budgets/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Budget removed successfully', 'success');
        setBudgets((prev) => prev.filter((b) => b.id !== deleteId));
      } else {
        addToast('Failed to delete budget', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Budget Limits</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set monthly spending limits for each category. You&apos;ll get warnings when approaching the limit.
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Set a Budget
        </h2>
        <BudgetForm month={month} year={year} onSaved={fetchBudgets} />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-500">Loading budgets...</p>
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon="\ud83c\udfaf"
          title="No budgets set"
          description="Set monthly budget limits above to track your spending against targets."
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Active Budgets \u2014 {MONTHS[month - 1]} {year}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Monthly Limit</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {budgets.map((budget) => (
                  <tr key={budget.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{budget.category?.icon}</span>
                        <span className="font-medium text-gray-900">
                          {budget.category?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(budget.amountLimit)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteId(budget.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Remove Budget"
        confirmText="Remove"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleting}
      >
        <p>Are you sure you want to remove this budget limit? You can always set it again later.</p>
      </Modal>
    </div>
  );
}
