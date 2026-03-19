import React from 'react';
import { useTranslation } from '../i18n';

interface SizesDropdownProps {
  sizes: any;
  onChange: (sizes: any) => void;
  onReset: () => void;
}

export const SizesDropdown: React.FC<SizesDropdownProps> = ({ sizes, onChange, onReset }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t } = useTranslation();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#555] transition-colors"
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
        {t('toolbar.style')}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} data-testid="sizes-backdrop" />
          <div className="absolute top-full mt-2 left-0 z-50 p-4 bg-[#2d2d2d] rounded-lg shadow-xl border border-[#404040] w-64 text-sm" data-testid="sizes-dropdown">
            <div className="mb-4">
              <label className="text-gray-400 text-xs block mb-1">Body Font Size</label>
              <input
                type="text"
                value={sizes?.typography?.font_size?.body || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({
                    ...sizes,
                    typography: {
                      ...sizes?.typography,
                      font_size: { ...sizes?.typography?.font_size, body: val }
                    }
                  });
                }}
                className="w-full bg-[#1e1e1e] border border-[#555] rounded px-2 py-1 text-gray-200"
                placeholder="10pt"
              />
            </div>

            <button
              onClick={() => {
                onReset();
                setIsOpen(false);
              }}
              className="w-full text-center text-sm text-amber-500 hover:text-amber-400 border border-amber-600/30 hover:bg-amber-600/10 rounded py-1.5 transition-colors"
            >
              Reset to Theme Defaults
            </button>
          </div>
        </>
      )}
    </div>
  );
};
