import { useEffect, useState } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { configureMonacoYaml } from 'monaco-yaml';

interface EditorPanelProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export function EditorPanel({ value, onChange }: EditorPanelProps) {
  const monaco = useMonaco();
  const [schema, setSchema] = useState<unknown>(null);

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

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e]">
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
  );
}
