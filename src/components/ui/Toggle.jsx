import { forwardRef } from 'react';

/**
 * Componente de Toggle Switch reutilizável
 * Usado para alternar status ativo/inativo
 */
const Toggle = forwardRef(({ 
  checked = false,
  onChange,
  disabled = false,
  loading = false,
  label,
  description,
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
  ...props 
}, ref) => {
  
  // Configurações de tamanho
  const sizeConfig = {
    sm: {
      switch: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4'
    },
    md: {
      switch: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: {
      switch: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  const handleChange = (e) => {
    if (!disabled && !loading && onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center">
        {/* Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled || loading}
          onClick={() => handleChange({ target: { checked: !checked } })}
          className={`
            relative inline-flex items-center ${config.switch} rounded-full 
            transition-colors duration-200 ease-in-out focus:outline-none 
            focus:ring-2 focus:ring-primary/20 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${checked 
              ? 'bg-primary' 
              : 'bg-outline-variant'
            }
          `}
        >
          {/* Thumb */}
          <span
            className={`
              ${config.thumb} inline-block rounded-full bg-white shadow-lg 
              transform transition-transform duration-200 ease-in-out
              ${checked ? config.translate : 'translate-x-0.5'}
            `}
          >
            {loading && (
              <span className="material-symbols-outlined animate-spin text-xs text-outline absolute inset-0 flex items-center justify-center">
                sync
              </span>
            )}
          </span>
        </button>

        {/* Hidden Input para acessibilidade */}
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled || loading}
          className="sr-only"
          {...props}
        />
      </div>

      {/* Label e Descrição */}
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label className="text-sm font-medium text-on-surface cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-secondary">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Toggle.displayName = 'Toggle';

export default Toggle;