/**
 * Skeleton loading para área do gráfico
 * Simula o layout do gráfico de crescimento semanal
 */
export default function ChartSkeleton() {
  return (
    <div className="lg:col-span-3 bg-surface-container-lowest rounded-2xl p-4 lg:p-8 editorial-shadow">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-2">
        <div className="h-6 w-48 bg-surface-container/50 animate-pulse rounded"></div>
        <div className="flex items-center gap-3">
          <div className="h-3 w-20 bg-surface-container/50 animate-pulse rounded"></div>
          <div className="h-3 w-16 bg-surface-container/50 animate-pulse rounded"></div>
        </div>
      </div>

      {/* Chart area skeleton */}
      <div className="w-full h-60 bg-surface-container/30 animate-pulse rounded-lg flex items-end justify-between p-4">
        {/* Simulated chart bars */}
        {[40, 60, 35, 80, 45, 70, 55].map((height, i) => (
          <div
            key={i}
            className="bg-surface-container/50 animate-pulse rounded-t"
            style={{ 
              height: `${height}%`, 
              width: '12%',
              animationDelay: `${i * 100}ms`
            }}
          ></div>
        ))}
      </div>

      {/* Days labels skeleton */}
      <div className="flex justify-between mt-2">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((_, i) => (
          <div key={i} className="h-3 w-6 bg-surface-container/50 animate-pulse rounded"></div>
        ))}
      </div>
    </div>
  );
}