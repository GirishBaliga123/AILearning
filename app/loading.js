import { SkeletonCard } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-40 animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
