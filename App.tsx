
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import ImageStudio from './components/ImageStudio.tsx';
import MangaStudio from './components/MangaStudio.tsx';
import ImageModal from './components/ImageModal.tsx';
import Account from './components/Account.tsx';
import * as auth from './lib/auth.ts';
import * as db from './lib/db.ts';
import { soundManager, Sfx } from './lib/sounds.ts';
import { setLanguage as setI18nLanguage, t } from './lib/i18n.ts';
import type { GeneratedImage, StoredUser } from './types.ts';

export enum View {
  DASHBOARD,
  IMAGE_STUDIO,
  MANGA_STUDIO,
  ACCOUNT,
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [credits, setCredits] = useState<number>(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [viewingImage, setViewingImage] = useState<GeneratedImage | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');

  const handleSetLanguage = useCallback((lang: 'en' | 'fr') => {
    setI18nLanguage(lang);
    setLanguage(lang);
  }, []);

  // Effect to check for an active session on initial app load
  useEffect(() => {
    const detectedLang = navigator.language.startsWith('fr') ? 'fr' : 'en';
    handleSetLanguage(detectedLang);

    const initializeSession = async () => {
      try {
        const currentUser = await auth.getOrCreateUser();
        if (currentUser) {
          setUser(currentUser);
          setCredits(currentUser.credits);
        }
      } catch (error) {
        console.error("Failed to initialize session:", error);
        setAppError(t('errors.sessionError'));
      } finally {
        setIsAppLoading(false);
      }
    };
    initializeSession();
  }, [handleSetLanguage]);

  // Effect to load images from IndexedDB when user session is ready
  useEffect(() => {
    const loadImages = async () => {
      if (user) {
        const images = await db.getImages();
        setGeneratedImages(images);
      } else {
        setGeneratedImages([]);
      }
    };
    loadImages();
  }, [user]);


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
        await auth.updateUserCredits(newCredits);

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt: prompt,
          createdAt: new Date().toISOString(),
        };
        
        await db.saveImage(newImage);
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
        />;
    }
  };
  
  if (isAppLoading) {
    // While loading, render the exact same skeleton as in index.html to avoid flicker.
    // React will see this matches the initial server-rendered HTML and won't update the DOM.
    return (
        <div className="min-h-screen bg-slate-900 text-gray-200" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <header className="bg-slate-900/50 backdrop-blur-sm border-b border-cyan-500/20 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="text-xl sm:text-2xl font-bold tracking-widest text-cyan-400" style={{ textShadow: '0 0 5px #06b6d4, 0 0 10px #06b6d4' }}>
                        HIBBI
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="hidden sm:flex items-center space-x-2">
                            <div className="w-14 h-8 bg-slate-800/70 rounded-full animate-pulse"></div>
                            <div className="w-8 h-8 bg-slate-800/70 rounded-full animate-pulse"></div>
                            <div className="w-8 h-8 bg-slate-800/70 rounded-full animate-pulse"></div>
                        </div>
                        <div className="w-24 h-11 bg-slate-800/70 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center pt-16">
                    <div className="w-3/4 md:w-1/2 h-10 bg-slate-800/70 rounded-md mb-4 animate-pulse"></div>
                    <div className="w-full md:w-3/4 h-8 bg-slate-800/70 rounded-md mb-12 animate-pulse"></div>
                    <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                        <div className="h-60 bg-slate-800/70 rounded-lg animate-pulse"></div>
                        <div className="h-60 bg-slate-800/70 rounded-lg animate-pulse"></div>
                    </div>
                </div>
            </main>
        </div>
    );
  }

  if (appError) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-4">
        <div className="text-2xl font-bold text-red-400">
          {appError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Header 
        credits={credits} 
        onLogoClick={() => setView(View.DASHBOARD)}
        onLanguageChange={handleSetLanguage}
        currentLanguage={language}
        onAccountClick={() => setView(View.ACCOUNT)}
      />
      <main className="container mx-auto px-4 py-8">
        <div key={view} className="animate-view-fade-in">
          {renderView()}
        </div>
      </main>
      {viewingImage && <ImageModal image={viewingImage} onClose={() => setViewingImage(null)} />}
    </div>
  );
};

export default App;
