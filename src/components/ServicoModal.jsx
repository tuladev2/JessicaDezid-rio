import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import { supabase } from '../lib/supabase';
import { 
  CATEGORIAS_SERVICOS, 
  validateServicoForm, 
  sanitizeServicoData,
  formatCurrency,
  parseCurrency,
  formatDuration
} from '../lib/servicosUtils';

/**
 * Modal para criação e edição de serviços
 * Inclui upload de imagem para Supabase Storage + preview
 */
export default function ServicoModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingServico = null, 
  loading = false 
}) {
  const fileInputRef = useRef(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    duration_minutes: '',
    price_single: '',
    price_package: '',
    image_url: ''
  });

  // Estado de upload
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // URL local para preview imediato

  // Estado de validação
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const isEditing = !!editingServico;
  const modalTitle = isEditing ? 'Editar Serviço' : 'Novo Serviço';

  // Preencher formulário quando editando
  useEffect(() => {
    if (isOpen) {
      if (editingServico) {
        setFormData({
          name: editingServico.name || '',
          description: editingServico.description || '',
          category: editingServico.category || '',
          duration_minutes: editingServico.duration_minutes?.toString() || '',
          price_single: editingServico.price_single?.toString() || '',
          price_package: editingServico.price_package?.toString() || '',
          image_url: editingServico.image_url || ''
        });
        setImagePreview(editingServico.image_url || null);
      } else {
        setFormData({
          name: '',
          description: '',
          category: '',
          duration_minutes: '',
          price_single: '',
          price_package: '',
          image_url: ''
        });
        setImagePreview(null);
      }
      setErrors({});
      setTouched({});
      setImagePreviewError(false);
      setUploadError(null);
    }
  }, [isOpen, editingServico]);

  // Handler para mudanças nos campos
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Marcar campo como tocado
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validação em tempo real
    const newFormData = { ...formData, [field]: value };
    const validation = validateServicoForm(newFormData);
    
    setErrors(prev => ({
      ...prev,
      [field]: validation.errors[field] || null
    }));
  };

  // Handlers específicos para cada campo
  const handleNameChange = (e) => handleInputChange('name', e.target.value);
  const handleDescriptionChange = (e) => handleInputChange('description', e.target.value);
  const handleCategoryChange = (e) => handleInputChange('category', e.target.value);
  const handleDurationChange = (e) => handleInputChange('duration_minutes', e.target.value);
  const handleImageUrlChange = (e) => {
    handleInputChange('image_url', e.target.value);
    setImagePreviewError(false);
    setImagePreview(e.target.value || null);
  };

  // Handler de upload para Supabase Storage
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setUploadError('Apenas imagens são permitidas (JPG, PNG, WebP).');
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Imagem muito grande. Máximo permitido: 5MB.');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    // Preview local imediato enquanto faz upload
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    try {
      // Nome único para evitar colisão: timestamp + nome original sanitizado
      const ext = file.name.split('.').pop();
      const fileName = `servico_${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('imagens-servicos')
        .upload(fileName, file, { upsert: true, contentType: file.type });

      if (uploadErr) throw uploadErr;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('imagens-servicos')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Salvar URL pública no formData
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      setImagePreview(publicUrl);
      setImagePreviewError(false);

    } catch (err) {
      console.error('Erro no upload da imagem:', err);
      setUploadError(`Erro ao enviar imagem: ${err.message}`);
      setImagePreview(formData.image_url || null); // reverter preview
    } finally {
      setUploadLoading(false);
      // Limpar input para permitir re-upload do mesmo arquivo
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handler para preços com formatação
  const handlePriceChange = (field) => (e) => {
    let value = e.target.value;
    
    // Permitir apenas números, vírgula e ponto
    value = value.replace(/[^\d.,]/g, '');
    
    // Limitar a 2 casas decimais
    const parts = value.split(/[.,]/);
    if (parts.length > 2) {
      value = parts[0] + ',' + parts[1].substring(0, 2);
    } else if (parts.length === 2 && parts[1].length > 2) {
      value = parts[0] + ',' + parts[1].substring(0, 2);
    }
    
    handleInputChange(field, value);
  };

  // Handler para submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos os campos como tocados
    const allFields = Object.keys(formData);
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    
    // Validar formulário completo
    const validation = validateServicoForm(formData);
    
    // Filtrar apenas erros reais (não nulos)
    const realErrors = Object.fromEntries(
      Object.entries(validation.errors).filter(([, v]) => v !== null && v !== undefined && v !== '')
    );

    console.log('[ServicoModal] Submit — formData:', formData);
    console.log('[ServicoModal] Erros de validação:', realErrors);
    console.log('[ServicoModal] Formulário válido:', validation.isValid);

    setErrors(realErrors);
    
    if (!validation.isValid) {
      const firstErrorField = Object.keys(realErrors)[0];
      const firstErrorElement = document.getElementById(firstErrorField);
      if (firstErrorElement) firstErrorElement.focus();
      return;
    }
    
    try {
      const sanitizedData = sanitizeServicoData(formData);
      console.log('[ServicoModal] Dados sanitizados para envio:', sanitizedData);
      await onSubmit(sanitizedData);
    } catch (error) {
      console.error('[ServicoModal] Erro ao submeter:', error);
    }
  };

  // Handler para cancelar
  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  // Verificar se formulário tem mudanças (para edição)
  const hasChanges = isEditing && editingServico ? (
    formData.name !== (editingServico.name || '') ||
    formData.description !== (editingServico.description || '') ||
    formData.category !== (editingServico.category || '') ||
    formData.duration_minutes !== (editingServico.duration_minutes?.toString() || '') ||
    formData.price_single !== (editingServico.price_single?.toString() || '') ||
    formData.price_package !== (editingServico.price_package?.toString() || '') ||
    formData.image_url !== (editingServico.image_url || '')
  ) : true;

  // Verificar se pode submeter — filtrar erros null (campos válidos que já foram tocados)
  const activeErrors = Object.values(errors).filter(v => v !== null && v !== undefined && v !== '');
  const canSubmit = !loading && !uploadLoading && hasChanges && activeErrors.length === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={modalTitle}
      width="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grid de campos principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna Esquerda - Informações Básicas */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-on-surface mb-4">Informações Básicas</h4>
            
            {/* Nome do Serviço */}
            <Input
              id="name"
              label="Nome do Serviço *"
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              error={touched.name ? errors.name : null}
              placeholder="Ex: Limpeza de Pele Profunda"
              maxLength={100}
            />

            {/* Categoria */}
            <Select
              id="category"
              label="Categoria *"
              value={formData.category}
              onChange={handleCategoryChange}
              options={CATEGORIAS_SERVICOS}
              error={touched.category ? errors.category : null}
              placeholder="Selecione uma categoria"
            />

            {/* Duração */}
            <Input
              id="duration_minutes"
              label="Duração (minutos) *"
              type="number"
              value={formData.duration_minutes}
              onChange={handleDurationChange}
              error={touched.duration_minutes ? errors.duration_minutes : null}
              placeholder="Ex: 90"
              min="1"
              max="480"
            />
            
            {/* Preview da duração */}
            {formData.duration_minutes && !errors.duration_minutes && (
              <p className="text-xs text-secondary">
                Duração: {formatDuration(parseInt(formData.duration_minutes))}
              </p>
            )}

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-secondary mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Descreva o serviço, benefícios e diferenciais..."
                maxLength={500}
                rows={4}
                className={`
                  w-full px-4 py-3 border rounded-xl bg-surface 
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary 
                  transition-colors text-on-surface placeholder-outline resize-none
                  ${touched.description && errors.description 
                    ? 'border-error focus:ring-error/20 focus:border-error' 
                    : 'border-outline-variant'
                  }
                `}
              />
              <div className="flex justify-between items-center mt-1">
                {touched.description && errors.description && (
                  <p className="text-sm text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {errors.description}
                  </p>
                )}
                <p className="text-xs text-outline ml-auto">
                  {formData.description.length}/500 caracteres
                </p>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Preços e Imagem */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-on-surface mb-4">Preços e Imagem</h4>
            
            {/* Preço Individual */}
            <Input
              id="price_single"
              label="Preço Individual *"
              type="text"
              value={formData.price_single}
              onChange={handlePriceChange('price_single')}
              error={touched.price_single ? errors.price_single : null}
              placeholder="Ex: 280,00"
              icon="attach_money"
            />

            {/* Preço do Pacote */}
            <Input
              id="price_package"
              label="Preço do Pacote (opcional)"
              type="text"
              value={formData.price_package}
              onChange={handlePriceChange('price_package')}
              error={touched.price_package ? errors.price_package : null}
              placeholder="Ex: 1200,00"
              icon="inventory_2"
            />

            {/* Preview dos preços */}
            {(formData.price_single || formData.price_package) && (
              <div className="bg-surface-container/30 rounded-xl p-4">
                <h5 className="text-sm font-medium text-on-surface mb-2">Preview de Preços:</h5>
                {formData.price_single && !errors.price_single && (
                  <p className="text-sm text-secondary">
                    Individual: {formatCurrency(parseCurrency(formData.price_single))}
                  </p>
                )}
                {formData.price_package && !errors.price_package && (
                  <p className="text-sm text-secondary">
                    Pacote: {formatCurrency(parseCurrency(formData.price_package))}
                  </p>
                )}
                {formData.price_single && formData.price_package && 
                 !errors.price_single && !errors.price_package && (
                  <p className="text-xs text-primary mt-1">
                    Economia: {formatCurrency(
                      (parseCurrency(formData.price_single) * 6) - parseCurrency(formData.price_package)
                    )} (aprox. 6 sessões)
                  </p>
                )}
              </div>
            )}

            {/* Upload / URL da Imagem */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Imagem do Serviço (opcional)
              </label>

              {/* Área de upload por clique */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              <div
                onClick={() => !uploadLoading && fileInputRef.current?.click()}
                className={`relative w-full h-36 rounded-xl border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden
                  ${uploadLoading
                    ? 'border-primary/40 bg-primary/5 cursor-wait'
                    : 'border-outline-variant hover:border-primary hover:bg-primary/5'
                  }`}
              >
                {imagePreview && !imagePreviewError ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover rounded-xl"
                      onError={() => setImagePreviewError(true)}
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                      <span className="material-symbols-outlined text-white text-2xl">edit</span>
                      <p className="text-white text-xs mt-1">Trocar imagem</p>
                    </div>
                  </>
                ) : uploadLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-primary text-2xl">sync</span>
                    <p className="text-xs text-primary">Enviando imagem...</p>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-outline text-2xl">cloud_upload</span>
                    <p className="text-xs text-secondary text-center px-4">
                      Clique para fazer upload<br/>
                      <span className="text-outline">JPG, PNG ou WebP · máx. 5MB</span>
                    </p>
                  </>
                )}
              </div>

              {/* Erro de upload */}
              {uploadError && (
                <p className="mt-2 text-xs text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {uploadError}
                </p>
              )}

              {/* Campo de URL manual como alternativa */}
              <div className="mt-3">
                <Input
                  id="image_url"
                  label="Ou cole uma URL de imagem"
                  type="url"
                  value={formData.image_url}
                  onChange={handleImageUrlChange}
                  error={touched.image_url ? errors.image_url : null}
                  placeholder="https://exemplo.com/imagem.jpg"
                  icon="link"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-between pt-6 border-t border-outline-variant/20">
          <div className="flex items-center gap-2 text-sm text-secondary">
            <span className="material-symbols-outlined text-sm">info</span>
            <span>Campos marcados com * são obrigatórios</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-secondary hover:text-on-surface hover:bg-surface-container rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={!canSubmit}
              className="relative z-10 px-6 py-2 text-sm font-medium bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {(loading || uploadLoading) && (
                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
              )}
              {uploadLoading ? 'Aguardando upload...' : isEditing ? 'Salvar Alterações' : 'Criar Serviço'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}