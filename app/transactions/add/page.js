import TransactionForm from '@/components/transactions/TransactionForm';

export default function AddTransactionPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Transaction</h1>
        <p className="text-sm text-gray-500 mt-1">
          Record a new expense or income.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <TransactionForm />
      </div>
    </div>
  );
}
