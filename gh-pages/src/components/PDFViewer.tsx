import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Ensure pdfjs worker is set up
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string | null;
  loading: boolean;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, loading }) => {
  const [numPages, setNumPages] = useState<number | null>(null);

  if (!url && !loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#2d2d2d] text-gray-500">
        No document available
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#3d3d3d] overflow-auto flex justify-center py-4" data-testid="pdf-viewer">
      {loading && (
        <div
          className="absolute inset-0 z-10 shimmer pointer-events-none"
          data-testid="pdf-shimmer"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        />
      )}
      {url && (
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div className="text-gray-400">Loading PDF...</div>}
        >
          {Array.from(new Array(numPages || 0), (_, index) => (
            <div key={`page_${index + 1}`} className="mb-4 shadow-lg">
              <Page
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={true}
                width={800} // fixed width or responsive based on container
              />
            </div>
          ))}
        </Document>
      )}
    </div>
  );
};
