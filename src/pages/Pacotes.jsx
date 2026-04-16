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
      console.error('Erro ao buscar serviços:', err);
      showNotification('Erro ao carregar serviços', 'error');
    }
  };

  // Buscar pacotes vendidos do Supabase
  const fetchPacotes = async () => {
    try {
      const { data, error } = await supabase
        .from('pacotes_vendidos')
        .select(`
          *,
          clients(id, full_name),
          services(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPacotes(data || []);
    } catch (err) {
      console.error('Erro ao buscar pacotes:', err);
      showNotification('Erro ao carregar pacotes', 'error');
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
      // Validação detalhada
      if (!novoProcedimento.name.trim()) {
        showNotification('Nome do procedimento é obrigatório', 'error');
        return;
      }

      if (!novoProcedimento.price_single || parseFloat(novoProcedimento.price_single) <= 0) {
        showNotification('Preço deve ser maior que zero', 'error');
        return;
      }

      console.log('Tentando adicionar procedimento:', novoProcedimento);

      const payload = {
        name: novoProcedimento.name.trim(),
        price_single: parseFloat(novoProcedimento.price_single),
        duration: parseInt(novoProcedimento.duration) || 60,
        category: novoProcedimento.category,
        is_active: true
      };

      console.log('Payload para Supabase:', payload);

      const { data, error } = await supabase
        .from('services')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Procedimento criado com sucesso:', data);

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
      console.error('Erro completo ao adicionar procedimento:', err);
      
      // Mensagem de erro mais detalhada
      let errorMessage = 'Erro ao adicionar procedimento';
      
      if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      
      if (err.code === '42501') {
        errorMessage = 'Erro de permissão. Verifique as políticas RLS no Supabase.';
      } else if (err.code === '42P01') {
        errorMessage = 'Tabela "services" não encontrada. Execute o SQL no Supabase.';
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

      console.log('Fazendo upload da imagem:', caminhoArquivo);

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('pacotes-imagens')
        .upload(caminhoArquivo, imagemSelecionada, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro ao fazer upload:', error);
        throw error;
      }

      console.log('Upload realizado com sucesso:', data);

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from('pacotes-imagens')
        .getPublicUrl(caminhoArquivo);

      console.log('URL pública da imagem:', urlData.publicUrl);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
      showNotification('Erro ao fazer upload da imagem', 'error');
      return null;
    } finally {
      setUploadingImagem(false);
    }
  };

  // Criar pacote
  const criarPacote = async () => {
    try {
      if (!procedimentoSelecionado || !nomePacote.trim()) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      setSaving(true);

      // Upload da imagem (se houver)
      let imagemUrl = null;
      if (imagemSelecionada) {
        imagemUrl = await uploadImagem();
        if (!imagemUrl) {
          // Se o upload falhou, não continuar
          setSaving(false);
          return;
        }
      }

      const payload = {
        nome_pacote: nomePacote,
        service_id: procedimentoSelecionado,
        quantidade_sessoes: quantidadeSessoes,
        valor_unitario: valorUnitario,
        desconto_tipo: tipoDesconto, // CORRIGIDO: era tipo_desconto
        desconto_valor: desconto,
        valor_total: valorTotal,
        client_id: null,
        imagem_url: imagemUrl // Adicionar URL da imagem
      };

      console.log('Criando pacote com payload:', payload);

      const { data, error } = await supabase
        .from('pacotes_vendidos')
        .insert([payload])
        .select();

      if (error) {
        console.error('Erro do Supabase ao criar pacote:', error);
        throw error;
      }

      console.log('Pacote criado com sucesso:', data);

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

      showNotification('Pacote criado com sucesso!', 'success');
    } catch (err) {
      console.error('Erro completo ao criar pacote:', err);
      
      let errorMessage = 'Erro ao criar pacote';
      
      if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      
      if (err.code === '42501') {
        errorMessage = 'Erro de permissão. Verifique as políticas RLS da tabela pacotes_vendidos.';
      } else if (err.code === '42P01') {
        errorMessage = 'Tabela "pacotes_vendidos" não encontrada. Execute o SQL no Supabase.';
      } else if (err.code === '23503') {
        errorMessage = 'Erro de chave estrangeira. Verifique se o procedimento existe.';
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setSaving(false);
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

        {/* Header com título dinâmico */}
        <div className="flex items-end justify-between mb-6 lg:mb-8">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Gestão de Planos</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-on-surface">
              Pacotes {quantidadeSessoes}x
            </h2>
          </div>
        </div>

        {/* Layout Mobile-First: Flex Column no Mobile, Grid no Desktop */}
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
                  <div className="flex items-center gap-2">
                    <select 
                      value={procedimentoSelecionado}
                      onChange={(e) => handleProcedimentoChange(e.target.value)}
                      className="flex-1 bg-transparent border-0 border-b border-outline-variant pb-2 text-sm text-on-surface focus:border-primary focus:ring-0 focus:outline-none"
                    >
                      <option value="">Selecione um procedimento</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setModalNovoProcedimento(true)}
                      className="text-primary hover:text-primary/80 transition-colors"
                      title="Adicionar novo procedimento"
                    >
                      <span className="material-symbols-outlined text-xl">add_circle</span>
                    </button>
                  </div>
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

          {/* Tabela de Planos Ativos */}
          <div className="lg:col-span-3 bg-surface-container-lowest rounded-2xl editorial-shadow">
            <div className="p-4 lg:p-6 border-b border-outline-variant/20">
              <h3 className="font-serif text-lg text-on-surface">Planos Ativos</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="text-left py-4 px-4 lg:px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Pacote</th>
                    <th className="text-left py-4 px-4 lg:px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Procedimento</th>
                    <th className="text-center py-4 px-4 lg:px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Sessões</th>
                    <th className="text-left py-4 px-4 lg:px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Valor</th>
                    <th className="text-center py-4 px-4 lg:px-6 text-[10px] tracking-widest uppercase text-secondary font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Skeleton loading
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-outline-variant/10">
                        <td className="py-4 px-4 lg:px-6">
                          <div className="animate-pulse h-4 bg-surface-container rounded w-24"></div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="animate-pulse h-4 bg-surface-container rounded w-32"></div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="animate-pulse h-4 bg-surface-container rounded w-16 mx-auto"></div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="animate-pulse h-4 bg-surface-container rounded w-20"></div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="animate-pulse h-4 bg-surface-container rounded w-16 mx-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : pacotes.length > 0 ? (
                    pacotes.map((pacote) => {
                      const progressPercentage = (pacote.sessoes_utilizadas / pacote.quantidade_sessoes) * 100;
                      return (
                        <tr key={pacote.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-primary/5 transition-colors">
                          <td className="py-4 px-4 lg:px-6">
                            <div>
                              <p className="text-sm text-on-surface font-medium">{pacote.nome_pacote}</p>
                              <p className="text-xs text-secondary">{pacote.clients?.full_name || 'Cliente não definido'}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 lg:px-6 text-sm text-secondary">{pacote.services?.name}</td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-on-surface font-medium">
                                {pacote.sessoes_utilizadas || 0}/{pacote.quantidade_sessoes}
                              </span>
                              <div className="w-16 h-1.5 bg-primary/10 rounded-full overflow-hidden mt-1">
                                <div 
                                  className="h-full bg-primary rounded-full transition-all duration-300" 
                                  style={{ width: `${Math.min(progressPercentage, 100)}%` }} 
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 lg:px-6 text-sm text-on-surface">
                            R$ {parseFloat(pacote.valor_total).toFixed(2)}
                          </td>
                          <td className="py-4 px-4 lg:px-6 text-center">
                            <span className={`text-[10px] tracking-wider uppercase px-3 py-1 rounded-full font-medium ${
                              pacote.status === 'Concluído'
                                ? 'bg-tertiary/10 text-tertiary'
                                : pacote.status === 'Ativo'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-outline/10 text-outline'
                            }`}>
                              {pacote.status || 'Ativo'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center opacity-60">
                          <span className="material-symbols-outlined text-4xl mb-4 text-outline">inventory_2</span>
                          <p className="text-sm text-secondary">Ainda não há pacotes cadastrados na clínica.</p>
                          <p className="text-xs text-outline mt-1">Crie o primeiro pacote usando o formulário ao lado.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
    </div>
  );
}