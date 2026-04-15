/**
 * Componente para erro de dados/carregamento
 */
export default function DataError({ onRetry, message, title }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-surface-container-low/30 rounded-xl border border-outline-variant/20">
      <div className="w-12 h-12 mb-3 bg-error/10 rounded-full flex items-center justify-center">
        <span className="material-symbols-outlined text-error text-lg">database</span>
      </div>
      
      <h4 className="font-medium text-on-surface mb-2">
        {title || 'Erro ao Carregar Dados'}
      </h4>
      
      <p className="text-xs text-secondary mb-4 max-w-xs">
        {message || 'Não foi possível carregar os dados. Tente novamente.'}
      </p>
      
      <button
        onClick={onRetry}
        className="px-4 py-2 text-xs bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-sm">refresh</span>
        Recarregar
      </button>
    </div>
  );
}