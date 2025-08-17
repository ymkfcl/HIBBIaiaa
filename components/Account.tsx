import React, { useState, useEffect } from 'react';
import { View } from '../App';
import * as auth from '../lib/auth';
import { UserCircleIcon, KeyIcon, ZapIcon } from './Icons';
import { soundManager, Sfx } from '../lib/sounds';
import { t } from '../lib/i18n';

interface AccountProps {
  user: { email: string; credits: number } | null;
  setView: (view: View) => void;
}

type UserData = {
  email: string;
  passwordHash: string;
  credits: number;
};

const Account: React.FC<AccountProps> = ({ user, setView }) => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (user) {
      const data = auth.getUserData(user.email);
      // We use credits from the user prop for real-time accuracy,
      // but fetch the raw stored data for the password.
      if (data) {
        setUserData({
            ...data,
            credits: user.credits, 
        });
      }
    }
  }, [user]);

  const handleBackClick = () => {
    soundManager.play(Sfx.Click);
    setView(View.DASHBOARD);
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center pt-16">
        <h1 className="text-2xl text-slate-400">{t('account.loading')}</h1>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">{t('account.title')}</h1>
      
      <div className="bg-slate-800/50 p-8 rounded-lg border border-cyan-500/20 space-y-6">
        <p className="text-sm text-slate-400 border-l-4 border-yellow-500/50 pl-4">
          {t('account.disclaimer')}
        </p>

        <div>
          <label className="flex items-center text-sm font-semibold text-slate-400 mb-2">
            <UserCircleIcon className="w-5 h-5 mr-2" />
            {t('account.emailLabel')}
          </label>
          <div className="bg-slate-900/50 border border-slate-700 rounded-md p-3 text-white font-mono select-all">
            {userData.email}
          </div>
        </div>
        
        <div>
          <label className="flex items-center text-sm font-semibold text-slate-400 mb-2">
            <ZapIcon className="w-5 h-5 mr-2" />
            {t('account.creditsLabel')}
          </label>
          <div className="bg-slate-900/50 border border-slate-700 rounded-md p-3 text-white font-mono select-all">
            {userData.credits} / 170
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-semibold text-slate-400 mb-2">
            <KeyIcon className="w-5 h-5 mr-2" />
            {t('account.passwordLabel')}
          </label>
          <div className="bg-slate-900/50 border border-slate-700 rounded-md p-3 text-white font-mono select-all">
            {userData.passwordHash}
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center">
        <button 
          onClick={handleBackClick}
          className="bg-slate-700 text-white font-semibold py-2 px-6 rounded-md hover:bg-cyan-500 transition-colors"
        >
          &larr; {t('account.backButton')}
        </button>
      </div>
    </div>
  );
};

export default Account;