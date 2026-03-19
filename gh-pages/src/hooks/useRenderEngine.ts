import { useState, useEffect, useRef } from 'react';
import { generateTypstSource } from '../engine/yamlToTypst';

export function useRenderEngine(yamlString: string, debounceMs: number = 500) {
  const [status, setStatus] = useState<'idle' | 'compiling' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const messageIdRef = useRef(0);
  const pendingRequests = useRef<Map<number, { resolve: (data: any) => void; reject: (err: any) => void }>>(new Map());

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../engine/typstCompiler.worker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (e) => {
      const { id, status, data, error } = e.data;
      const request = pendingRequests.current.get(id);

      if (request) {
        pendingRequests.current.delete(id);
        if (status === 'success') {
          request.resolve(data);
        } else {
          request.reject(new Error(error));
        }
      }
    };

    // Send init request
    const id = ++messageIdRef.current;
    workerRef.current.postMessage({ id, type: 'init' });

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const compile = async () => {
      if (!workerRef.current) return;

      setStatus('compiling');
      setError(null);

      try {
        const typstSource = generateTypstSource(yamlString);

        const id = ++messageIdRef.current;
        const workerPromise = new Promise((resolve, reject) => {
          pendingRequests.current.set(id, { resolve, reject });
        });

        workerRef.current.postMessage({
          id,
          type: 'compile',
          payload: { source: typstSource },
        });

        const pdfData: any = await workerPromise;
        const pdfArray = new Uint8Array(pdfData);

        const blob = new Blob([pdfArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        setPdfUrl((prevUrl) => {
          if (prevUrl) URL.revokeObjectURL(prevUrl);
          return url;
        });

        setStatus('success');
      } catch (err: any) {
        console.error("Compilation error:", err);
        setError(err.message);
        setStatus('error');
      }
    };

    timeout = setTimeout(compile, debounceMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [yamlString, debounceMs]);

  return { status, error, pdfUrl };
}
