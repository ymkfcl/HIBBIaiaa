import React from 'react';
import { View } from '../App';
import { ImageIcon, BookOpenIcon } from './Icons';
import { soundManager, Sfx } from '../lib/sounds';
import { t } from '../lib/i18n';

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
    onClick: () => void;
  }> = ({ title, description, icon, onClick }) => (
    <div
      onClick={onClick}
      className="bg-slate-800/50 p-8 rounded-lg border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400">{description}</p>
      </div>
    </div>
  );

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
          onClick={() => handleCardClick(View.MANGA_STUDIO)}
        />
      </div>
    </div>
  );
};

export default Dashboard;