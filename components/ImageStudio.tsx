import React, { useState, memo } from 'react';
import { GeneratedImage } from '../types';
import { DownloadIcon, SparklesIcon } from './Icons';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { soundManager, Sfx } from '../lib/sounds';
import { t } from '../lib/i18n';

type AspectRatio = '1:1' | '16:9' | '9:16';

interface ImageStudioProps {
  onGenerate: (prompt: string, options: { aspectRatio: AspectRatio }) => Promise<GeneratedImage>;
  images: GeneratedImage[];
  onImageClick: (image: GeneratedImage) => void;
}

const ImageCard: React.FC<{ image: GeneratedImage; onClick: () => void }> = memo(({ image, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.play(Sfx.Download);
    const link = document.createElement('a');
    link.href = image.url;
    const fileName = `${image.prompt.slice(0, 30).replace(/[\s/\\?%*:|"<>]/g, '_') || 'hibbi-generated'}.jpeg`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="relative aspect-square rounded-lg overflow-hidden group border-2 border-slate-700 cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={image.url} alt={image.prompt} className="w-full h-full object-cover bg-slate-800" />
      <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="p-4 text-white flex flex-col justify-between h-full">
          <p className="text-sm line-clamp-3">{image.prompt}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">{new Date(image.createdAt).toLocaleDateString()}</span>
            <button
              onClick={handleDownload}
              className="p-2 rounded-full bg-cyan-500/80 hover:bg-cyan-500 transition-colors"
              aria-label={t('imageModal.download')}
            >
              <DownloadIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const quickStyles = {
    'Content Type': ['Epic landscape', 'Close-up portrait of a celebrity', 'Fantasy character concept art', 'Cyberpunk city street'],
    'Art Style': ['Photorealistic', 'Anime style', 'Oil painting', 'Watercolor', 'Low poly'],
    'Enhancers': ['hyperdetailed', 'dramatic lighting', '4K resolution', 'cinematic composition']
};

const ImageStudio: React.FC<ImageStudioProps> = ({ onGenerate, images, onImageClick }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const { isLoading, error, generateImage } = useImageGeneration(onGenerate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPrompt = `unfiltered, RAW photo, ${prompt}`;

    const success = await generateImage(finalPrompt, { aspectRatio });
    if (success) {
      // Don't clear prompts, user might want to iterate
    }
  };
  
  const handleAspectRatioChange = (ratio: AspectRatio) => {
    setAspectRatio(ratio);
    soundManager.play(Sfx.Switch);
  }

  const handleQuickStyleClick = (style: string) => {
    setPrompt(p => p ? `${p}, ${style}` : style);
    soundManager.play(Sfx.Click);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">{t('imageStudio.title')}</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('imageStudio.promptPlaceholder')}
            className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none"
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-slate-300 mb-3">{t('imageStudio.quickStyles')}</h3>
                {Object.entries(quickStyles).map(([category, styles]) => (
                    <div key={category} className="mb-3">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                        {styles.map(style => (
                        <button
                            type="button"
                            key={style}
                            onClick={() => handleQuickStyleClick(style)}
                            className="bg-slate-700 text-xs text-slate-200 px-2 py-1 rounded-md hover:bg-slate-600 transition-colors"
                        >
                            + {style}
                        </button>
                        ))}
                    </div>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-slate-300">{t('imageStudio.aspectRatio')}:</span>
                {(['1:1', '16:9', '9:16'] as AspectRatio[]).map(ratio => (
                    <button
                        type="button"
                        key={ratio}
                        onClick={() => handleAspectRatioChange(ratio)}
                        className={`px-3 py-1 text-sm rounded-md font-semibold transition-colors ${aspectRatio === ratio ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                    >
                        {ratio}
                    </button>
                ))}
            </div>
            <button 
                type="submit" 
                disabled={isLoading || !prompt.trim()}
                className="bg-cyan-500 text-white font-bold py-3 px-6 rounded-md flex items-center justify-center space-x-2 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                <>
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    <span>{t('imageStudio.generating')}</span>
                </>
                ) : (
                <>
                    <SparklesIcon className="w-5 h-5" />
                    <span>{t('imageStudio.generate')}</span>
                </>
                )}
            </button>
        </div>
        {error && <p className="text-red-400 mt-2 text-center sm:text-right">{error}</p>}
      </form>

      <h2 className="text-2xl font-semibold mb-4 text-white">{t('imageStudio.galleryTitle')}</h2>
      {images.length === 0 && !isLoading ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-lg">
          <p className="text-slate-400">{t('imageStudio.galleryEmpty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {isLoading && images.length === 0 && <div className="aspect-square bg-slate-800 rounded-lg animate-pulse"></div>}
          {images.map((img) => <ImageCard key={img.id} image={img} onClick={() => onImageClick(img)} />)}
        </div>
      )}
    </div>
  );
};

export default ImageStudio;