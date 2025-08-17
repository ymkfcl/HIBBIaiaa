import React, { useState } from 'react';
import { ZapIcon, Volume2Icon, VolumeXIcon, UKFlagIcon, FRFlagIcon, UserCircleIcon } from './Icons';
import { soundManager, Sfx } from '../lib/sounds';
import { t } from '../lib/i18n';

interface HeaderProps {
  credits: number;
  onLogoClick: () => void;
  onLanguageChange: (lang: 'en' | 'fr') => void;
  currentLanguage: 'en' | 'fr';
  onAccountClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ credits, onLogoClick, onLanguageChange, currentLanguage, onAccountClick }) => {
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };
  
  const handleLogoClick = () => {
    soundManager.play(Sfx.Click);
    onLogoClick();
  }

  const handleLangClick = (lang: 'en' | 'fr') => {
    soundManager.play(Sfx.Click);
    onLanguageChange(lang);
  }

  const handleAccountClick = () => {
    soundManager.play(Sfx.Click);
    onAccountClick();
  }

  return (
    <header className="bg-slate-900/50 backdrop-blur-sm border-b border-cyan-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          onClick={handleLogoClick}
          className="text-xl sm:text-2xl font-bold tracking-widest text-cyan-400 cursor-pointer"
          style={{ textShadow: '0 0 5px #06b6d4, 0 0 10px #06b6d4' }}
        >
          HIBBI
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
           <div className="flex items-center space-x-1">
            <button onClick={() => handleLangClick('en')} title="English" className={`p-1 rounded-full transition-all ${currentLanguage === 'en' ? 'ring-2 ring-cyan-400' : 'opacity-50 hover:opacity-100'}`}>
                <UKFlagIcon className="w-6 h-6 rounded-full" />
            </button>
            <button onClick={() => handleLangClick('fr')} title="Français" className={`p-1 rounded-full transition-all ${currentLanguage === 'fr' ? 'ring-2 ring-cyan-400' : 'opacity-50 hover:opacity-100'}`}>
                <FRFlagIcon className="w-6 h-6 rounded-full" />
            </button>
           </div>
           <button onClick={handleToggleMute} title="Toggle Sound" className="p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500">
            {isMuted ? <VolumeXIcon className="w-5 h-5" /> : <Volume2Icon className="w-5 h-5" />}
          </button>
          <button onClick={handleAccountClick} title="Account" className="p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <UserCircleIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-full px-3 sm:px-4 py-2 text-cyan-400">
            <ZapIcon className="w-5 h-5" />
            <span className="font-semibold">{credits}</span>
            <span className="hidden sm:inline text-xs text-slate-400">{t('header.credits')}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
