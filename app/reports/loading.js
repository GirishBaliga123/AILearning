import { SkeletonCard, SkeletonChart } from '@/components/ui/Skeleton';

export default function ReportsLoading() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-72 animate-pulse"></div>
      </div>
      <div className="h-12 bg-white rounded-xl border border-gray-200 mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonChart />
        </div>
        <SkeletonChart />
      </div>
    </div>
  );
}
