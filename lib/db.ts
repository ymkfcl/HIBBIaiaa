
import { GeneratedImage, MangaProject, StoredUser } from '../types.ts';

const DB_NAME = 'HibbiDB';
const DB_VERSION = 3; // Incremented version for schema change
const LOCAL_KEY = 'local';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject("Error opening DB");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Clean up old stores if they exist
      if (db.objectStoreNames.contains('images')) db.deleteObjectStore('images');
      if (db.objectStoreNames.contains('projects')) db.deleteObjectStore('projects');
      if (db.objectStoreNames.contains('users')) db.deleteObjectStore('users');
      
      // Create new stores
      db.createObjectStore('images', { keyPath: 'id' });
      db.createObjectStore('projects', { keyPath: 'id' });
      db.createObjectStore('users', { keyPath: 'id' });
    };
  });
};

// --- IMAGES ---

type ImageRecord = {
    id: string;
    images: GeneratedImage[];
}

export const saveImage = async (image: GeneratedImage): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction('images', 'readwrite');
    const store = transaction.objectStore('images');
    
    return new Promise((resolve, reject) => {
        const getRequest = store.get(LOCAL_KEY);
        getRequest.onsuccess = () => {
            const data: ImageRecord = getRequest.result || { id: LOCAL_KEY, images: [] };
            data.images.unshift(image); // Add to the beginning
            store.put(data);
        };
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getImages = async (): Promise<GeneratedImage[]> => {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction('images', 'readonly');
        const store = transaction.objectStore('images');
        const request = store.get(LOCAL_KEY);

        request.onsuccess = () => {
            resolve(request.result ? request.result.images : []);
        };
    });
};

// --- PROJECTS ---

type ProjectRecord = {
    id: string;
    projects: MangaProject[];
}

export const saveProjects = async (projects: MangaProject[]): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction('projects', 'readwrite');
    const store = transaction.objectStore('projects');
    store.put({ id: LOCAL_KEY, projects });

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getProjects = async (): Promise<MangaProject[]> => {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction('projects', 'readonly');
        const store = transaction.objectStore('projects');
        const request = store.get(LOCAL_KEY);

        request.onsuccess = () => {
            resolve(request.result ? request.result.projects : []);
        };
    });
};

// --- USERS ---
type StoredUserWithId = StoredUser & { id: string };

export const saveUser = async (user: StoredUser): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction('users', 'readwrite');
    const store = transaction.objectStore('users');
    store.put({ ...user, id: LOCAL_KEY });
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getUser = async (): Promise<StoredUser | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('users', 'readonly');
        const store = transaction.objectStore('users');
        const request = store.get(LOCAL_KEY);
        request.onsuccess = () => {
            resolve(request.result || null);
        };
        request.onerror = () => reject("Error fetching user");
    });
};