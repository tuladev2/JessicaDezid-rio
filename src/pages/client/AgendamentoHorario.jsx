import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// Mapa de nome do dia (pt-BR) para índice JS (0=Dom)
const DIA_NOME_PARA_JS = {
  'Domingo': 0, 'Segunda-feira': 1, 'Terça-feira': 2,
  'Quarta-feira': 3, 'Quinta-feira': 4, 'Sexta-feira': 5, 'Sábado': 6
};

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Converte "HH:MM" em minutos desde meia-noite
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

// Adiciona N minutos a "HH:MM" e retorna "HH:MM"
const addMin = (t, n) => {
  const total = toMin(t) + n;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const formatarMoeda = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

// Gera array de datas do mês (com padding de dias anteriores)
function buildCalendarMonth(year, month) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Dom
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

export default function AgendamentoHorario() {
  const navigate = useNavigate();

  // ── Dados do localStorage ──────────────────────────────────────────────
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [clienteAgendamento, setClienteAgendamento] = useState(null);

  // ── Calendário ────────────────────────────────────────────────────────
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null); // Date object

  // ── Configurações da clínica ──────────────────────────────────────────
  const [diasAtivos, setDiasAtivos] = useState({}); // { 1: {inicio:'09:00', fim:'19:00'}, ... }
  const [bloqueios, setBloqueios] = useState([]);    // array de Date strings 'YYYY-MM-DD'
  const [intervaloMin, setIntervaloMin] = useState(30);

  // ── Slots de horário ──────────────────────────────────────────────────
  const [slots, setSlots] = useState([]);
  const [slotsOcupados, setSlotsOcupados] = useState([]); // ['HH:MM', ...]
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);

  // ── Confirmação ───────────────────────────────────────────────────────
  const [confirmando, setConfirmando] = useState(false);

  // ── 1. Carregar localStorage ──────────────────────────────────────────
  useEffect(() => {
    const pacoteRaw = localStorage.getItem('pacote_selecionado');
    const servicoRaw = localStorage.getItem('servico_selecionado');
    const clienteRaw = localStorage.getItem('cliente_agendamento');

    if (!clienteRaw) {
      navigate(servicoRaw ? '/agendar/dados?origem=servico' : pacoteRaw ? '/agendar/dados?origem=pacote' : '/agendar');
      return;
    }

    try { setClienteAgendamento(JSON.parse(clienteRaw)); } catch { navigate('/agendar/dados?origem=servico'); return; }

    if (pacoteRaw) {
      try {
        const p = JSON.parse(pacoteRaw);
        setItemSelecionado({
          id: p.id, tipo: 'pacote',
          procedimento: p.procedimento || p.nome || p.nome_pacote || 'Pacote',
          valor: p.valor_total || 0,
          duracao: p.duracao_minutos || 60,
          sessoes: p.quantidade_sessoes || 6,
        });
      } catch { navigate('/tratamentos'); }
    } else if (servicoRaw) {
      try {
        const s = JSON.parse(servicoRaw);
        setItemSelecionado({
          id: s.id, tipo: 'servico_avulso',
          procedimento: s.nome || s.procedimento || 'Serviço',
          valor: s.preco || 0,
          duracao: s.duracao_minutos || 60,
          sessoes: 1,
          isMock: s.isMock || false,
        });
      } catch { navigate('/agendar'); }
    } else {
      navigate('/agendar');
    }
  }, [navigate]);

  // ── 2. Carregar configurações da clínica ──────────────────────────────
  useEffect(() => {
    async function loadConfig() {
      try {
        const { data } = await supabase.from('config_agenda').select('*');
        if (!data) return;

        const dias = {};
        data.forEach(row => {
          if (row.dia && row.ativo) {
            const jsDay = DIA_NOME_PARA_JS[row.dia];
            if (jsDay !== undefined) dias[jsDay] = { inicio: row.inicio, fim: row.fim };
          }
          if (row.tipo === 'regras' && row.intervalo) setIntervaloMin(row.intervalo);
        });
        setDiasAtivos(dias);

        // Bloqueios de datas
        const { data: blq } = await supabase
          .from('bloqueios_datas')
          .select('data_inicio, data_fim')
          .gte('data_fim', today.toISOString().split('T')[0]);

        const bloqueadoSet = [];
        (blq || []).forEach(b => {
          const start = new Date(b.data_inicio + 'T00:00:00');
          const end = b.data_fim ? new Date(b.data_fim + 'T00:00:00') : start;
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            bloqueadoSet.push(d.toISOString().split('T')[0]);
          }
        });
        setBloqueios(bloqueadoSet);
      } catch (err) {
        console.warn('[AgendamentoHorario] Erro ao carregar config:', err.message);
        // Fallback: Seg-Sáb 09:00-19:00
        setDiasAtivos({ 1:{inicio:'09:00',fim:'19:00'}, 2:{inicio:'09:00',fim:'19:00'}, 3:{inicio:'09:00',fim:'19:00'}, 4:{inicio:'09:00',fim:'19:00'}, 5:{inicio:'09:00',fim:'18:00'}, 6:{inicio:'09:00',fim:'14:00'} });
      }
    }
    loadConfig();
  }, []);

  // ── 3. Gerar slots e buscar ocupados ao selecionar data ───────────────
  const carregarSlots = useCallback(async (date) => {
    if (!date || !itemSelecionado) return;
    const config = diasAtivos[date.getDay()];
    if (!config) { setSlots([]); return; }

    setLoadingSlots(true);
    setSelectedTime(null);

    const duracao = itemSelecionado.duracao || 60;
    const dateStr = date.toISOString().split('T')[0];

    // Buscar agendamentos do dia
    let ocupados = [];
    try {
      const { data } = await supabase
        .from('agendamentos')
        .select('horario_inicio, horario_fim')
        .eq('data', dateStr)
        .neq('status', 'Cancelado');

      ocupados = (data || []).map(a => ({
        inicio: toMin(a.horario_inicio.slice(0, 5)),
        fim: toMin(a.horario_fim.slice(0, 5)),
      }));
    } catch (err) {
      console.warn('[AgendamentoHorario] Erro ao buscar ocupados:', err.message);
    }

    // Gerar slots disponíveis
    const gerados = [];
    let cursor = toMin(config.inicio);
    const limiteMin = toMin(config.fim);

    while (cursor + duracao <= limiteMin) {
      const slotInicio = cursor;
      const slotFim = cursor + duracao;
      const horaStr = `${String(Math.floor(slotInicio / 60)).padStart(2, '0')}:${String(slotInicio % 60).padStart(2, '0')}`;

      // Verificar conflito com agendamentos existentes
      const conflito = ocupados.some(o =>
        slotInicio < o.fim && slotFim > o.inicio
      );

      // Bloquear horários passados se for hoje
      const agora = new Date();
      const slotDate = new Date(date);
      slotDate.setHours(Math.floor(slotInicio / 60), slotInicio % 60, 0, 0);
      const passado = slotDate <= agora;

      gerados.push({ hora: horaStr, disponivel: !conflito && !passado });
      cursor += intervaloMin;
    }

    setSlots(gerados);
    setLoadingSlots(false);
  }, [diasAtivos, itemSelecionado, intervaloMin]);

  useEffect(() => {
    if (selectedDate) carregarSlots(selectedDate);
  }, [selectedDate, carregarSlots]);

  // ── Helpers de calendário ─────────────────────────────────────────────
  const isDiaDesabilitado = (date) => {
    if (!date) return true;
    if (date < today) return true;
    if (!diasAtivos[date.getDay()]) return true;
    if (bloqueios.includes(date.toISOString().split('T')[0])) return true;
    return false;
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const calCells = buildCalendarMonth(calYear, calMonth);
  const mesLabel = new Date(calYear, calMonth, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // ── 4. Confirmar agendamento ──────────────────────────────────────────
  const handleConfirmar = async () => {
    if (!selectedDate || !selectedTime || !clienteAgendamento?.id || !itemSelecionado) return;
    setConfirmando(true);

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const horarioFim = addMin(selectedTime, itemSelecionado.duracao || 60);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      const payload = {
        cliente_id: clienteAgendamento.id,
        data: dateStr,
        horario_inicio: selectedTime,
        horario_fim: horarioFim,
        status: 'Confirmado',
        valor: itemSelecionado.valor || 0,
        notas: itemSelecionado.procedimento || '',
      };

      if (itemSelecionado.tipo === 'servico_avulso' && uuidRegex.test(itemSelecionado.id || '')) {
        payload.servico_id = itemSelecionado.id;
      } else if (itemSelecionado.tipo === 'pacote' && uuidRegex.test(itemSelecionado.id || '')) {
        payload.plano_pacote_id = itemSelecionado.id;
      }

      // Mock — sem banco
      if (itemSelecionado.isMock || (!payload.servico_id && !payload.plano_pacote_id)) {
        localStorage.setItem('agendamento_confirmado', JSON.stringify({
          id: `sim_${Date.now()}`, cliente_nome: clienteAgendamento.nome,
          procedimento: itemSelecionado.procedimento, data: dateStr,
          horario: selectedTime, valor: itemSelecionado.valor, tipo: itemSelecionado.tipo,
        }));
        navigate('/agendar/confirmado');
        return;
      }

      const { data: ag, error } = await supabase.from('agendamentos').insert([payload]).select('id').single();
      if (error) throw new Error(`${error.message} (${error.code})`);

      localStorage.setItem('agendamento_confirmado', JSON.stringify({
        id: ag.id, cliente_nome: clienteAgendamento.nome,
        procedimento: itemSelecionado.procedimento, data: dateStr,
        horario: selectedTime, valor: itemSelecionado.valor, tipo: itemSelecionado.tipo,
      }));
      navigate('/agendar/confirmado');
    } catch (err) {
      console.error('[AgendamentoHorario] Erro:', err);
      alert(`Erro ao confirmar agendamento:\n${err.message}`);
      setConfirmando(false);
    }
  };

  const podeConfirmar = !!selectedDate && !!selectedTime && !confirmando;

  return (
    <>
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1920px] mx-auto">
        <section className="mb-16">
          <h1 className="font-headline text-5xl md:text-7xl text-[#4A3728] tracking-tight leading-tight max-w-3xl">
            Escolha o Momento Ideal
          </h1>
          <p className="font-body text-[#4A3728]/80 mt-6 text-lg max-w-xl">
            Selecione a data e o horário que melhor se adaptam ao seu ritmo.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── Calendário ─────────────────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
            <div className="bg-[#faf2ee] p-6 rounded-[3rem] w-full flex flex-col luxury-shadow">
              {/* Navegação mês */}
              <div className="flex justify-between items-center mb-6 px-2">
                <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#efe6e3] transition-colors">
                  <span className="material-symbols-outlined text-[#4A3728] text-sm">chevron_left</span>
                </button>
                <h3 className="font-headline text-base text-[#4A3728] capitalize">{mesLabel}</h3>
                <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#efe6e3] transition-colors">
                  <span className="material-symbols-outlined text-[#4A3728] text-sm">chevron_right</span>
                </button>
              </div>

              {/* Cabeçalho dias */}
              <div className="grid grid-cols-7 mb-2">
                {DIAS_SEMANA.map(d => (
                  <span key={d} className="text-center text-[9px] uppercase tracking-widest text-[#4A3728]/50 font-label py-1">{d}</span>
                ))}
              </div>

              {/* Células */}
              <div className="grid grid-cols-7 gap-y-1">
                {calCells.map((date, i) => {
                  if (!date) return <div key={i} />;
                  const disabled = isDiaDesabilitado(date);
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const isToday = date.toDateString() === today.toDateString();
                  return (
                    <button
                      key={i}
                      disabled={disabled}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        mx-auto w-9 h-9 rounded-full text-sm transition-all duration-200 flex items-center justify-center
                        ${disabled ? 'text-[#4A3728]/20 cursor-not-allowed' : 'cursor-pointer'}
                        ${isSelected ? 'bg-[#775841] text-white luxury-shadow font-semibold' : ''}
                        ${!isSelected && isToday ? 'border border-[#775841] text-[#775841]' : ''}
                        ${!isSelected && !disabled ? 'hover:bg-[#efe6e3] text-[#4A3728]' : ''}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Legenda */}
              <div className="mt-6 pt-4 border-t border-[#d3c3ba]/20 flex items-center gap-4 px-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#775841]" />
                  <span className="text-[9px] text-[#4A3728]/60 font-label uppercase tracking-wider">Selecionado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full border border-[#775841]" />
                  <span className="text-[9px] text-[#4A3728]/60 font-label uppercase tracking-wider">Hoje</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Horários ───────────────────────────────────────────────── */}
          <div className="lg:col-span-5">
            <h2 className="font-headline text-2xl mb-2 text-[#4A3728]">Horários Disponíveis</h2>

            {!selectedDate && (
              <p className="font-body text-sm text-[#4A3728]/50 mb-8">Selecione uma data para ver os horários.</p>
            )}

            {selectedDate && (
              <p className="font-body text-sm text-[#4A3728]/60 mb-8">
                {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                {itemSelecionado?.duracao && (
                  <span className="ml-2 text-[#775841]">· {itemSelecionado.duracao} min por sessão</span>
                )}
              </p>
            )}

            {/* Loading skeleton */}
            {loadingSlots && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-full bg-[#f0e9e5] animate-pulse" />
                ))}
              </div>
            )}

            {/* Slots */}
            {!loadingSlots && selectedDate && slots.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {slots.map(({ hora, disponivel }) => (
                  <button
                    key={hora}
                    disabled={!disponivel}
                    onClick={() => disponivel && setSelectedTime(hora)}
                    className={`py-4 px-6 rounded-full font-label text-sm transition-all duration-200 ${
                      !disponivel
                        ? 'bg-[#f0e9e5] text-[#4A3728]/30 cursor-not-allowed line-through'
                        : selectedTime === hora
                          ? 'bg-[#4A3728] text-white shadow-xl'
                          : 'border border-[#d3c3ba]/30 text-[#4A3728] hover:border-[#775841] hover:text-[#775841]'
                    }`}
                  >
                    {hora}
                  </button>
                ))}
              </div>
            )}

            {!loadingSlots && selectedDate && slots.length === 0 && (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-3xl text-[#d3c3ba] block mb-3">event_busy</span>
                <p className="font-body text-sm text-[#4A3728]/60">Nenhum horário disponível para este dia.</p>
              </div>
            )}

            {/* Info */}
            <div className="mt-10 p-8 bg-[#faf2ee] rounded-[2rem] border border-[#d3c3ba]/10">
              <div className="flex gap-4 items-center mb-3">
                <span className="material-symbols-outlined text-[#775841]">info</span>
                <p className="font-label text-sm text-[#4A3728]/60 uppercase tracking-widest">Informações Importantes</p>
              </div>
              <p className="font-body text-sm text-[#4f453e] leading-relaxed">
                Recomendamos chegar com 15 minutos de antecedência para desfrutar de nosso ritual de boas-vindas com chás orgânicos e aromaterapia.
              </p>
            </div>
          </div>

          {/* ── Resumo ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="sticky top-32 bg-white p-8 rounded-[2.5rem] luxury-shadow border border-[#e9e1dd]">
              <h3 className="font-headline text-xl mb-8 text-[#4A3728]">Resumo da Reserva</h3>
              <div className="space-y-5">

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#4A3728]/60 font-label">Tratamento</span>
                  <span className="font-body text-[#4A3728] font-semibold text-base leading-snug">
                    {itemSelecionado?.procedimento || '—'}
                  </span>
                  {itemSelecionado?.tipo === 'pacote' && (
                    <span className="text-xs text-[#4A3728]/50">{itemSelecionado.sessoes} Sessões</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#4A3728]/60 font-label">Data Escolhida</span>
                  <span className="font-body text-[#4A3728] text-sm">
                    {selectedDate
                      ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                      : <span className="text-[#4A3728]/30 italic">Selecione uma data</span>
                    }
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#4A3728]/60 font-label">Horário</span>
                  <span className="font-body text-[#4A3728] text-sm">
                    {selectedTime
                      ? `${selectedTime} — ${addMin(selectedTime, itemSelecionado?.duracao || 60)}`
                      : <span className="text-[#4A3728]/30 italic">Selecione um horário</span>
                    }
                  </span>
                </div>

                <div className="pt-6 border-t border-[#d3c3ba]/20 flex justify-between items-center">
                  <span className="font-label text-sm uppercase tracking-widest text-[#4A3728]/60">Investimento</span>
                  <span className="font-headline text-[#4A3728] text-xl">
                    {formatarMoeda(itemSelecionado?.valor)}
                  </span>
                </div>

                {clienteAgendamento && (
                  <div className="p-3 bg-[#f5ede8] rounded-xl">
                    <p className="text-xs text-[#4A3728]/80 font-medium">
                      Olá, {clienteAgendamento.nome}!
                    </p>
                  </div>
                )}

                <button
                  onClick={handleConfirmar}
                  disabled={!podeConfirmar}
                  className={`block w-full py-5 rounded-full font-label uppercase tracking-[0.15em] text-xs text-center transition-all duration-300 luxury-shadow ${
                    podeConfirmar
                      ? 'bg-[#775841] text-white hover:bg-[#5d412b]'
                      : 'bg-[#d3c3ba]/40 text-[#4A3728]/30 cursor-not-allowed'
                  }`}
                >
                  {confirmando ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                      Confirmando...
                    </span>
                  ) : (
                    'Confirmar Agendamento'
                  )}
                </button>

                <p className="text-center text-[10px] text-[#82756d] font-label uppercase tracking-widest">
                  Cancelamento até 24h antes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom section */}
      <section className="relative w-full h-[500px] overflow-hidden mt-20">
        <div className="absolute inset-0 bg-[#efe6e3]">
          <img
            alt="Spa interior"
            className="w-full h-full object-cover opacity-70"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRp_qrg7f47tYhLqIH-OiAiaU_Ssbi6k9ZK_IU5KCq_auz3CoJp5icnchFaW-vTV3-bYkEvo_gisZqSiOpr0LxjvLxUUO3mcHSTZUzDy4LhkTym4R4NUe0jZ-YSsV3FFxorACDAFAh_QfXMvuP_2ZbYCChz9Z1yKUiLuF2doWN8E4Snov-bHUBNSCORzwvtkuFxXmBoTF8lgwHimQHMFrSzWSI0LRpCMNVFx4wEeqFklgdq6PxyXZNxW_uiDEWDysRMH0jNLEHO_s"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCFB] via-transparent to-transparent" />
        </div>
        <div className="absolute bottom-20 left-0 w-full text-center px-6">
          <h2 className="font-headline text-4xl text-[#4A3728] max-w-2xl mx-auto mb-3">Um refúgio para os seus sentidos.</h2>
          <p className="font-body text-[#4A3728]/60 uppercase tracking-[0.3em] text-xs">Exclusividade & Serenidade</p>
        </div>
      </section>
    </>
  );
}
