import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ImageStudio from './components/ImageStudio';
import MangaStudio from './components/MangaStudio';
import ImageModal from './components/ImageModal';
import Account from './components/Account';
import { GeneratedImage, StoredUser } from './types';
import * as auth from './lib/auth';
import * as db from './lib/db';
import { soundManager, Sfx } from './lib/sounds';
import { setLanguage as setI18nLanguage, t } from './lib/i18n';

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
  const [loadingMessage, setLoadingMessage] = useState(t('app.loading'));
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
  
  if (isAppLoading || appError) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-4">
        {isAppLoading && <div className="loader mb-4"></div>}
        <div className={`text-2xl font-bold ${appError ? 'text-red-400' : 'text-cyan-400'}`}>
          {appError ? appError : loadingMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,144,255,0.3),rgba(255,255,255,0))]">
      <Header 
        credits={credits} 
        onLogoClick={() => setView(View.DASHBOARD)}
        onLanguageChange={handleSetLanguage}
        currentLanguage={language}
        onAccountClick={() => setView(View.ACCOUNT)}
      />
      <main className="container mx-auto px-4 py-8">
        {renderView()}
      </main>
      {viewingImage && <ImageModal image={viewingImage} onClose={() => setViewingImage(null)} />}
    </div>
  );
};

export default App;
