import React from 'react';
import { supabase } from '../lib/supabase';

// Move hook to the top to help with line mapping diagnostics
export const useDashboardData = () => {
  const [data, setData] = React.useState(DATA_VAZIA);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [refreshingMetric, setRefreshingMetric] = React.useState(null);

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        fetchAgendamentosHoje(),
        fetchFaturamentoMensal(),
        fetchNovosClientes(),
        fetchTaxaRetorno(),
        fetchGraficoSemanal(),
        fetchProximosAgendamentos(),
      ]);

      const [hoje_, faturamento, novosClientes, taxaRetorno, grafico, proximos] = results.map(r => 
        r.status === 'fulfilled' ? r.value : null
      );

      setData({
        appointmentsToday: hoje_ ?? 0,
        appointmentsProgress: `${Math.min((hoje_ ?? 0) * 10, 100)}%`,
        monthlyRevenue: faturamento ?? 0,
        newClientsThisMonth: novosClientes ?? 0,
        returnRate: taxaRetorno ?? 0,
        returnRateWidth: `${taxaRetorno ?? 0}%`,
        weeklyChartData: grafico ?? DATA_VAZIA.weeklyChartData,
        upcomingClients: proximos ?? [],
      });
    } catch (err) {
      console.error('[Dashboard] fetchAll critial error:', err.message);
      setError('Erro ao carregar dados do dashboard.');
      setData(DATA_VAZIA);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMetric = React.useCallback(async (metric) => {
    setRefreshingMetric(metric);
    try {
      switch (metric) {
        case 'hoje': {
          const v = await fetchAgendamentosHoje();
          setData(prev => ({ ...prev, appointmentsToday: v, appointmentsProgress: `${Math.min(v * 10, 100)}%` }));
          break;
        }
        case 'faturamento': {
          const v = await fetchFaturamentoMensal();
          setData(prev => ({ ...prev, monthlyRevenue: v }));
          break;
        }
        case 'clientes': {
          const v = await fetchNovosClientes();
          setData(prev => ({ ...prev, newClientsThisMonth: v }));
          break;
        }
        case 'retorno': {
          const v = await fetchTaxaRetorno();
          setData(prev => ({ ...prev, returnRate: v, returnRateWidth: `${v}%` }));
          break;
        }
        default:
          await fetchAll();
      }
    } catch (err) {
      console.error(`[Dashboard] refresh ${metric}:`, err.message);
    } finally {
      setRefreshingMetric(null);
    }
  }, [fetchAll]);

  const refetch = React.useCallback(() => fetchAll(), [fetchAll]);

  React.useEffect(() => { fetchAll(); }, [fetchAll]);

  return { data, loading, error, refetch, refreshMetric, refreshingMetric };
};

const LABELS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const DATA_VAZIA = {
  appointmentsToday: 0,
  appointmentsProgress: '0%',
  monthlyRevenue: 0,
  newClientsThisMonth: 0,
  returnRate: 0,
  returnRateWidth: '0%',
  weeklyChartData: Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: LABELS_SEMANA[d.getDay()],
      agendamentos: 0,
      cancelados: 0,
    };
  }),
  upcomingClients: [],
};

// ── Helpers de data ──────────────────────────────────────────────────────────
function hoje() {
  return new Date().toISOString().split('T')[0];
}
function inicioMes() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
}
function fimMes() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
}
function diasUltimos7() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

// ── Queries individuais ──────────────────────────────────────────────────────
async function fetchAgendamentosHoje() {
  try {
    const { count, error } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('data', hoje())
      .in('status', ['Confirmado', 'Concluído', 'Realizado']);
    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('[Dashboard] agendamentos hoje:', err.message);
    return 0;
  }
}

async function fetchFaturamentoMensal() {
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('valor')
      .gte('data', inicioMes())
      .lte('data', fimMes())
      .in('status', ['Concluído', 'Realizado', 'Pago']);
    if (error) throw error;
    return (data || []).reduce((acc, r) => acc + (Number(r.valor) || 0), 0);
  } catch (err) {
    console.error('[Dashboard] faturamento mensal:', err.message);
    return 0;
  }
}

async function fetchNovosClientes() {
  try {
    const { count, error } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', inicioMes() + 'T00:00:00');
    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('[Dashboard] novos clientes:', err.message);
    return 0;
  }
}

async function fetchTaxaRetorno() {
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('cliente_id')
      .neq('status', 'Cancelado');
    if (error) throw error;

    const contagem = {};
    (data || []).forEach(({ cliente_id }) => {
      if (cliente_id) contagem[cliente_id] = (contagem[cliente_id] || 0) + 1;
    });

    const total = Object.keys(contagem).length;
    const recorrentes = Object.values(contagem).filter(n => n >= 2).length;
    return total > 0 ? Math.round((recorrentes / total) * 100) : 0;
  } catch (err) {
    console.error('[Dashboard] taxa retorno:', err.message);
    return 0;
  }
}

async function fetchGraficoSemanal() {
  const dias = diasUltimos7();
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('data, status')
      .gte('data', dias[0])
      .lte('data', dias[6]);

    if (error) throw error;

    return dias.map((dateStr) => {
      const d = new Date(dateStr + 'T00:00:00');
      const registros = (data || []).filter(r => r.data === dateStr);
      return {
        label: LABELS_SEMANA[d.getDay()],
        agendamentos: registros.filter(r => r.status !== 'Cancelado').length,
        cancelados: registros.filter(r => r.status === 'Cancelado').length,
      };
    });
  } catch (err) {
    console.error('[Dashboard] gráfico semanal:', err.message);
    return dias.map((dateStr) => {
      const d = new Date(dateStr + 'T00:00:00');
      return { label: LABELS_SEMANA[d.getDay()], agendamentos: 0, cancelados: 0 };
    });
  }
}

async function fetchProximosAgendamentos() {
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        id,
        data,
        horario_inicio,
        status,
        notas,
        clients ( full_name, avatar_url ),
        planos_pacotes ( nome_pacote, procedimento )
      `)
      .gte('data', hoje())
      .in('status', ['Confirmado', 'Remarcado'])
      .order('data', { ascending: true })
      .order('horario_inicio', { ascending: true })
      .limit(4);

    if (error) throw error;

    return (data || []).map(appt => ({
      id: appt.id,
      name: appt.clients?.full_name || 'Cliente',
      avatar: appt.clients?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/1154/1154448.png',
      procedure:
        appt.planos_pacotes?.procedimento ||
        appt.planos_pacotes?.nome_pacote ||
        appt.notas ||
        'Procedimento',
      time: appt.horario_inicio?.slice(0, 5) || '00:00',
      date: appt.data,
      confirmed: appt.status === 'Confirmado',
      dimmed: appt.status === 'Remarcado',
    }));
  } catch (err) {
    console.error('[Dashboard] próximos agendamentos:', err.message);
    return [];
  }
}
