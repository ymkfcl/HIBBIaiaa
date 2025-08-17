import React, { useState, useEffect } from 'react';
import { MangaCharacter, GeneratedImage } from '../types';
import { XIcon, SparklesIcon, UserCircleIcon } from './Icons';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { soundManager, Sfx } from '../lib/sounds';
import { t } from '../lib/i18n';

interface CharacterModalProps {
  characterToEdit?: MangaCharacter | null;
  onSave: (characterData: Omit<MangaCharacter, 'id'> & { id?: string }) => void;
  onClose: () => void;
  onGenerate: (prompt: string, options?: { aspectRatio?: string }) => Promise<GeneratedImage>;
}

const CharacterModal: React.FC<CharacterModalProps> = ({ characterToEdit, onSave, onClose, onGenerate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const { isLoading: isGenerating, error, generateImage } = useImageGeneration(onGenerate);

  useEffect(() => {
    if (characterToEdit) {
      setName(characterToEdit.name);
      setDescription(characterToEdit.description);
      setAvatarUrl(characterToEdit.avatarUrl);
    }
  }, [characterToEdit]);

  const handleGenerateAvatar = async () => {
    const prompt = `close-up portrait of ${name}, ${description}, character sheet, anime style`;
    const image = await generateImage(prompt, { aspectRatio: '1:1' });
    if (image && typeof image !== 'boolean') {
      setAvatarUrl(image.url);
    }
  };

  const handleSave = () => {
    if (!name || !description || !avatarUrl) {
      alert(t('characterModal.alert'));
      soundManager.play(Sfx.Error);
      return;
    }
    soundManager.play(Sfx.Add);
    onSave({
      id: characterToEdit?.id,
      name,
      description,
      avatarUrl,
    });
  };
  
  const handleClose = () => {
    soundManager.play(Sfx.Close);
    onClose();
  };

  const modalTitle = characterToEdit ? t('characterModal.editTitle') : t('characterModal.createTitle');
  const saveButtonText = characterToEdit ? t('characterModal.saveButton') : t('characterModal.createButton');

  const inputStyles = "w-full bg-slate-800 border-2 border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all disabled:opacity-50";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-900 border-2 border-cyan-500/20 rounded-lg shadow-2xl shadow-cyan-500/10 w-full max-w-lg m-4 relative animate-scale-in">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <XIcon className="w-6 h-6" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">{modalTitle}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1" htmlFor="char-name">{t('characterModal.nameLabel')}</label>
              <input id="char-name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputStyles} placeholder={t('characterModal.namePlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1" htmlFor="char-desc">{t('characterModal.descriptionLabel')}</label>
              <textarea id="char-desc" value={description} onChange={e => setDescription(e.target.value)} className={inputStyles} rows={4} placeholder={t('characterModal.descriptionPlaceholder')} />
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-32 h-32 bg-slate-800 border-2 border-slate-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Character Avatar" className="w-full h-full object-cover rounded-md" />
                ) : (
                  <UserCircleIcon className="w-16 h-16 text-slate-600" />
                )}
              </div>
              <div className="flex-grow">
                <label className="block text-sm font-semibold text-slate-400 mb-1">{t('characterModal.avatarLabel')}</label>
                <p className="text-xs text-slate-500 mb-2">{t('characterModal.avatarDescription')}</p>
                <button
                  onClick={handleGenerateAvatar}
                  disabled={isGenerating || !name || !description}
                  className="w-full bg-slate-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center space-x-2 hover:bg-slate-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      <span>{t('imageStudio.generating')}</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      <span>{t('characterModal.generateAvatarButton')}</span>
                    </>
                  )}
                </button>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={!name || !description || !avatarUrl || isGenerating}
                className="bg-cyan-500 text-white font-bold py-2.5 px-6 rounded-md flex items-center justify-center space-x-2 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
              >
                {saveButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterModal;