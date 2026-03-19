import React, { useState, useEffect } from 'react';
import { SplitPane } from 'react-collapse-pane';
import { Toolbar } from './components/Toolbar';
import { EditorPanel } from './components/EditorPanel';
import { PDFViewer } from './components/PDFViewer';
import { ErrorBanner } from './components/ErrorBanner';
import { WasmLoadingNotice } from './components/WasmLoadingNotice';
import { ResetHint } from './components/ResetHint';
import { MobileView } from './components/MobileView';

import { useRenderEngine } from './hooks/useRenderEngine';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTranslation, I18nProvider } from './i18n';
import { defaultShowcase, skeleton } from './templates';
import yaml from 'js-yaml';

const AppContent: React.FC = () => {
  const { t } = useTranslation();

  // State Persistence
  const [yamlContent, setYamlContent] = useLocalStorage<string>('rendercv-yaml', defaultShowcase, 1000);
  const [theme, setTheme] = useLocalStorage<string>('rendercv-theme', 'mart');
  const [accentColor, setAccentColor] = useLocalStorage<string>('rendercv-accent', '#8B5A2B');
  const [themeLang, setThemeLang] = useLocalStorage<string>('rendercv-theme-lang', 'english');
  const [sizes, setSizes] = useLocalStorage<any>('rendercv-sizes', {});

  // App State
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showResetHint, setShowResetHint] = useState(false);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update YAML when toolbar controls change
  useEffect(() => {
    try {
      const doc = yaml.load(yamlContent) as any;
      if (!doc) return;

      let modified = false;

      if (!doc.design) { doc.design = {}; modified = true; }
      if (doc.design.theme !== theme) { doc.design.theme = theme; modified = true; }

      if (!doc.design.colors) doc.design.colors = {};
      if (doc.design.colors.name !== accentColor) { doc.design.colors.name = accentColor; modified = true; }

      if (!doc.locale) { doc.locale = {}; modified = true; }
      if (doc.locale.language !== themeLang) { doc.locale.language = themeLang; modified = true; }

      if (Object.keys(sizes).length > 0) {
        // Deep merge sizes into typography/etc
        if (!doc.design.typography) doc.design.typography = {};
        if (sizes.typography?.font_size?.body) {
           if (!doc.design.typography.font_size) doc.design.typography.font_size = {};
           doc.design.typography.font_size.body = sizes.typography.font_size.body;
           modified = true;
        }
      }

      if (modified) {
        setYamlContent(yaml.dump(doc));
      }
    } catch (e) {}
  }, [theme, accentColor, themeLang, sizes, yamlContent, setYamlContent]);

  // Derived state for the render engine
  const { status, pdfUrl, error } = useRenderEngine(yamlContent, 1000);

  const handleReset = () => {
    setYamlContent(skeleton);
    setShowResetHint(true);
  };

  const handleResetSizes = () => {
    setSizes({});
  };

  const handleDownloadYaml = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RenderCV_Document.yaml`; // Ideally parse name from yaml
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `RenderCV_Document.pdf`; // Ideally parse name from yaml
      a.click();
    }
  };

  const editorSection = (
    <div className="h-full w-full flex flex-col">
      <EditorPanel value={yamlContent} onChange={(v) => setYamlContent(v || '')} />
      {yamlContent === defaultShowcase && (
        <div className="p-2 text-xs text-gray-500 bg-surface text-center">
          {t('hint.reset')}
        </div>
      )}
    </div>
  );

  const previewSection = (
    <div className="h-full w-full relative">
      <WasmLoadingNotice />
      <ErrorBanner error={error} />
      <PDFViewer url={pdfUrl} loading={status === 'compiling'} />
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-gray-200 font-sans">
      <Toolbar
        theme={theme}
        setTheme={setTheme}
        accentColor={accentColor}
        setAccentColor={setAccentColor}
        themeLang={themeLang}
        setThemeLang={setThemeLang}
        sizes={sizes}
        setSizes={setSizes}
        resetSizes={handleResetSizes}
        onReset={handleReset}
        onLoadYaml={setYamlContent}
        onDownloadYaml={handleDownloadYaml}
        onDownloadPdf={handleDownloadPdf}
        isMobile={isMobile}
      />

      <div className="flex-1 overflow-hidden relative">
        {isMobile ? (
          <MobileView editor={editorSection} preview={previewSection} />
        ) : (
          <SplitPane split="vertical" initialSizes={[1, 1]}>
            {editorSection}
            {previewSection}
          </SplitPane>
        )}
      </div>

      {showResetHint && <ResetHint onDismiss={() => setShowResetHint(false)} />}
    </div>
  );
};

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;
