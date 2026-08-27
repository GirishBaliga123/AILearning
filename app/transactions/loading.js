import { SkeletonTable } from '@/components/ui/Skeleton';

export default function TransactionsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 bg-gray-200 rounded w-40 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-36 animate-pulse"></div>
      </div>
      <div className="h-14 bg-white rounded-xl border border-gray-200 mb-4 animate-pulse"></div>
      <SkeletonTable rows={8} />
    </div>
  );
}
