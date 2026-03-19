#!/bin/bash
mkdir -p gh-pages/src/i18n/__tests__

cat << 'EN' > gh-pages/src/i18n/en.ts
export const en = {
  'toolbar.download_pdf': 'Download PDF',
  'toolbar.download_yaml': 'Download YAML',
  'toolbar.theme': 'Theme',
  'toolbar.style': 'Style',
  'toolbar.accent': 'Color',
  'toolbar.load_yaml': 'Load YAML',
  'toolbar.reset': 'Reset',
  'toolbar.theme_lang': 'CV Language',
  'toolbar.ui_lang': 'Language',
  'hint.reset': 'Don\'t like my CV? Press Reset to clear the template and make it ready for you (or an AI) to fill in.',
  'hint.ctrl_z': 'Template cleared. You can use Ctrl+Z in the editor to undo.',
  'wasm.loading': 'Preparing the document compiler...',
  'wasm.explanation': 'This only happens once. Your browser will save it for future visits.',
  'pdf.rendering': 'Rendering...',
  'pdf.error': 'Changes won\'t be visible in the PDF until you resolve syntax issues.',
  'mobile.editor': 'Editor',
  'mobile.preview': 'Preview',
};
EN

cat << 'ES' > gh-pages/src/i18n/es.ts
export const es = {
  'toolbar.download_pdf': 'Descargar PDF',
  'toolbar.download_yaml': 'Descargar YAML',
  'toolbar.theme': 'Tema',
  'toolbar.style': 'Estilo',
  'toolbar.accent': 'Color',
  'toolbar.load_yaml': 'Cargar YAML',
  'toolbar.reset': 'Reset',
  'toolbar.theme_lang': 'Idioma CV',
  'toolbar.ui_lang': 'Idioma',
  'hint.reset': '¿No te gusta mi CV? Presiona Reset para limpiar la plantilla y dejarla lista para rellenar por ti (o una IA).',
  'hint.ctrl_z': 'Plantilla limpiada. Puedes usar Ctrl+Z en el editor para deshacer.',
  'wasm.loading': 'Preparando el compilador de documentos...',
  'wasm.explanation': 'Esto solo ocurre la primera vez. Tu navegador lo guardará para visitas futuras.',
  'pdf.rendering': 'Renderizando...',
  'pdf.error': 'Los cambios no serán visibles en el PDF hasta que resuelvas los problemas de sintaxis.',
  'mobile.editor': 'Editor',
  'mobile.preview': 'Vista previa',
};
ES

cat << 'IDX' > gh-pages/src/i18n/index.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en';
import { es } from './es';

type Language = 'en' | 'es';
type Dictionary = typeof en;
export type TranslationKey = keyof Dictionary;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const dictionaries: Record<Language, Dictionary> = { en, es };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('rendercv-ui-lang') as Language;
    if (saved && (saved === 'en' || saved === 'es')) {
      setLanguageState(saved);
    } else {
      const browserLang = typeof navigator !== 'undefined' && navigator.language.startsWith('es') ? 'es' : 'en';
      setLanguageState(browserLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('rendercv-ui-lang', lang);
  };

  const t = (key: TranslationKey): string => {
    return dictionaries[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
IDX

cat << 'TST' > gh-pages/src/i18n/__tests__/i18n.test.tsx
import { renderHook, act } from '@testing-library/react';
import { I18nProvider, useTranslation } from '../index';

describe('useTranslation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to english if no local storage or navigator preference', () => {
    Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });
    const { result } = renderHook(() => useTranslation(), { wrapper: I18nProvider });
    expect(result.current.language).toBe('en');
    expect(result.current.t('toolbar.download_pdf')).toBe('Download PDF');
  });

  it('detects spanish from navigator', () => {
    Object.defineProperty(navigator, 'language', { value: 'es-ES', configurable: true });
    const { result } = renderHook(() => useTranslation(), { wrapper: I18nProvider });
    expect(result.current.language).toBe('es');
    expect(result.current.t('toolbar.download_pdf')).toBe('Descargar PDF');
  });

  it('restores from local storage', () => {
    localStorage.setItem('rendercv-ui-lang', 'es');
    const { result } = renderHook(() => useTranslation(), { wrapper: I18nProvider });
    expect(result.current.language).toBe('es');
  });

  it('changes language and persists to local storage', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper: I18nProvider });
    act(() => {
      result.current.setLanguage('es');
    });
    expect(result.current.language).toBe('es');
    expect(localStorage.getItem('rendercv-ui-lang')).toBe('es');
    expect(result.current.t('toolbar.download_pdf')).toBe('Descargar PDF');
  });
});
TST
