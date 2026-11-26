import {
  ApiKeys,
  GeneratedImage,
  ImagineThread,
  ThemeMode,
} from '../types/studio';

const DB_NAME = 'lumina_studio_db';
const DB_VERSION = 2;
const STORE_IMAGES = 'images';
const STORE_THREADS = 'threads';
const KEYS_STORAGE = 'lumina_studio_api_keys_v1';
const THEME_STORAGE = 'lumina_studio_theme_v1';

export const DEFAULT_API_KEYS: ApiKeys = {
  pollinationsKey: '',
  geminiKey: '',
  openaiKey: '',
  huggingfaceKey: '',
  aihordeKey: '',
};

export function loadApiKeys(): ApiKeys {
  try {
    const raw = localStorage.getItem(KEYS_STORAGE);
    if (!raw) return { ...DEFAULT_API_KEYS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_API_KEYS, ...parsed };
  } catch {
    return { ...DEFAULT_API_KEYS };
  }
}

export function saveApiKeys(keys: ApiKeys): void {
  try {
    localStorage.setItem(KEYS_STORAGE, JSON.stringify(keys));
  } catch {
    // Ignore
  }
}

export function loadTheme(): ThemeMode {
  try {
    const val = localStorage.getItem(THEME_STORAGE);
    if (val === 'light' || val === 'dark') return val;
  } catch {
    // Ignore
  }
  return 'dark';
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE, theme);
  } catch {
    // Ignore
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        const store = db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_THREADS)) {
        const tStore = db.createObjectStore(STORE_THREADS, { keyPath: 'id' });
        tStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadSavedImages(): Promise<GeneratedImage[]> {
  try {
    const db = await openDatabase();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_IMAGES, 'readonly');
      const request = tx.objectStore(STORE_IMAGES).getAll();
      request.onsuccess = () => {
        const items = (request.result as GeneratedImage[]) || [];
        items.sort((a, b) => b.createdAt - a.createdAt);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function saveImageRecord(image: GeneratedImage): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_IMAGES, 'readwrite');
      tx.objectStore(STORE_IMAGES).put(image);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore
  }
}

export async function deleteImageRecord(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_IMAGES, 'readwrite');
      tx.objectStore(STORE_IMAGES).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore
  }
}

export async function clearAllImages(): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_IMAGES, 'readwrite');
      tx.objectStore(STORE_IMAGES).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore
  }
}

export async function loadSavedThreads(): Promise<ImagineThread[]> {
  try {
    const db = await openDatabase();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_THREADS, 'readonly');
      const request = tx.objectStore(STORE_THREADS).getAll();
      request.onsuccess = () => {
        const items = (request.result as ImagineThread[]) || [];
        items.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function saveThreadRecord(thread: ImagineThread): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_THREADS, 'readwrite');
      tx.objectStore(STORE_THREADS).put(thread);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore
  }
}

export async function deleteThreadRecord(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_THREADS, 'readwrite');
      tx.objectStore(STORE_THREADS).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore
  }
}
