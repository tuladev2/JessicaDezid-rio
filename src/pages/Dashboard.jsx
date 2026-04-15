import { useEffect, useMemo, useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useDashboardRealTime } from '../hooks/useRealTimeUpdates';
import { useClientActions } from '../hooks/useClientActions';
import { MetricSkeleton } from '../components/LoadingStates';
import { NetworkError, DataError } from '../components/ErrorStates';
import WeeklyChart from '../components/WeeklyChart';
import UpcomingClients from '../components/UpcomingClients';

export default function Dashboard() {
  // Usar hook customizado para dados do dashboard
  const { data: dashboardData, loading, error, refetch } = useDashboardData();
  
  // Hook para ações dos clientes
  const { 
    markAsAttended, 
    getClientDetails 
  } = useClientActions();
  
  // Estado para indicar atualizações em tempo real
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Escutar atualizações em tempo real
  useDashboardRealTime(() => {
    console.log('Dados atualizados em tempo real, recarregando...');
    setIsUpdating(true);
    refetch().finally(() => {
      // Remover indicador após um delay para feedback visual
      setTimeout(() => setIsUpdating(false), 2000);
    });
  });

  // Escutar evento de agendamento criado
  useEffect(() => {
    const handleAgendamentoCriado = () => {
      console.log('Novo agendamento criado, atualizando dashboard...');
      setIsUpdating(true);
      refetch().finally(() => {
        setTimeout(() => setIsUpdating(false), 2000);
      });
    };

    window.addEventListener('agendamento-criado', handleAgendamentoCriado);
    return () => window.removeEventListener('agendamento-criado', handleAgendamentoCriado);
  }, [refetch]);

  // Handler para ver todas as clientes
  const handleViewAllClients = () => {
    window.location.href = '/admin/agendamentos';
  };

  // Handler para ações dos clientes
  const handleClientAction = async (clientId, action) => {
    console.log(`Ação ${action} para cliente ${clientId}`);
    
    try {
      switch (action) {
        case 'mark_attended':
          const attendedResult = await markAsAttended(clientId);
          if (attendedResult.success) {
            alert(attendedResult.message);
            refetch(); // Recarregar dados
          } else {
            alert(`Erro: ${attendedResult.error}`);
          }
          break;
          
        case 'reschedule':
          // Por enquanto, apenas mostrar alerta
          // Futuramente, abrir modal de reagendamento
          alert('Funcionalidade de reagendamento em desenvolvimento');
          break;
          
        case 'view_details':
          const detailsResult = await getClientDetails(clientId);
          if (detailsResult.success) {
            // Por enquanto, mostrar dados no console
            console.log('Detalhes do cliente:', detailsResult.data);
            // Futuramente, abrir modal com detalhes
            alert(`Cliente: ${detailsResult.data.full_name}\nTelefone: ${detailsResult.data.phone}`);
          } else {
            alert(`Erro ao carregar detalhes: ${detailsResult.error}`);
          }
          break;
          
        case 'view':
        default:
          // Ação padrão - mostrar opções
          console.log('Visualizando opções para cliente:', clientId);
          break;
      }
    } catch (err) {
      console.error('Erro ao executar ação:', err);
      alert('Erro inesperado. Tente novamente.');
    }
  };

  // Memoizar formatação de moeda para evitar recriações desnecessárias
  const formatCurrency = useMemo(() => {
    return (value) => new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  }, []);

  // Tratamento de erro com componentes específicos
  if (error) {
    // Verificar tipo de erro para mostrar componente apropriado
    const isNetworkError = error.includes('fetch') || error.includes('network') || error.includes('conexão');
    
    if (isNetworkError) {
      return (
        <div className="min-h-96">
          <NetworkError 
            onRetry={refetch}
            message={error}
          />
        </div>
      );
    } else {
      return (
        <div className="min-h-96">
          <DataError 
            onRetry={refetch}
            message={error}
            title="Erro no Dashboard"
          />
        </div>
      );
    }
  }

  // Memoizar cálculo das estatísticas para evitar recálculos desnecessários
  const dynamicStats = useMemo(() => [
    { 
      label: 'Agendamentos Hoje', 
      value: dashboardData?.appointmentsToday?.toString().padStart(2, '0') || '00', 
      icon: 'calendar_month', 
      hasBar: true, 
      barWidth: dashboardData?.appointmentsProgress || '0%'
    },
    { 
      label: 'Faturamento Mensal', 
      value: formatCurrency(dashboardData?.monthlyRevenue || 0), 
      icon: 'attach_money', 
      sub: dashboardData?.revenueGrowth || 'Sem dados'
    },
    { 
      label: 'Novos Clientes', 
      value: `+${dashboardData?.newClientsThisMonth?.toString() || '0'}`, 
      icon: 'person_add', 
      sub: dashboardData?.clientsGrowth || 'Sem dados'
    },
    { 
      label: 'Taxa de Retorno', 
      value: dashboardData?.returnRate || '0%', 
      icon: 'sync', 
      hasBar: true, 
      barWidth: dashboardData?.returnRateWidth || '0%'
    },
  ], [dashboardData, formatCurrency]);

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 lg:mb-10 gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Painel de Controle</p>
          <h2 className="font-serif text-2xl lg:text-3xl text-on-surface">Visão Geral</h2>
        </div>
        <p className="text-xs text-outline font-body flex items-center gap-2">
          Última atualização: <span className="text-on-surface">Dados em Tempo Real</span>
          {isUpdating && (
            <span className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-sm animate-spin">sync</span>
              <span className="text-xs">Atualizando...</span>
            </span>
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {loading ? (
          // Mostrar skeletons durante carregamento
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          // Mostrar dados reais
          dynamicStats.map((stat, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest p-6 rounded-2xl editorial-shadow hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg">{stat.icon}</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant text-sm flex-shrink-0 animate-pulse">sync</span>
              </div>
              <p className="text-3xl font-light text-on-surface mb-1 font-body">{stat.value}</p>
              <p className="text-xs text-secondary font-medium">{stat.label}</p>
              {stat.hasBar ? (
                <div className="mt-3 h-1.5 bg-primary/10 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out absolute top-0 left-0" 
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

      {/* Bottom Section: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 mt-2">
        {/* Left: Growth Chart */}
        <div className="lg:col-span-3 bg-surface-container-lowest rounded-2xl p-4 lg:p-8 editorial-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-2">
            <h3 className="font-serif text-lg text-on-surface">Crescimento Semanal</h3>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] text-secondary">
                <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                Agendamentos
              </span>
              <span className="flex items-center gap-1 text-[10px] text-secondary">
                <span className="w-2 h-2 rounded-full bg-tertiary inline-block"></span>
                Cancelados
              </span>
            </div>
          </div>

          {/* Dynamic Weekly Chart */}
          <WeeklyChart 
            chartData={dashboardData?.weeklyChartData} 
            loading={loading} 
          />
        </div>

        {/* Right: Upcoming Clients Component */}
        <UpcomingClients
          clients={dashboardData?.upcomingClients}
          loading={loading}
          onViewAll={handleViewAllClients}
          onClientAction={handleClientAction}
        />
      </div>
    </div>
  );
}
