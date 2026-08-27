'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { exportTransactionsPDF } from '@/services/exportService';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    type: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (filters.search) params.set('search', filters.search);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.type) params.set('type', filters.type);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();

      if (res.ok) {
        setTransactions(data.transactions);
        setPagination(data.pagination);
      }
    } catch {
      console.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
  }

  function handlePageChange(page) {
    fetchTransactions(page);
  }

  function handleDelete(deletedId) {
    setTransactions((prev) => prev.filter((t) => t.id !== deletedId));
    setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pagination.total} total transaction{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {transactions.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                const totalExpenses = transactions
                  .filter((t) => t.type === 'EXPENSE')
                  .reduce((sum, t) => sum + t.amount, 0);
                const totalIncome = transactions
                  .filter((t) => t.type === 'INCOME')
                  .reduce((sum, t) => sum + t.amount, 0);
                exportTransactionsPDF({
                  transactions,
                  filters,
                  totalExpenses,
                  totalIncome,
                });
              }}
            >
              \ud83d\udcc4 Export PDF
            </Button>
          )}
          <Link href="/transactions/add">
            <Button>+ Add Transaction</Button>
          </Link>
        </div>
      </div>

      <TransactionFilters filters={filters} onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-500">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon="\ud83d\udcb0"
          title="No transactions yet"
          description="Start tracking your expenses by adding your first transaction."
          actionLabel="Add Transaction"
          onAction={() => (window.location.href = '/transactions/add')}
        />
      ) : (
        <>
          <TransactionList
            transactions={transactions}
            onDelete={handleDelete}
          />
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
