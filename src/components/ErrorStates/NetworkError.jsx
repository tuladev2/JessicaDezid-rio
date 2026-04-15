/**
 * Componente para erro de conexão de rede
 */
export default function NetworkError({ onRetry, message }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 mb-4 bg-error/10 rounded-full flex items-center justify-center">
        <span className="material-symbols-outlined text-error text-2xl">wifi_off</span>
      </div>
      
      <h3 className="font-serif text-lg text-on-surface mb-2">
        Problema de Conexão
      </h3>
      
      <p className="text-sm text-secondary mb-6 max-w-sm">
        {message || 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'}
      </p>
      
      <div className="space-y-2">
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Tentar Novamente
        </button>
        
        <p className="text-xs text-outline">
          Se o problema persistir, entre em contato com o suporte
        </p>
      </div>
    </div>
  );
}