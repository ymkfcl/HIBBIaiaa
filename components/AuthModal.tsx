import React, { useState } from 'react';
import { XIcon } from './Icons';
import { soundManager, Sfx } from '../lib/sounds';
import { t } from '../lib/i18n';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
}

type AuthMode = 'login' | 'signup';

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, onSignUp }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('auth.errorEmailPasswordRequired'));
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError(t('auth.errorPasswordsDoNotMatch'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onSignUp(email, password);
      }
    } catch (err) {
      if (err instanceof Error) {
        // Use a key for specific backend errors if they are standardized
        if (err.message.includes('Email already in use')) {
            setError(t('auth.errorEmailInUse'));
        } else if (err.message.includes('Invalid email or password')) {
            setError(t('auth.errorInvalidCredentials'));
        } else {
            setError(err.message);
        }
      } else {
        setError(t('errors.unexpected'));
      }
      soundManager.play(Sfx.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    soundManager.play(Sfx.Switch);
  };
  
  const handleClose = () => {
    soundManager.play(Sfx.Close);
    onClose();
  }

  const inputStyles = "w-full bg-slate-800 border-2 border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all disabled:opacity-50";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-900 border-2 border-cyan-500/20 rounded-lg shadow-2xl shadow-cyan-500/10 w-full max-w-md m-4 relative animate-scale-in">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <XIcon className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="flex border-b border-slate-700 mb-6">
            <button 
              onClick={() => switchMode('login')}
              className={`py-2 px-4 font-semibold transition-colors ${mode === 'login' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {t('auth.login')}
            </button>
            <button 
              onClick={() => switchMode('signup')}
              className={`py-2 px-4 font-semibold transition-colors ${mode === 'signup' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {t('auth.signUp')}
            </button>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6">
            {mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccountTitle')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1" htmlFor="email">{t('auth.email')}</label>
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={inputStyles} placeholder="user@hibbi.ai" disabled={isLoading} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1" htmlFor="password">{t('auth.password')}</label>
              <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className={inputStyles} placeholder="••••••••" disabled={isLoading} />
            </div>
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1" htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputStyles} placeholder="••••••••" disabled={isLoading} />
              </div>
            )}

            {error && <p className="text-red-400 text-sm animate-fade-in">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 text-white font-bold py-2.5 px-4 rounded-md flex items-center justify-center space-x-2 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <span>{mode === 'login' ? t('auth.loginButton') : t('auth.createAccountButton')}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;