import { forwardRef } from 'react';

/**
 * Componente de Select reutilizável seguindo o design system
 */
const Select = forwardRef(({ 
  label, 
  error, 
  options = [], 
  placeholder = 'Selecione uma opção',
  className = '', 
  containerClassName = '',
  ...props 
}, ref) => {
  const hasError = !!error;
  
  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label 
          htmlFor={props.id} 
          className="block text-sm font-medium text-secondary mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full px-4 py-3 border rounded-xl bg-surface 
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary 
            transition-colors text-on-surface appearance-none cursor-pointer
            ${hasError 
              ? 'border-error focus:ring-error/20 focus:border-error' 
              : 'border-outline-variant'
            }
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-outline text-sm">expand_more</span>
        </div>
      </div>
      
      {hasError && (
        <p className="mt-1 text-sm text-error flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">error</span>
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;