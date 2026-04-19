import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

// ── Comprime e converte imagem para WebP via Canvas ──────────────────────────
async function comprimirParaWebP(file, maxWidth = 684, maxHeight = 1026, qualidade = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calcular dimensões mantendo proporção, limitando ao dobro do tamanho alvo
      let { width, height } = img;
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
      width  = Math.round(width  * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(blob || file),
        'image/webp',
        qualidade
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// ── Upload genérico elegante ──────────────────────────────────────────────────
function UploadImagem({ label, descricao, icone, imagemAtual, onUpload, uploading }) {
  const inputRef = useRef(null);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] tracking-widest uppercase text-secondary font-semibold">{label}</p>
        {descricao && <p className="text-xs text-outline mt-0.5">{descricao}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-container flex-shrink-0 border border-outline-variant/20">
          {imagemAtual ? (
            <img src={imagemAtual} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-outline text-2xl">{icone}</span>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant/40 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container transition-all disabled:opacity-50"
        >
          {uploading ? (
            <><span className="material-symbols-outlined text-sm animate-spin">refresh</span>Enviando...</>
          ) : (
            <><span className="material-symbols-outlined text-sm">cloud_upload</span>Alterar imagem</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Upload específico para Imagem da Home (342×513) ───────────────────────────
function UploadImagemHome({ imagemAtual, onUpload, uploading }) {
  const inputRef = useRef(null);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] tracking-widest uppercase text-secondary font-semibold">Imagem da Home</p>
        <p className="text-xs text-outline mt-0.5">Foto principal exibida na página inicial do cliente</p>
      </div>

      {/* Preview com proporção fixa 342×513 */}
      <div
        className="rounded-xl overflow-hidden bg-surface-container border border-outline-variant/20 relative"
        style={{ width: '100%', maxWidth: '171px', aspectRatio: '342 / 513' }}
      >
        {imagemAtual ? (
          <img
            src={imagemAtual}
            alt="Imagem da Home"
            className="w-full h-full rounded-xl"
            style={{ objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-outline text-3xl">home</span>
            <span className="text-[9px] text-outline text-center px-2">Sem imagem</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl animate-spin">refresh</span>
          </div>
        )}
      </div>

      {/* Aviso de tamanho ideal */}
      <p className="text-[10px] text-outline flex items-center gap-1">
        <span className="material-symbols-outlined text-xs">straighten</span>
        Tamanho ideal: 342×513px · WebP gerado automaticamente
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant/40 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container transition-all disabled:opacity-50"
      >
        {uploading ? (
          <><span className="material-symbols-outlined text-sm animate-spin">refresh</span>Comprimindo e enviando...</>
        ) : (
          <><span className="material-symbols-outlined text-sm">cloud_upload</span>Alterar imagem da Home</>
        )}
      </button>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Perfil() {
  const { session } = useAuth();

  // Dados da clínica
  const [clinica, setClinica] = useState({
    nome_clinica: '',
    endereco: '',
    whatsapp: '',
    bio: '',
    foto_perfil_url: '',
    imagem_home_url: '',
    imagem_login_url: '',
  });

  const [loading, setLoading]       = useState(true);
  const [salvando, setSalvando]     = useState(false);
  const [notification, setNotification] = useState(null);

  // Estados de upload individuais
  const [uploadingFoto,   setUploadingFoto]   = useState(false);
  const [uploadingHome,   setUploadingHome]   = useState(false);
  const [uploadingLogin,  setUploadingLogin]  = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ── Carregar dados ──────────────────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('configuracoes_clinica')
        .select('*')
        .maybeSingle();

      if (error && !['PGRST116', 'PGRST200'].includes(error.code)) {
        console.error('[Perfil] Erro ao carregar:', error.message);
      }

      if (data) {
        setClinica({
          nome_clinica:     data.nome_clinica     || '',
          endereco:         data.endereco         || '',
          whatsapp:         data.whatsapp         || '',
          bio:              data.bio              || '',
          foto_perfil_url:  data.foto_perfil_url  || '',
          imagem_home_url:  data.imagem_home_url  || '',
          imagem_login_url: data.imagem_login_url || '',
        });
      }
    } catch (err) {
      console.error('[Perfil] Erro:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Salvar dados da clínica ─────────────────────────────────────────────────
  const salvarPerfil = async () => {
    setSalvando(true);
    try {
      const payload = {
        nome_clinica:     clinica.nome_clinica.trim(),
        endereco:         clinica.endereco.trim(),
        whatsapp:         clinica.whatsapp.trim(),
        bio:              clinica.bio.trim(),
        foto_perfil_url:  clinica.foto_perfil_url,
        imagem_home_url:  clinica.imagem_home_url,
        imagem_login_url: clinica.imagem_login_url,
        updated_at:       new Date().toISOString(),
      };

      // Upsert — usa id=1 como linha única de configuração
      const { error } = await supabase
        .from('configuracoes_clinica')
        .upsert({ id: 1, ...payload }, { onConflict: 'id' });

      if (error) throw error;
      showNotification('Configurações salvas com sucesso!', 'success');
    } catch (err) {
      console.error('[Perfil] Erro ao salvar:', err.message);
      showNotification('Erro ao salvar. Tente novamente.', 'error');
    } finally {
      setSalvando(false);
    }
  };

  // ── Upload genérico para Supabase Storage ───────────────────────────────────
  const uploadImagem = async (file, pasta, nomeFixo) => {
    const ext = file.name.split('.').pop();
    const caminho = `${pasta}/${nomeFixo}.${ext}`;

    // Remove arquivo anterior se existir
    await supabase.storage.from('clinica-assets').remove([caminho]);

    const { error } = await supabase.storage
      .from('clinica-assets')
      .upload(caminho, file, { upsert: true, cacheControl: '3600' });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('clinica-assets')
      .getPublicUrl(caminho);

    // Adiciona cache-buster para forçar reload no browser
    return `${urlData.publicUrl}?t=${Date.now()}`;
  };

  // ── Handlers de upload ──────────────────────────────────────────────────────
  const handleUploadFoto = async (file) => {
    setUploadingFoto(true);
    try {
      const url = await uploadImagem(file, 'perfil', 'foto-perfil');
      setClinica(prev => ({ ...prev, foto_perfil_url: url }));
      // Salvar imediatamente no banco
      await supabase.from('configuracoes_clinica')
        .upsert({ id: 1, foto_perfil_url: url, updated_at: new Date().toISOString() }, { onConflict: 'id' });
      showNotification('Foto de perfil atualizada!', 'success');
    } catch (err) {
      console.error('[Perfil] Erro upload foto:', err.message);
      showNotification('Erro ao enviar foto. Verifique o bucket "clinica-assets" no Supabase.', 'error');
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleUploadHome = async (file) => {
    setUploadingHome(true);
    try {
      // Comprimir e converter para WebP (max 684×1026 = 2× o tamanho alvo)
      const blob = await comprimirParaWebP(file, 684, 1026, 0.85);
      const webpFile = new File([blob], 'imagem-home.webp', { type: 'image/webp' });

      // Remover versão anterior (qualquer extensão)
      await supabase.storage.from('clinica-assets').remove([
        'site/imagem-home.webp', 'site/imagem-home.jpg',
        'site/imagem-home.jpeg', 'site/imagem-home.png',
      ]);

      const { error } = await supabase.storage
        .from('clinica-assets')
        .upload('site/imagem-home.webp', webpFile, { upsert: true, cacheControl: '3600' });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('clinica-assets')
        .getPublicUrl('site/imagem-home.webp');

      const url = `${urlData.publicUrl}?t=${Date.now()}`;
      setClinica(prev => ({ ...prev, imagem_home_url: url }));
      await supabase.from('configuracoes_clinica')
        .upsert({ id: 1, imagem_home_url: url, updated_at: new Date().toISOString() }, { onConflict: 'id' });

      // Notifica a Home para atualizar a imagem sem F5
      window.dispatchEvent(new CustomEvent('imagem-home-atualizada', { detail: { url } }));

      showNotification('Imagem da Home atualizada!', 'success');
    } catch (err) {
      console.error('[Perfil] Erro upload home:', err.message);
      showNotification('Erro ao enviar imagem. Verifique o bucket "clinica-assets" no Supabase.', 'error');
    } finally {
      setUploadingHome(false);
    }
  };

  const handleUploadLogin = async (file) => {
    setUploadingLogin(true);
    try {
      const url = await uploadImagem(file, 'site', 'imagem-login');
      setClinica(prev => ({ ...prev, imagem_login_url: url }));
      await supabase.from('configuracoes_clinica')
        .upsert({ id: 1, imagem_login_url: url, updated_at: new Date().toISOString() }, { onConflict: 'id' });
      showNotification('Imagem de Login atualizada!', 'success');
    } catch (err) {
      console.error('[Perfil] Erro upload login:', err.message);
      showNotification('Erro ao enviar imagem. Verifique o bucket "clinica-assets" no Supabase.', 'error');
    } finally {
      setUploadingLogin(false);
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="px-4 lg:px-12 py-10 animate-pulse space-y-4">
        <div className="h-8 bg-surface-container rounded w-48"></div>
        <div className="h-48 bg-surface-container rounded-2xl"></div>
        <div className="h-48 bg-surface-container rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-12 py-6 lg:py-10">

      {/* Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-2 min-w-72 max-w-sm
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Administração</p>
          <h2 className="font-serif text-2xl lg:text-3xl text-on-surface">Perfil da Clínica</h2>
        </div>
        <button
          onClick={salvarPerfil}
          disabled={salvando}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all disabled:opacity-60 self-start sm:self-auto"
        >
          {salvando ? (
            <>
              <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
              Salvando...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">save</span>
              Salvar Alterações
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Coluna Esquerda ─────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Foto de Perfil + Email */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 editorial-shadow">
            <h3 className="font-serif text-lg text-on-surface mb-6">Foto de Perfil</h3>
            <div className="flex items-center gap-6 mb-6">
              {/* Avatar grande */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-container border-2 border-primary/20">
                  {clinica.foto_perfil_url ? (
                    <img src={clinica.foto_perfil_url} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <span className="material-symbols-outlined text-primary text-3xl">person</span>
                    </div>
                  )}
                </div>
                {uploadingFoto && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl animate-spin">refresh</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">
                  {clinica.nome_clinica || 'Nome da Clínica'}
                </p>
                <p className="text-xs text-secondary mt-0.5 truncate">
                  {session?.user?.email || ''}
                </p>
                <input
                  type="file"
                  id="upload-foto-perfil"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files[0] && handleUploadFoto(e.target.files[0])}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('upload-foto-perfil').click()}
                  disabled={uploadingFoto}
                  className="mt-3 flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                  {uploadingFoto ? 'Enviando...' : 'Alterar foto'}
                </button>
              </div>
            </div>
          </div>

          {/* Dados da Clínica */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 editorial-shadow">
            <h3 className="font-serif text-lg text-on-surface mb-6">Dados da Clínica</h3>
            <div className="space-y-6">

              {/* Nome da Clínica */}
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Nome da Clínica
                </label>
                <input
                  type="text"
                  value={clinica.nome_clinica}
                  onChange={(e) => setClinica(prev => ({ ...prev, nome_clinica: e.target.value }))}
                  placeholder="Ex: Jessica Dezidério Estética"
                  className="w-full bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 focus:outline-none py-2 placeholder:text-outline"
                />
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  value={clinica.endereco}
                  onChange={(e) => setClinica(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Ex: Rua das Flores, 123 — Centro, Florianópolis/SC"
                  className="w-full bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 focus:outline-none py-2 placeholder:text-outline"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  WhatsApp de Contato
                </label>
                <input
                  type="tel"
                  value={clinica.whatsapp}
                  onChange={(e) => setClinica(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="Ex: 5548992212770"
                  className="w-full bg-transparent border-0 border-b border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-0 focus:outline-none py-2 placeholder:text-outline"
                />
                <p className="text-[10px] text-outline mt-1">Formato internacional sem espaços: 55 + DDD + número</p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-secondary mb-2 font-semibold">
                  Bio / Descrição da Clínica
                </label>
                <textarea
                  value={clinica.bio}
                  onChange={(e) => setClinica(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Uma breve descrição sobre a clínica, especialidades e diferenciais..."
                  rows={4}
                  className="w-full bg-transparent border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:border-primary focus:ring-0 focus:outline-none p-3 placeholder:text-outline resize-none"
                />
              </div>

            </div>
          </div>
        </div>

        {/* ── Coluna Direita ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personalização do Site */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 editorial-shadow">
            <h3 className="font-serif text-lg text-on-surface mb-2">Personalização do Site</h3>
            <p className="text-xs text-secondary mb-6">
              As imagens são atualizadas automaticamente em todo o site ao fazer upload.
            </p>

            <div className="space-y-6 divide-y divide-outline-variant/10">
              <div className="pt-0">
                <UploadImagemHome
                  imagemAtual={clinica.imagem_home_url}
                  onUpload={handleUploadHome}
                  uploading={uploadingHome}
                />
              </div>
              <div className="pt-6">
                <UploadImagem
                  label="Imagem de Login"
                  descricao="Foto exibida na tela de login da administração"
                  icone="lock"
                  imagemAtual={clinica.imagem_login_url}
                  onUpload={handleUploadLogin}
                  uploading={uploadingLogin}
                />
              </div>
            </div>
          </div>

          {/* Instruções SQL */}
          <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-lg flex-shrink-0 mt-0.5">info</span>
              <div>
                <p className="text-xs font-semibold text-on-surface mb-1">Configuração inicial</p>
                <p className="text-[11px] text-secondary leading-relaxed">
                  Execute o SQL em <code className="bg-primary/10 px-1 rounded text-primary">perfil_clinica_schema.sql</code> no Supabase para criar a tabela e o bucket necessários.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
