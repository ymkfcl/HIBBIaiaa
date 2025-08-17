import { GeneratedImage, MangaProject, StoredUser } from '../types';

const DB_NAME = 'HibbiDB';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject("Error opening DB");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'userEmail' });
      }
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'userEmail' });
      }
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'email' });
      }
    };
  });
};

// --- IMAGES ---

type ImageRecord = {
    userEmail: string;
    images: GeneratedImage[];
}

export const saveImage = async (userEmail: string, image: GeneratedImage): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction('images', 'readwrite');
    const store = transaction.objectStore('images');
    
    return new Promise((resolve, reject) => {
        const getRequest = store.get(userEmail);
        getRequest.onsuccess = () => {
            const data: ImageRecord = getRequest.result || { userEmail, images: [] };
            data.images.unshift(image); // Add to the beginning
            store.put(data);
        };
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getImages = async (userEmail: string): Promise<GeneratedImage[]> => {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction('images', 'readonly');
        const store = transaction.objectStore('images');
        const request = store.get(userEmail);

        request.onsuccess = () => {
            resolve(request.result ? request.result.images : []);
        };
    });
};

// --- PROJECTS ---

type ProjectRecord = {
    userEmail: string;
    projects: MangaProject[];
}

export const saveProjects = async (userEmail: string, projects: MangaProject[]): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction('projects', 'readwrite');
    const store = transaction.objectStore('projects');
    store.put({ userEmail, projects });

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getProjects = async (userEmail: string): Promise<MangaProject[]> => {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction('projects', 'readonly');
        const store = transaction.objectStore('projects');
        const request = store.get(userEmail);

        request.onsuccess = () => {
            resolve(request.result ? request.result.projects : []);
        };
    });
};

// --- USERS ---

export const saveUser = async (user: StoredUser): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction('users', 'readwrite');
    const store = transaction.objectStore('users');
    store.put(user);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getUser = async (email: string): Promise<StoredUser | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('users', 'readonly');
        const store = transaction.objectStore('users');
        const request = store.get(email);
        request.onsuccess = () => {
            resolve(request.result || null);
        };
        request.onerror = () => reject("Error fetching user");
    });
};
