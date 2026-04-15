/**
 * Skeleton loading para cards de métricas
 * Mantém o layout idêntico ao card real
 */
export default function MetricSkeleton() {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl editorial-shadow">
      <div className="flex items-start justify-between mb-4">
        {/* Icon skeleton */}
        <div className="w-10 h-10 rounded-full bg-surface-container/50 animate-pulse"></div>
        {/* Sync icon skeleton */}
        <div className="w-5 h-5 rounded bg-surface-container/50 animate-pulse"></div>
      </div>
      
      {/* Value skeleton */}
      <div className="h-9 w-24 bg-surface-container/50 animate-pulse rounded mb-1"></div>
      
      {/* Label skeleton */}
      <div className="h-3 w-32 bg-surface-container/50 animate-pulse rounded mb-3"></div>
      
      {/* Progress bar or subtitle skeleton */}
      <div className="h-1.5 w-full bg-surface-container/50 animate-pulse rounded"></div>
    </div>
  );
}