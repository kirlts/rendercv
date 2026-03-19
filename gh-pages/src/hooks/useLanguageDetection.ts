import { useEffect } from 'react';
import { useTranslation } from '../i18n';

export function useLanguageDetection() {
  const { language, setLanguage } = useTranslation();

  useEffect(() => {
    const saved = localStorage.getItem('rendercv-ui-lang');
    if (saved && ['en', 'es'].includes(saved)) {
      setLanguage(saved as 'en' | 'es');
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (['en', 'es'].includes(browserLang)) {
        setLanguage(browserLang as 'en' | 'es');
      }
    }
  }, [setLanguage]);

  return language;
}
