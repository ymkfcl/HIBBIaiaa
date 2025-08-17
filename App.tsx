import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ImageStudio from './components/ImageStudio';
import MangaStudio from './components/MangaStudio';
import AuthModal from './components/AuthModal';
import ImageModal from './components/ImageModal';
import Account from './components/Account';
import { GeneratedImage } from './types';
import * as auth from './lib/auth';
import * as db from './lib/db';
import { soundManager, Sfx } from './lib/sounds';
import { setLanguage as setI18nLanguage, t } from './lib/i18n';

export enum View {
  DASHBOARD,
  IMAGE_STUDIO,
  MANGA_STUDIO,
  ACCOUNT
}

// User type for app state
type User = {
  email: string;
  credits: number;
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [credits, setCredits] = useState<number>(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [viewingImage, setViewingImage] = useState<GeneratedImage | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');

  const handleSetLanguage = useCallback((lang: 'en' | 'fr') => {
    setI18nLanguage(lang);
    setLanguage(lang);
  }, []);

  // Effect to check for an active session on initial app load
  useEffect(() => {
    const detectedLang = navigator.language.startsWith('fr') ? 'fr' : 'en';
    handleSetLanguage(detectedLang);

    const checkSession = async () => {
        const currentUser = await auth.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setCredits(currentUser.credits);
        }
        setIsAppLoading(false);
    };
    checkSession();
  }, [handleSetLanguage]);

  // Effect to load images from IndexedDB when user logs in
  useEffect(() => {
    const loadImages = async () => {
      if (user) {
        const images = await db.getImages(user.email);
        setGeneratedImages(images);
      } else {
        setGeneratedImages([]);
      }
    };
    loadImages();
  }, [user]);


  const handleLogin = async (email: string, password: string) => {
    const { user } = await auth.login(email, password);
    setUser(user);
    setCredits(user.credits);
    setIsAuthModalOpen(false);
    soundManager.play(Sfx.Login);
  };

  const handleSignUp = async (email: string, password: string) => {
    const { user } = await auth.signUp(email, password);
    setUser(user);
    setCredits(user.credits);
    setIsAuthModalOpen(false);
    soundManager.play(Sfx.Login);
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setCredits(0);
    setView(View.DASHBOARD);
    soundManager.play(Sfx.Logout);
  };

  const handleGenerateImage = useCallback(async (prompt: string, options?: { aspectRatio?: string }): Promise<GeneratedImage> => {
      if (!user) {
        throw new Error(t('errors.mustBeLoggedIn'));
      }
      if (credits <= 0) {
          throw new Error(t('errors.notEnoughCredits'));
      }
      
      soundManager.play(Sfx.Generate);
      try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: options?.aspectRatio || '1:1',
            },
        });
        
        const newCredits = credits - 1;
        setCredits(newCredits);
        await auth.updateUserCredits(user.email, newCredits);

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt: prompt,
          createdAt: new Date().toISOString(),
        };
        
        await db.saveImage(user.email, newImage);
        setGeneratedImages(prev => [newImage, ...prev]);
        soundManager.play(Sfx.Success);
        return newImage;

      } catch (error) {
        console.error("Error generating image:", error);
        soundManager.play(Sfx.Error);
        throw new Error(t('errors.generationFailed'));
      }
  }, [credits, user, language]);
  
  const renderView = () => {
    switch (view) {
      case View.IMAGE_STUDIO:
        return <ImageStudio onGenerate={handleGenerateImage} images={generatedImages} onImageClick={setViewingImage} />;
      case View.MANGA_STUDIO:
        return <MangaStudio onGenerate={handleGenerateImage} user={user} />;
      case View.ACCOUNT:
        return <Account user={user} setView={setView} />;
      case View.DASHBOARD:
      default:
        return <Dashboard 
          setView={setView} 
          user={user} 
          onAuthRequired={() => setIsAuthModalOpen(true)}
        />;
    }
  };
  
  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-2xl font-bold">{t('app.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,144,255,0.3),rgba(255,255,255,0))]">
      <Header 
        credits={credits} 
        onLogoClick={() => setView(View.DASHBOARD)}
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onAccountClick={() => setView(View.ACCOUNT)}
        onLanguageChange={handleSetLanguage}
        currentLanguage={language}
      />
      <main className="container mx-auto px-4 py-8">
        {renderView()}
      </main>
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} onSignUp={handleSignUp} />}
      {viewingImage && <ImageModal image={viewingImage} onClose={() => setViewingImage(null)} />}
    </div>
  );
};

export default App;
