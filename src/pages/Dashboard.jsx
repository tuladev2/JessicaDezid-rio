import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [currentKpi, setCurrentKpi] = useState({
    appointmentsToday: 0,
    appointmentsProgress: '0%',
    monthlyRevenue: 0,
    revenueGrowth: '+0% vs mês anterior',
    newClientsThisMonth: 0,
    clientsGrowth: '+0% vs mês anterior',
    returnRate: '0%',
    returnRateWidth: '0%',
  });

  const [upcomingClients, setUpcomingClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

        // 1. Agendamentos Hoje (Count)
        const { count: countToday } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('appointment_date', today)
          .neq('status', 'Cancelado');

        // 2. Novos Clientes este Mês (Count)
        const { count: countClientsMonth } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth);

        // 3. Receita Mensal Real
        // Trazendo agendamentos do mes para somar a receita (assumindo total_value_charged)
        const { data: monthAppointments } = await supabase
          .from('appointments')
          .select('total_value_charged')
          .gte('appointment_date', startOfMonth)
          .neq('status', 'Cancelado');

        const revenue = monthAppointments?.reduce((acc, curr) => acc + (curr.total_value_charged || 0), 0) || 0;

        // 4. Próximos Agendamentos (Lista)
        const { data: nextAppts } = await supabase
          .from('appointments')
          .select(`
            id,
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

        // Map para o formato de UI preservando placeholders se vazios
        const formattedNextClients = nextAppts?.map(appt => ({
          name: appt.clients?.full_name || 'Cliente Oculto',
          avatar: appt.clients?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/1154/1154448.png',
          procedure: appt.services?.name || 'Serviço sob Consulta',
          time: appt.start_time?.substring(0, 5) || '00:00',
          confirmed: appt.status === 'Confirmado' || appt.status === 'Concluído',
          dimmed: appt.status === 'Remarcado'
        })) || [];

        setCurrentKpi({
          appointmentsToday: countToday || 0,
          appointmentsProgress: countToday > 0 ? `${Math.min(countToday * 10, 100)}%` : '0%', // Mock logic for progress
          monthlyRevenue: revenue,
          revenueGrowth: '+12% vs ontem', // Placeholder logic 
          newClientsThisMonth: countClientsMonth || 0,
          clientsGrowth: 'Constante',
          returnRate: '95%',
          returnRateWidth: '95%',
        });

        setUpcomingClients(formattedNextClients);

      } catch (err) {
        console.error('Erro na integração do Blueprint:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const dynamicStats = [
    { 
      label: 'Agendamentos Hoje', 
      value: currentKpi.appointmentsToday.toString().padStart(2, '0'), 
      icon: 'calendar_month', 
      hasBar: true, 
      barWidth: currentKpi.appointmentsProgress 
    },
    { 
      label: 'Faturamento Mensal', 
      value: formatCurrency(currentKpi.monthlyRevenue), 
      icon: 'attach_money', 
      sub: currentKpi.revenueGrowth 
    },
    { 
      label: 'Novos Clientes', 
      value: `+${currentKpi.newClientsThisMonth.toString()}`, 
      icon: 'person_add', 
      sub: currentKpi.clientsGrowth 
    },
    { 
      label: 'Taxa de Retorno', 
      value: currentKpi.returnRate, 
      icon: 'sync', 
      hasBar: true, 
      barWidth: currentKpi.returnRateWidth 
    },
  ];

  return (
    <div className="px-12 py-10">
      {/* Page Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Painel de Controle</p>
          <h2 className="font-serif text-3xl text-on-surface">Visão Geral</h2>
        </div>
        <p className="text-xs text-outline font-body">
          Última atualização: <span className="text-on-surface">Dados em Tempo Real</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {dynamicStats.map((stat, i) => (
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
            {loading ? (
               <div className="h-9 w-24 bg-surface-container/50 animate-pulse rounded mb-1"></div>
            ) : (
               <p className="text-3xl font-light text-on-surface mb-1 font-body">{stat.value}</p>
            )}
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
        ))}
      </div>

      {/* Bottom Section: Two Columns */}
      <div className="grid grid-cols-5 gap-6 mt-2">
        {/* Left: Growth Chart */}
        <div className="col-span-3 bg-surface-container-lowest rounded-2xl p-8 editorial-shadow">
          <div className="flex items-center justify-between mb-6">
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

          {/* SVG Chart (Static Design Placeholder as requested) */}
          <svg viewBox="0 0 600 240" className="w-[100%] h-[auto]">
            {/* Grid lines */}
            {[0, 60, 120, 180, 240].map((y) => (
              <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#e9e1dd" strokeWidth="0.5" />
            ))}

            {/* Main line */}
            <polyline
              points="0,200 100,170 200,130 300,90 400,120 500,70 600,40"
              fill="none"
              stroke="#775841"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Fill gradient */}
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#775841" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#775841" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points="0,200 100,170 200,130 300,90 400,120 500,70 600,40 600,240 0,240"
              fill="url(#chartGrad)"
            />

            {/* Secondary line */}
            <polyline
              points="0,220 100,210 200,200 300,190 400,200 500,195 600,185"
              fill="none"
              stroke="#48626c"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              strokeLinecap="round"
            />

            {/* Day labels */}
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d, i) => (
              <text
                key={d}
                x={i * 100}
                y={238}
                className="text-[10px] fill-outline"
                textAnchor="middle"
              >
                {d}
              </text>
            ))}
          </svg>
        </div>

        {/* Right: Next Clients */}
        <div className="col-span-2 bg-surface-container-lowest rounded-2xl p-8 editorial-shadow flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg text-on-surface">Próximas Clientes</h3>
            <button className="text-xs text-primary font-medium hover:underline tracking-widest uppercase">Ver todas</button>
          </div>

          <div className="space-y-4 flex-1">
            {loading ? (
               <div className="flex items-center justify-center h-full">
                 <span className="material-symbols-outlined animate-spin text-primary">sync</span>
               </div>
            ) : upcomingClients.length > 0 ? (
               upcomingClients.map((client, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:bg-primary/5 border border-transparent hover:border-outline-variant/30 ${
                    client.dimmed ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      alt={client.name}
                      className="w-10 h-10 rounded-full object-cover grayscale-[20%]"
                      src={client.avatar}
                    />
                    <div>
                      <p className="text-sm font-medium text-on-surface">{client.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-secondary mt-0.5">{client.procedure}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-xs font-semibold text-primary">{client.time}</span>
                    {client.confirmed && (
                      <span className="material-symbols-outlined text-green-600/80 text-sm">check_circle</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
               <div className="flex flex-col items-center justify-center h-full text-center p-6 text-secondary bg-surface-container-low/50 rounded-xl dashed-border">
                 <span className="material-symbols-outlined text-4xl mb-2 text-outline-variant">event_available</span>
                 <p className="text-sm">Nenhum agendamento pendente para os próximos dias.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
