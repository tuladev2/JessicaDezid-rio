import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AgendamentoDados() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const origem = searchParams.get('origem') || 'pacote'; // 'servico' ou 'pacote'
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birth: '',
    cpf: ''
  });
  const [loading, setLoading] = useState(false);
  const [cpfLoading, setCpfLoading] = useState(false);
  const [clienteExistente, setClienteExistente] = useState(null);
  const [itemSelecionado, setItemSelecionado] = useState(null); // pacote ou serviço
  const [sessoesPacote, setSessoesPacote] = useState(null);

  // Carregar pacote ou serviço selecionado do localStorage
  useEffect(() => {
    const pacote = localStorage.getItem('pacote_selecionado');
    const servico = localStorage.getItem('servico_selecionado');

    console.log('[AgendamentoDados] localStorage pacote:', pacote);
    console.log('[AgendamentoDados] localStorage servico:', servico);

    if (pacote) {
      try {
        const parsed = JSON.parse(pacote);
        console.log('[AgendamentoDados] Pacote carregado:', parsed);
        setItemSelecionado({ ...parsed, tipo: 'pacote' });
      } catch (err) {
        console.warn('Erro ao carregar pacote do localStorage:', err);
        navigate('/tratamentos');
      }
    } else if (servico) {
      try {
        const parsed = JSON.parse(servico);
        console.log('[AgendamentoDados] Serviço carregado:', parsed);
        setItemSelecionado({ ...parsed, tipo: 'servico_avulso' });
      } catch (err) {
        console.warn('Erro ao carregar serviço do localStorage:', err);
        navigate('/agendar');
      }
    } else {
      console.warn('[AgendamentoDados] Nenhum item no localStorage, redirecionando...');
      navigate(origem === 'servico' ? '/agendar' : '/tratamentos');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Função para buscar cliente por CPF
  const buscarClientePorCPF = async (cpf) => {
    if (!cpf || cpf.length < 11) return;
    
    setCpfLoading(true);
    try {
      const { data: cliente, error: clienteError } = await supabase
        .from('clients')
        .select('*')
        .ilike('cpf', `%${cpf}%`)
        .single();

      if (clienteError && clienteError.code !== 'PGRST116') {
        throw clienteError;
      }

      if (cliente) {
        setClienteExistente(cliente);
        setFormData(prev => ({
          ...prev,
          name: cliente.full_name || '',
          phone: cliente.phone || '',
          birth: cliente.birth_date ? formatDateToBR(cliente.birth_date) : ''
        }));

        // Buscar sessões disponíveis
        const { data: pacotes, error: pacotesError } = await supabase
          .from('pacotes_vendidos')
          .select('*')
          .eq('cliente_id', cliente.id)
          .gt('sessoes_restantes', 0)
          .eq('status', 'ativo');

        if (!pacotesError && pacotes && pacotes.length > 0) {
          const totalSessoes = pacotes.reduce((sum, p) => sum + p.sessoes_restantes, 0);
          setSessoesPacote(totalSessoes);
        }

        // Cliente existente — ir direto para horário sem precisar submeter o form
        const clienteData = {
          id: cliente.id,
          nome: cliente.full_name,
          telefone: cliente.phone,
          cpf: cpf,
          isExistente: true,
          sessoesPacote: null
        };
        localStorage.setItem('cliente_agendamento', JSON.stringify(clienteData));

        // Pequeno delay para mostrar a mensagem de boas-vindas antes de navegar
        setTimeout(() => {
          navigate('/agendar/horario');
        }, 1500);

      } else {
        setClienteExistente(null);
        setSessoesPacote(null);
        setFormData(prev => ({
          ...prev,
          name: '',
          phone: '',
          birth: ''
        }));
      }
    } catch (err) {
      console.warn('Erro ao buscar cliente:', err);
      setClienteExistente(null);
      setSessoesPacote(null);
    } finally {
      setCpfLoading(false);
    }
  };

  // Formatar data para DD/MM/AAAA
  const formatDateToBR = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Se mudou o CPF, buscar cliente
    if (name === 'cpf') {
      const cpfLimpo = value.replace(/\D/g, '');
      if (cpfLimpo.length === 11) {
        buscarClientePorCPF(cpfLimpo);
      } else {
        setClienteExistente(null);
        setSessoesPacote(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cpfLimpo = formData.cpf.replace(/\D/g, '');

    console.log('[AgendamentoDados] Dados no momento do envio:', {
      nome: formData.name,
      cpf: cpfLimpo,
      telefone: formData.phone,
      itemSelecionado,
      clienteExistente: clienteExistente?.id || null
    });

    if (!cpfLimpo || cpfLimpo.length !== 11) {
      alert('Por favor, informe um CPF válido com 11 dígitos.');
      return;
    }

    // Se cliente já foi identificado via busca automática de CPF,
    // só salvar no localStorage e navegar — sem nova chamada ao banco
    if (clienteExistente) {
      const clienteAgendamentoData = {
        id: clienteExistente.id,
        nome: clienteExistente.full_name,
        telefone: clienteExistente.phone || formData.phone,
        cpf: cpfLimpo,
        isExistente: true,
        sessoesPacote: sessoesPacote
      };
      localStorage.setItem('cliente_agendamento', JSON.stringify(clienteAgendamentoData));
      navigate('/agendar/horario');
      return;
    }

    setLoading(true);
    
    try {
      let birthDate = null;
      if (formData.birth && formData.birth.length === 10) {
        const [d, m, y] = formData.birth.split('/');
        birthDate = `${y}-${m}-${d}`;
      }

      // Upsert: cria se não existe, atualiza se já existe (conflito no CPF)
      const { data: cliente, error: clienteErr } = await supabase
        .from('clients')
        .upsert(
          {
            full_name: formData.name || 'Cliente Sem Nome',
            phone: formData.phone || '',
            birth_date: birthDate,
            cpf: cpfLimpo
          },
          {
            onConflict: 'cpf',        // coluna com unique constraint
            ignoreDuplicates: false   // atualiza os demais campos se CPF já existe
          }
        )
        .select('id, full_name, phone')
        .single();

      if (clienteErr) {
        console.error('Erro no upsert de cliente:', clienteErr);
        console.error('Código:', clienteErr.code, '| Detalhes:', clienteErr.details);
        throw clienteErr;
      }

      if (!cliente?.id) {
        throw new Error('Banco não retornou o ID do cliente após upsert');
      }

      const clienteAgendamentoData = {
        id: cliente.id,
        nome: cliente.full_name,
        telefone: cliente.phone,
        cpf: cpfLimpo,
        isExistente: false,
        sessoesPacote: null
      };

      localStorage.setItem('cliente_agendamento', JSON.stringify(clienteAgendamentoData));
      
      // Navegar SOMENTE após confirmação do banco
      navigate('/agendar/horario');

    } catch (err) {
      console.error('Erro completo ao processar cliente:', err);
      
      let msg = 'Erro ao processar seus dados. Tente novamente.';
      if (err.code === '23505') msg = 'CPF já cadastrado. Recarregue a página e tente novamente.';
      else if (err.code === '42501') msg = 'Sem permissão para cadastrar. Entre em contato com o suporte.';
      else if (err.message) msg = `Erro: ${err.message}`;
      
      alert(msg);
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto w-full">
      {/* Navigation / Context */}
      <div className="mb-12 flex items-center gap-4 opacity-60">
        <span className="text-[10px] tracking-[0.2em] font-label uppercase">01 Procedimento</span>
        <span className="w-8 h-[1px] bg-[#d3c3ba]"></span>
        <span className="text-[10px] tracking-[0.2em] font-label uppercase">02 Horário</span>
        <span className="w-8 h-[1px] bg-[#4A3728]"></span>
        <span className="text-[10px] tracking-[0.2em] font-label uppercase text-[#4A3728] font-bold">03 Seus Dados</span>
      </div>

      {/* Section Title */}
      <div className="mb-16">
        <h2 className="serif-italic text-4xl md:text-5xl text-[#4A3728] mb-4 leading-tight">Finalize seu agendamento</h2>
        <p className="font-body text-[#4A3728]/80 text-lg max-w-lg leading-relaxed">
          Por favor, preencha os campos abaixo com suas informações pessoais para garantirmos o melhor atendimento.
        </p>
        
        {/* Mostrar item selecionado (pacote ou serviço) */}
        {itemSelecionado && (
          <div className="mt-8 p-6 bg-[#F8F6F4] rounded-2xl border border-[#775841]/10">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-[#775841]">
                {itemSelecionado.tipo === 'pacote' ? 'package_2' : 'spa'}
              </span>
              <div>
                <p className="font-label text-[10px] tracking-[0.2em] uppercase text-[#4A3728]/60">
                  {itemSelecionado.tipo === 'pacote' ? 'Pacote Selecionado' : 'Serviço Selecionado'}
                </p>
                <p className="serif-regular text-[#4A3728] text-lg">
                  {itemSelecionado.procedimento || itemSelecionado.nome}
                </p>
                <p className="font-body text-[#4A3728]/70 text-sm">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    itemSelecionado.valor_total || itemSelecionado.preco || 0
                  )}
                  {itemSelecionado.tipo === 'pacote' && ' • 6 Sessões'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Layout: Asymmetrical & Spaced */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-y-12 gap-x-16">
        {/* Left Column: Primary Data */}
        <div className="md:col-span-7 flex flex-col gap-12">
          {/* NOME COMPLETO */}
          <div className="relative group">
            <label htmlFor="name" className="block font-label text-[10px] tracking-[0.2em] uppercase text-[#4A3728]/60 mb-2">NOME COMPLETO</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Maria Oliveira Santos"
              className="w-full bg-transparent border-t-0 border-x-0 border-b border-[#d3c3ba]/30 focus:ring-0 focus:border-[#4A3728] py-3 transition-all placeholder:text-[#d3c3ba]/50 serif-regular text-xl text-[#4A3728] outline-none"
            />
          </div>

          {/* TELEFONE */}
          <div className="relative group">
            <label htmlFor="phone" className="block font-label text-[10px] tracking-[0.2em] uppercase text-[#4A3728]/60 mb-2">TELEFONE</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              className="w-full bg-transparent border-t-0 border-x-0 border-b border-[#d3c3ba]/30 focus:ring-0 focus:border-[#4A3728] py-3 transition-all placeholder:text-[#d3c3ba]/50 serif-regular text-xl text-[#4A3728] outline-none"
            />
          </div>
        </div>

        {/* Right Column: Verification Data */}
        <div className="md:col-span-5 flex flex-col gap-12">
          {/* DATA DE NASCIMENTO */}
          <div className="relative group">
            <label htmlFor="birth" className="block font-label text-[10px] tracking-[0.2em] uppercase text-[#4A3728]/60 mb-2">DATA DE NASCIMENTO</label>
            <input
              type="text"
              id="birth"
              name="birth"
              value={formData.birth}
              onChange={handleChange}
              placeholder="DD/MM/AAAA"
              className="w-full bg-transparent border-t-0 border-x-0 border-b border-[#d3c3ba]/30 focus:ring-0 focus:border-[#4A3728] py-3 transition-all placeholder:text-[#d3c3ba]/50 serif-regular text-xl text-[#4A3728] outline-none"
            />
          </div>

          {/* CPF */}
          <div className="relative group">
            <label htmlFor="cpf" className="block font-label text-[10px] tracking-[0.2em] uppercase text-[#4A3728]/60 mb-2">
              CPF *
              {cpfLoading && (
                <span className="ml-2 material-symbols-outlined animate-spin text-sm">refresh</span>
              )}
            </label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              required
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              className="w-full bg-transparent border-t-0 border-x-0 border-b border-[#d3c3ba]/30 focus:ring-0 focus:border-[#4A3728] py-3 transition-all placeholder:text-[#d3c3ba]/50 serif-regular text-xl text-[#4A3728] outline-none"
            />
            
            {/* Status do cliente */}
            {clienteExistente && (
              <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                  <div>
                    <p className="text-green-800 text-sm font-medium">
                      Olá, {clienteExistente.full_name}! Que bom ter você de volta!
                    </p>
                    <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined animate-spin text-xs">refresh</span>
                      Redirecionando para escolha de horário...
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {formData.cpf && !cpfLoading && !clienteExistente && formData.cpf.replace(/\D/g, '').length === 11 && (
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-sm">person_add</span>
                  <p className="text-blue-800 text-sm">
                    Novo cliente! Preencha seus dados abaixo.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary & Footer Action */}
        <div className="md:col-span-12 mt-12 pt-12 border-t border-[#d3c3ba]/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4 py-2">
              <span className="material-symbols-outlined text-[#4A3728]/60">
                {itemSelecionado?.tipo === 'pacote' ? 'calendar_today' : 'spa'}
              </span>
              <div className="text-left">
                <p className="font-label text-[10px] tracking-[0.2em] uppercase text-[#82756d]/70">Resumo da sessão</p>
                <p className="serif-regular text-[#4A3728]">
                  {itemSelecionado
                    ? `${itemSelecionado.procedimento || itemSelecionado.nome}${itemSelecionado.tipo === 'pacote' ? ' • Pacote 6 Sessões' : ' • Avulso'}`
                    : 'Procedimento Selecionado'}
                </p>
                {clienteExistente && sessoesPacote > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    {sessoesPacote} sessões disponíveis
                  </p>
                )}
              </div>
            </div>

          <button
            type="submit"
            disabled={loading || !formData.cpf || formData.cpf.replace(/\D/g, '').length !== 11}
            className={`group relative px-12 py-5 bg-[#4A3728] text-[#FDFCFB] rounded-full overflow-hidden transition-all duration-500 flex items-center gap-4 ${
              loading || !formData.cpf || formData.cpf.replace(/\D/g, '').length !== 11
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-[1.02] active:scale-95'
            }`}
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
            ) : (
              <>
                <span className="font-label text-[11px] tracking-[0.3em] uppercase font-bold">
                  {clienteExistente ? 'Continuar' : 'Criar Conta e Continuar'}
                </span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Terms & Privacy Quiet Note */}
      <p className="mt-12 text-center text-[10px] tracking-[0.1em] text-[#4A3728]/40 uppercase max-w-md mx-auto leading-loose">
        Ao confirmar, você concorda com nossas políticas de cancelamento e processamento de dados pessoais.
      </p>
    </main>
  );
}
