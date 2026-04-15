/**
 * Componente para estado vazio (sem dados)
 */
export default function EmptyState({ 
  icon = 'inbox', 
  title = 'Nenhum dado encontrado', 
  message = 'Não há informações para exibir no momento.',
  action,
  actionLabel = 'Atualizar'
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 mb-4 bg-outline-variant/10 rounded-full flex items-center justify-center">
        <span className="material-symbols-outlined text-outline-variant text-2xl">{icon}</span>
      </div>
      
      <h3 className="font-medium text-on-surface mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-secondary mb-6 max-w-sm">
        {message}
      </p>
      
      {action && (
        <button
          onClick={action}
          className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}