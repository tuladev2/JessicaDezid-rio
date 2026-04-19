import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Pacotes() {
  // Estados principais conforme solicitado
  const [quantidadeSessoes, setQuantidadeSessoes] = useState(6);
  const [valorUnitario, setValorUnitario] = useState(0);
  const [desconto, setDesconto] = useState(15);
  const [tipoDesconto, setTipoDesconto] = useState('porcentagem');
  const [procedimentoSelecionado, setProcedimentoSelecionado] = useState('');
  const [nomePacote, setNomePacote] = useState('');
  
  // Estados para dados do Supabase
  const [services, setServices] = useState([]);
  const [pacotes, setPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Estado para valor total calculado
  const [valorTotal, setValorTotal] = useState(0);
  
  // Estados para modal de novo procedimento
  const [modalNovoProcedimento, setModalNovoProcedimento] = useState(false);
  const [novoProcedimento, setNovoProcedimento] = useState({
    name: '',
    price_single: '',
    duration: 60,
    category: 'Facial'
  });

  // Estados para upload de imagem
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [previewImagem, setPreviewImagem] = useState(null);
  const [uploadingImagem, setUploadingImagem] = useState(false);

  // Estado para controlar aba ativa (formulário ou lista)
  const [abaAtiva, setAbaAtiva] = useState('lista'); // 'form' | 'lista'
  // Estado para edição inline
  const [pacoteEditando, setPacoteEditando] = useState(null);
  const [editForm, setEditForm] = useState({});

  const iniciarEdicao = (pacote) => {
    setPacoteEditando(pacote.id);
    setEditForm({
      nome_pacote: pacote.nome_pacote,
      procedimento: pacote.procedimento,
      quantidade_sessoes: pacote.quantidade_sessoes,
      valor_unitario: pacote.valor_unitario,
      valor_total: pacote.valor_total,
      status: pacote.status,
    });
  };

  const cancelarEdicao = () => {
    setPacoteEditando(null);
    setEditForm({});
  };

  const salvarEdicao = async (pacoteId) => {
    try {
      const subtotal = Number(editForm.valor_unitario) * Number(editForm.quantidade_sessoes);
      const payload = {
        nome_pacote: editForm.nome_pacote,
        procedimento: editForm.procedimento,
        quantidade_sessoes: Number(editForm.quantidade_sessoes),
        valor_unitario: Number(editForm.valor_unitario),
        valor_total: Number(editForm.valor_total) || subtotal,
        status: editForm.status,
      };
      const { error } = await supabase.from('planos_pacotes').update(payload).eq('id', pacoteId);
      if (error) throw error;
      await fetchPacotes();
      setPacoteEditando(null);
      showNotification('Pacote atualizado com sucesso!', 'success');
    } catch (err) {
      console.error('[Pacotes] Erro ao editar pacote:', err.message);
      showNotification('Erro ao salvar edição.', 'error');
    }
  };

  // Estado para exclusão
  const [pacoteParaExcluir, setPacoteParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  // Função para mostrar notificações
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Buscar serviços do Supabase
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('[Pacotes] Erro ao buscar serviços:', err.message);
      showNotification('Erro ao carregar serviços', 'error');
    }
  };

  // Buscar planos de pacotes do Supabase (tabela planos_pacotes)
  const fetchPacotes = async () => {
    try {
      const { data, error } = await supabase
        .from('planos_pacotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPacotes(data || []);
    } catch (err) {
      console.error('[Pacotes] Erro ao buscar planos de pacotes:', err.message);
      showNotification('Erro ao carregar planos de pacotes', 'error');
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchServices(),
        fetchPacotes()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Cálculo automático do valor total - useEffect conforme solicitado
  useEffect(() => {
    const subtotal = valorUnitario * quantidadeSessoes;
    let valorDesconto = 0;
    
    if (tipoDesconto === 'porcentagem') {
      valorDesconto = (subtotal * desconto) / 100;
    } else {
      valorDesconto = desconto;
    }
    
    const total = Math.max(0, subtotal - valorDesconto);
    setValorTotal(total);
  }, [valorUnitario, quantidadeSessoes, desconto, tipoDesconto]);

  // Atualizar valor unitário quando procedimento é selecionado
  const handleProcedimentoChange = (serviceId) => {
    setProcedimentoSelecionado(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setValorUnitario(parseFloat(service.price_single) || 0);
    }
  };

  // Adicionar novo procedimento
  const adicionarNovoProcedimento = async () => {
    try {
      // PRIORIDADE 5: Validação de entrada em formulários
      if (!novoProcedimento.name.trim()) {
        showNotification('Nome do procedimento é obrigatório', 'error');
        return;
      }

      if (novoProcedimento.name.trim().length > 100) {
        showNotification('Nome do procedimento não pode exceder 100 caracteres', 'error');
        return;
      }

      if (!novoProcedimento.price_single || parseFloat(novoProcedimento.price_single) <= 0) {
        showNotification('Preço deve ser maior que zero', 'error');
        return;
      }

      if (parseInt(novoProcedimento.duration) <= 0) {
        showNotification('Duração deve ser maior que zero', 'error');
        return;
      }

      const payload = {
        name: novoProcedimento.name.trim().slice(0, 100),
        price_single: parseFloat(novoProcedimento.price_single),
        duration: parseInt(novoProcedimento.duration) || 60,
        category: novoProcedimento.category,
        is_active: true
      };

      const { data, error } = await supabase
        .from('services')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('[Pacotes] Erro ao adicionar procedimento:', error.code, error.message);
        throw error;
      }

      // Atualizar lista de serviços
      await fetchServices();
      
      // Selecionar o novo procedimento automaticamente
      setProcedimentoSelecionado(data.id);
      setValorUnitario(parseFloat(data.price_single));

      // Fechar modal e limpar form
      setModalNovoProcedimento(false);
      setNovoProcedimento({ name: '', price_single: '', duration: 60, category: 'Facial' });

      showNotification('Procedimento adicionado com sucesso!', 'success');
    } catch (err) {
      console.error('[Pacotes] Erro ao adicionar procedimento:', err.message);
      
      let errorMessage = 'Erro ao adicionar procedimento';
      
      if (err.code === '42501') {
        errorMessage = 'Erro de permissão. Verifique as políticas RLS no Supabase.';
      } else if (err.code === '42P01') {
        errorMessage = 'Tabela "services" não encontrada. Execute o SQL no Supabase.';
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      
      showNotification(errorMessage, 'error');
    }
  };

  // Handler para seleção de imagem
  const handleImagemSelecionada = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        showNotification('Por favor, selecione apenas arquivos de imagem', 'error');
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('A imagem deve ter no máximo 5MB', 'error');
        return;
      }

      setImagemSelecionada(file);

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImagem(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para fazer upload da imagem no Supabase Storage
  const uploadImagem = async () => {
    if (!imagemSelecionada) return null;

    try {
      setUploadingImagem(true);

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const nomeArquivo = `${timestamp}-${imagemSelecionada.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const caminhoArquivo = `pacotes/${nomeArquivo}`;

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('pacotes-imagens')
        .upload(caminhoArquivo, imagemSelecionada, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('[Pacotes] Erro ao fazer upload:', error.message);
        throw error;
      }

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from('pacotes-imagens')
        .getPublicUrl(caminhoArquivo);

      return urlData.publicUrl;
    } catch (err) {
      console.error('[Pacotes] Erro ao fazer upload da imagem:', err.message);
      showNotification('Erro ao fazer upload da imagem', 'error');
      return null;
    } finally {
      setUploadingImagem(false);
    }
  };

  // Criar ou atualizar pacote (upsert na tabela planos_pacotes)
  const criarPacote = async () => {
    try {
      // PRIORIDADE 5: Validação de entrada em formulários
      if (!procedimentoSelecionado || !nomePacote.trim()) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      if (nomePacote.trim().length > 100) {
        showNotification('Nome do pacote não pode exceder 100 caracteres', 'error');
        return;
      }

      if (quantidadeSessoes <= 0 || quantidadeSessoes > 50) {
        showNotification('Quantidade de sessões deve estar entre 1 e 50', 'error');
        return;
      }

      if (valorUnitario <= 0) {
        showNotification('Valor unitário deve ser maior que zero', 'error');
        return;
      }

      setSaving(true);

      // Upload da imagem (se houver)
      let imagemUrl = null;
      if (imagemSelecionada) {
        imagemUrl = await uploadImagem();
        if (!imagemUrl) {
          setSaving(false);
          return;
        }
      }

      // Calcular valor total com desconto
      const subtotal = valorUnitario * quantidadeSessoes;
      const valorDescontoCalculado = tipoDesconto === 'porcentagem' 
        ? (subtotal * desconto) / 100 
        : desconto;
      const valorTotalCalculado = Math.max(0, subtotal - valorDescontoCalculado);

      const payload = {
        nome_pacote: nomePacote.trim().slice(0, 100),
        procedimento: procedimentoSelecionado.slice(0, 100),
        quantidade_sessoes: Math.max(1, Math.min(50, quantidadeSessoes)),
        valor_unitario: Math.max(0, valorUnitario),
        desconto_percentual: tipoDesconto === 'porcentagem' ? Math.max(0, desconto) : 0,
        valor_total: valorTotalCalculado,
        status: 'ATIVO',
        imagem_url: imagemUrl
      };

      const { data, error } = await supabase
        .from('planos_pacotes')
        .insert([payload])
        .select();

      if (error) {
        console.error('[Pacotes] Erro ao criar plano:', error.code, error.message);
        throw error;
      }

      await fetchPacotes();

      // Limpar formulário
      setNomePacote('');
      setProcedimentoSelecionado('');
      setQuantidadeSessoes(6);
      setValorUnitario(0);
      setDesconto(15);
      setTipoDesconto('porcentagem');
      setImagemSelecionada(null);
      setPreviewImagem(null);

      showNotification('Plano de pacote criado com sucesso!', 'success');
    } catch (err) {
      console.error('[Pacotes] Erro ao criar plano:', err.message);
      
      let errorMessage = 'Erro ao criar plano de pacote';
      
      if (err.code === '42501') {
        errorMessage = 'Erro de permissão. Verifique as políticas RLS da tabela planos_pacotes.';
      } else if (err.code === '42P01') {
        errorMessage = 'Tabela "planos_pacotes" não encontrada. Execute o SQL no Supabase.';
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Excluir pacote
  const deletePacote = async () => {
    if (!pacoteParaExcluir) return;
    setExcluindo(true);
    try {
      const { count, error: countErr } = await supabase
        .from('agendamentos')
        .select('id', { count: 'exact', head: true })
        .eq('plano_pacote_id', pacoteParaExcluir.id)
        .neq('status', 'Cancelado');

      if (countErr) throw countErr;

      if (count > 0) {
        showNotification(
          `Não é possível excluir: este pacote possui ${count} agendamento${count > 1 ? 's' : ''} ativo${count > 1 ? 's' : ''}.`,
          'error'
        );
        setPacoteParaExcluir(null);
        return;
      }

      const { error } = await supabase
        .from('planos_pacotes')
        .delete()
        .eq('id', pacoteParaExcluir.id);

      if (error) throw error;

      setPacotes(prev => prev.filter(p => p.id !== pacoteParaExcluir.id));
      showNotification('Pacote excluído com sucesso!', 'success');
      setPacoteParaExcluir(null);
    } catch (err) {
      console.error('[Pacotes] Erro ao excluir pacote:', err.message);
      showNotification(`Erro ao excluir: ${err.message}`, 'error');
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="px-4 lg:px-12 py-6 lg:py-10">
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

        {/* Header com título dinâmico + abas */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 lg:mb-8 gap-4">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Gestão de Planos</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-on-surface">
              Pacotes {quantidadeSessoes}x
            </h2>
          </div>
          {/* Abas mobile */}
          <div className="flex bg-surface-container rounded-xl p-1 gap-1 self-start sm:self-auto">
            <button
              onClick={() => setAbaAtiva('lista')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === 'lista'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">inventory_2</span>
              Planos Ativos
              {pacotes.length > 0 && (
                <span className="bg-primary text-on-primary text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {pacotes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setAbaAtiva('form')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === 'form'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Novo Pacote
            </button>
          </div>
        </div>

        {/* ── ABA: PLANOS ATIVOS ─────────────────────────────────────────── */}
        {abaAtiva === 'lista' && (
          <div className="bg-surface-container-lowest rounded-2xl editorial-shadow">
            <div className="p-4 lg:p-6 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="font-serif text-lg text-on-surface">Planos Ativos</h3>
              <button
                onClick={() => setAbaAtiva('form')}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Novo Pacote
              </button>
            </div>

            {/* Cards mobile / Tabela desktop */}
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse h-20 bg-surface-container rounded-xl" />
                ))}
              </div>
            ) : pacotes.length === 0 ? (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-4xl text-outline mb-3 block">inventory_2</span>
                <p className="text-sm text-secondary">Nenhum plano cadastrado ainda.</p>
                <button
                  onClick={() => setAbaAtiva('form')}
                  className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:opacity-90 transition-all"
                >
                  Criar primeiro pacote
                </button>
              </div>
            ) : (
              <>
                {/* MOBILE: Cards empilhados */}
                <div className="lg:hidden divide-y divide-outline-variant/10">
                  {pacotes.map((pacote) => (
                    <div key={pacote.id} className="p-4">
                      {pacoteEditando === pacote.id ? (
                        /* Modo edição mobile */
                        <div className="space-y-3">
                          <input
                            value={editForm.nome_pacote}
                            onChange={e => setEditForm(f => ({ ...f, nome_pacote: e.target.value }))}
                            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm"
                            placeholder="Nome do pacote"
                          />
                          <input
                            value={editForm.procedimento}
                            onChange={e => setEditForm(f => ({ ...f, procedimento: e.target.value }))}
                            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm"
                            placeholder="Procedimento"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] uppercase tracking-widest text-secondary">Sessões</label>
                              <input
                                type="number"
                                value={editForm.quantidade_sessoes}
                                onChange={e => setEditForm(f => ({ ...f, quantidade_sessoes: e.target.value }))}
                                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-widest text-secondary">Valor Unit.</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editForm.valor_unitario}
                                onChange={e => setEditForm(f => ({ ...f, valor_unitario: e.target.value }))}
                                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm mt-1"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] uppercase tracking-widest text-secondary">Valor Total</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editForm.valor_total}
                                onChange={e => setEditForm(f => ({ ...f, valor_total: e.target.value }))}
                                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-widest text-secondary">Status</label>
                              <select
                                value={editForm.status}
                                onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm mt-1"
                              >
                                <option value="ATIVO">ATIVO</option>
                                <option value="INATIVO">INATIVO</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => salvarEdicao(pacote.id)}
                              className="flex-1 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={cancelarEdicao}
                              className="flex-1 py-2 bg-surface-container text-on-surface rounded-lg text-xs font-semibold"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Modo visualização mobile */
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-on-surface truncate">{pacote.nome_pacote}</p>
                            <p className="text-xs text-secondary mt-0.5 truncate">{pacote.procedimento}</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="text-xs text-outline">{pacote.quantidade_sessoes} sessões</span>
                              <span className="text-xs font-semibold text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pacote.valor_total)}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                pacote.status === 'INATIVO' ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'
                              }`}>
                                {pacote.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => iniciarEdicao(pacote)}
                              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-primary/10 text-secondary hover:text-primary transition-all"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              onClick={() => setPacoteParaExcluir(pacote)}
                              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 text-secondary hover:text-red-600 transition-all"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* DESKTOP: Tabela */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-outline-variant/10">
                        <th className="text-left py-4 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Pacote</th>
                        <th className="text-left py-4 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Procedimento</th>
                        <th className="text-center py-4 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Sessões</th>
                        <th className="text-right py-4 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Unit.</th>
                        <th className="text-right py-4 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Total</th>
                        <th className="text-center py-4 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Status</th>
                        <th className="text-center py-4 px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pacotes.map((pacote) => (
                        <tr key={pacote.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-primary/5 transition-colors">
                          {pacoteEditando === pacote.id ? (
                            /* Linha de edição desktop */
                            <>
                              <td className="py-3 px-6">
                                <input
                                  value={editForm.nome_pacote}
                                  onChange={e => setEditForm(f => ({ ...f, nome_pacote: e.target.value }))}
                                  className="w-full border border-outline-variant rounded-lg px-2 py-1.5 text-sm"
                                />
                              </td>
                              <td className="py-3 px-6">
                                <input
                                  value={editForm.procedimento}
                                  onChange={e => setEditForm(f => ({ ...f, procedimento: e.target.value }))}
                                  className="w-full border border-outline-variant rounded-lg px-2 py-1.5 text-sm"
                                />
                              </td>
                              <td className="py-3 px-6">
                                <input
                                  type="number"
                                  value={editForm.quantidade_sessoes}
                                  onChange={e => setEditForm(f => ({ ...f, quantidade_sessoes: e.target.value }))}
                                  className="w-16 border border-outline-variant rounded-lg px-2 py-1.5 text-sm text-center mx-auto block"
                                />
                              </td>
                              <td className="py-3 px-6">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editForm.valor_unitario}
                                  onChange={e => setEditForm(f => ({ ...f, valor_unitario: e.target.value }))}
                                  className="w-24 border border-outline-variant rounded-lg px-2 py-1.5 text-sm text-right ml-auto block"
                                />
                              </td>
                              <td className="py-3 px-6">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editForm.valor_total}
                                  onChange={e => setEditForm(f => ({ ...f, valor_total: e.target.value }))}
                                  className="w-24 border border-outline-variant rounded-lg px-2 py-1.5 text-sm text-right ml-auto block"
                                />
                              </td>
                              <td className="py-3 px-6">
                                <select
                                  value={editForm.status}
                                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                                  className="border border-outline-variant rounded-lg px-2 py-1.5 text-xs mx-auto block"
                                >
                                  <option value="ATIVO">ATIVO</option>
                                  <option value="INATIVO">INATIVO</option>
                                </select>
                              </td>
                              <td className="py-3 px-6">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => salvarEdicao(pacote.id)}
                                    className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:opacity-90"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={cancelarEdicao}
                                    className="px-3 py-1.5 bg-surface-container text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container-high"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            /* Linha normal desktop */
                            <>
                              <td className="py-4 px-6">
                                <p className="text-sm text-on-surface font-medium">{pacote.nome_pacote}</p>
                              </td>
                              <td className="py-4 px-6 text-sm text-secondary">{pacote.procedimento}</td>
                              <td className="py-4 px-6 text-center text-sm text-on-surface">{pacote.quantidade_sessoes}</td>
                              <td className="py-4 px-6 text-right text-sm text-on-surface">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pacote.valor_unitario)}
                              </td>
                              <td className="py-4 px-6 text-right text-sm text-on-surface font-semibold">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pacote.valor_total)}
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className={`text-[10px] tracking-wider uppercase px-3 py-1 rounded-full font-medium ${
                                  pacote.status === 'INATIVO' ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'
                                }`}>
                                  {pacote.status}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => iniciarEdicao(pacote)}
                                    title="Editar"
                                    className="w-8 h-8 flex items-center justify-center rounded-full text-secondary hover:text-primary hover:bg-primary/10 transition-all"
                                  >
                                    <span className="material-symbols-outlined text-base">edit</span>
                                  </button>
                                  <button
                                    onClick={() => setPacoteParaExcluir(pacote)}
                                    title="Excluir"
                                    className="w-8 h-8 flex items-center justify-center rounded-full text-secondary hover:text-red-600 hover:bg-red-50 transition-all"
                                  >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ABA: NOVO PACOTE (formulário) ──────────────────────────────── */}
        {abaAtiva === 'form' && (
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
          {/* Formulário de Cadastro */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form de Cadastro Rápido */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 editorial-shadow">
              <h3 className="font-serif text-lg text-on-surface mb-6">Cadastro Rápido</h3>

              <div className="space-y-5">
                {/* Nome do Pacote */}
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                    Nome do Pacote *
                  </label>
                  <input
                    type="text"
                    value={nomePacote}
                    onChange={(e) => setNomePacote(e.target.value)}
                    placeholder="Ex: Plano Verão, Combo Noiva..."
                    className="w-full bg-transparent border-0 border-b border-outline-variant pb-2 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-0 focus:outline-none"
                  />
                </div>

            {/* Procedimento - Campo editável conforme solicitado */}
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                    Procedimento *
                  </label>
                  <input
                    type="text"
                    value={procedimentoSelecionado}
                    onChange={(e) => setProcedimentoSelecionado(e.target.value)}
                    placeholder="Ex: Buço ou Queixo, Axilas, Virilha..."
                    className="w-full bg-transparent border-0 border-b border-outline-variant pb-2 text-sm text-on-surface focus:border-primary focus:ring-0 focus:outline-none"
                  />
                </div>

                {/* Quantidade de Sessões - Campo editável conforme solicitado */}
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                    Quantidade de Sessões
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantidadeSessoes}
                    onChange={(e) => setQuantidadeSessoes(parseInt(e.target.value) || 1)}
                    className="w-full bg-transparent border-0 border-b border-outline-variant pb-2 text-sm text-on-surface focus:border-primary focus:ring-0 focus:outline-none"
                  />
                </div>

                {/* Upload de Imagem */}
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                    Imagem do Pacote (Opcional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="upload-imagem"
                      accept="image/*"
                      onChange={handleImagemSelecionada}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('upload-imagem').click()}
                      disabled={uploadingImagem}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-all duration-300 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">cloud_upload</span>
                      {uploadingImagem ? 'Enviando...' : 'Selecionar Imagem'}
                    </button>
                    {previewImagem && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-primary/20">
                        <img 
                          src={previewImagem} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagemSelecionada(null);
                            setPreviewImagem(null);
                          }}
                          className="absolute top-1 right-1 bg-error text-white rounded-full p-0.5 hover:bg-error/80 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    )}
                  </div>
                  {imagemSelecionada && (
                    <p className="text-[10px] text-secondary mt-1">
                      {imagemSelecionada.name} ({(imagemSelecionada.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                {/* Valor Unitário e Desconto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                      Valor Unitário
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={valorUnitario}
                      onChange={(e) => setValorUnitario(parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-0 border-b border-outline-variant pb-2 text-sm text-on-surface focus:border-primary focus:ring-0 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                      Desconto
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={desconto}
                        onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                        className="flex-1 bg-transparent border-0 border-b border-outline-variant pb-2 text-sm text-primary font-semibold focus:border-primary focus:ring-0 focus:outline-none"
                      />
                      <select
                        value={tipoDesconto}
                        onChange={(e) => setTipoDesconto(e.target.value)}
                        className="bg-transparent border-0 border-b border-outline-variant pb-2 text-xs text-primary font-semibold focus:border-primary focus:ring-0 focus:outline-none"
                      >
                        <option value="porcentagem">%</option>
                        <option value="valor_fixo">R$</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Resumo de Preços - Cálculo em Tempo Real */}
                <div className="bg-primary/5 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-xs text-secondary">
                    <span>Subtotal ({quantidadeSessoes} sessões)</span>
                    <span>R$ {(valorUnitario * quantidadeSessoes).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-secondary">
                    <span>Desconto</span>
                    <span>- R$ {(tipoDesconto === 'porcentagem' ? (valorUnitario * quantidadeSessoes * desconto) / 100 : desconto).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-primary/20">
                    <span className="text-xs text-secondary">Valor Total</span>
                    <span className="text-lg font-serif text-primary">R$ {valorTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Botão Criar Pacote */}
                <button 
                  onClick={criarPacote}
                  disabled={saving || !procedimentoSelecionado || !nomePacote.trim()}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Criando...' : 'Criar Pacote'}
                </button>
              </div>
            </div>

            {/* Imagem da Clínica */}
            <div className="rounded-2xl overflow-hidden editorial-shadow">
              <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-tertiary/10 flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-4xl text-primary/50 mb-2 block">spa</span>
                  <p className="text-sm text-secondary">Jessica Dezidério</p>
                  <p className="text-xs text-outline">Estética Premium</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Modal de Adicionar Novo Procedimento */}
      {modalNovoProcedimento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-md editorial-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-on-surface">Novo Procedimento</h3>
              <button 
                onClick={() => {
                  setModalNovoProcedimento(false);
                  setNovoProcedimento({ name: '', price_single: '', duration: 60, category: 'Facial' });
                }}
                className="text-secondary hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-5">
              {/* Nome do Procedimento */}
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Nome do Procedimento *
                </label>
                <input
                  type="text"
                  value={novoProcedimento.name}
                  onChange={(e) => setNovoProcedimento(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Limpeza de Pele, Massagem..."
                  className="w-full bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 py-2 placeholder:text-outline"
                  required
                />
              </div>

              {/* Preço */}
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={novoProcedimento.price_single}
                  onChange={(e) => setNovoProcedimento(prev => ({ ...prev, price_single: e.target.value }))}
                  placeholder="0.00"
                  className="w-full bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 py-2 placeholder:text-outline"
                  required
                />
              </div>

              {/* Duração */}
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={novoProcedimento.duration}
                  onChange={(e) => setNovoProcedimento(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  className="w-full bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 py-2"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Categoria
                </label>
                <select
                  value={novoProcedimento.category}
                  onChange={(e) => setNovoProcedimento(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 py-2"
                >
                  <option value="Facial">Facial</option>
                  <option value="Corporal">Corporal</option>
                  <option value="Massagem">Massagem</option>
                  <option value="Depilação">Depilação</option>
                  <option value="Estética Avançada">Estética Avançada</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => {
                  setModalNovoProcedimento(false);
                  setNovoProcedimento({ name: '', price_single: '', duration: 60, category: 'Facial' });
                }}
                className="flex-1 px-4 py-3 bg-surface-container text-on-surface rounded-xl text-xs font-semibold tracking-widest uppercase hover:bg-surface-container-high transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarNovoProcedimento}
                className="flex-1 px-4 py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {pacoteParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-2xl">delete_forever</span>
              </div>
              <h3 className="font-serif text-lg text-on-surface">Excluir Pacote</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Tem certeza que deseja excluir o pacote{' '}
                <span className="font-semibold text-on-surface">"{pacoteParaExcluir.nome_pacote}"</span>?
                <br />Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setPacoteParaExcluir(null)}
                disabled={excluindo}
                className="flex-1 py-3 bg-surface-container text-on-surface rounded-xl text-xs font-semibold tracking-widest uppercase hover:bg-surface-container-high transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={deletePacote}
                disabled={excluindo}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-semibold tracking-widest uppercase hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {excluindo ? (
                  <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> Excluindo...</>
                ) : (
                  'Excluir'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}