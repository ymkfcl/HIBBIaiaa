
import { useState } from 'react';
import type { GeneratedImage } from '../types.ts';

type GenerateFunction = (prompt: string, options?: any) => Promise<GeneratedImage>;

export const useImageGeneration = (onGenerate: GenerateFunction) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (prompt: string, options?: any): Promise<boolean | GeneratedImage> => {
    if (!prompt.trim() || isLoading) return false;

    setError(null);
    setIsLoading(true);
    try {
      const result = await onGenerate(prompt, options);
      return result; // Success, return the image object
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      return false; // Failure
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, generateImage };
};
