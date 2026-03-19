import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';

interface ResetHintProps {
  onDismiss: () => void;
}

export const ResetHint: React.FC<ResetHintProps> = ({ onDismiss }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#2d2d2d] border border-green-600 shadow-xl rounded-full px-6 py-2 z-50 animate-bounce" data-testid="reset-hint">
      <span className="text-sm font-medium text-green-400">{t('hint.ctrl_z')}</span>
    </div>
  );
};
