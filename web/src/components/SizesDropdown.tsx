import { useState, useRef, useEffect } from 'react';
import { ChevronDown, RotateCcw, Save, Check } from 'lucide-react';

export interface ThemeDefaults {
  font_family?: string;
  font_size: Record<string, string>;
  font_weight: Record<string, number>;
  spacing?: Record<string, string>;
}

interface SizesDropdownProps {
  fontSizes: Record<string, string>;
  fontWeights: Record<string, number>;
  spacing: Record<string, string>;
  themeDefaults: ThemeDefaults | null;
  onFontSizesChange: (sizes: Record<string, string>) => void;
  onFontWeightsChange: (weights: Record<string, number>) => void;
  onSpacingChange: (spacing: Record<string, string>) => void;
  onReset: () => void;
  onSave: () => void;
  fonts: string[];
  selectedFont: string;
  onFontChange: (font: string) => void;
}

interface SliderConfig {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

function parseValue(val: string): { num: number; unit: string } {
  const match = val.match(/^([\d.]+)\s*(pt|em|cm|mm|in)$/);
  if (match) return { num: parseFloat(match[1]), unit: match[2] };
  return { num: parseFloat(val) || 0, unit: 'pt' };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildSliderConfig(key: string, label: string, defaultValue: string): SliderConfig {
  const { num, unit } = parseValue(defaultValue);
  let step: number;
  let min: number;
  let max: number;
  if (unit === 'em') {
    step = 0.1;
    min = Math.max(0.1, Math.round((num * 0.5) * 10) / 10);
    max = Math.round((num * 2) * 10) / 10;
  } else {
    step = unit === 'pt' ? 0.5 : 0.01;
    min = Math.max(step, Math.round((num * 0.5) / step) * step);
    max = Math.round((num * 2) / step) * step;
  }
  return { key, label, unit, min, max, step };
}

const FIELD_LABELS: Record<string, string> = {
  body: 'Cuerpo',
  name: 'Nombre',
  headline: 'Titular',
  connections: 'Contacto',
  section_titles: 'Secciones',
  entry_title: 'Subsecciones',
  entry_detail: 'Sub. detalle',
};

/**
 * Editable value span: clicking on it turns it into a text input.
 * Supports optional min/max clamping.
 */
function EditableValue({
  value,
  onChange,
  min,
  max,
}: {
  value: string;
  onChange: (newValue: string) => void;
  min?: number;
  max?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) { setDraft(value); return; }
    // Parse and clamp if min/max provided
    const parsed = parseValue(trimmed);
    let num = parsed.num;
    const unit = trimmed.match(/[a-z]+$/i) ? parsed.unit : parseValue(value).unit;
    if (min !== undefined && max !== undefined) {
      num = clamp(num, min, max);
    }
    const finalValue = `${num}${unit}`;
    if (finalValue !== value) onChange(finalValue);
    else setDraft(value);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        className="text-[10px] text-gray-200 font-mono bg-[#1e1e1e] border border-[#555] rounded px-1 w-12 outline-none focus:border-[#fc5c45]"
        aria-label="editable value"
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className="text-[10px] text-gray-300 font-mono cursor-text hover:text-white hover:underline"
      title="Click para editar"
    >
      {value}
    </span>
  );
}

export function SizesDropdown({
  fontSizes,
  fontWeights,
  spacing,
  themeDefaults,
  onFontSizesChange,
  onFontWeightsChange,
  onSpacingChange,
  onReset,
  onSave,
  fonts,
  selectedFont,
  onFontChange,
}: SizesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const sizeDefaults = themeDefaults?.font_size ?? fontSizes;
  const weightDefaults = themeDefaults?.font_weight ?? fontWeights;
  const spacingDefaults = themeDefaults?.spacing ?? spacing;
  const sliders = Object.entries(FIELD_LABELS).map(([key, label]) =>
    buildSliderConfig(key, label, sizeDefaults[key] || '9pt')
  );
  // Spacing sliders: all in cm, step 0.05, range 0.05–2.0
  const SPACING_STEP = 0.05;
  const SPACING_MIN = 0.05;
  const SPACING_MAX = 2.0;

  const handleSizeChange = (key: string, numValue: number, unit: string) => {
    const s = sliders.find(sl => sl.key === key);
    const clamped = s ? clamp(numValue, s.min, s.max) : numValue;
    onFontSizesChange({ ...fontSizes, [key]: `${clamped}${unit}` });
  };

  const handleDirectEdit = (key: string, rawValue: string) => {
    const s = sliders.find(sl => sl.key === key);
    const { unit: currentUnit } = parseValue(fontSizes[key] || sizeDefaults[key] || '9pt');
    const parsed = parseValue(rawValue);
    const unit = rawValue.match(/[a-z]+$/i) ? parsed.unit : currentUnit;
    const num = s ? clamp(parsed.num, s.min, s.max) : parsed.num;
    onFontSizesChange({ ...fontSizes, [key]: `${num}${unit}` });
  };

  const handleWeightChange = (key: string, weight: number) => {
    onFontWeightsChange({ ...fontWeights, [key]: clamp(weight, 100, 900) });
  };

  const handleWeightEdit = (key: string, rawValue: string) => {
    const num = Math.round(clamp(parseInt(rawValue) || 400, 100, 900) / 50) * 50;
    onFontWeightsChange({ ...fontWeights, [key]: num });
  };

  const handleSpacingChange = (key: string, numValue: number, unit: string) => {
    const clamped = clamp(numValue, SPACING_MIN, SPACING_MAX);
    // Round to step precision to avoid floating point drift
    const rounded = Math.round(clamped / SPACING_STEP) * SPACING_STEP;
    onSpacingChange({ ...spacing, [key]: `${parseFloat(rounded.toFixed(2))}${unit}` });
  };

  const handleSpacingEdit = (key: string, rawValue: string) => {
    const parsed = parseValue(rawValue);
    const clamped = clamp(parsed.num, SPACING_MIN, SPACING_MAX);
    const rounded = Math.round(clamped / SPACING_STEP) * SPACING_STEP;
    onSpacingChange({ ...spacing, [key]: `${parseFloat(rounded.toFixed(2))}cm` });
  };

  const handleSave = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs px-2 py-1 bg-[#1e1e1e] border border-[#404040] hover:bg-[#404040] rounded transition-colors whitespace-nowrap"
      >
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        Estilo
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 max-w-[90vw] bg-[#2d2d2d] border border-[#404040] rounded-lg shadow-xl z-50 py-2 px-3 max-h-[80vh] overflow-y-auto overflow-x-hidden">
          {/* Font picker */}
          <div className="mb-3 pb-2 border-b border-[#363636]">
            <div className="flex items-center gap-2">
              <label htmlFor="font-select-dropdown" className="text-[10px] text-gray-300 uppercase tracking-wider font-bold whitespace-nowrap">
                Fuente:
              </label>
              <select
                id="font-select-dropdown"
                aria-label="Fuente"
                value={selectedFont}
                onChange={(e) => onFontChange(e.target.value)}
                className="flex-1 text-xs px-1.5 py-0.5 bg-[#1e1e1e] border border-[#404040] hover:bg-[#404040] rounded transition-colors text-gray-200 outline-none cursor-pointer disabled:opacity-50"
                disabled={fonts.length === 0}
              >
                {fonts.length === 0 ? (
                  <option className="bg-[#1e1e1e]">Loading...</option>
                ) : (
                  fonts.map(f => (
                    <option key={f} value={f} className="bg-[#1e1e1e]" style={{ fontFamily: f }}>{f}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {sliders.map((s) => {
            const currentSizeValue = fontSizes[s.key] || sizeDefaults[s.key];
            const { num: sizeNum } = parseValue(currentSizeValue);
            const currentWeight = fontWeights[s.key] ?? weightDefaults[s.key] ?? 400;

            return (
              <div key={s.key} className="mb-3 pb-2 border-b border-[#363636] last:border-b-0 last:mb-1 last:pb-0">
                {/* Field label */}
                <div className="text-[10px] text-gray-300 uppercase tracking-wider font-bold mb-1">
                  {s.label}
                </div>

                {/* Size slider */}
                <div className="flex items-center gap-2 mb-1">
                  <label htmlFor={`size-${s.key}`} className="text-[9px] text-gray-500 w-10 shrink-0">
                    tamaño
                  </label>
                  <input
                    id={`size-${s.key}`}
                    aria-label={s.label}
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={sizeNum}
                    onChange={(e) => handleSizeChange(s.key, parseFloat(e.target.value), s.unit)}
                    className="flex-1 slider-size cursor-pointer"
                  />
                  <EditableValue
                    value={currentSizeValue}
                    onChange={(v) => handleDirectEdit(s.key, v)}
                  />
                </div>

                {/* Weight slider */}
                <div className="flex items-center gap-2 mb-1">
                  <label htmlFor={`weight-${s.key}`} className="text-[9px] text-gray-500 w-10 shrink-0">
                    peso
                  </label>
                  <input
                    id={`weight-${s.key}`}
                    aria-label={`Peso ${s.label}`}
                    type="range"
                    min={100}
                    max={900}
                    step={50}
                    value={currentWeight}
                    onChange={(e) => handleWeightChange(s.key, Number(e.target.value))}
                    className="flex-1 slider-weight cursor-pointer"
                  />
                  <EditableValue
                    value={String(currentWeight)}
                    onChange={(v) => handleWeightEdit(s.key, v)}
                    min={100}
                    max={900}
                  />
                </div>

                {/* Spacing slider */}
                <div className="flex items-center gap-2">
                  <label htmlFor={`spacing-${s.key}`} className="text-[9px] text-gray-500 w-10 shrink-0">
                    espaciado
                  </label>
                  <input
                    id={`spacing-${s.key}`}
                    aria-label={`Espaciado ${s.label}`}
                    type="range"
                    min={SPACING_MIN}
                    max={SPACING_MAX}
                    step={SPACING_STEP}
                    value={parseValue(spacing[s.key] || spacingDefaults[s.key] || '0.2cm').num}
                    onChange={(e) => handleSpacingChange(s.key, parseFloat(e.target.value), 'cm')}
                    className="flex-1 slider-spacing cursor-pointer"
                  />
                  <EditableValue
                    value={spacing[s.key] || spacingDefaults[s.key]}
                    onChange={(v) => handleSpacingEdit(s.key, v)}
                    min={SPACING_MIN}
                    max={SPACING_MAX}
                  />
                </div>
              </div>
            );
          })}

          {/* Action buttons */}
          <div className="flex gap-1.5 mt-1">
            <button
              onClick={onReset}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 bg-[#1e1e1e] border border-[#404040] hover:bg-[#404040] rounded transition-colors text-gray-300"
            >
              <RotateCcw className="w-3 h-3" />
              Reiniciar
            </button>
            <button
              onClick={handleSave}
              className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 bg-[#1e1e1e] border border-[#404040] rounded transition-colors ${saved ? 'text-green-400 border-green-600' : 'text-green-400 hover:bg-[#2a4a2a]'}`}
            >
              {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
              {saved ? '¡Guardado!' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
