import { useEffect, useMemo, useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useClientActions } from '../hooks/useClientActions';
import { MetricSkeleton } from '../components/LoadingStates';
import { NetworkError, DataError } from '../components/ErrorStates';
import WeeklyChart from '../components/WeeklyChart';
import UpcomingClients from '../components/UpcomingClients';

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export default function Dashboard() {
  const { data, loading, error, refetch, refreshMetric, refreshingMetric } = useDashboardData();
  const { markAsAttended, getClientDetails } = useClientActions();
  const [isUpdating, setIsUpdating] = useState(false);

  // Escuta agendamento criado externamente
  useEffect(() => {
    const handler = () => {
      setIsUpdating(true);
      refetch();
      setTimeout(() => setIsUpdating(false), 2000);
    };
    window.addEventListener('agendamento-criado', handler);
    return () => window.removeEventListener('agendamento-criado', handler);
  }, [refetch]);

  const handleViewAllClients = () => { window.location.href = '/admin/agendas'; };

  const handleClientAction = async (clientId, action) => {
    try {
      if (action === 'mark_attended') {
        const r = await markAsAttended(clientId);
        if (r.success) { alert(r.message); refetch(); }
        else alert(`Erro: ${r.error}`);
      } else if (action === 'view_details') {
        const r = await getClientDetails(clientId);
        if (r.success && r.data)
          alert(`Cliente: ${r.data.full_name || '—'}\nTelefone: ${r.data.phone || '—'}`);
        else alert(`Erro: ${r.error}`);
      } else if (action === 'reschedule') {
        alert('Reagendamento em desenvolvimento');
      }
    } catch (err) {
      console.error('[Dashboard] ação cliente:', err.message);
      alert('Erro inesperado. Tente novamente.');
    }
  };

  // Definição dos 4 cards de métricas
  const stats = useMemo(() => [
    {
      key: 'hoje',
      label: 'Agendamentos Hoje',
      value: String(data.appointmentsToday).padStart(2, '0'),
      icon: 'calendar_month',
      hasBar: true,
      barWidth: data.appointmentsProgress,
    },
    {
      key: 'faturamento',
      label: 'Faturamento Mensal',
      value: fmt(data.monthlyRevenue),
      icon: 'attach_money',
      sub: data.monthlyRevenue > 0 ? 'Mês atual' : 'Sem dados',
    },
    {
      key: 'clientes',
      label: 'Novos Clientes',
      value: `+${data.newClientsThisMonth}`,
      icon: 'person_add',
      sub: data.newClientsThisMonth > 0 ? 'Este mês' : 'Sem novos',
    },
    {
      key: 'retorno',
      label: 'Taxa de Retorno',
      value: `${data.returnRate}%`,
      icon: 'sync',
      hasBar: true,
      barWidth: data.returnRateWidth,
    },
  ], [data]);

  if (error) {
    const isNet = error.includes('fetch') || error.includes('network');
    return (
      <div className="min-h-96">
        {isNet
          ? <NetworkError onRetry={refetch} message={error} />
          : <DataError onRetry={refetch} message={error} title="Erro no Dashboard" />
        }
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 lg:mb-10 gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Painel de Controle</p>
          <h2 className="font-serif text-2xl lg:text-3xl text-on-surface">Visão Geral</h2>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-outline font-body">
            Dados em tempo real
          </p>
          <button
            onClick={refetch}
            disabled={loading}
            title="Atualizar tudo"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors disabled:opacity-40"
          >
            <span className={`material-symbols-outlined text-secondary text-base ${loading || isUpdating ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        {loading ? (
          <><MetricSkeleton /><MetricSkeleton /><MetricSkeleton /><MetricSkeleton /></>
        ) : (
          stats.map((stat) => (
            <div
              key={stat.key}
              className="bg-surface-container-lowest p-4 lg:p-6 rounded-2xl editorial-shadow"
            >
              <div className="flex items-start justify-between mb-3 lg:mb-4">
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-base lg:text-lg">{stat.icon}</span>
                </div>
                {/* Botão de refresh individual */}
                <button
                  onClick={() => refreshMetric(stat.key)}
                  disabled={refreshingMetric === stat.key}
                  title={`Atualizar ${stat.label}`}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors disabled:opacity-40"
                >
                  <span className={`material-symbols-outlined text-outline-variant text-sm ${refreshingMetric === stat.key ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                </button>
              </div>
              <p className="text-2xl lg:text-3xl font-light text-on-surface mb-1 font-body leading-none">
                {stat.value}
              </p>
              <p className="text-[10px] lg:text-xs text-secondary font-medium">{stat.label}</p>
              {stat.hasBar ? (
                <div className="mt-3 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: stat.barWidth }}
                  />
                </div>
              ) : (
                <p className="text-[10px] text-outline mt-2">{stat.sub}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Gráfico + Próximos */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Gráfico semanal */}
        <div className="lg:col-span-3 bg-surface-container-lowest rounded-2xl p-4 lg:p-8 editorial-shadow overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-2">
            <h3 className="font-serif text-lg text-on-surface">Crescimento Semanal</h3>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] text-secondary">
                <span className="w-2 h-2 rounded-full bg-[#775841] inline-block" />
                Agendamentos
              </span>
              <span className="flex items-center gap-1 text-[10px] text-secondary">
                <span className="w-2 h-2 rounded-full bg-[#48626c] inline-block" />
                Cancelados
              </span>
            </div>
          </div>
          <WeeklyChart chartData={data.weeklyChartData} loading={loading} />
        </div>

        {/* Próximos atendimentos */}
        <UpcomingClients
          clients={data.upcomingClients}
          loading={loading}
          onViewAll={handleViewAllClients}
          onClientAction={handleClientAction}
        />
      </div>
    </div>
  );
}
