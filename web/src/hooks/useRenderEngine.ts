import { useState, useEffect } from 'react';

export type RenderState = 'idle' | 'rendering' | 'success' | 'error';

interface RenderError {
  type: 'validation' | 'user' | 'unknown';
  details: unknown;
}

export function useRenderEngine(yaml: string, design: string, debounceMs: number = 500) {
  const [debouncedYaml, setDebouncedYaml] = useState(yaml);
  const [debouncedDesign, setDebouncedDesign] = useState(design);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<RenderState>('idle');
  const [error, setError] = useState<RenderError | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedYaml(yaml);
      setDebouncedDesign(design);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [yaml, design, debounceMs]);

  useEffect(() => {
    if (!debouncedYaml) return;

    const controller = new AbortController();

    const renderPdf = async () => {
      setStatus('rendering');

      try {
        const response = await fetch('http://localhost:8000/api/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ yaml: debouncedYaml, design: debouncedDesign }),
          signal: controller.signal
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errData = await response.json();
          setError({
            type: errData.error || 'unknown',
            details: errData.details
          });
          setStatus('error');
          return;
        }

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const blob = await response.blob();
        const newUrl = URL.createObjectURL(blob);

        setPdfUrl((prevUrl) => {
          if (prevUrl) URL.revokeObjectURL(prevUrl);
          return newUrl;
        });

        setStatus('success');
        setError(null);

      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') return;

        setError({
          type: 'unknown',
          details: (err as Error).message || 'An unknown error occurred'
        });
        setStatus('error');
      }
    };

    renderPdf();

    return () => {
      controller.abort();
    };
  }, [debouncedYaml, debouncedDesign]);

  return { pdfUrl, status, error };
}
