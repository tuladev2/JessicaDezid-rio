import { useState, useEffect } from 'react';

/**
 * Prompt de instalação PWA cross-platform:
 * - Android/Chrome/Samsung: usa beforeinstallprompt nativo
 * - iOS/Safari: mostra instruções manuais (share → Add to Home Screen)
 * - Já instalado ou dispensado: não aparece
 */

function detectOS() {
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  return { isIOS, isSafariOnly: isIOS && isSafari };
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    // Já instalado como PWA — não mostrar nada
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (navigator.standalone) return; // iOS standalone
    // Já dispensado nesta sessão
    if (sessionStorage.getItem('pwa-dismissed')) return;

    const { isIOS, isSafariOnly } = detectOS();

    if (isIOS && isSafariOnly) {
      // iOS Safari: mostrar instruções manuais após 3s
      const t = setTimeout(() => setShowIOS(true), 3000);
      return () => clearTimeout(t);
    }

    // Android / Chrome / Samsung Internet
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroid(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('pwa-dismissed', '1');
    setShowAndroid(false);
    setShowIOS(false);
  };

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Instalação:', outcome);
    setDeferredPrompt(null);
    setShowAndroid(false);
  };

  // ── Banner Android ────────────────────────────────────────────────────
  if (showAndroid) {
    return (
      <div className="fixed bottom-20 left-3 right-3 z-[60] sm:left-auto sm:right-5 sm:max-w-sm">
        <div className="bg-[#FDFBF7] border border-[#d3c3ba]/40 rounded-2xl p-4 shadow-2xl shadow-[#4A3728]/15 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#775841] flex items-center justify-center flex-shrink-0">
            <span className="font-serif italic text-white text-base font-bold">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label text-[10px] tracking-[0.2em] uppercase text-[#775841] leading-none mb-1">
              Instalar App
            </p>
            <p className="font-body text-xs text-[#4A3728]/70 leading-snug">
              Acesso rápido na tela inicial.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstallAndroid}
              className="px-4 py-2 bg-[#775841] text-white rounded-full font-label text-[10px] tracking-widest uppercase hover:bg-[#5d412b] transition-colors active:scale-95"
            >
              Instalar
            </button>
            <button
              onClick={dismiss}
              className="text-[#4A3728]/40 font-label text-[9px] tracking-widest uppercase hover:text-[#4A3728] transition-colors text-center"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Banner iOS ────────────────────────────────────────────────────────
  if (showIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[60]"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="bg-[#FDFBF7] border-t border-[#d3c3ba]/40 px-5 py-4 shadow-2xl shadow-[#4A3728]/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#775841] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="font-serif italic text-white text-sm font-bold">JD</span>
            </div>
            <div className="flex-1">
              <p className="font-label text-[10px] tracking-[0.2em] uppercase text-[#775841] mb-1">
                Adicionar à Tela de Início
              </p>
              <p className="font-body text-xs text-[#4A3728]/80 leading-relaxed">
                Toque no ícone{' '}
                <span className="inline-flex items-center gap-0.5 text-[#775841] font-medium">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"wght" 300' }}>
                    ios_share
                  </span>
                  Compartilhar
                </span>{' '}
                e depois em{' '}
                <span className="font-medium text-[#4A3728]">"Adicionar à Tela de Início"</span>.
              </p>
            </div>
            <button
              onClick={dismiss}
              className="text-[#4A3728]/30 hover:text-[#4A3728] transition-colors flex-shrink-0 mt-0.5"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          {/* Seta apontando para o botão de share do Safari */}
          <div className="flex justify-center mt-3">
            <div className="flex items-center gap-1.5 text-[#4A3728]/40">
              <span className="material-symbols-outlined text-sm animate-bounce">arrow_downward</span>
              <span className="font-label text-[9px] tracking-widest uppercase">Barra inferior do Safari</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
