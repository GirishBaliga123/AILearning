'use client';

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-3"><div className="h-4 bg-gray-200 rounded w-24"></div><div className="w-9 h-9 bg-gray-200 rounded-lg"></div></div>
      <div className="h-8 bg-gray-200 rounded w-32"></div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200"><div className="flex gap-4"><div className="h-4 bg-gray-200 rounded w-20"></div><div className="h-4 bg-gray-200 rounded w-32"></div><div className="h-4 bg-gray-200 rounded w-24"></div><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></div></div>
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="px-4 py-3 border-b border-gray-100"><div className="flex items-center gap-4"><div className="h-4 bg-gray-200 rounded w-20"></div><div className="h-4 bg-gray-200 rounded w-40"></div><div className="h-4 bg-gray-200 rounded w-24"></div><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></div></div>)}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
      <div className="h-64 bg-gray-100 rounded-lg"></div>
    </div>
  );
}

export default function Skeleton({ className = '' }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>;
}
