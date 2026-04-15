import { formatCurrency, formatDuration } from '../lib/servicosUtils';
import ServicoActions from './ServicoActions';

/**
 * Componente de tabela para visualização de serviços em desktop
 * Layout responsivo que se adapta para cards em mobile
 */
export default function ServicosTable({
  servicos = [],
  loading = false,
  onEdit,
  onToggleStatus,
  onDelete,
  operationLoading = false
}) {

  // Skeleton loader para estado de carregamento
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-surface-container rounded-lg"></div>
          <div>
            <div className="h-4 bg-surface-container rounded w-32 mb-2"></div>
            <div className="h-3 bg-surface-container rounded w-24"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-3 bg-surface-container rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-3 bg-surface-container rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-3 bg-surface-container rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-3 bg-surface-container rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 bg-surface-container rounded w-32"></div>
      </td>
    </tr>
  );

  // Estado vazio
  if (!loading && servicos.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl editorial-shadow overflow-hidden">
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">
            spa
          </span>
          <h3 className="font-serif text-xl text-on-surface mb-2">
            Nenhum serviço encontrado
          </h3>
          <p className="text-secondary">
            Os serviços aparecerão aqui quando forem cadastrados ou quando os filtros corresponderem a algum resultado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl editorial-shadow overflow-hidden">
      {/* Tabela Desktop - Hidden em mobile */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          {/* Header da Tabela */}
          <thead className="bg-surface-container/30 border-b border-outline-variant/20">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Serviço
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Duração
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Preço Individual
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Preço Pacote
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>

          {/* Body da Tabela */}
          <tbody className="divide-y divide-outline-variant/10">
            {loading ? (
              // Skeleton rows
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : (
              // Dados reais
              servicos.map((servico) => (
                <tr 
                  key={servico.id}
                  className="hover:bg-surface-container/20 transition-colors"
                >
                  {/* Coluna Serviço (com imagem e info) */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Imagem do Serviço */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
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
                          <span className="material-symbols-outlined text-outline text-sm">spa</span>
                        </div>
                      </div>

                      {/* Info do Serviço */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-on-surface truncate">
                            {servico.name}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              servico.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {servico.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        {servico.description && (
                          <p className="text-xs text-outline truncate max-w-xs">
                            {servico.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Coluna Categoria */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-secondary">
                      {servico.category}
                    </span>
                  </td>

                  {/* Coluna Duração */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-on-surface font-medium">
                      {formatDuration(servico.duration_minutes)}
                    </span>
                  </td>

                  {/* Coluna Preço Individual */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-primary">
                      {formatCurrency(servico.price_single)}
                    </span>
                  </td>

                  {/* Coluna Preço Pacote */}
                  <td className="px-6 py-4">
                    {servico.price_package ? (
                      <div>
                        <span className="text-sm font-medium text-on-surface">
                          {formatCurrency(servico.price_package)}
                        </span>
                        <p className="text-xs text-secondary">
                          Economia: {formatCurrency((servico.price_single * 6) - servico.price_package)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-outline">—</span>
                    )}
                  </td>

                  {/* Coluna Ações */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <ServicoActions
                        servico={servico}
                        onEdit={onEdit}
                        onToggleStatus={onToggleStatus}
                        onDelete={onDelete}
                        loading={operationLoading}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile/Tablet - Visible apenas em telas menores */}
      <div className="lg:hidden">
        {loading ? (
          // Skeleton cards
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 border border-outline-variant/20 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-surface-container rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-surface-container rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-surface-container rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-surface-container rounded w-1/3"></div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="h-6 bg-surface-container rounded w-20"></div>
                  <div className="h-8 bg-surface-container rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Cards reais
          <div className="p-4 space-y-4">
            {servicos.map((servico) => (
              <div
                key={servico.id}
                className="p-4 border border-outline-variant/20 rounded-xl hover:bg-surface-container/20 transition-colors"
              >
                {/* Header do Card */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Imagem */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
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

                  {/* Info Principal */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-on-surface truncate">
                        {servico.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          servico.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {servico.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-sm text-secondary mb-1">
                      {servico.category}
                    </p>
                    {servico.description && (
                      <p className="text-xs text-outline line-clamp-2">
                        {servico.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Detalhes em Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-surface-container/20 rounded-lg">
                  <div>
                    <p className="text-xs text-secondary mb-1">Duração</p>
                    <p className="text-sm font-medium text-on-surface">
                      {formatDuration(servico.duration_minutes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary mb-1">Preço Individual</p>
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(servico.price_single)}
                    </p>
                  </div>
                  {servico.price_package && (
                    <>
                      <div>
                        <p className="text-xs text-secondary mb-1">Preço Pacote</p>
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

                {/* Ações do Card */}
                <div className="flex justify-end pt-3 border-t border-outline-variant/10">
                  <ServicoActions
                    servico={servico}
                    onEdit={onEdit}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                    loading={operationLoading}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}