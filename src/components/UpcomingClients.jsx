import { useState } from 'react';
import { ClientItemSkeleton } from './LoadingStates';

function ClientItem({ client, onAction, loading }) {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:bg-primary/5 border border-transparent hover:border-outline-variant/30 relative ${client.dimmed ? 'opacity-50' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            alt={client.name}
            className="w-10 h-10 rounded-full object-cover grayscale-[20%]"
            src={client.avatar}
            onError={(e) => {
              e.target.src = 'https://cdn-icons-png.flaticon.com/512/1154/1154448.png';
            }}
          />
          {client.confirmed && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xs">check</span>
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-on-surface">{client.name}</p>
          <p className="text-[10px] uppercase tracking-widest text-secondary mt-0.5">
            {client.procedure}
          </p>
        </div>
      </div>
      <div className="text-right flex items-center gap-3">
        <div className="text-right">
          <span className="text-xs font-semibold text-primary block">{client.time}</span>
          {client.date && (
            <span className="text-[10px] text-secondary">{formatDate(client.date)}</span>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => onAction(client.id, 'view')}
            disabled={loading}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary/10 transition-colors disabled:opacity-50"
            title="Ver detalhes do cliente"
          >
            {loading ? (
              <span className="material-symbols-outlined text-primary text-sm animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined text-primary text-sm">more_vert</span>
            )}
          </button>
          {showActions && !loading && (
            <div className="absolute right-0 top-full mt-1 bg-surface-container-lowest rounded-lg border border-outline-variant/20 shadow-lg z-10 min-w-32">
              <button
                onClick={() => onAction(client.id, 'mark_attended')}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-on-surface hover:bg-surface-container/50 transition-colors rounded-t-lg"
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Marcar Atendido
              </button>
              <button
                onClick={() => onAction(client.id, 'reschedule')}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-on-surface hover:bg-surface-container/50 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">schedule</span>
                Reagendar
              </button>
              <button
                onClick={() => onAction(client.id, 'view_details')}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-on-surface hover:bg-surface-container/50 transition-colors rounded-b-lg"
              >
                <span className="material-symbols-outlined text-sm">person</span>
                Ver Perfil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UpcomingClients({ clients, loading, onViewAll, onClientAction }) {
  const [actionLoading, setActionLoading] = useState(null);

  const handleClientAction = async (clientId, action) => {
    setActionLoading(clientId);
    try {
      await onClientAction(clientId, action);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-4 lg:p-8 editorial-shadow flex flex-col">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="font-serif text-lg text-on-surface">Próximas Clientes</h3>
        <button
          onClick={onViewAll}
          className="text-xs text-primary font-medium hover:underline tracking-widest uppercase transition-colors"
        >
          Ver todas
        </button>
      </div>
      <div className="space-y-4 flex-1">
        {loading ? (
          <>
            <ClientItemSkeleton />
            <ClientItemSkeleton />
            <ClientItemSkeleton />
            <ClientItemSkeleton />
          </>
        ) : clients && clients.length > 0 ? (
          clients.map((client) => (
            <ClientItem
              key={client.id}
              client={client}
              onAction={handleClientAction}
              loading={actionLoading === client.id}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-secondary bg-surface-container-low/50 rounded-xl dashed-border">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline-variant">event_available</span>
            <p className="text-sm">Nenhum agendamento pendente para os próximos dias.</p>
          </div>
        )}
      </div>
    </div>
  );
}