/**
 * Utilitários para formatação e validação de serviços
 */

/**
 * Formata valor monetário para exibição
 */
export const formatCurrency = (value) => {
  if (!value && value !== 0) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Converte string de moeda para número
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove símbolos e converte vírgula para ponto
  const cleanString = currencyString
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
    
  return parseFloat(cleanString) || 0;
};

/**
 * Formata duração em minutos para exibição
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Categorias disponíveis para serviços
 */
export const CATEGORIAS_SERVICOS = [
  { value: 'Tratamentos Faciais', label: 'Tratamentos Faciais' },
  { value: 'Tratamentos Corporais', label: 'Tratamentos Corporais' },
  { value: 'Depilação', label: 'Depilação' },
  { value: 'Massagens', label: 'Massagens' },
  { value: 'Estética Avançada', label: 'Estética Avançada' },
  { value: 'Harmonização Facial', label: 'Harmonização Facial' },
  { value: 'Outros', label: 'Outros' }
];

/**
 * Valida dados do formulário de serviço
 */
export const validateServicoForm = (formData) => {
  const errors = {};

  // Nome obrigatório
  if (!formData.name?.trim()) {
    errors.name = 'Nome do serviço é obrigatório';
  } else if (formData.name.trim().length < 3) {
    errors.name = 'Nome deve ter pelo menos 3 caracteres';
  } else if (formData.name.trim().length > 100) {
    errors.name = 'Nome deve ter no máximo 100 caracteres';
  }

  // Categoria obrigatória
  if (!formData.category?.trim()) {
    errors.category = 'Categoria é obrigatória';
  }

  // Duração obrigatória e válida
  const duration = parseInt(formData.duration_minutes);
  if (!formData.duration_minutes || isNaN(duration)) {
    errors.duration_minutes = 'Duração é obrigatória';
  } else if (duration <= 0) {
    errors.duration_minutes = 'Duração deve ser maior que zero';
  } else if (duration > 480) { // 8 horas máximo
    errors.duration_minutes = 'Duração não pode exceder 8 horas (480 minutos)';
  }

  // Preço individual obrigatório e válido
  const priceString = typeof formData.price_single === 'string' 
    ? formData.price_single 
    : String(formData.price_single || '');
  const priceSingle = parseCurrency(priceString);
  
  if (!formData.price_single || priceSingle <= 0) {
    errors.price_single = 'Preço individual é obrigatório e deve ser maior que zero';
  } else if (priceSingle > 10000) {
    errors.price_single = 'Preço individual não pode exceder R$ 10.000,00';
  }

  // Preço do pacote (opcional, mas se informado deve ser válido)
  if (formData.price_package) {
    const packagePriceString = typeof formData.price_package === 'string' 
      ? formData.price_package 
      : String(formData.price_package);
    const pricePackage = parseCurrency(packagePriceString);
    
    if (pricePackage <= 0) {
      errors.price_package = 'Preço do pacote deve ser maior que zero';
    } else if (pricePackage > 50000) {
      errors.price_package = 'Preço do pacote não pode exceder R$ 50.000,00';
    } else if (pricePackage <= priceSingle) {
      errors.price_package = 'Preço do pacote deve ser maior que o preço individual';
    }
  }

  // Descrição (opcional, mas se informada deve ter tamanho válido)
  if (formData.description && formData.description.trim().length > 500) {
    errors.description = 'Descrição deve ter no máximo 500 caracteres';
  }

  // URL da imagem (opcional, mas se informada deve ser válida)
  if (formData.image_url && formData.image_url.trim()) {
    try {
      new URL(formData.image_url.trim());
      // URL válida — aceitar qualquer URL https (Supabase Storage, CDNs, etc.)
      if (!formData.image_url.trim().startsWith('http')) {
        errors.image_url = 'URL da imagem deve começar com http:// ou https://';
      }
    } catch {
      errors.image_url = 'URL da imagem inválida';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitiza dados do formulário antes do envio
 */
export const sanitizeServicoData = (formData) => {
  return {
    name: formData.name?.trim() || '',
    description: formData.description?.trim() || '',
    category: formData.category?.trim() || '',
    duration_minutes: parseInt(formData.duration_minutes) || 0,
    price_single: typeof formData.price_single === 'string' 
      ? parseCurrency(formData.price_single) 
      : parseFloat(formData.price_single) || 0,
    price_package: formData.price_package 
      ? (typeof formData.price_package === 'string' 
          ? parseCurrency(formData.price_package) 
          : parseFloat(formData.price_package))
      : null,
    image_url: formData.image_url?.trim() || ''
  };
};

/**
 * Gera placeholder de imagem baseado na categoria
 */
export const getPlaceholderImage = (category) => {
  const placeholders = {
    'Tratamentos Faciais': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop',
    'Tratamentos Corporais': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop',
    'Depilação': 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&h=300&fit=crop',
    'Massagens': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop',
    'Estética Avançada': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop',
    'Harmonização Facial': 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&h=300&fit=crop'
  };
  
  return placeholders[category] || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop';
};

/**
 * Debounce function para otimizar buscas
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};