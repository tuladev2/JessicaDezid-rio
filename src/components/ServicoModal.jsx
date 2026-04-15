import { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './ui/Input';
import Select from './ui/Select';
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
 * Inclui validação em tempo real e preview de imagem
 */
export default function ServicoModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingServico = null, 
  loading = false 
}) {
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

  // Estado de validação
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // Determinar se é edição ou criação
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
      } else {
        // Reset para novo serviço
        setFormData({
          name: '',
          description: '',
          category: '',
          duration_minutes: '',
          price_single: '',
          price_package: '',
          image_url: ''
        });
      }
      setErrors({});
      setTouched({});
      setImagePreviewError(false);
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
    setErrors(validation.errors);
    
    if (!validation.isValid) {
      // Focar no primeiro campo com erro
      const firstErrorField = Object.keys(validation.errors)[0];
      const firstErrorElement = document.getElementById(firstErrorField);
      if (firstErrorElement) {
        firstErrorElement.focus();
      }
      return;
    }
    
    try {
      // Sanitizar dados antes do envio
      const sanitizedData = sanitizeServicoData(formData);
      await onSubmit(sanitizedData);
      
      // Modal será fechado pelo componente pai após sucesso
    } catch (error) {
      // Erro será tratado pelo componente pai
      console.error('Erro ao submeter formulário:', error);
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

  // Verificar se pode submeter
  const canSubmit = !loading && hasChanges && Object.keys(errors).length === 0;

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

            {/* URL da Imagem */}
            <Input
              id="image_url"
              label="URL da Imagem (opcional)"
              type="url"
              value={formData.image_url}
              onChange={handleImageUrlChange}
              error={touched.image_url ? errors.image_url : null}
              placeholder="https://exemplo.com/imagem.jpg"
              icon="image"
            />

            {/* Preview da Imagem */}
            {formData.image_url && !errors.image_url && (
              <div className="bg-surface-container/30 rounded-xl p-4">
                <h5 className="text-sm font-medium text-on-surface mb-2">Preview da Imagem:</h5>
                <div className="w-full h-32 rounded-lg overflow-hidden bg-surface-container">
                  {!imagePreviewError ? (
                    <img
                      src={formData.image_url}
                      alt="Preview do serviço"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreviewError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-2xl mb-1 block">broken_image</span>
                        <p className="text-xs">Erro ao carregar imagem</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
              className="px-6 py-2 text-sm font-medium bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
              )}
              {isEditing ? 'Salvar Alterações' : 'Criar Serviço'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}