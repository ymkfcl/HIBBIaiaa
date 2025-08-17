
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
}

export interface MangaPanel {
  id: string;
  image: GeneratedImage | null;
  dialogue: string;
}

export interface MangaPage {
  id: string;
  panels: MangaPanel[];
  layout: string; // e.g., '2x2', '1x3'
}

export interface MangaCharacter {
    id: string;
    name: string;
    description: string; // Prompt-like description for consistent generation
    avatarUrl: string; // A reference image
}

export interface MangaProject {
  id: string;
  title: string;
  characters: MangaCharacter[];
  pages: MangaPage[];
  updatedAt: string;
}
   