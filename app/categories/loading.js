import { SkeletonChart, SkeletonTable } from '@/components/ui/Skeleton';

export default function CategoriesLoading() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
      </div>
      <div className="h-12 bg-white rounded-xl border border-gray-200 mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonChart />
        <div className="lg:col-span-2">
          <SkeletonTable rows={6} />
        </div>
      </div>
    </div>
  );
}
