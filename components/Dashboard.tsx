
import React from 'react';
import { View } from '../App.tsx';
import { ImageIcon, BookOpenIcon } from './Icons.tsx';
import { soundManager, Sfx } from '../lib/sounds.ts';
import { t } from '../lib/i18n.ts';

interface DashboardProps {
  setView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  
  const handleCardClick = (view: View) => {
    soundManager.play(Sfx.Click);
    setView(view);
  };

  const Card: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }> = ({ title, description, icon, onClick, disabled = false }) => {
    const cardClasses = `relative bg-slate-800/50 p-8 rounded-lg border border-cyan-500/20 transition-all duration-300 group ${
        disabled 
        ? 'opacity-60 cursor-not-allowed filter grayscale' 
        : 'hover:border-cyan-400/50 hover:bg-slate-800/80 transform hover:-translate-y-1 cursor-pointer hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
    }`;

    return (
      <div
        onClick={!disabled ? onClick : undefined}
        className={cardClasses}
      >
        {disabled && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full transform rotate-6 z-10 shadow-lg">
            {t('dashboard.comingSoon')}
          </div>
        )}
        <div className="flex flex-col items-center text-center">
          <div className={`mb-4 text-cyan-400 ${!disabled && "group-hover:text-cyan-300"} transition-colors duration-300`}>
            {icon}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-slate-400">{description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center pt-16">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center text-white" style={{ textShadow: '0 0 10px rgba(6, 182, 212, 0.5)' }}>
        {t('dashboard.title')}
      </h1>
      <p className="text-md md:text-lg text-slate-300 mb-12 max-w-2xl text-center">
        {t('dashboard.subtitle')}
      </p>
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card
          title={t('dashboard.imageStudioTitle')}
          description={t('dashboard.imageStudioDescription')}
          icon={<ImageIcon className="w-16 h-16" />}
          onClick={() => handleCardClick(View.IMAGE_STUDIO)}
        />
        <Card
          title={t('dashboard.mangaStudioTitle')}
          description={t('dashboard.mangaStudioDescription')}
          icon={<BookOpenIcon className="w-16 h-16" />}
          disabled={true}
        />
      </div>
    </div>
  );
};

export default Dashboard;
