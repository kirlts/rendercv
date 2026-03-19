import React from 'react';
import { useTranslation } from '../i18n';

const THEME_LANGUAGES = ['english', 'spanish', 'portuguese', 'french', 'german'];

interface ThemeLanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const ThemeLanguageSelector: React.FC<ThemeLanguageSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme-lang" className="text-sm font-medium text-gray-400">
        {t('toolbar.theme_lang')}
      </label>
      <select
        id="theme-lang"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#3d3d3d] text-gray-200 text-sm rounded border border-[#555] px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none pr-8 relative"
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
      >
        {THEME_LANGUAGES.map(lang => (
          <option key={lang} value={lang}>
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};