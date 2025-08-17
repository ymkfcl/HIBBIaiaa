
// lib/i18n.ts

const translations = {
  en: {
    app: { 
        loading: 'Initializing Session...' 
    },
    header: {
        credits: '/ 170',
    },
    dashboard: {
        title: 'Your Local AI Studio',
        subtitle: 'Unleash your creativity. Generate stunning images or craft entire manga series, all within your browser.',
        imageStudioTitle: 'Image Studio',
        imageStudioDescription: 'Generate single, high-quality images from text prompts. Perfect for concept art, avatars, and inspiration.',
        mangaStudioTitle: 'Manga Studio',
        mangaStudioDescription: 'Create full manga books with characters, pages, and panels. Bring your stories to life, one frame at a time.',
        comingSoon: 'Coming Soon',
    },
    imageStudio: {
        title: 'Image Studio',
        promptPlaceholder: 'A cyberpunk cat wearing sunglasses, neon city background...',
        quickStyles: 'Quick Styles',
        aspectRatio: 'Aspect Ratio',
        generating: 'Generating...',
        generate: 'Generate',
        galleryTitle: 'Your Gallery',
        galleryEmpty: 'Your generated images will appear here.',
    },
    mangaStudio: {
        title: 'Manga Studio',
        newProject: 'New Project',
        untitledProjectBase: 'Untitled Manga',
        noProjects: 'Your manga projects will appear here. Create a new one to get started!',
        lastUpdated: 'Last updated',
        openEditor: 'Open Editor',
        deleteProject: 'Delete Project',
        confirmDeleteProject: 'Are you sure you want to permanently delete this project? This action cannot be undone.',
        deleteCharacter: 'Delete Character',
        backToProjects: 'Back to Projects',
        pages: 'Pages',
        characters: 'Characters',
        page: 'Page',
        newPage: 'New Page',
        newCharacter: 'New Character',
        noCharacters: 'No characters created yet. Add one to build your cast!',
        confirmDeleteCharacter: "Are you sure you want to delete this character? This can't be undone.",
        emptyPanel: 'Empty Panel',
        addPanel: 'Add Panel to Page',
        selectPage: 'Select or create a page to begin.',
        inspector: 'Inspector',
        panelPrompt: 'Panel Prompt',
        panelPromptPlaceholder: 'A hero looking over a neon city...',
        addCharacterToPrompt: 'Add Character to Prompt',
        createCharacterHint: 'Create a character to add them here.',
        generateImage: 'Generate Image',
        dialogue: 'Dialogue',
        dialoguePlaceholder: "It's time to end this...",
        selectPanel: 'Select a panel to edit its properties.',
    },
    characterModal: {
        editTitle: 'Edit Character',
        createTitle: 'Create New Character',
        saveButton: 'Save Changes',
        createButton: 'Create Character',
        nameLabel: 'Character Name',
        namePlaceholder: 'e.g., Kaito Shadowblade',
        descriptionLabel: 'Appearance & Personality (Prompt)',
        descriptionPlaceholder: 'e.g., silver hair, cybernetic eye, calm and collected, wears a black trench coat',
        avatarLabel: 'Avatar',
        avatarDescription: 'Generate an avatar based on the name and description.',
        generateAvatarButton: 'Generate Avatar',
        alert: 'Please fill in all fields and generate an avatar.',
    },
    confirmModal: {
        title: 'Are you sure?',
        confirmButton: 'Confirm Delete',
        cancelButton: 'Cancel',
    },
    imageModal: {
        prompt: 'Prompt',
        generated: 'Generated',
        download: 'Download Image',
    },
    account: {
        loading: 'Loading Account...',
        title: 'Account Details',
        disclaimer: 'This is an anonymous local session. Your data is stored only in your browser and is not shared.',
        creditsLabel: 'Current Credits',
        resetLabel: 'Credits Reset On',
        backButton: 'Back to Dashboard',
    },
    errors: {
        sessionError: 'Could not initialize session. Please check your connection or disable ad-blockers and try again.',
        mustBeLoggedIn: "Session not active. Please refresh.",
        notEnoughCredits: "Not enough credits.",
        generationFailed: "Failed to generate image. Please try again later.",
        unexpected: 'An unexpected error occurred.',
    },
  },
  fr: {
    app: { 
        loading: 'Initialisation de la session...' 
    },
    header: {
        credits: '/ 170',
    },
    dashboard: {
        title: 'Votre Studio IA Local',
        subtitle: 'Libérez votre créativité. Générez des images époustouflantes ou créez des séries de mangas entières, le tout dans votre navigateur.',
        imageStudioTitle: 'Studio d\'Image',
        imageStudioDescription: 'Générez des images uniques de haute qualité à partir de textes. Parfait pour le concept art, les avatars et l\'inspiration.',
        mangaStudioTitle: 'Studio de Manga',
        mangaStudioDescription: 'Créez des livres de manga complets avec personnages, pages et panneaux. Donnez vie à vos histoires, une case à la fois.',
        comingSoon: 'Bientôt disponible',
    },
    imageStudio: {
        title: 'Studio d\'Image',
        promptPlaceholder: 'Un chat cyberpunk avec des lunettes de soleil, fond de ville néon...',
        quickStyles: 'Styles Rapides',
        aspectRatio: 'Format d\'Image',
        generating: 'Génération...',
        generate: 'Générer',
        galleryTitle: 'Votre Galerie',
        galleryEmpty: 'Vos images générées apparaîtront ici.',
    },
    mangaStudio: {
        title: 'Studio de Manga',
        newProject: 'Nouveau Projet',
        untitledProjectBase: 'Manga sans titre',
        noProjects: 'Vos projets de manga apparaîtront ici. Créez-en un nouveau pour commencer !',
        lastUpdated: 'Dernière mise à jour',
        openEditor: 'Ouvrir l\'Éditeur',
        deleteProject: 'Supprimer le Projet',
        confirmDeleteProject: 'Êtes-vous sûr de vouloir supprimer définitivement ce projet ? Cette action est irréversible.',
        deleteCharacter: 'Supprimer le Personnage',
        backToProjects: 'Retour aux Projets',
        pages: 'Pages',
        characters: 'Personnages',
        page: 'Page',
        newPage: 'Nouvelle Page',
        newCharacter: 'Nouveau Personnage',
        noCharacters: "Aucun personnage créé pour l'instant. Ajoutez-en un pour construire votre casting !",
        confirmDeleteCharacter: "Êtes-vous sûr de vouloir supprimer ce personnage ? Cette action est irréversible.",
        emptyPanel: 'Case Vide',
        addPanel: 'Ajouter une Case à la Page',
        selectPage: 'Sélectionnez ou créez une page pour commencer.',
        inspector: 'Inspecteur',
        panelPrompt: 'Prompt de la Case',
        panelPromptPlaceholder: 'Un héros contemplant une ville néon...',
        addCharacterToPrompt: 'Ajouter un Personnage au Prompt',
        createCharacterHint: 'Créez un personnage pour l\'ajouter ici.',
        generateImage: 'Générer l\'Image',
        dialogue: 'Dialogue',
        dialoguePlaceholder: 'Il est temps d\'en finir...',
        selectPanel: 'Sélectionnez une case pour modifier ses propriétés.',
    },
    characterModal: {
        editTitle: 'Modifier le Personnage',
        createTitle: 'Créer un Nouveau Personnage',
        saveButton: 'Enregistrer les Changements',
        createButton: 'Créer le Personnage',
        nameLabel: 'Nom du Personnage',
        namePlaceholder: 'ex: Kaito Shadowblade',
        descriptionLabel: 'Apparence & Personnalité (Prompt)',
        descriptionPlaceholder: 'ex: cheveux argentés, œil cybernétique, calme et posé, porte un trench-coat noir',
        avatarLabel: 'Avatar',
        avatarDescription: 'Générez un avatar basé sur le nom et la description.',
        generateAvatarButton: 'Générer l\'Avatar',
        alert: 'Veuillez remplir tous les champs et générer un avatar.',
    },
    confirmModal: {
        title: 'Êtes-vous sûr(e) ?',
        confirmButton: 'Confirmer la Suppression',
        cancelButton: 'Annuler',
    },
    imageModal: {
        prompt: 'Prompt',
        generated: 'Générée le',
        download: 'Télécharger l\'Image',
    },
    account: {
        loading: 'Chargement du compte...',
        title: 'Détails du Compte',
        disclaimer: 'Ceci est une session locale anonyme. Vos données sont stockées uniquement dans votre navigateur et ne sont pas partagées.',
        creditsLabel: 'Crédits Actuels',
        resetLabel: 'Réinitialisation des crédits le',
        backButton: 'Retour au Tableau de Bord',
    },
    errors: {
        sessionError: "Impossible d'initialiser la session. Veuillez vérifier votre connexion ou désactiver les bloqueurs de publicité et réessayer.",
        mustBeLoggedIn: "Session non active. Veuillez actualiser.",
        notEnoughCredits: "Pas assez de crédits.",
        generationFailed: "La génération de l'image a échoué. Veuillez réessayer plus tard.",
        unexpected: 'Une erreur inattendue est survenue.',
    },
  }
};

type Language = 'en' | 'fr';

let currentLanguage: Language = 'en';

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
};

// Helper function to navigate nested object with dot notation
const getNestedValue = (obj: any, path: string): string | undefined => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const t = (key: string): string => {
  const translated = getNestedValue(translations[currentLanguage], key);
  if (translated) {
    return translated;
  }

  // Fallback to English if translation is missing in the current language
  const fallback = getNestedValue(translations.en, key);
  if (fallback) {
    return fallback;
  }

  // Return the key itself if not found anywhere
  return key;
};
