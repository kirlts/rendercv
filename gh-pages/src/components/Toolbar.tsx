import React from 'react';
import { ColorPicker } from './ColorPicker';
import { LanguageSelector } from './LanguageSelector';
import { ThemeLanguageSelector } from './ThemeLanguageSelector';
import { SizesDropdown } from './SizesDropdown';
import { useTranslation } from '../i18n';

interface ToolbarProps {
  cvName?: string;
  theme: string;
  setTheme: (theme: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  themeLang: string;
  setThemeLang: (lang: string) => void;
  sizes: any;
  setSizes: (sizes: any) => void;
  resetSizes: () => void;
  onReset: () => void;
  onLoadYaml: (content: string) => void;
  onDownloadYaml: () => void;
  onDownloadPdf: () => void;
  isMobile?: boolean;
}

const THEMES = ['classic', 'engineeringresumes', 'moderncv', 'sb2nov', 'mart'];

export const Toolbar: React.FC<ToolbarProps> = ({
  theme,
  setTheme,
  accentColor,
  setAccentColor,
  themeLang,
  setThemeLang,
  sizes,
  setSizes,
  resetSizes,
  onReset,
  onLoadYaml,
  onDownloadYaml,
  onDownloadPdf,
  isMobile = false
}) => {
  const { t } = useTranslation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onLoadYaml(content);
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const primaryControls = (
    <>
      <div className="flex items-center gap-2" data-testid="theme-selector">
        <label className="text-sm font-medium text-gray-400 hidden sm:block">{t('toolbar.theme')}</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="bg-[#3d3d3d] text-gray-200 text-sm rounded border border-[#555] px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {THEMES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <ColorPicker color={accentColor} onChange={setAccentColor} />
      <SizesDropdown sizes={sizes} onChange={setSizes} onReset={resetSizes} />
      <div className="hidden sm:block h-6 w-px bg-[#555] mx-1"></div>
      <ThemeLanguageSelector value={themeLang} onChange={setThemeLang} />
      <LanguageSelector />
    </>
  );

  const actionControls = (
    <>
      <input
        type="file"
        accept=".yaml,.yml"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        data-testid="file-input"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#555] transition-colors"
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span className={isMobile ? "hidden" : "block"}>{t('toolbar.load_yaml')}</span>
      </button>

      <button
        onClick={onDownloadYaml}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#555] transition-colors"
      >
        <span className={isMobile ? "hidden" : "block"}>{t('toolbar.download_yaml')}</span>
      </button>

      <button
        onClick={onReset}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#555] text-amber-500 hover:text-amber-400 transition-colors"
      >
        <span className={isMobile ? "hidden" : "block"}>{t('toolbar.reset')}</span>
      </button>

      <button
        onClick={onDownloadPdf}
        className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className={isMobile ? "hidden sm:block" : "block"}>{t('toolbar.download_pdf')}</span>
      </button>
    </>
  );

  return (
    <div className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 w-full flex-shrink-0 z-20">
      <div className="flex items-center gap-4">
        <h1 className="font-bold text-lg text-white tracking-tight hidden sm:block">RenderCV</h1>
        <div className="hidden lg:flex items-center gap-3">
          {primaryControls}
        </div>
      </div>

      <div className="flex items-center gap-2 relative">
        <div className="hidden lg:flex items-center gap-2">
          {actionControls}
        </div>

        {/* Mobile Hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={onDownloadPdf}
            className="flex items-center justify-center w-8 h-8 rounded bg-blue-600 text-white"
            title={t('toolbar.download_pdf')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-8 h-8 flex flex-col justify-center items-center bg-[#3d3d3d] rounded border border-[#555] text-white"
          >
            <span className="w-4 h-0.5 bg-current mb-1"></span>
            <span className="w-4 h-0.5 bg-current mb-1"></span>
            <span className="w-4 h-0.5 bg-current"></span>
          </button>

          {mobileMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-[#404040] rounded-lg shadow-xl p-4 flex flex-col gap-4 z-50">
              {primaryControls}
              <hr className="border-[#404040]" />
              <div className="flex flex-col gap-2">
                {actionControls}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
