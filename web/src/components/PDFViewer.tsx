import { useState } from 'react';
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
  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className={`transition-opacity duration-300 ${isRendering ? 'opacity-50' : 'opacity-100'}`}>
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Loading PDF...</p>
          </div>
        }
        error={
          <div className="text-red-400 p-8 flex flex-col items-center">
            <p>Failed to load PDF. Check the backend connection.</p>
          </div>
        }
      >
        {numPages && Array.from(new Array(numPages), (_, index) => (
          <div key={`page_${index + 1}`} className="mb-6 shadow-2xl rounded overflow-hidden border border-[#404040]">
            <Page
              pageNumber={index + 1}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              width={800}
              className="bg-white"
            />
          </div>
        ))}
      </Document>
    </div>
  );
}
