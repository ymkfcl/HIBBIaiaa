
import React from 'react';
import type { GeneratedImage } from '../types.ts';
import { DownloadIcon, XIcon } from './Icons.tsx';
import { soundManager, Sfx } from '../lib/sounds.ts';
import { t } from '../lib/i18n.ts';

interface ImageModalProps {
  image: GeneratedImage;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  const handleDownload = () => {
    soundManager.play(Sfx.Download);
    const link = document.createElement('a');
    link.href = image.url;
    const fileName = `${image.prompt.slice(0, 30).replace(/[\s/\\?%*:|"<>]/g, '_') || 'hibbi-generated'}.jpeg`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    soundManager.play(Sfx.Close);
    onClose();
  }

  // Prevent clicks inside the modal from closing it
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
    >
      <div
        onClick={stopPropagation}
        className="bg-slate-900 border border-cyan-500/20 rounded-lg shadow-2xl shadow-cyan-500/10 w-full max-w-3xl max-h-[90vh] relative animate-scale-in flex flex-col"
      >
        <button onClick={handleClose} className="absolute -top-4 -right-4 text-slate-300 bg-slate-800 rounded-full p-2 hover:text-white hover:bg-slate-700 transition-colors z-10">
          <XIcon className="w-6 h-6" />
        </button>
        
        <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto">
            <div className="aspect-square bg-slate-800 rounded-md overflow-hidden self-start">
                <img src={image.url} alt={image.prompt} className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col text-slate-200">
                <h3 className="text-lg font-bold text-cyan-400 mb-2">{t('imageModal.prompt')}</h3>
                <p className="text-slate-300 mb-6 flex-grow">{image.prompt}</p>
                
                <div className="border-t border-slate-700 pt-4 text-sm text-slate-400">
                    <p><strong>{t('imageModal.generated')}:</strong> {new Date(image.createdAt).toLocaleString()}</p>
                </div>

                <button
                    onClick={handleDownload}
                    className="w-full mt-6 bg-cyan-500 text-white font-bold py-2.5 px-4 rounded-md flex items-center justify-center space-x-2 hover:bg-cyan-600 transition-colors"
                >
                    <DownloadIcon className="w-5 h-5" />
                    <span>{t('imageModal.download')}</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
