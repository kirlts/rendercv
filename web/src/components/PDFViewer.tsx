import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFViewerProps {
  url: string;
  isRendering: boolean;
}

export function PDFViewer({ url, isRendering }: PDFViewerProps) {
  const [pdfs, setPdfs] = useState([{ url, id: Date.now() }]);
  const [numPagesMap, setNumPagesMap] = useState<Record<number, number>>({});
  const [pdfError, setPdfError] = useState<Error | null>(null);
  const renderedPagesRef = useRef<Record<number, Set<number>>>({});
  const [readyPdfs, setReadyPdfs] = useState<Set<number>>(new Set());
  const RENDER_WIDTH = 800; // Fixed raster width for quality

  useEffect(() => {
    setPdfs(prev => {
      if (prev[prev.length - 1].url !== url) {
        return [...prev, { url, id: Date.now() }];
      }
      return prev;
    });
  }, [url]);

  const handleLoadSuccess = (id: number, numPages: number) => {
    setNumPagesMap(prev => ({ ...prev, [id]: numPages }));
    setPdfError(null);
  };
  
  const handleRenderSuccess = (id: number, pageIndex: number, totalPages: number) => {
    if (!renderedPagesRef.current[id]) {
      renderedPagesRef.current[id] = new Set();
    }
    renderedPagesRef.current[id].add(pageIndex);
    
    // Solo cuando TODAS las páginas y sus capas se han dibujado
    if (renderedPagesRef.current[id].size === totalPages) {
      setReadyPdfs(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      setTimeout(() => {
        setPdfs(prev => prev.filter(p => p.id >= id));
        Object.keys(renderedPagesRef.current).forEach(key => {
          if (Number(key) < id) delete renderedPagesRef.current[Number(key)];
        });
      }, 50);
    }
  };


  return (
    <div className="relative w-full mt-4">
      {isRendering && (
        <div className="fixed bottom-8 right-8 z-50 bg-blue-600/90 backdrop-blur text-white px-4 py-2 rounded-full shadow-2xl border border-blue-400/30 flex items-center gap-2 text-sm font-semibold animate-pulse">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sincronizando versión...
        </div>
      )}

      <div className="grid w-full">
        {pdfs.map((pdf, index) => {
          const isOlder = index < pdfs.length - 1;
          const pagesCount = numPagesMap[pdf.id];
          const isReady = readyPdfs.has(pdf.id) || (pdfs.length === 1 && !readyPdfs.has(pdf.id));
          
          return (
            <div 
              key={pdf.id}
             className={`col-start-1 row-start-1 w-full ${isOlder ? 'pointer-events-none' : ''}`}
              style={{ 
                zIndex: isOlder ? 0 : 10,
                opacity: isReady || isOlder ? 1 : 0
              }}
            >
              <Document
                file={pdf.url}
                onLoadSuccess={({ numPages }) => handleLoadSuccess(pdf.id, numPages)}
                onLoadError={isOlder ? undefined : setPdfError}
                loading={null}
                externalLinkTarget="_blank"
              >
                {pagesCount && Array.from(new Array(pagesCount), (_, fileIndex) => (
                  <div key={`page_${pdf.id}_${fileIndex + 1}`} className="mb-4 shadow-2xl rounded overflow-hidden border border-[#404040]">
                    <Page
                      pageNumber={fileIndex + 1}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      width={RENDER_WIDTH}
                      className="pdf-page-scaled"
                      onRenderSuccess={() => handleRenderSuccess(pdf.id, fileIndex, pagesCount)}
                    />
                  </div>
                ))}
              </Document>
            </div>
          );
        })}
      </div>

      {pdfError && (
        <div className="bg-white shadow-2xl rounded flex flex-col items-center justify-center border border-red-200 p-8 mx-auto" style={{ maxWidth: 800 }}>
          <svg className="w-16 h-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-bold text-center text-red-600 text-lg mb-2">Error de compilación o renderizado</p>
          <div className="mt-6 p-4 bg-red-50 rounded text-sm font-mono text-red-900 overflow-auto w-full max-w-2xl text-left border border-red-200">
            <p className="font-bold text-red-800 mb-2">Detalles técnicos:</p>
            <p>{pdfError.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
