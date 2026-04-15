import { formatCurrency, formatDuration } from '../lib/servicosUtils';
import ServicoActions from './ServicoActions';

/**
 * Componente de card individual para visualização mobile/tablet
 * Versão compacta e touch-friendly dos serviços
 */
export default function ServicoCard({
  servico,
  onEdit,
  onToggleStatus,
  onDelete,
  loading = false,
  variant = 'default' // 'default', 'compact', 'detailed'
}) {

  // Variantes do card
  const variants = {
    default: {
      container: 'p-4',
      image: 'w-16 h-16',
      spacing: 'gap-4 mb-4'
    },
    compact: {
      container: 'p-3',
      image: 'w-12 h-12',
      spacing: 'gap-3 mb-3'
    },
    detailed: {
      container: 'p-6',
      image: 'w-20 h-20',
      spacing: 'gap-4 mb-6'
    }
  };

  const config = variants[variant] || variants.default;

  return (
    <div className={`
      ${config.container} border border-outline-variant/20 rounded-xl 
      hover:bg-surface-container/20 transition-colors
      ${loading ? 'opacity-50 pointer-events-none' : ''}
    `}>
      {/* Header do Card */}
      <div className={`flex items-start ${config.spacing}`}>
        {/* Imagem do Serviço */}
        <div className={`${config.image} rounded-lg overflow-hidden bg-surface-container flex-shrink-0`}>
          {servico.image_url ? (
            <img
              src={servico.image_url}
              alt={servico.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-outline text-lg">spa</span>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="min-w-0 flex-1">
          {/* Nome e Status */}
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-on-surface truncate mb-1">
                {servico.name}
              </h3>
              <p className="text-sm text-secondary">
                {servico.category}
              </p>
            </div>
            
            {/* Status Badge */}
            <span
              className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                servico.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {servico.is_active ? 'Ativo' : 'Inativo'}
            </span>
          </div>

          {/* Descrição (apenas em variant detailed) */}
          {variant === 'detailed' && servico.description && (
            <p className="text-xs text-outline line-clamp-2 mb-2">
              {servico.description}
            </p>
          )}

          {/* Preço Principal (sempre visível) */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(servico.price_single)}
            </span>
            <span className="text-xs text-secondary">
              {formatDuration(servico.duration_minutes)}
            </span>
          </div>
        </div>
      </div>

      {/* Detalhes Expandidos (apenas em variant default e detailed) */}
      {(variant === 'default' || variant === 'detailed') && (
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-surface-container/20 rounded-lg">
          <div>
            <p className="text-xs text-secondary mb-1">Duração</p>
            <p className="text-sm font-medium text-on-surface">
              {formatDuration(servico.duration_minutes)}
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary mb-1">Individual</p>
            <p className="text-sm font-semibold text-primary">
              {formatCurrency(servico.price_single)}
            </p>
          </div>
          
          {servico.price_package && (
            <>
              <div>
                <p className="text-xs text-secondary mb-1">Pacote</p>
                <p className="text-sm font-medium text-on-surface">
                  {formatCurrency(servico.price_package)}
                </p>
              </div>
              <div>
                <p className="text-xs text-secondary mb-1">Economia</p>
                <p className="text-sm font-medium text-green-600">
                  {formatCurrency((servico.price_single * 6) - servico.price_package)}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Ações do Card */}
      <div className="flex justify-end pt-3 border-t border-outline-variant/10">
        <ServicoActions
          servico={servico}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          loading={loading}
        />
      </div>
    </div>
  );
}

/**
 * Componente de skeleton para loading state
 */
export function ServicoCardSkeleton({ variant = 'default' }) {
  const variants = {
    default: {
      container: 'p-4',
      image: 'w-16 h-16',
      spacing: 'gap-4 mb-4'
    },
    compact: {
      container: 'p-3',
      image: 'w-12 h-12',
      spacing: 'gap-3 mb-3'
    },
    detailed: {
      container: 'p-6',
      image: 'w-20 h-20',
      spacing: 'gap-4 mb-6'
    }
  };

  const config = variants[variant] || variants.default;

  return (
    <div className={`${config.container} border border-outline-variant/20 rounded-xl animate-pulse`}>
      {/* Header Skeleton */}
      <div className={`flex items-start ${config.spacing}`}>
        <div className={`${config.image} bg-surface-container rounded-lg`}></div>
        <div className="flex-1">
          <div className="h-4 bg-surface-container rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-surface-container rounded w-1/2 mb-2"></div>
          <div className="flex justify-between items-center">
            <div className="h-3 bg-surface-container rounded w-20"></div>
            <div className="h-3 bg-surface-container rounded w-16"></div>
          </div>
        </div>
      </div>

      {/* Details Skeleton (apenas para variants maiores) */}
      {(variant === 'default' || variant === 'detailed') && (
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-surface-container/20 rounded-lg">
          <div>
            <div className="h-2 bg-surface-container rounded w-12 mb-1"></div>
            <div className="h-3 bg-surface-container rounded w-16"></div>
          </div>
          <div>
            <div className="h-2 bg-surface-container rounded w-16 mb-1"></div>
            <div className="h-3 bg-surface-container rounded w-20"></div>
          </div>
        </div>
      )}

      {/* Actions Skeleton */}
      <div className="flex justify-end pt-3 border-t border-outline-variant/10">
        <div className="h-8 bg-surface-container rounded w-32"></div>
      </div>
    </div>
  );
}