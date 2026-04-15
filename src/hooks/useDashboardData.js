import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook customizado para gerenciar dados do dashboard
 * Busca métricas em tempo real do Supabase
 */
export const useDashboardData = () => {
  const [data, setData] = useState({
    appointmentsToday: 0,
    appointmentsProgress: '0%',
    monthlyRevenue: 0,
    revenueGrowth: '+0% vs mês anterior',
    newClientsThisMonth: 0,
    clientsGrowth: '+0% vs mês anterior',
    returnRate: '0%',
    returnRateWidth: '0%',
    weeklyChartData: {
      appointments: [0, 0, 0, 0, 0, 0, 0],
      cancellations: [0, 0, 0, 0, 0, 0, 0],
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    },
    upcomingClients: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 6);
      const weekStart = startOfWeek.toISOString().split('T')[0];

      // 1. Agendamentos Hoje
      const { count: appointmentsToday } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today)
        .neq('status', 'Cancelado');

      // 2. Faturamento Mensal
      const { data: monthlyAppointments } = await supabase
        .from('appointments')
        .select('total_value_charged')
        .gte('appointment_date', startOfMonth)
        .neq('status', 'Cancelado');

      const monthlyRevenue = monthlyAppointments?.reduce((acc, curr) => 
        acc + (curr.total_value_charged || 0), 0) || 0;

      // 3. Novos Clientes este Mês
      const { count: newClientsThisMonth } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth);

      // 4. Taxa de Retorno (clientes com mais de 1 agendamento)
      const { data: clientsWithMultipleAppointments } = await supabase
        .from('appointments')
        .select('client_id')
        .neq('status', 'Cancelado');

      const clientCounts = {};
      clientsWithMultipleAppointments?.forEach(appt => {
        clientCounts[appt.client_id] = (clientCounts[appt.client_id] || 0) + 1;
      });

      const returningClients = Object.values(clientCounts).filter(count => count > 1).length;
      const totalClients = Object.keys(clientCounts).length;
      const returnRate = totalClients > 0 ? Math.round((returningClients / totalClients) * 100) : 0;

      // 5. Dados do Gráfico Semanal
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const { count: dayAppointments } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('appointment_date', dateStr)
          .neq('status', 'Cancelado');

        const { count: dayCancellations } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('appointment_date', dateStr)
          .eq('status', 'Cancelado');

        weeklyData.push({
          appointments: dayAppointments || 0,
          cancellations: dayCancellations || 0
        });
      }

      // 6. Próximos Agendamentos
      const { data: upcomingAppointments } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          start_time,
          status,
          clients ( full_name, avatar_url ),
          services ( name )
        `)
        .gte('appointment_date', today)
        .neq('status', 'Cancelado')
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(4);

      const formattedUpcomingClients = upcomingAppointments?.map(appt => ({
        id: appt.id,
        name: appt.clients?.full_name || 'Cliente Oculto',
        avatar: appt.clients?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/1154/1154448.png',
        procedure: appt.services?.name || 'Serviço sob Consulta',
        time: appt.start_time?.substring(0, 5) || '00:00',
        date: appt.appointment_date,
        confirmed: appt.status === 'Confirmado' || appt.status === 'Concluído',
        dimmed: appt.status === 'Remarcado'
      })) || [];

      // Calcular crescimento (simulado por enquanto)
      const revenueGrowth = monthlyRevenue > 0 ? '+12% vs mês anterior' : 'Sem dados anteriores';
      const clientsGrowth = newClientsThisMonth > 0 ? 'Crescimento constante' : 'Sem novos clientes';

      setData({
        appointmentsToday: appointmentsToday || 0,
        appointmentsProgress: appointmentsToday > 0 ? `${Math.min(appointmentsToday * 10, 100)}%` : '0%',
        monthlyRevenue,
        revenueGrowth,
        newClientsThisMonth: newClientsThisMonth || 0,
        clientsGrowth,
        returnRate: `${returnRate}%`,
        returnRateWidth: `${returnRate}%`,
        weeklyChartData: {
          appointments: weeklyData.map(d => d.appointments),
          cancellations: weeklyData.map(d => d.cancellations),
          labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
        },
        upcomingClients: formattedUpcomingClients
      });

    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { data, loading, error, refetch };
};