import React from 'react';
import { useTranslation } from '../i18n';

interface ErrorBannerProps {
  error: string | null;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error }) => {
  const { t } = useTranslation();

  if (!error) return null;

  return (
    <div
      className="absolute top-4 left-4 right-4 z-50 p-4 bg-amber-600/90 text-white rounded-lg shadow-xl border border-amber-500 backdrop-blur-sm"
      role="alert"
    >
      <div className="flex items-start">
        <svg className="w-6 h-6 mr-3 mt-0.5 text-amber-100 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h3 className="text-sm font-semibold">{t('pdf.error')}</h3>
          <p className="mt-1 text-sm text-amber-100 font-mono break-all">{error}</p>
        </div>
      </div>
    </div>
  );
};
