import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import AgendamentoModal from '../components/AgendamentoModal';

const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

// Helper para converter horário em posição em pixels (100px = 1 hora)
const timeToPixels = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  const startH = 8; // 08:00
  if (h < startH) return 0;
  return ((h - startH) * 60 + m) * (100 / 60); // 100px por hora
};

// Helper para obter datas da semana
const getWeekDates = (weekOffset = 0) => {
  const today = new Date();
  const currentWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1 + (weekOffset * 7)));
  const weekDates = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeek);
    date.setDate(currentWeek.getDate() + i);
    weekDates.push(date);
  }
  
  return weekDates;
};

// Skeleton para loading
const CalendarSkeleton = () => (
  <div className="animate-pulse">
    {hours.map((hour) => (
      <div key={hour} className="calendar-grid">
        <div className="time-slot flex items-start justify-end pr-3 pt-2">
          <div className="h-3 w-8 bg-surface-container rounded"></div>
        </div>
        {days.map((_, di) => (
          <div key={di} className="time-slot border-l border-outline-variant/10">
            {Math.random() > 0.7 && (
              <div className="m-1 h-12 bg-surface-container rounded-lg"></div>
            )}
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default function Agendas() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0); // Para mobile
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [roomCapacity, setRoomCapacity] = useState({
    sala01: { current: 0, max: 8 },
    sala02: { current: 0, max: 8 },
    sala03: { current: 0, max: 8 }
  });

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calcular datas da semana
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  
  // Label da semana
  const weekLabel = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('pt-BR', { month: 'long' })}, ${start.getFullYear()}`;
  }, [weekDates]);

  // Buscar agendamentos
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const startDate = weekDates[0].toISOString().split('T')[0];
      const endDate = weekDates[6].toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data,
          horario_inicio,
          horario_fim,
          status,
          valor,
          notas,
          cliente_id,
          servico_id,
          plano_pacote_id,
          clients(full_name, phone, cpf),
          planos_pacotes(nome_pacote, procedimento)
        `)
        .gte('data', startDate)
        .lte('data', endDate)
        .neq('status', 'Cancelado')
        .order('data', { ascending: true })
        .order('horario_inicio', { ascending: true });

      if (error) throw error;

      const formatted = (data || []).map(apt => {
        const aptDate = new Date(apt.data + 'T00:00:00');
        const dayIndex = aptDate.getDay() === 0 ? 6 : aptDate.getDay() - 1; // Segunda = 0

        const [startH, startM] = apt.horario_inicio.split(':').map(Number);
        const [endH, endM] = apt.horario_fim.split(':').map(Number);
        const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);

        // Resolver nome do procedimento: pacote > notas > fallback
        const procedure =
          apt.planos_pacotes?.procedimento ||
          apt.planos_pacotes?.nome_pacote ||
          apt.notas ||
          'Procedimento';

        return {
          id: apt.id,
          name: apt.clients?.full_name || 'Cliente',
          procedure,
          time: `${apt.horario_inicio.slice(0, 5)} - ${apt.horario_fim.slice(0, 5)}`,
          day: dayIndex,
          // Offset de 2px para não encostar na linha divisória de cima
          top: timeToPixels(apt.horario_inicio) + 2,
          // Subtrair 4px (2px top + 2px bottom) para não encostar na linha de baixo
          height: Math.max(46, durationMinutes * (100 / 60) - 4),
          status: apt.status,
          phone: apt.clients?.phone,
          cpf: apt.clients?.cpf,
          valor: apt.valor,
          agendamento_id: apt.id
        };
      });

      setAppointments(formatted);

      // Capacidade baseada no máximo simultâneo do dia
      const simultaneos = {};
      formatted.forEach(apt => {
        const key = `${apt.day}-${apt.time.split(' - ')[0]}`;
        simultaneos[key] = (simultaneos[key] || 0) + 1;
      });
      const maxSimultaneo = Object.values(simultaneos).reduce((a, b) => Math.max(a, b), 0);

      setRoomCapacity({
        sala01: { current: Math.min(maxSimultaneo, 8), max: 8 },
        sala02: { current: 0, max: 8 },
        sala03: { current: 0, max: 8 }
      });

    } catch (err) {
      console.error('[Agendas] Erro ao buscar agendamentos:', err.message);
      showNotification('Erro ao carregar agendamentos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [weekOffset, weekDates]);

  // Função para mostrar notificações
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Navegar semanas
  const navigateWeek = (direction) => {
    setWeekOffset(prev => prev + direction);
  };

  // Atualizar status de agendamento
  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;
      
      showNotification(`Agendamento marcado como ${newStatus.toLowerCase()}!`, 'success');
      setDetailsModalOpen(false);
      fetchAppointments();
    } catch (err) {
      console.error('[Agendas] Erro ao atualizar status:', err.message);
      showNotification('Erro ao atualizar agendamento', 'error');
    }
  };

  // Cancelar agendamento
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) return;

    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'Cancelado' })
        .eq('id', appointmentId);

      if (error) throw error;
      
      showNotification('Agendamento cancelado com sucesso!', 'success');
      setDetailsModalOpen(false);
      fetchAppointments(); // Recarregar dados
    } catch (err) {
      console.error('[Agendas] Erro ao cancelar agendamento:', err.message);
      showNotification('Erro ao cancelar agendamento', 'error');
    }
  };

  // Iniciar atendimento
  const handleStartAttendance = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'Em atendimento' })
        .eq('id', appointmentId);

      if (error) throw error;

      showNotification('Atendimento iniciado!', 'success');
      fetchAppointments();
    } catch (err) {
      console.error('[Agendas] Erro ao iniciar atendimento:', err.message);
      showNotification('Erro ao iniciar atendimento', 'error');
    }
  };

  // Clicar em espaço vazio da grade
  const handleGridClick = (dayIndex, hour) => {
    const selectedDate = weekDates[dayIndex];
    const [hourNum] = hour.split(':').map(Number);
    
    setSelectedDate(selectedDate.toISOString().split('T')[0]);
    setSelectedTime(`${hourNum.toString().padStart(2, '0')}:00`);
    setModalOpen(true);
  };

  // Próximo agendamento
  const nextAppointment = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().substring(0, 5);
    
    return appointments.find(apt => {
      const aptDate = weekDates[apt.day]?.toISOString().split('T')[0];
      return aptDate === today && apt.time.split(' - ')[0] > currentTime;
    });
  }, [appointments, weekDates]);

  return (
    <div className="px-4 lg:px-12 py-6 lg:py-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 lg:mb-8 gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Controle de Agenda</p>
          <h2 className="font-serif text-2xl lg:text-3xl text-on-surface">
            {isMobile ? 'Agenda do Dia' : 'Agenda Semanal'}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigateWeek(-1)}
            className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-primary/5 transition-all"
          >
            <span className="material-symbols-outlined text-sm text-secondary">chevron_left</span>
          </button>
          <p className="text-sm text-on-surface font-medium min-w-48 text-center">{weekLabel}</p>
          <button 
            onClick={() => navigateWeek(1)}
            className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-primary/5 transition-all"
          >
            <span className="material-symbols-outlined text-sm text-secondary">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Notificações Toast */}
      {notification && (
        <div className={`
          fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-2 min-w-80 max-w-md
          ${notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-red-50 text-red-800 border-red-200'
          }
        `}>
          <span className="material-symbols-outlined text-lg">
            {notification.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="flex-1">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Layout Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Calendário - Mobile: Lista do Dia / Desktop: Grade Semanal */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl editorial-shadow overflow-hidden relative">
          
          {loading && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-20 flex items-center justify-center">
              <CalendarSkeleton />
            </div>
          )}

          {/* Mobile: Seletor de Dia com scroll horizontal */}
          {isMobile && (
            <div className="border-b border-outline-variant/20 p-4 overflow-x-auto">
              <div className="flex gap-2 min-w-min">
                {weekDates.map((date, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(i)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-center transition-colors ${
                      selectedDay === i 
                        ? 'bg-primary text-on-primary' 
                        : 'bg-surface-container text-secondary hover:bg-primary/10'
                    }`}
                  >
                    <p className="text-xs font-medium">{days[i].slice(0, 3)}</p>
                    <p className="text-sm font-light">{date.getDate()}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop: Cabeçalho dos Dias */}
          {!isMobile && (
            <div className="calendar-grid border-b border-outline-variant/20">
              <div className="py-4 px-3"></div>
              {days.map((day, i) => (
                <div key={day} className="py-4 px-3 text-center">
                  <p className="text-[10px] tracking-widest uppercase text-secondary">{day.slice(0, 3)}</p>
                  <p className={`text-lg font-light mt-1 ${
                    weekDates[i]?.toDateString() === new Date().toDateString() 
                      ? 'text-primary font-medium' 
                      : 'text-on-surface'
                  }`}>
                    {weekDates[i]?.getDate()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Mobile: Lista do Dia */}
          {isMobile ? (
            <div className="p-4 space-y-3">
              {appointments
                .filter(apt => apt.day === selectedDay)
                .map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-4 bg-primary/5 border-l-4 border-primary rounded-xl hover:bg-primary/10 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setDetailsModalOpen(true);
                    }}
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={apt.avatar || 'https://cdn-icons-png.flaticon.com/512/1154/1154448.png'}
                        alt={apt.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{apt.name}</p>
                      <p className="text-xs text-secondary truncate">{apt.procedure}</p>
                      <p className="text-xs text-outline mt-1">{apt.time}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                        apt.status === 'Confirmado' ? 'bg-green-100 text-green-800' :
                        apt.status === 'Em atendimento' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                        apt.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                        apt.status === 'Rejeitado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {apt.status || 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
              
              {appointments.filter(apt => apt.day === selectedDay).length === 0 && (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 block">event_available</span>
                  <p className="text-sm text-secondary">Nenhum agendamento para este dia</p>
                </div>
              )}
            </div>
          ) : (
            /* Desktop: Grade de Horários */
            <div className="relative">
              {hours.map((hour) => (
                <div key={hour} className="calendar-grid">
                  <div className="time-slot flex items-start justify-end pr-3 pt-2">
                    <span className="text-[10px] text-outline">{hour}</span>
                  </div>
                  {days.map((_, di) => (
                    <div 
                      key={di} 
                      className="time-slot border-l border-outline-variant/10 hover:bg-primary/5 cursor-pointer transition-colors"
                      onClick={() => handleGridClick(di, hour)}
                    />
                  ))}
                </div>
              ))}

              {/* Cards de Agendamento — posicionados absolutamente sobre a grade */}
              {appointments.map((apt, idx) => {
                // Detectar sobreposição no mesmo dia/horário para posicionar lado a lado
                const overlap = appointments.filter(
                  (a, i) => i < idx && a.day === apt.day &&
                    Math.abs(a.top - apt.top) < apt.height
                ).length;
                const overlapTotal = appointments.filter(
                  a => a.day === apt.day && Math.abs(a.top - apt.top) < apt.height
                ).length;
                const widthFraction = overlapTotal > 1 ? 1 / overlapTotal : 1;
                const leftOffset = overlap * widthFraction;

                return (
                  <div
                    key={apt.id}
                    className="absolute rounded-md shadow-sm cursor-pointer z-10 overflow-hidden
                               bg-[#f5ede8] border border-[#c9a98a]/40 hover:bg-[#ede0d8] 
                               hover:border-[#b8906f] hover:shadow-md transition-all duration-200"
                    style={{
                      top: `${apt.top}px`,
                      left: `calc(80px + (${apt.day} + ${leftOffset}) * ((100% - 80px) / 7) + 3px)`,
                      width: `calc((100% - 80px) / 7 * ${widthFraction} - 6px)`,
                      height: `${apt.height}px`,
                    }}
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setDetailsModalOpen(true);
                    }}
                  >
                    {/* Barra lateral accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#8b5e3c]" />

                    {/* Conteúdo — centralizado verticalmente, afastado das linhas divisórias */}
                    <div className="flex flex-col justify-center h-full pl-3 pr-2 py-1.5">
                      <p className="text-[10px] font-semibold text-[#4A3728] truncate leading-snug">
                        {apt.name}
                      </p>
                      <p className="text-[9px] text-[#7a5c42] truncate leading-snug mt-0.5">
                        {apt.procedure}
                      </p>
                      {apt.height >= 64 && (
                        <p className="text-[8px] text-[#a08060] leading-snug mt-0.5 tabular-nums">
                          {apt.time}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Painel Lateral */}
        <div className="lg:col-span-1 space-y-4 lg:space-y-6">
          {/* Capacidade das Salas */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 lg:p-6 editorial-shadow">
            <p className="text-xs tracking-widest uppercase text-secondary mb-4">Capacidade</p>
            <div className="space-y-4">
              {Object.entries(roomCapacity).map(([room, capacity]) => (
                <div key={room}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface font-medium">
                      {room === 'sala01' ? 'Sala 01' : room === 'sala02' ? 'Sala 02' : 'Sala 03'}
                    </span>
                    <span className="text-secondary">{capacity.current}/{capacity.max}</span>
                  </div>
                  <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${(capacity.current / capacity.max) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Próximo Atendimento */}
          {nextAppointment && (
            <div className="bg-surface-container-lowest rounded-2xl p-4 lg:p-6 editorial-shadow">
              <p className="text-xs tracking-widest uppercase text-secondary mb-4">Próximo Atendimento</p>
              <div className="flex items-center gap-3 mb-4">
                <img
                  alt={nextAppointment.name}
                  className="w-12 h-12 rounded-full object-cover grayscale-[20%]"
                  src={nextAppointment.avatar || 'https://cdn-icons-png.flaticon.com/512/1154/1154448.png'}
                />
                <div>
                  <p className="text-sm font-semibold text-on-surface">{nextAppointment.name}</p>
                  <p className="text-[10px] text-secondary mt-0.5">{nextAppointment.procedure}</p>
                  <p className="text-[10px] text-outline mt-0.5">{nextAppointment.time}</p>
                </div>
              </div>
              <button 
                onClick={() => handleStartAttendance(nextAppointment.id)}
                className="w-full py-3 border border-primary text-primary rounded-xl text-xs font-semibold tracking-wider uppercase hover:bg-primary hover:text-on-primary transition-all duration-300"
              >
                Iniciar Atendimento
              </button>
            </div>
          )}

          {/* Estatísticas do Dia */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 lg:p-6 editorial-shadow">
            <p className="text-xs tracking-widest uppercase text-secondary mb-4">Hoje</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-secondary">Total</span>
                <span className="text-lg font-light text-on-surface">
                  {appointments.filter(apt => {
                    const today = new Date().toISOString().split('T')[0];
                    const aptDate = weekDates[apt.day]?.toISOString().split('T')[0];
                    return aptDate === today;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-secondary">Confirmados</span>
                <span className="text-sm font-medium text-green-600">
                  {appointments.filter(apt => {
                    const today = new Date().toISOString().split('T')[0];
                    const aptDate = weekDates[apt.day]?.toISOString().split('T')[0];
                    return aptDate === today && apt.status === 'Confirmado';
                  }).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão Flutuante Mobile */}
      {isMobile && (
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
        >
          <span className="material-symbols-outlined text-xl">add</span>
        </button>
      )}

      {/* Modal de Agendamento */}
      <AgendamentoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedDate(null);
          setSelectedTime(null);
        }}
        onSuccess={() => {
          showNotification('Agendamento criado com sucesso!', 'success');
          fetchAppointments();
        }}
        prefilledDate={selectedDate}
        prefilledTime={selectedTime}
      />

      {/* Modal de Detalhes do Agendamento */}
      {detailsModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md editorial-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-on-surface">Detalhes do Agendamento</h3>
              <button 
                onClick={() => setDetailsModalOpen(false)}
                className="text-secondary hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Cliente */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 font-semibold">Cliente</p>
                <p className="text-lg font-medium text-on-surface">{selectedAppointment.name}</p>
              </div>

              {/* Procedimento */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 font-semibold">Procedimento</p>
                <p className="text-lg font-medium text-on-surface">{selectedAppointment.procedure}</p>
              </div>

              {/* Horário */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 font-semibold">Horário</p>
                <p className="text-lg font-medium text-on-surface">{selectedAppointment.time}</p>
              </div>

              {/* Telefone */}
              {selectedAppointment.phone && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 font-semibold">Telefone</p>
                  <p className="text-lg font-medium text-on-surface">{selectedAppointment.phone}</p>
                </div>
              )}

              {/* CPF */}
              {selectedAppointment.cpf && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 font-semibold">CPF</p>
                  <p className="text-lg font-medium text-on-surface">{selectedAppointment.cpf}</p>
                </div>
              )}

              {/* Valor */}
              {selectedAppointment.valor && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 font-semibold">Valor</p>
                  <p className="text-lg font-medium text-on-surface">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedAppointment.valor)}
                  </p>
                </div>
              )}

              {/* Status */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 font-semibold">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  selectedAppointment.status === 'Confirmado' ? 'bg-green-100 text-green-800' :
                  selectedAppointment.status === 'Em atendimento' ? 'bg-blue-100 text-blue-800' :
                  selectedAppointment.status === 'Realizado' ? 'bg-gray-100 text-gray-600' :
                  selectedAppointment.status === 'Rejeitado' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedAppointment.status || 'Pendente'}
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {selectedAppointment.status === 'Pendente' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedAppointment.agendamento_id, 'Confirmado')}
                    className="py-2.5 bg-green-600 text-white rounded-xl text-[10px] font-semibold tracking-wider uppercase hover:bg-green-700 transition-all"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedAppointment.agendamento_id, 'Rejeitado')}
                    className="py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-semibold tracking-wider uppercase hover:bg-red-700 transition-all"
                  >
                    Rejeitar
                  </button>
                </>
              )}
              
              {selectedAppointment.status === 'Confirmado' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedAppointment.agendamento_id, 'Em atendimento')}
                    className="py-2.5 bg-primary text-on-primary rounded-xl text-[10px] font-semibold tracking-wider uppercase hover:opacity-90 transition-all"
                  >
                    Atender agora
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(selectedAppointment.agendamento_id)}
                    className="py-2.5 bg-surface-container text-on-surface rounded-xl text-[10px] font-semibold tracking-wider uppercase hover:bg-surface-container-high transition-all"
                  >
                    Cancelar
                  </button>
                </>
              )}

              {selectedAppointment.status === 'Em atendimento' && (
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.agendamento_id, 'Realizado')}
                  className="col-span-2 py-2.5 bg-green-600 text-white rounded-xl text-[10px] font-semibold tracking-wider uppercase hover:bg-green-700 transition-all"
                >
                  Concluir Atendimento
                </button>
              )}
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="flex-1 py-3 bg-surface-container text-on-surface rounded-xl text-xs font-semibold tracking-wider uppercase hover:bg-surface-container-high transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
