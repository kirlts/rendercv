import { useEffect, useState } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { configureMonacoYaml } from 'monaco-yaml';

interface EditorPanelProps {
  value: string;
  onChange: (value: string | undefined) => void;
  error?: any;
}

export function EditorPanel({ value, onChange, error }: EditorPanelProps) {
  const monaco = useMonaco();
  const [schema, setSchema] = useState<unknown>(null);
  const [isErrorExpanded, setIsErrorExpanded] = useState(false);

  // Auto-expand error if it changes from null to something
  useEffect(() => {
    if (error) {
      setIsErrorExpanded(false); // keep it closed initially or open? The user says it truncates, so closed is fine, just needs a button.
    }
  }, [error]);

  useEffect(() => {
    fetch('http://localhost:8000/api/schema')
      .then((res) => res.json())
      .then((data) => {
        setSchema(data);
      })
      .catch((err) => console.error("Failed to fetch schema", err));
  }, []);

  useEffect(() => {
    if (monaco && schema) {
      configureMonacoYaml(monaco, {
        enableSchemaRequest: true,
        hover: true,
        completion: true,
        validate: true,
        format: true,
        schemas: [
          {
            uri: "http://localhost:8000/api/schema",
            fileMatch: ["*"],
            schema: schema
          }
        ]
      });
    }
  }, [monaco, schema]);

  useEffect(() => {
    if (!monaco) return;
    const model = monaco.editor.getModels()[0];
    if (!model) return;

    if (!error) {
      monaco.editor.setModelMarkers(model, 'rendercv', []);
      return;
    }

    const markers: any[] = [];
    
    if (error.type === 'validation' && Array.isArray(error.details)) {
      error.details.forEach((err: any) => {
        if (err.yaml_location) {
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: err.message,
            startLineNumber: err.yaml_location[0][0],
            startColumn: err.yaml_location[0][1],
            endLineNumber: err.yaml_location[1][0],
            endColumn: err.yaml_location[1][1],
          });
        }
      });
    } else if (error.type === 'syntax') {
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        message: typeof error.details === 'string' ? error.details : "Error de sintaxis.",
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: model.getLineCount(),
        endColumn: model.getLineMaxColumn(model.getLineCount()),
      });
    }

    monaco.editor.setModelMarkers(model, 'rendercv', markers);
  }, [monaco, error]);

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e] relative">
      {error && (
        <div className={`bg-red-900/40 shrink-0 text-red-200 border-b border-red-800/50 p-3 text-sm flex gap-3 overflow-y-auto transition-all ${isErrorExpanded ? 'max-h-64' : 'max-h-24'}`}>
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1 font-mono min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div className="font-bold text-red-300">
                El Linter detectó {error.type === 'validation' ? 'errores de validación' : 'un error de sintaxis'}:
              </div>
              <button 
                onClick={() => setIsErrorExpanded(!isErrorExpanded)}
                className="ml-4 px-2 py-1 text-xs bg-red-800/40 hover:bg-red-700/60 border border-red-700/50 rounded transition-colors whitespace-nowrap flex-shrink-0"
              >
                {isErrorExpanded ? 'Ver menos' : 'Ver más'}
              </button>
            </div>
            <div className={`whitespace-pre-wrap break-words ${isErrorExpanded ? '' : 'line-clamp-2'}`}>
              {error.type === 'validation' && Array.isArray(error.details) ? (
                <ul className="list-disc pl-4 space-y-2">
                  {error.details.map((err: any, idx: number) => (
                    <li key={idx}>
                      {err.message} 
                      {err.yaml_location && <span className="text-red-400/80 ml-2">(Línea {err.yaml_location[0][0]})</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div>{typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2)}</div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 relative">
        <Editor
          height="100%"
        defaultLanguage="yaml"
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          padding: { top: 16 },
        }}
      />
      </div>
    </div>
  );
}
