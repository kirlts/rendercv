import React, { useState } from 'react';
import { useTranslation } from '../i18n';

const PRESETS = ['#004F90', '#8B5A2B', '#000000', '#2E5339', '#6B2D5B', '#1A6B5C', '#B85C00', '#4A4A4A'];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="relative" data-testid="color-picker">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#555] transition-colors"
      >
        <span className="w-4 h-4 rounded-full border border-gray-600" style={{ backgroundColor: color }} />
        {t('toolbar.accent')}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} data-testid="color-backdrop" />
          <div className="absolute top-full mt-2 left-0 z-50 p-3 bg-[#2d2d2d] rounded-lg shadow-xl border border-[#404040] w-64">
            <div className="mb-3">
              <label className="text-xs text-gray-400 mb-1 block">HEX Color</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => onChange(e.target.value)}
                  className="bg-[#1e1e1e] border border-[#404040] rounded px-2 py-1 text-sm w-full font-mono text-gray-200"
                />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
              </div>
            </div>

            <div className="text-xs text-gray-400 mb-2">Presets</div>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset}
                  onClick={() => {
                    onChange(preset);
                    setIsOpen(false);
                  }}
                  className={`w-full h-8 rounded transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2d2d2d] focus:ring-white ${color === preset ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2d2d2d]' : ''}`}
                  style={{ backgroundColor: preset }}
                  title={preset}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
