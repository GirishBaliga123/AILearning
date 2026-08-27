'use client';

import { useState, useEffect, useCallback } from 'react';
import RecurringForm from '@/components/settings/RecurringForm';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/layout/Toast';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';

export default function RecurringPage() {
  const { addToast } = useToast();
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecurring = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recurring');
      const data = await res.json();
      if (res.ok) {
        setRecurring(data.recurring);
      }
    } catch {
      console.error('Failed to fetch recurring expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecurring();
  }, [fetchRecurring]);

  async function handleToggle(id) {
    try {
      const res = await fetch(`/api/recurring/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleActive: true }),
      });

      const data = await res.json();
      if (res.ok) {
        addToast(data.message, 'success');
        setRecurring((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
        );
      } else {
        addToast('Failed to update', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/recurring/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Recurring expense deleted', 'success');
        setRecurring((prev) => prev.filter((r) => r.id !== deleteId));
      } else {
        addToast('Failed to delete', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  async function handleProcess() {
    try {
      const res = await fetch('/api/recurring/process', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, data.created > 0 ? 'success' : 'info');
      } else {
        addToast('Failed to process recurring expenses', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    }
  }

  const activeCount = recurring.filter((r) => r.isActive).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recurring Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Set up expenses that repeat every month (e.g., rent, subscriptions).
            They&apos;ll be auto-added to your transactions.
          </p>
        </div>
        {recurring.length > 0 && (
          <button
            onClick={handleProcess}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
          >
            \ud83d\udd04 Process Now
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Add Recurring Expense
        </h2>
        <RecurringForm onSaved={fetchRecurring} />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      ) : recurring.length === 0 ? (
        <EmptyState
          icon="\ud83d\udd04"
          title="No recurring expenses"
          description="Add recurring expenses above and they'll be automatically added to your transactions each month."
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Recurring Expenses
            </h2>
            <span className="text-xs text-gray-500">
              {activeCount} active / {recurring.length} total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Day</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recurring.map((r) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      !r.isActive ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.description}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="inline-flex items-center gap-1.5">
                        <span>{r.category?.icon}</span>
                        <span>{r.category?.name}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {r.dayOfMonth}{getSuffix(r.dayOfMonth)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(r.id)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          r.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {r.isActive ? '\u25cf Active' : '\u25cb Paused'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteId(r.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Delete
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
        title="Delete Recurring Expense"
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleting}
      >
        <p>
          Are you sure you want to delete this recurring expense? Future months
          will no longer have this transaction auto-added.
        </p>
      </Modal>
    </div>
  );
}

function getSuffix(day) {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
