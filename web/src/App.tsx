import { useState, useEffect, useCallback, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { EditorPanel } from './components/EditorPanel';
import { PDFViewer } from './components/PDFViewer';
import { useRenderEngine } from './hooks/useRenderEngine';
import { SplitPane } from 'react-split-pane';
import type { ThemeDefaults } from './components/SizesDropdown';
import './split-pane.css';

const DEFAULT_YAML = `cv:
  name: John Doe
  location: San Francisco, CA
  email: john.doe@email.com
  website: https://rendercv.com/
  sections:
    education:
      - institution: Princeton University
        area: Computer Science
        degree: PhD
        start_date: 2018-09
        end_date: 2023-05`;

const DEFAULT_FONT_SIZES: Record<string, string> = {
  body: '9pt',
  name: '28pt',
  headline: '8pt',
  connections: '8pt',
  section_titles: '1.3em',
  entry_title: '9pt',
  entry_detail: '9pt',
};

const DEFAULT_FONT_WEIGHTS: Record<string, number> = {
  body: 400,
  name: 700,
  headline: 400,
  connections: 400,
  section_titles: 700,
  entry_title: 700,
  entry_detail: 400,
};

const DEFAULT_SPACING: Record<string, string> = {
  body: '0.2cm',
  name: '0.7cm',
  headline: '0.7cm',
  connections: '0.7cm',
  section_titles: '0.5cm',
  entry_title: '0.4cm',
  entry_detail: '0.2cm',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SplitPaneComponent = SplitPane as any;

interface UndoSnapshot {
  fontSizes: Record<string, string>;
  fontWeights: Record<string, number>;
  font: string;
}

function App() {
  const [yamlContent, setYamlContent] = useState<string>(() => {
    return localStorage.getItem('rendercv-yaml') || DEFAULT_YAML;
  });

  const [selectedDesign, setSelectedDesign] = useState<string>(() => {
    return localStorage.getItem('rendercv-design') || 'jpmr';
  });

  const [selectedFont, setSelectedFont] = useState<string>(() => {
    return localStorage.getItem('rendercv-font') || 'Source Sans 3';
  });

  const [fontSizes, setFontSizes] = useState<Record<string, string>>(() => {
    const stored = localStorage.getItem('rendercv-font-sizes');
    return stored ? JSON.parse(stored) : DEFAULT_FONT_SIZES;
  });

  const [fontWeights, setFontWeights] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem('rendercv-font-weights');
    return stored ? JSON.parse(stored) : DEFAULT_FONT_WEIGHTS;
  });

  const [spacing, setSpacing] = useState<Record<string, string>>(() => {
    const stored = localStorage.getItem('rendercv-spacing');
    return stored ? JSON.parse(stored) : DEFAULT_SPACING;
  });

  const [themeDefaults, setThemeDefaults] = useState<ThemeDefaults | null>(null);

  // Undo snapshot for reset
  const undoRef = useRef<UndoSnapshot | null>(null);

  // Track the "saved" default template content for Update Template logic
  const [defaultTemplateContent, setDefaultTemplateContent] = useState<string | null>(null);
  const [isDefaultTemplateLoaded, setIsDefaultTemplateLoaded] = useState(false);
  const [templateLang, setTemplateLang] = useState<'es' | 'en' | null>(null);

  const { pdfUrl, status, error } = useRenderEngine(yamlContent, selectedDesign, selectedFont, fontSizes, fontWeights, spacing, 500);

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('rendercv-yaml', yamlContent); }, [yamlContent]);
  useEffect(() => { localStorage.setItem('rendercv-design', selectedDesign); }, [selectedDesign]);
  useEffect(() => { localStorage.setItem('rendercv-font', selectedFont); }, [selectedFont]);
  useEffect(() => { localStorage.setItem('rendercv-font-sizes', JSON.stringify(fontSizes)); }, [fontSizes]);
  useEffect(() => { localStorage.setItem('rendercv-font-weights', JSON.stringify(fontWeights)); }, [fontWeights]);
  useEffect(() => { localStorage.setItem('rendercv-spacing', JSON.stringify(spacing)); }, [spacing]);

  // Fetch theme defaults when design changes
  useEffect(() => {
    fetch(`http://localhost:8000/api/theme-defaults/${selectedDesign}`)
      .then(res => res.json())
      .then((data: ThemeDefaults) => {
        setThemeDefaults(data);
        const storedDesign = localStorage.getItem('rendercv-font-sizes-design');
        if (storedDesign !== selectedDesign) {
          setFontSizes(data.font_size);
          setFontWeights(data.font_weight);
          if (data.font_family) setSelectedFont(data.font_family);
          if (data.spacing) setSpacing(data.spacing);
          localStorage.setItem('rendercv-font-sizes-design', selectedDesign);
        }
      })
      .catch(err => console.error("Failed to fetch theme defaults:", err));
  }, [selectedDesign]);

  // Ctrl+Z undo for reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && undoRef.current) {
        e.preventDefault();
        const snapshot = undoRef.current;
        setFontSizes(snapshot.fontSizes);
        setFontWeights(snapshot.fontWeights);
        setSelectedFont(snapshot.font);
        undoRef.current = null;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) setYamlContent(value);
  };

  const handleResetSizes = () => {
    undoRef.current = {
      fontSizes: { ...fontSizes },
      fontWeights: { ...fontWeights },
      font: selectedFont,
    };
    if (themeDefaults) {
      setFontSizes(themeDefaults.font_size);
      setFontWeights(themeDefaults.font_weight);
      setSpacing(themeDefaults.spacing ?? DEFAULT_SPACING);
      if (themeDefaults.font_family) setSelectedFont(themeDefaults.font_family);
    } else {
      setFontSizes(DEFAULT_FONT_SIZES);
      setFontWeights(DEFAULT_FONT_WEIGHTS);
      setSpacing(DEFAULT_SPACING);
    }
  };

  const handleLoadYaml = (content: string, _theme?: string) => {
    setYamlContent(content);
    setIsDefaultTemplateLoaded(false);
    setDefaultTemplateContent(null);
    setTemplateLang(null);
  };

  const handleLoadDefaultTemplate = useCallback(async (lang: 'es' | 'en' = 'es') => {
    try {
      const res = await fetch(`http://localhost:8000/api/default-template?lang=${lang}`);
      if (res.ok) {
        const data = await res.json();
        setYamlContent(data.content);
        setDefaultTemplateContent(data.content);
        setIsDefaultTemplateLoaded(true);
        setTemplateLang(lang);
      }
    } catch (err) {
      console.error("Error loading default template:", err);
    }
  }, []);

  const handleUpdateTemplate = useCallback(async () => {
    try {
      const lang = templateLang || 'es';
      const res = await fetch(`http://localhost:8000/api/default-template?lang=${lang}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: yamlContent }),
      });
      if (res.ok) {
        setDefaultTemplateContent(yamlContent);
      }
    } catch (err) {
      console.error("Error saving default template:", err);
    }
  }, [yamlContent, templateLang]);

  const handleSaveToCVs = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/save-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yaml: yamlContent, design: selectedDesign }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.details || 'Error guardando el CV');
      }
      return await res.json();
    } catch (err) {
      console.error('Error saving CV to folder:', err);
      throw err;
    }
  }, [yamlContent, selectedDesign]);

  const handleSaveDefaults = useCallback(async () => {
    try {
      const newDefaults = { font_size: fontSizes, font_weight: fontWeights, font_family: selectedFont, spacing };
      const res = await fetch(`http://localhost:8000/api/theme-defaults/${selectedDesign}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDefaults),
      });
      if (res.ok) {
        setThemeDefaults(newDefaults);
      }
    } catch (err) {
      console.error('Error saving defaults:', err);
    }
  }, [fontSizes, fontWeights, spacing, selectedDesign, selectedFont]);

  const isTemplateModified = isDefaultTemplateLoaded && defaultTemplateContent !== null && yamlContent !== defaultTemplateContent;

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#1e1e1e] font-sans">
      <Toolbar
        yamlContent={yamlContent}
        onLoadYaml={handleLoadYaml}
        pdfUrl={pdfUrl}
        selectedDesign={selectedDesign}
        onDesignChange={setSelectedDesign}
        selectedFont={selectedFont}
        onFontChange={setSelectedFont}
        fontSizes={fontSizes}
        fontWeights={fontWeights}
        spacing={spacing}
        themeDefaults={themeDefaults}
        onFontSizesChange={setFontSizes}
        onFontWeightsChange={setFontWeights}
        onSpacingChange={setSpacing}
        onResetSizes={handleResetSizes}
        onSaveDefaults={handleSaveDefaults}
        onLoadDefaultTemplate={handleLoadDefaultTemplate}
        onUpdateTemplate={handleUpdateTemplate}
        isTemplateModified={isTemplateModified}
        templateLang={templateLang}
        onSaveToCVs={handleSaveToCVs}
      />

      <div className="flex-1 overflow-hidden relative">
        <SplitPaneComponent split="vertical" minSize={200} defaultSize="50%" className="split-pane-wrapper">
          <div className="h-full w-full">
            <EditorPanel value={yamlContent} onChange={handleEditorChange} error={status === 'error' ? error : null} />
          </div>

          <div className="h-full relative overflow-hidden bg-[#2d2d2d]">
            {status === 'error' && error && (
              <div className="absolute top-0 left-0 right-0 z-20 bg-amber-500/90 text-amber-950 px-4 py-2 text-sm font-medium flex justify-center items-center backdrop-blur-sm border-b border-amber-600/50 shadow-md">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Los cambios no serán visibles en el PDF hasta que resuelvas los problemas de sintaxis.
              </div>
            )}

            <div id="pdf-container" className="h-full w-full overflow-y-auto flex justify-center">
              {pdfUrl ? (
                <PDFViewer url={pdfUrl} isRendering={status === 'rendering'} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Initializing preview...</p>
                </div>
              )}
            </div>
          </div>
        </SplitPaneComponent>
      </div>
    </div>
  );
}

export default App;
