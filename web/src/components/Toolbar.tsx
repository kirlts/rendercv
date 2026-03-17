import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface ToolbarProps {
  onLoadExample: (filename: string) => void;
  onReset: () => void;
  pdfUrl: string | null;
  selectedDesign: string;
  onDesignChange: (design: string) => void;
}

const DESIGNS = [
  { id: 'classic', name: 'Classic' },
  { id: 'faang_software_engineer', name: 'FAANG Software Engineer (En desarrollo)', disabled: true },
  { id: 'systems_engineer', name: 'Systems Engineer (En desarrollo)', disabled: true },
  { id: 'data_scientist', name: 'Data Scientist (En desarrollo)', disabled: true },
  { id: 'startup_hacker', name: 'Startup Hacker (En desarrollo)', disabled: true },
  { id: 'quant_developer', name: 'Quant Developer (En desarrollo)', disabled: true }
];

export function Toolbar({ onLoadExample, onReset, pdfUrl, selectedDesign, onDesignChange }: ToolbarProps) {
  const [examples, setExamples] = useState<{name: string}[]>([]);
  const [selectedExample, setSelectedExample] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/examples')
      .then(res => res.json())
      .then(data => {
        if (data.examples) {
          setExamples(data.examples);
        }
      })
      .catch(err => console.error("Failed to fetch examples:", err));
  }, []);

  const handleExampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filename = e.target.value;
    setSelectedExample(filename);
    if (filename) {
      onLoadExample(filename);
    }
  };

  const handleDesignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDesignChange(e.target.value);
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = 'rendercv_output.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="h-14 bg-[#2d2d2d] flex items-center px-4 border-b border-[#404040] text-gray-300 justify-between">
      <div className="flex items-center gap-4">
        <h1 className="font-bold text-white tracking-wide text-lg flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-blue-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          RenderCV <span className="font-normal text-gray-400">Live Preview</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#1e1e1e] px-3 py-1.5 rounded-md border border-[#404040]">
           <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Design Profile:</label>
           <select
             value={selectedDesign}
             onChange={handleDesignChange}
             className="bg-transparent text-sm text-gray-200 outline-none cursor-pointer"
           >
             {DESIGNS.map(d => (
               <option key={d.id} value={d.id} disabled={d.disabled} className={`bg-[#1e1e1e] ${d.disabled ? 'text-gray-600 opacity-50 italic' : ''}`}>{d.name}</option>
             ))}
           </select>
        </div>

        <div className="flex items-center gap-2 bg-[#1e1e1e] px-3 py-1.5 rounded-md border border-[#404040]">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Example:</label>
          <select
            value={selectedExample}
            onChange={handleExampleChange}
            className="bg-transparent text-sm text-gray-200 outline-none cursor-pointer w-48"
          >
            <option value="" className="bg-[#1e1e1e]">-- Start from scratch --</option>
            {examples.map(ex => (
              <option key={ex.name} value={ex.name} className="bg-[#1e1e1e]">{ex.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={onReset}
          className="text-sm px-4 py-1.5 bg-[#1e1e1e] border border-[#404040] hover:bg-[#404040] rounded transition-colors"
        >
          Reset
        </button>

        <button
          onClick={handleDownload}
          disabled={!pdfUrl}
          className={`flex items-center gap-2 text-sm px-4 py-1.5 rounded transition-colors font-medium ${
            pdfUrl
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
              : 'bg-[#1e1e1e] text-gray-500 border border-[#404040] cursor-not-allowed'
          }`}
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>
    </div>
  );
}
