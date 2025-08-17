
import React from 'react';
import { XIcon, AlertTriangleIcon } from './Icons.tsx';
import { soundManager, Sfx } from '../lib/sounds.ts';
import { t } from '../lib/i18n.ts';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, onConfirm, onCancel }) => {
  
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    soundManager.play(Sfx.Close);
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-900 border-2 border-yellow-500/20 rounded-lg shadow-2xl shadow-yellow-500/10 w-full max-w-md m-4 relative animate-scale-in">
        <button onClick={handleCancel} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <XIcon className="w-6 h-6" />
        </button>

        <div className="p-8">
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 text-yellow-400">
                    <AlertTriangleIcon className="w-12 h-12"/>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                <p className="text-slate-400 mb-6">{message}</p>
                
                <div className="flex justify-center space-x-4 w-full">
                    <button
                        onClick={handleCancel}
                        className="flex-1 bg-slate-700 text-white font-bold py-2.5 px-4 rounded-md hover:bg-slate-600 transition-colors"
                    >
                        {t('confirmModal.cancelButton')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 bg-red-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-red-700 transition-colors"
                    >
                        {t('confirmModal.confirmButton')}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;