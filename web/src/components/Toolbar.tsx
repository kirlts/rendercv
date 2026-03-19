import { useEffect, useState, useRef } from 'react';
import { Download, Upload, FileText, Save, Check, FolderDown, Loader2 } from 'lucide-react';
import { SizesDropdown } from './SizesDropdown';
import type { ThemeDefaults } from './SizesDropdown';

interface ToolbarProps {
  yamlContent: string;
  onLoadYaml: (content: string, theme?: string) => void;
  pdfUrl: string | null;
  selectedDesign: string;
  onDesignChange: (design: string) => void;
  selectedFont: string;
  onFontChange: (font: string) => void;
  fontSizes: Record<string, string>;
  fontWeights: Record<string, number>;
  spacing: Record<string, string>;
  themeDefaults: ThemeDefaults | null;
  onFontSizesChange: (sizes: Record<string, string>) => void;
  onFontWeightsChange: (weights: Record<string, number>) => void;
  onSpacingChange: (spacing: Record<string, string>) => void;
  onResetSizes: () => void;
  onSaveDefaults: () => void;
  onLoadDefaultTemplate: (lang: 'es' | 'en') => void;
  onUpdateTemplate: () => void;
  isTemplateModified: boolean;
  templateLang: 'es' | 'en' | null;
  onSaveToCVs: () => Promise<{ status: string; path: string }>;
}

interface Oferta {
  name: string;
  filename: string;
}

interface Theme {
  id: string;
  name: string;
}

