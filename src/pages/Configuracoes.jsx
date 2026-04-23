import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const DIAS_PADRAO = [
  { dia: 'Segunda-feira', inicio: '09:00', fim: '19:00', ativo: true },
  { dia: 'Terça-feira',   inicio: '09:00', fim: '19:00', ativo: true },
  { dia: 'Quarta-feira',  inicio: '09:00', fim: '19:00', ativo: true },
  { dia: 'Quinta-feira',  inicio: '09:00', fim: '19:00', ativo: true },
  { dia: 'Sexta-feira',   inicio: '09:00', fim: '18:00', ativo: true },
  { dia: 'Sábado',        inicio: '09:00', fim: '14:00', ativo: true },
  { dia: 'Domingo',       inicio: '',      fim: '',      ativo: false },
];

// Calcula horas trabalhadas entre dois horários "HH:MM"
function calcularHoras(inicio, fim) {
  if (!inicio || !fim) return 0;
  const [hi, mi] = inicio.split(':').map(Number);
  const [hf, mf] = fim.split(':').map(Number);
  return Math.max(0, (hf * 60 + mf - (hi * 60 + mi)) / 60);
}

export default function Configuracoes() {
  const [horarios, setHorarios]   = useState(DIAS_PADRAO);
  const [bloqueios, setBloqueios] = useState([]);
  const [regras, setRegras]       = useState({ intervalo: '30', antecedencia: '48' });
  const [loading, setLoading]     = useState(true);
  const [salvando, setSalvando]   = useState(false);
  const [notification, setNotification] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [novoBloqueio, setNovoBloqueio] = useState({
    data_inicio: '',
    data_fim: '',
    motivo: '',
    tipo: 'Feriado'
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ── Carregar dados do Supabase ──────────────────────────────────────────────
  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const [{ data: configData }, { data: bloqueiosData }] = await Promise.all([
          supabase.from('config_agenda').select('*'),
          supabase.from('bloqueios_datas').select('*').order('data_inicio', { ascending: true }),
        ]);

        if (configData?.length) {
          // Mapeia registros do banco para o estado local
          const horariosDb = DIAS_PADRAO.map(padrao => {
            const registro = configData.find(r => r.dia === padrao.dia);
            return registro
              ? { dia: registro.dia, inicio: registro.inicio || '', fim: registro.fim || '', ativo: registro.ativo ?? padrao.ativo }
              : padrao;
          });
          setHorarios(horariosDb);

          const regrasDb = configData.find(r => r.tipo === 'regras');
          if (regrasDb) setRegras({ intervalo: String(regrasDb.intervalo || 30), antecedencia: String(regrasDb.antecedencia || 48) });
        }

        setBloqueios(bloqueiosData || []);
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  // ── Handlers de horário ─────────────────────────────────────────────────────
  const toggleDia = useCallback((index) => {
    setHorarios(prev => prev.map((h, i) => i === index ? { ...h, ativo: !h.ativo } : h));
  }, []);

  const atualizarHorario = useCallback((index, campo, valor) => {
    setHorarios(prev => prev.map((h, i) => i === index ? { ...h, [campo]: valor } : h));
  }, []);

  // ── Remover bloqueio ────────────────────────────────────────────────────────
  const removerBloqueio = async (id) => {
    try {
      const { error } = await supabase.from('bloqueios_datas').delete().eq('id', id);
      if (error) throw error;
      setBloqueios(prev => prev.filter(b => b.id !== id));
      showNotification('Bloqueio removido.', 'success');
    } catch (err) {
      console.error('Erro ao remover bloqueio:', err);
      showNotification('Erro ao remover bloqueio.', 'error');
    }
  };

  // ── Adicionar bloqueio ──────────────────────────────────────────────────────
  const adicionarBloqueio = async () => {
    // Validação
    if (!novoBloqueio.data_inicio || !novoBloqueio.motivo) {
      showNotification('Preencha data de início e motivo.', 'error');
      return;
    }

    // Validação: data_fim >= data_inicio
    if (novoBloqueio.data_fim && novoBloqueio.data_fim < novoBloqueio.data_inicio) {
      showNotification('Data de fim deve ser maior ou igual à data de início.', 'error');
      return;
    }

    try {
      const payload = {
        data_inicio: novoBloqueio.data_inicio,
        data_fim: novoBloqueio.data_fim || null,
        motivo: novoBloqueio.motivo,
        tipo: novoBloqueio.tipo
      };

      const { data, error } = await supabase
        .from('bloqueios_datas')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      setBloqueios(prev => [...prev, data].sort((a, b) => 
        new Date(a.data_inicio) - new Date(b.data_inicio)
      ));
      
      showNotification('Bloqueio adicionado com sucesso!', 'success');
      setModalAberto(false);
      setNovoBloqueio({ data_inicio: '', data_fim: '', motivo: '', tipo: 'Feriado' });
    } catch (err) {
      console.error('Erro ao adicionar bloqueio:', err);
      showNotification('Erro ao adicionar bloqueio.', 'error');
    }
  };

  // ── Salvar tudo ─────────────────────────────────────────────────────────────
  const salvarAlteracoes = async () => {
    setSalvando(true);
    try {
      // 1. Upsert horários (usa dia como chave de conflito)
      const horariosPayload = horarios.map(h => ({
        dia: h.dia,
        inicio: h.ativo && h.inicio?.trim() ? h.inicio.trim() : null,
        fim:    h.ativo && h.fim?.trim()    ? h.fim.trim()    : null,
        ativo: h.ativo,
      }));

      const { error: errHorarios } = await supabase
        .from('config_agenda')
        .upsert(horariosPayload, { onConflict: 'dia' });

      if (errHorarios) throw errHorarios;

      // 2. Upsert regras (linha única com tipo='regras')
      const rulesPayload = { 
        tipo: 'regras', 
        intervalo: parseInt(regras.intervalo) || 0, 
        antecedencia: parseInt(regras.antecedencia) || 0 
      };

      console.log('[Config] Salvando regras:', rulesPayload);

      const { error: errRegras } = await supabase
        .from('config_agenda')
        .upsert(rulesPayload, { onConflict: 'tipo' });

      if (errRegras) throw errRegras;

      showNotification('Configurações salvas com sucesso!', 'success');
      
      // Recarregar para garantir que os dados do banco estão sincronizados
      // (Isso ajuda a confirmar que o 'intervalo' persistiu)
      setTimeout(async () => {
        const { data } = await supabase.from('config_agenda').select('*');
        if (data) {
           const regrasDb = data.find(r => r.tipo === 'regras');
           if (regrasDb) {
             setRegras({ 
               intervalo: String(regrasDb.intervalo || 0), 
               antecedencia: String(regrasDb.antecedencia || 0) 
             });
           }
        }
      }, 500);

    } catch (err) {
      console.error('Erro ao salvar:', err);
      showNotification(`Erro ao salvar: ${err.message || 'Erro desconhecido'}`, 'error');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 lg:px-12 py-10 animate-pulse space-y-4">
        <div className="h-8 bg-surface-container rounded w-64"></div>
        <div className="h-64 bg-surface-container rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-12 py-6 lg:py-10">
      {/* Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-2 min-w-72
          ${notification.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          <span className="material-symbols-outlined text-lg">
            {notification.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="flex-1 text-sm">{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Administração</p>
          <h2 className="font-serif text-3xl text-on-surface">Configurações de Agenda</h2>
        </div>
        <button
          onClick={salvarAlteracoes}
          disabled={salvando}
          className="px-6 py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300 disabled:opacity-60"
        >
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Esquerda */}
        <div className="lg:col-span-3 space-y-6">
          {/* Horário de Funcionamento */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 editorial-shadow">
            <h3 className="font-serif text-lg text-on-surface mb-6">Horário de Funcionamento</h3>
            <div className="space-y-3">
              {horarios.map((item, i) => (
                <div
                  key={item.dia}
                  className={`rounded-xl transition-all ${
                    item.ativo ? 'bg-primary/5' : 'bg-surface-container-low opacity-50'
                  }`}
                >
                  {/* Linha principal: toggle + nome do dia */}
                  <div className="flex items-center justify-between p-3 pb-2">
                    <div className="flex items-center gap-3">
                      {/* Toggle */}
                      <button
                        onClick={() => toggleDia(i)}
                        className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors ${item.ativo ? 'bg-primary' : 'bg-outline-variant'}`}
                      >
                        <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all ${item.ativo ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                      <p className="text-sm text-on-surface font-medium">{item.dia}</p>
                    </div>
                    {!item.ativo && (
                      <span className="text-xs text-outline italic">Fechado</span>
                    )}
                  </div>

                  {/* Linha de horários — só aparece quando ativo */}
                  {item.ativo && (
                    <div className="flex items-center gap-2 px-3 pb-3 pl-[52px]">
                      <input
                        type="time"
                        value={item.inicio}
                        onChange={(e) => atualizarHorario(i, 'inicio', e.target.value)}
                        className="bg-white border border-outline-variant/40 rounded-lg text-sm text-on-surface focus:border-primary focus:ring-0 focus:outline-none px-2 py-1.5 w-full max-w-[110px]"
                      />
                      <span className="text-xs text-secondary flex-shrink-0">até</span>
                      <input
                        type="time"
                        value={item.fim}
                        onChange={(e) => atualizarHorario(i, 'fim', e.target.value)}
                        className="bg-white border border-outline-variant/40 rounded-lg text-sm text-on-surface focus:border-primary focus:ring-0 focus:outline-none px-2 py-1.5 w-full max-w-[110px]"
                      />
                      {item.inicio && item.fim && (
                        <span className="text-[10px] text-secondary flex-shrink-0 hidden sm:block">
                          {calcularHoras(item.inicio, item.fim).toFixed(1)}h
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Regras de Tempo */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 editorial-shadow">
            <h3 className="font-serif text-lg text-on-surface mb-6">Regras de Tempo</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Intervalo entre Sessões
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={regras.intervalo}
                    onChange={(e) => setRegras(prev => ({ ...prev, intervalo: e.target.value }))}
                    className="w-20 bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 text-center"
                  />
                  <span className="text-xs text-secondary">minutos</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Antecedência Mínima
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={regras.antecedencia}
                    onChange={(e) => setRegras(prev => ({ ...prev, antecedencia: e.target.value }))}
                    className="w-20 bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 text-center"
                  />
                  <span className="text-xs text-secondary">horas antes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Direita */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bloqueio de Datas */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 editorial-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg text-on-surface">Bloqueio de Datas</h3>
              <button 
                onClick={() => setModalAberto(true)}
                className="text-primary text-xs font-medium hover:underline"
              >
                + Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {bloqueios.length === 0 ? (
                <p className="text-xs text-outline text-center py-4">Nenhum bloqueio cadastrado.</p>
              ) : (
                bloqueios.map((block) => (
                  <div key={block.id} className="flex items-center justify-between p-4 rounded-xl bg-error/5 border border-error/10">
                    <div>
                      <p className="text-sm font-medium text-on-surface">{block.motivo || block.reason}</p>
                      <p className="text-[10px] text-secondary mt-0.5">
                        {block.data_inicio ? new Date(block.data_inicio).toLocaleDateString('pt-BR') : block.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-error/10 text-error font-medium">
                        {block.tipo || block.type || 'Feriado'}
                      </span>
                      <button
                        onClick={() => removerBloqueio(block.id)}
                        className="text-secondary hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Adicionar Bloqueio */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-md editorial-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-on-surface">Adicionar Bloqueio</h3>
              <button 
                onClick={() => {
                  setModalAberto(false);
                  setNovoBloqueio({ data_inicio: '', data_fim: '', motivo: '', tipo: 'Feriado' });
                }}
                className="text-secondary hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-5">
              {/* Data de Início */}
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Data de Início *
                </label>
                <input
                  type="date"
                  value={novoBloqueio.data_inicio}
                  onChange={(e) => setNovoBloqueio(prev => ({ ...prev, data_inicio: e.target.value }))}
                  className="w-full bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 py-2"
                  required
                />
              </div>

              {/* Data de Fim */}
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Data de Fim (opcional)
                </label>
                <input
                  type="date"
                  value={novoBloqueio.data_fim}
                  onChange={(e) => setNovoBloqueio(prev => ({ ...prev, data_fim: e.target.value }))}
                  className="w-full bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 py-2"
                />
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Motivo *
                </label>
                <input
                  type="text"
                  value={novoBloqueio.motivo}
                  onChange={(e) => setNovoBloqueio(prev => ({ ...prev, motivo: e.target.value }))}
                  placeholder="Ex: Natal, Férias, Evento"
                  className="w-full bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 py-2 placeholder:text-outline"
                  required
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Tipo
                </label>
                <select
                  value={novoBloqueio.tipo}
                  onChange={(e) => setNovoBloqueio(prev => ({ ...prev, tipo: e.target.value }))}
                  className="w-full bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 py-2"
                >
                  <option value="Feriado">Feriado</option>
                  <option value="Férias">Férias</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => {
                  setModalAberto(false);
                  setNovoBloqueio({ data_inicio: '', data_fim: '', motivo: '', tipo: 'Feriado' });
                }}
                className="flex-1 px-4 py-3 bg-surface-container text-on-surface rounded-xl text-xs font-semibold tracking-widest uppercase hover:bg-surface-container-high transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarBloqueio}
                className="flex-1 px-4 py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
