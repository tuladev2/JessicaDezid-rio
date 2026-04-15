/**
 * Skeleton loading para lista de clientes
 * Simula o layout da lista de próximas clientes
 */
export default function ClientSkeleton() {
  return (
    <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-4 lg:p-8 editorial-shadow flex flex-col">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div className="h-6 w-36 bg-surface-container/50 animate-pulse rounded"></div>
        <div className="h-4 w-16 bg-surface-container/50 animate-pulse rounded"></div>
      </div>

      {/* Client items skeleton */}
      <div className="space-y-4 flex-1">
        {[1, 2, 3, 4].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-xl border border-transparent"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <div className="flex items-center gap-3">
              {/* Avatar skeleton */}
              <div className="w-10 h-10 rounded-full bg-surface-container/50 animate-pulse"></div>
              
              <div>
                {/* Name skeleton */}
                <div className="h-4 w-24 bg-surface-container/50 animate-pulse rounded mb-1"></div>
                {/* Procedure skeleton */}
                <div className="h-3 w-32 bg-surface-container/50 animate-pulse rounded"></div>
              </div>
            </div>
            
            <div className="text-right flex items-center gap-3">
              {/* Time skeleton */}
              <div className="h-4 w-12 bg-surface-container/50 animate-pulse rounded"></div>
              {/* Icon skeleton */}
              <div className="w-5 h-5 rounded-full bg-surface-container/50 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton para um item individual de cliente
 */
export function ClientItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-transparent animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container/50"></div>
        <div>
          <div className="h-4 w-24 bg-surface-container/50 rounded mb-1"></div>
          <div className="h-3 w-32 bg-surface-container/50 rounded"></div>
        </div>
      </div>
      
      <div className="text-right flex items-center gap-3">
        <div className="h-4 w-12 bg-surface-container/50 rounded"></div>
        <div className="w-5 h-5 rounded-full bg-surface-container/50"></div>
      </div>
    </div>
  );
}