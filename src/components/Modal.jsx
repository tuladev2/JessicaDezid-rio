import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, width = 'max-w-2xl' }) {
  // Fecha com Tecla Esc
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop Glassmorphism */}
      <div 
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Window */}
      <div 
        className={`relative w-full ${width} bg-surface-container-lowest rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-all transform scale-100 opacity-100`}
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/10">
          <h3 className="font-serif text-2xl text-on-surface">{title}</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-secondary text-xl">close</span>
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto flex-1 font-body custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
