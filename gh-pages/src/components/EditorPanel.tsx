import React, { useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';

interface EditorPanelProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ value, onChange }) => {
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      // Accessing monaco-yaml features safely by casting to any to bypass TS error
      // if it's strictly typed without monaco-yaml types.
      const anyMonaco = monaco as any;
      if (anyMonaco.languages.yaml && anyMonaco.languages.yaml.yamlDefaults) {
        anyMonaco.languages.yaml.yamlDefaults.setDiagnosticsOptions({
          validate: true,
          enableSchemaRequest: true,
          hover: true,
          completion: true,
        });
      }
    }
  }, [monaco]);

  return (
    <div className="w-full h-full bg-surface" data-testid="editor-panel">
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
          padding: { top: 16 },
        }}
      />
    </div>
  );
};
