import React from 'react';
import { useTranslation } from '../i18n';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#555] transition-colors"
      title={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
    >
      <span className="text-lg leading-none">{language === 'en' ? '🇪🇸' : '🇬🇧'}</span>
      <span className="font-medium">{language.toUpperCase()}</span>
    </button>
  );
};
