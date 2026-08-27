'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/components/layout/Toast';
import Modal from '@/components/ui/Modal';

export default function TransactionList({ transactions, onDelete }) {
  const { addToast } = useToast();
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${deleteId}`, { method: 'DELETE' });
      if (res.ok) { addToast('Transaction deleted', 'success'); onDelete(deleteId); }
      else addToast('Failed to delete', 'error');
    } catch { addToast('Something went wrong', 'error'); }
    finally { setDeleting(false); setDeleteId(null); }
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr><th className="text-left px-4 py-3 font-medium text-gray-600">Date</th><th className="text-left px-4 py-3 font-medium text-gray-600">Description</th><th className="text-left px-4 py-3 font-medium text-gray-600">Category</th><th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th><th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="px-4 py-3 text-gray-900"><div className="flex items-center gap-2">{t.description}{t.isRecurring && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">\ud83d\udd04 Recurring</span>}</div></td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap"><span className="inline-flex items-center gap-1.5"><span>{t.category?.icon}</span><span>{t.category?.name}</span></span></td>
                  <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${t.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'}`}>{t.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(t.amount)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap"><div className="flex items-center justify-end gap-2"><Link href={`/transactions/${t.id}/edit`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</Link><button onClick={() => setDeleteId(t.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Transaction" confirmText="Delete" variant="danger" onConfirm={handleDelete} loading={deleting}><p>Are you sure? This cannot be undone.</p></Modal>
    </>
  );
}
