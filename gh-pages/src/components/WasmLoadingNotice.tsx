import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';

interface WasmLoadingNoticeProps {
  onDismiss?: () => void;
}

export const WasmLoadingNotice: React.FC<WasmLoadingNoticeProps> = ({ onDismiss }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if never dismissed and still loading after 1 second (cache takes time)
    const isDismissed = localStorage.getItem('wasm-notice-dismissed');
    if (!isDismissed) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('wasm-notice-dismissed', 'true');
    if (onDismiss) onDismiss();
  };

  if (!visible) return null;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#2d2d2d] text-gray-200 px-6 py-4 rounded-lg shadow-xl border border-[#404040] flex items-center gap-4 max-w-md w-full" data-testid="wasm-notice">
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{t('wasm.loading')}</h4>
        <p className="text-xs text-gray-400 mt-1">{t('wasm.explanation')}</p>
        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-3 overflow-hidden">
          <div className="bg-blue-500 h-1.5 rounded-full animate-[progress_2s_ease-in-out_infinite] w-1/3"></div>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="text-gray-400 hover:text-white transition-colors p-2"
        aria-label="Dismiss"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