export function Toolbar({ yamlContent, onLoadYaml, pdfUrl, selectedDesign, onDesignChange, selectedFont, onFontChange, fontSizes, fontWeights, spacing, themeDefaults, onFontSizesChange, onFontWeightsChange, onSpacingChange, onResetSizes, onSaveDefaults, onLoadDefaultTemplate, onUpdateTemplate, isTemplateModified, templateLang, onSaveToCVs }: ToolbarProps) {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [fonts, setFonts] = useState<string[]>([]);
  const [selectedOferta, setSelectedOferta] = useState<string>("");
  const [ofertaSaved, setOfertaSaved] = useState(false);
  const [cvSaveState, setCvSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/ofertas')
      .then(res => res.json())
      .then(async data => {
        if (data.ofertas) {
          setOfertas(data.ofertas);
          if (data.ofertas.length > 0) {
            const latestOferta = data.ofertas[0].filename;
            setSelectedOferta(latestOferta);
            try {
              const fileRes = await fetch(`http://localhost:8000/api/ofertas/${latestOferta}`);
              if (fileRes.ok) {
                const fileData = await fileRes.json();
                onLoadYaml(fileData.content, fileData.theme || undefined);
              }
            } catch (err) {
              console.error("Error auto-loading oferta:", err);
            }
          }
        }
      })
      .catch(err => console.warn("Failed to fetch ofertas (directory might be deleted):", err));

    fetch('http://localhost:8000/api/themes')
      .then(res => res.json())
      .then(data => {
        if (data.themes && data.themes.length > 0) {
          setThemes(data.themes);
        }
      })
      .catch(err => console.error("Failed to fetch themes:", err));

    fetch('http://localhost:8000/api/fonts')
      .then(res => res.json())
      .then(data => {
        if (data.fonts && data.fonts.length > 0) {
          setFonts(data.fonts);
        }
      })
      .catch(err => console.error("Failed to fetch fonts:", err));
  }, []);
  const handleDesignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDesignChange(e.target.value);
  };

  const handleOfertaSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filename = e.target.value;
    setSelectedOferta(filename);
    if (!filename) return;
    try {
      const res = await fetch(`http://localhost:8000/api/ofertas/${filename}`);
      if (res.ok) {
        const data = await res.json();
        onLoadYaml(data.content, data.theme || undefined);
      }
    } catch (err) {
      console.error("Error loading oferta:", err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        onLoadYaml(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = 'Martin_Gil_CV.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleSaveOferta = async () => {
    if (!selectedOferta) return;
    try {
      const res = await fetch(`http://localhost:8000/api/ofertas/${selectedOferta}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: yamlContent }),
      });
      if (res.ok) {
        setOfertaSaved(true);
        setTimeout(() => setOfertaSaved(false), 1500);
      } else {
        console.error('Failed to save oferta');
      }
    } catch (err) {
      console.error('Error saving oferta:', err);
    }
  };

  const handleSaveToCVs = async () => {
    setCvSaveState('saving');
    try {
      await onSaveToCVs();
      setCvSaveState('saved');
      setTimeout(() => setCvSaveState('idle'), 2000);
    } catch {
      setCvSaveState('error');
      setTimeout(() => setCvSaveState('idle'), 2000);
    }
  };

  return (
    <div className="h-11 bg-[#2d2d2d] flex items-center px-3 border-b border-[#404040] text-gray-300 shrink-0 gap-2">
      {/* Logo */}
      <div className="flex items-center gap-1.5 shrink-0">
        <h1 className="font-bold text-white tracking-wide text-xs flex items-center gap-1 whitespace-nowrap">
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 stroke-blue-500 shrink-0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          CV<span className="font-normal text-gray-400 ml-0.5">YAML→PDF</span>
        </h1>
      </div>

      {/* Left-aligned controls: Tamaños, Fuente, Ofertas */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Estilo Dropdown (font + sizes + weights) */}
        <SizesDropdown
          fontSizes={fontSizes}
          fontWeights={fontWeights}
          spacing={spacing}
          themeDefaults={themeDefaults}
          onFontSizesChange={onFontSizesChange}
          onFontWeightsChange={onFontWeightsChange}
          onSpacingChange={onSpacingChange}
          onReset={onResetSizes}
          onSave={onSaveDefaults}
          fonts={fonts}
          selectedFont={selectedFont}
          onFontChange={onFontChange}
        />

        {/* Ofertas Recientes */}
        <div className="flex items-center gap-1.5 bg-[#1e1e1e] px-2 py-1 rounded border border-[#404040]">
          <label htmlFor="ofertas-select" className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider whitespace-nowrap">Ofertas:</label>
          <select
            id="ofertas-select"
            value={selectedOferta}
            onChange={handleOfertaSelect}
            className="bg-transparent text-xs text-gray-200 outline-none cursor-pointer max-w-[150px] disabled:opacity-50"
            disabled={ofertas.length === 0}
          >
            {ofertas.length === 0 ? (
              <option value="" className="bg-[#1e1e1e]">-- No hay ofertas --</option>
            ) : (
              <>
                <option value="" className="bg-[#1e1e1e]">-- Recientes --</option>
                {ofertas.map(o => (
                  <option key={o.filename} value={o.filename} className="bg-[#1e1e1e]">{o.name}</option>
                ))}
              </>
            )}
          </select>
          {selectedOferta && (
            <button
              onClick={handleSaveOferta}
              className={`ml-1 text-[10px] transition-colors ${ofertaSaved ? 'text-green-400' : 'text-orange-400 hover:text-orange-300'}`}
              title="Guardar cambios en la oferta seleccionada"
            >
              {ofertaSaved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Right-aligned action buttons */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        {/* Design Profile */}
        <div className="flex items-center gap-1.5 bg-[#1e1e1e] px-2 py-1 rounded border border-[#404040]">
           <label htmlFor="design-select" className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tema:</label>
           <select
             id="design-select"
             value={selectedDesign}
             onChange={handleDesignChange}
             className="bg-transparent text-xs text-gray-200 outline-none cursor-pointer disabled:opacity-50"
             disabled={themes.length === 0}
           >
             {themes.length === 0 ? (
               <option className="bg-[#1e1e1e]">Loading...</option>
             ) : (
               themes.map(d => (
                 <option key={d.id} value={d.id} className="bg-[#1e1e1e]">{d.name}</option>
               ))
             )}
           </select>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept=".yaml,.yml"
          onChange={handleFileUpload}
          className="hidden"
          id="yaml-upload"
        />

        {/* Load Default Template Dropdown */}
        <div className="relative group">
          <button
            className="flex items-center gap-1 text-xs px-2 py-1 bg-[#1e1e1e] border border-[#404040] hover:bg-[#404040] rounded transition-colors whitespace-nowrap"
            title="Seleccionar plantilla base por idioma"
          >
            <FileText className="w-3 h-3" />
            Plantilla base
            <svg className="w-2.5 h-2.5 ml-0.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div className="absolute right-0 top-full mt-0.5 bg-[#2d2d2d] border border-[#404040] rounded shadow-lg z-50 hidden group-hover:block min-w-[120px]">
            <button
              onClick={() => { setSelectedOferta(""); onLoadDefaultTemplate('es'); }}
              className="w-full text-left text-xs px-3 py-1.5 text-gray-200 hover:bg-[#404040] transition-colors"
            >
              🇪🇸 Español
            </button>
            <button
              onClick={() => { setSelectedOferta(""); onLoadDefaultTemplate('en'); }}
              className="w-full text-left text-xs px-3 py-1.5 text-gray-200 hover:bg-[#404040] transition-colors"
            >
              🇬🇧 Inglés
            </button>
          </div>
        </div>

        {/* Upload YAML */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 text-xs px-2 py-1 bg-[#1e1e1e] border border-[#404040] hover:bg-[#404040] rounded transition-colors whitespace-nowrap"
          title="Cargar archivo YAML"
        >
          <Upload className="w-3 h-3" />
          YAML
        </button>

        {/* Save in CVs folder */}
        <button
          onClick={handleSaveToCVs}
          disabled={!pdfUrl || cvSaveState === 'saving'}
          className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded transition-colors font-medium ${
            cvSaveState === 'saved'
              ? 'bg-green-600 text-white shadow-sm'
              : cvSaveState === 'error'
                ? 'bg-red-600 text-white shadow-sm'
                : pdfUrl
                  ? 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm'
                  : 'bg-[#1e1e1e] text-gray-500 border border-[#404040] cursor-not-allowed'
          }`}
          title="Guardar PDF en la carpeta CVs/"
        >
          {cvSaveState === 'saving' ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : cvSaveState === 'saved' ? (
            <Check className="w-3 h-3" />
          ) : (
            <FolderDown className="w-3 h-3" />
          )}
          {cvSaveState === 'saved' ? '¡Guardado!' : cvSaveState === 'error' ? 'Error' : 'Guardar CV'}
        </button>

        {/* Download PDF / Update Template */}
        {isTemplateModified ? (
          <button
            onClick={onUpdateTemplate}
            className="flex items-center gap-1.5 text-xs px-3 py-1 rounded transition-colors font-medium bg-orange-600 hover:bg-orange-500 text-white shadow-sm"
          >
            <Save className="w-3 h-3" />
            Actualizar plantilla ({templateLang === 'en' ? 'Inglés' : 'Español'})
          </button>
        ) : (
          <button
            onClick={handleDownload}
            disabled={!pdfUrl}
            className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded transition-colors font-medium ${
              pdfUrl
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                : 'bg-[#1e1e1e] text-gray-500 border border-[#404040] cursor-not-allowed'
            }`}
          >
            <Download className="w-3 h-3" />
            Descargar PDF
          </button>
        )}
      </div>
    </div>
  );
}
