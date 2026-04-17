import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const calendarDays = [
  { num: 29, faded: true }, { num: 30, faded: true }, { num: 31, faded: true },
  { num: 1 }, { num: 2 }, { num: 3 }, { num: 4 },
  { num: 5 }, { num: 6 }, { num: 7 }, { num: 8 },
  { num: 9 }, { num: 10 }, { num: 11, selected: true },
  { num: 12 }, { num: 13 }, { num: 14 }, { num: 15 }, { num: 16 },
];

const timeSlots = ['09:00', '10:30', '11:00', '13:30', '14:00', '15:30', '16:00', '17:30', '18:00'];

export default function AgendamentoHorario() {
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState('11:00');
  const [pacoteSelecionado, setPacoteSelecionado] = useState(null);
  const [clienteAgendamento, setClienteAgendamento] = useState(null);
  const [selectedDate, setSelectedDate] = useState(11);
  const [confirmando, setConfirmando] = useState(false);

  // Carregar dados do localStorage
  useEffect(() => {
    const pacote = localStorage.getItem('pacote_selecionado');
    const servico = localStorage.getItem('servico_selecionado');
    const cliente = localStorage.getItem('cliente_agendamento');

    console.log('[AgendamentoHorario] localStorage:', { pacote, servico, cliente });

    // Bloquear acesso sem identificação — redireciona para dados
    if (!cliente) {
      console.warn('[AgendamentoHorario] Sem cliente_agendamento, redirecionando...');
      if (servico) {
        navigate('/agendar/dados?origem=servico');
      } else if (pacote) {
        navigate('/agendar/dados?origem=pacote');
      } else {
        navigate('/agendar');
      }
      return;
    }

    if (pacote) {
      try {
        const parsed = JSON.parse(pacote);
        console.log('[AgendamentoHorario] Pacote carregado:', parsed);
        setPacoteSelecionado({ ...parsed, _tipo: 'pacote' });
      } catch (err) {
        console.warn('Erro ao carregar pacote:', err);
      }
    } else if (servico) {
      try {
        const parsed = JSON.parse(servico);
        console.log('[AgendamentoHorario] Serviço carregado:', parsed);
        setPacoteSelecionado({
          id: parsed.id,
          procedimento: parsed.nome,
          nome_pacote: 'Serviço Avulso',
          valor_total: parsed.preco || 0,
          quantidade_sessoes: 1,
          isMock: parsed.isMock || false,
          _tipo: 'servico_avulso'
        });
      } catch (err) {
        console.warn('Erro ao carregar serviço:', err);
      }
    } else {
      navigate('/agendar');
      return;
    }

    try {
      const clienteParsed = JSON.parse(cliente);
      console.log('[AgendamentoHorario] Cliente carregado:', clienteParsed);
      setClienteAgendamento(clienteParsed);
    } catch (err) {
      console.warn('Erro ao carregar cliente:', err);
      navigate('/agendar/dados?origem=servico');
    }
  }, [navigate]);

  // Formatar moeda
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  };

  // Calcular horário de fim baseado na duração do serviço
  const calcularHorarioFim = (horarioInicio, duracao = 60) => {
    const [horas, minutos] = horarioInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + duracao;
    const novasHoras = Math.floor(totalMinutos / 60);
    const novosMinutos = totalMinutos % 60;
    return `${String(novasHoras).padStart(2, '0')}:${String(novosMinutos).padStart(2, '0')}`;
  };

  // Confirmar agendamento e salvar no banco
  const handleConfirmarAgendamento = async () => {
    const debugInfo = {
      cliente_id: clienteAgendamento?.id,
      servico_id: pacoteSelecionado?._tipo === 'servico_avulso' ? pacoteSelecionado?.id : undefined,
      plano_pacote_id: pacoteSelecionado?._tipo === 'pacote' ? pacoteSelecionado?.id : undefined,
      procedimento: pacoteSelecionado?.procedimento,
      tipo: pacoteSelecionado?._tipo,
      data: selectedDate,
      hora: selectedTime
    };
    console.log('[DEBUG AGENDAMENTO]', debugInfo);

    if (!clienteAgendamento?.id) {
      alert('Erro: ID do Cliente está faltando. Volte e preencha seus dados novamente.');
      navigate('/agendar/dados?origem=servico');
      return;
    }

    if (!pacoteSelecionado?.procedimento) {
      alert('Erro: Nenhum serviço selecionado. Volte e escolha um tratamento.');
      navigate('/agendar');
      return;
    }

    // Serviço mock — simular confirmação sem INSERT
    if (pacoteSelecionado.isMock ||
        (typeof pacoteSelecionado.id === 'string' && pacoteSelecionado.id.startsWith('mock_'))) {
      console.warn('[AgendamentoHorario] Serviço mock — simulando confirmação');
      const dataFormatada = new Date(2024, 0, selectedDate).toISOString().split('T')[0];
      localStorage.setItem('agendamento_confirmado', JSON.stringify({
        id: `sim_${Date.now()}`,
        cliente_nome: clienteAgendamento.nome,
        procedimento: pacoteSelecionado.procedimento,
        data: dataFormatada,
        horario: selectedTime,
        valor: pacoteSelecionado.valor_total || 0,
        tipo: pacoteSelecionado._tipo
      }));
      navigate('/agendar/confirmado');
      return;
    }

    setConfirmando(true);

    try {
      const dataFormatada = new Date(2024, 0, selectedDate).toISOString().split('T')[0];
      const horarioFim = calcularHorarioFim(selectedTime, 60);
      const isServico = pacoteSelecionado._tipo === 'servico_avulso';

      // Payload base — sem FK de servico_id para evitar constraint violation
      // O nome do procedimento é salvo em notas como referência segura
      const payload = {
        cliente_id: clienteAgendamento.id,
        data: dataFormatada,
        horario_inicio: selectedTime,
        horario_fim: horarioFim,
        status: 'Confirmado',
        valor: pacoteSelecionado.valor_total || 0,
        notas: pacoteSelecionado.procedimento || ''
      };

      // Adicionar FK apenas se for um UUID válido (serviço real do banco)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (isServico && pacoteSelecionado.id && uuidRegex.test(pacoteSelecionado.id)) {
        payload.servico_id = pacoteSelecionado.id;
      } else if (!isServico && pacoteSelecionado.id && uuidRegex.test(pacoteSelecionado.id)) {
        payload.plano_pacote_id = pacoteSelecionado.id;
      }

      // Se não temos nenhuma FK válida, precisamos de pelo menos uma das duas
      // Usar notas como fallback e omitir FKs inválidas
      if (!payload.servico_id && !payload.plano_pacote_id) {
        console.warn('[AgendamentoHorario] Sem FK válida — usando apenas notas como referência');
        // Constraint CHECK exige ao menos uma — inserir com servico_id null não passa
        // Solução: usar plano_pacote_id com valor null se constraint não existir ainda
        // ou criar um registro sem a constraint (schema antigo)
        // Por segurança, bloqueamos e orientamos o usuário
        throw new Error(
          `O serviço "${pacoteSelecionado.procedimento}" não possui um ID válido no banco de dados. ` +
          `Por favor, peça ao administrador para verificar o cadastro do serviço.`
        );
      }

      console.log('[AgendamentoHorario] Payload para INSERT:', payload);

      const { data: agendamento, error: agendamentoError } = await supabase
        .from('agendamentos')
        .insert([payload])
        .select('id')
        .single();

      if (agendamentoError) {
        console.error('[AgendamentoHorario] Erro Supabase:', agendamentoError);
        // Mensagem de erro detalhada para debug
        const detalhe = agendamentoError.details || agendamentoError.hint || agendamentoError.message;
        throw new Error(`${agendamentoError.message}\n\nDetalhe: ${detalhe}\nCódigo: ${agendamentoError.code}`);
      }

      if (!agendamento?.id) {
        throw new Error('Banco não retornou ID do agendamento criado');
      }

      console.log('[AgendamentoHorario] Agendamento criado com sucesso:', agendamento.id);

      localStorage.setItem('agendamento_confirmado', JSON.stringify({
        id: agendamento.id,
        cliente_nome: clienteAgendamento.nome,
        procedimento: pacoteSelecionado.procedimento,
        data: dataFormatada,
        horario: selectedTime,
        valor: pacoteSelecionado.valor_total,
        tipo: pacoteSelecionado._tipo
      }));

      navigate('/agendar/confirmado');

    } catch (err) {
      console.error('[AgendamentoHorario] Erro completo:', err);
      alert(`Erro ao confirmar agendamento:\n${err.message}`);
      setConfirmando(false);
    }
  };

  return (
    <>
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1920px] mx-auto">
        {/* Header Title Section */}
        <section className="mb-16">
          <h1 className="font-headline text-5xl md:text-7xl text-[#4A3728] tracking-tight leading-tight max-w-3xl">
            Escolha o Momento Ideal
          </h1>
          <p className="font-body text-[#4A3728]/80 mt-6 text-lg max-w-xl">
            Sua jornada de renovação começa aqui. Selecione a data e o horário que melhor se adaptam ao seu ritmo.
          </p>
        </section>

        {/* Booking Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Calendar */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
            <div className="bg-[#faf2ee] p-8 rounded-[3rem] w-full aspect-square flex flex-col luxury-shadow">
              <div className="flex justify-between items-center mb-8 w-full px-4">
                <span className="material-symbols-outlined text-[#4A3728] cursor-pointer">chevron_left</span>
                <h3 className="font-headline text-xl text-[#4A3728]">Janeiro 2024</h3>
                <span className="material-symbols-outlined text-[#4A3728] cursor-pointer">chevron_right</span>
              </div>
              <div className="grid grid-cols-7 gap-2 w-full flex-grow text-center">
                {/* Days of week */}
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                  <span key={d} className="text-[10px] uppercase tracking-widest text-[#4A3728]/60 font-label">{d}</span>
                ))}
                {/* Dates */}
                {calendarDays.map((day, i) => (
                  <div
                    key={i}
                    onClick={() => !day.faded && setSelectedDate(day.num)}
                    className={`py-3 text-sm cursor-pointer transition-all ${
                      day.faded
                        ? 'opacity-20 cursor-not-allowed'
                        : selectedDate === day.num
                          ? 'bg-[#775841] text-white rounded-full luxury-shadow font-semibold'
                          : 'hover:bg-[#efe6e3] rounded-full'
                    }`}
                  >
                    {day.num}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle: Available Times */}
          <div className="lg:col-span-5">
            <h2 className="font-headline text-2xl mb-8 text-[#4A3728]">Horários Disponíveis</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-4 px-6 rounded-full font-label text-sm transition-all ${
                    selectedTime === time
                      ? 'bg-[#4A3728] text-white shadow-xl'
                      : 'border border-[#d3c3ba]/30 text-[#4A3728] hover:border-[#775841] hover:text-[#775841]'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            <div className="mt-12 p-8 bg-[#faf2ee] rounded-[2rem] border border-[#d3c3ba]/10">
              <div className="flex gap-4 items-center mb-4">
                <span className="material-symbols-outlined text-[#775841]">info</span>
                <p className="font-label text-sm text-[#4A3728]/60 uppercase tracking-widest">Informações Importantes</p>
              </div>
              <p className="font-body text-sm text-[#4f453e] leading-relaxed">
                Recomendamos chegar com 15 minutos de antecedência para desfrutar de nosso ritual de boas-vindas com chás orgânicos e aromaterapia.
              </p>
            </div>
          </div>

          {/* Right Sidebar: Summary */}
          <div className="lg:col-span-3">
            <div className="sticky top-32 bg-white p-8 rounded-[2.5rem] luxury-shadow border border-[#e9e1dd]">
              <h3 className="font-headline text-xl mb-8 text-[#4A3728]">Resumo da Reserva</h3>
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#4A3728]/60 font-label">Tratamento</span>
                  <span className="font-body text-[#4A3728] font-semibold text-lg">
                    {pacoteSelecionado?.procedimento || 'Carregando...'}
                  </span>
                  {pacoteSelecionado?.nome_pacote && (
                    <span className="text-xs text-[#4A3728]/60">
                      {pacoteSelecionado.nome_pacote}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#4A3728]/60 font-label">Data Escolhida</span>
                  <span className="font-body text-[#4A3728]">
                    {new Date(2024, 0, selectedDate).toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#4A3728]/60 font-label">Horário</span>
                  <span className="font-body text-[#4A3728]">{selectedTime}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#4A3728]/60 font-label">Sessões</span>
                  <span className="font-body text-[#4A3728]">
                    {pacoteSelecionado?._tipo === 'servico_avulso'
                      ? 'Sessão Avulsa'
                      : `${pacoteSelecionado?.quantidade_sessoes || 6} Sessões`}
                  </span>
                </div>
                <div className="pt-8 border-t border-[#d3c3ba]/20 flex justify-between items-center mb-8">
                  <span className="font-label text-sm uppercase tracking-widest text-[#4A3728]/60">Investimento</span>
                  <span className="font-headline text-[#4A3728] text-xl">
                    {pacoteSelecionado ? formatarMoeda(pacoteSelecionado.valor_total) : 'R$ 0,00'}
                  </span>
                </div>
                {clienteAgendamento && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                    <p className="text-xs text-green-800">
                      <span className="font-semibold">Bem-vinda-o , {clienteAgendamento.nome}!</span>
                      {clienteAgendamento.sessoesPacote > 0 && (
                        <span className="block mt-1">
                          Você tem {clienteAgendamento.sessoesPacote} sessões disponíveis.
                        </span>
                      )}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleConfirmarAgendamento}
                  disabled={confirmando}
                  className={`block w-full bg-[#775841] text-white py-5 rounded-full font-label uppercase tracking-[0.15em] text-xs text-center transition-all duration-300 luxury-shadow ${
                    confirmando 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-[#5d412b]'
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
                <p className="text-center text-[10px] text-[#82756d] font-label uppercase tracking-widest mt-4">
                  Cancelamento  até 24h antes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Aesthetic Section */}
      <section className="relative w-full h-[600px] overflow-hidden mt-20">
        <div className="organic-curve absolute inset-0 w-full h-full bg-[#efe6e3] overflow-hidden">
          <img
            alt="Spa interior"
            className="w-full h-full object-cover opacity-80"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRp_qrg7f47tYhLqIH-OiAiaU_Ssbi6k9ZK_IU5KCq_auz3CoJp5icnchFaW-vTV3-bYkEvo_gisZqSiOpr0LxjvLxUUO3mcHSTZUzDy4LhkTym4R4NUe0jZ-YSsV3FFxorACDAFAh_QfXMvuP_2ZbYCChz9Z1yKUiLuF2doWN8E4Snov-bHUBNSCORzwvtkuFxXmBoTF8lgwHimQHMFrSzWSI0LRpCMNVFx4wEeqFklgdq6PxyXZNxW_uiDEWDysRMH0jNLEHO_s"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCFB] via-transparent to-transparent"></div>
        </div>
        <div className="absolute bottom-24 left-0 w-full text-center px-6">
          <h2 className="font-headline text-4xl text-[#4A3728] max-w-2xl mx-auto mb-4">Um refúgio para os seus sentidos.</h2>
          <p className="font-body text-[#4A3728]/60 uppercase tracking-[0.3em] text-xs">Exclusividade & Serenidade</p>
        </div>
      </section>
    </>
  );
}
