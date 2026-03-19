import React from 'react';
import { useTranslation } from '../i18n';

interface MobileViewProps {
  editor: React.ReactNode;
  preview: React.ReactNode;
}

export const MobileView: React.FC<MobileViewProps> = ({ editor, preview }) => {
  const [activeTab, setActiveTab] = React.useState<'editor' | 'preview'>('editor');
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full w-full bg-background" data-testid="mobile-view">
      <div className="flex h-12 bg-surface border-b border-border flex-shrink-0">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex-1 flex justify-center items-center text-sm font-medium transition-colors ${activeTab === 'editor' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
        >
          {t('mobile.editor')}
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 flex justify-center items-center text-sm font-medium transition-colors ${activeTab === 'preview' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
        >
          {t('mobile.preview')}
        </button>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'editor' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          {editor}
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          {preview}
        </div>
      </div>
    </div>
  );
};
