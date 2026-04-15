import { forwardRef } from 'react';

/**
 * Componente de Input reutilizável seguindo o design system
 */
const Input = forwardRef(({ 
  label, 
  error, 
  icon, 
  rightIcon, 
  onRightIconClick,
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
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline text-sm">{icon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 border rounded-xl bg-surface 
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary 
            transition-colors text-on-surface placeholder-outline
            ${icon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${hasError 
              ? 'border-error focus:ring-error/20 focus:border-error' 
              : 'border-outline-variant'
            }
            ${className}
          `}
          {...props}
        />
        
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <span className="material-symbols-outlined text-outline hover:text-on-surface text-sm transition-colors">
              {rightIcon}
            </span>
          </button>
        )}
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

Input.displayName = 'Input';

export default Input;