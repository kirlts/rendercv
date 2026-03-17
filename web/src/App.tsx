import { useState, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { EditorPanel } from './components/EditorPanel';
import { PDFViewer } from './components/PDFViewer';
import { useRenderEngine } from './hooks/useRenderEngine';
import { SplitPane } from 'react-split-pane';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SplitPaneComponent = SplitPane as any;

function App() {
  const [yamlContent, setYamlContent] = useState<string>(() => {
    return localStorage.getItem('rendercv-yaml') || DEFAULT_YAML;
  });

  const [selectedDesign, setSelectedDesign] = useState<string>('classic');

  const { pdfUrl, status, error } = useRenderEngine(yamlContent, selectedDesign, 500);

  useEffect(() => {
    localStorage.setItem('rendercv-yaml', yamlContent);
  }, [yamlContent]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setYamlContent(value);
    }
  };

  const handleLoadExample = async (filename: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/examples/${filename}`);
      if (res.ok) {
        const data = await res.json();
        setYamlContent(data.content);
      }
    } catch (e) {
      console.error("Error loading example", e);
    }
  };

  const handleReset = () => {
    setYamlContent(DEFAULT_YAML);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#1e1e1e] font-sans">
      <Toolbar
        onLoadExample={handleLoadExample}
        onReset={handleReset}
        pdfUrl={pdfUrl}
        selectedDesign={selectedDesign}
        onDesignChange={setSelectedDesign}
      />

      <div className="flex-1 overflow-hidden relative">
        <SplitPaneComponent split="vertical" minSize={200} defaultSize="50%" className="split-pane-wrapper">
          <div className="h-full border-r border-[#404040]">
            <EditorPanel value={yamlContent} onChange={handleEditorChange} />
          </div>

          <div className="h-full relative overflow-hidden bg-[#2d2d2d]">
            {status === 'error' && error && (
              <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8">
                <div className="bg-[#1e1e1e] border border-red-500/50 shadow-2xl rounded-lg p-6 max-w-lg w-full text-white">
                  <div className="flex items-center gap-3 text-red-400 mb-4 border-b border-red-500/20 pb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-xl font-semibold capitalize">{error.type} Error</h2>
                  </div>
                  <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-y-auto max-h-96">
                    {typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div id="pdf-container" className="h-full w-full overflow-y-auto pt-8 flex justify-center">
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
