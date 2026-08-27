'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TransactionForm from '@/components/transactions/TransactionForm';

export default function EditTransactionPage() {
  const params = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTransaction() {
      try {
        const res = await fetch(`/api/transactions/${params.id}`);
        const data = await res.json();

        if (res.ok) {
          setTransaction(data.transaction);
        } else {
          setError(data.error || 'Transaction not found');
        }
      } catch {
        setError('Failed to load transaction');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchTransaction();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-sm text-gray-500">Loading transaction...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Transaction</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update the transaction details.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <TransactionForm transaction={transaction} isEdit />
      </div>
    </div>
  );
}
