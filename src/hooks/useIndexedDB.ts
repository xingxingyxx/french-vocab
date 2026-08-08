import { useState, useCallback, useEffect } from 'react';
import type { DailyProgress, UserStats } from '../types';

const DB_NAME = 'french-vocab-db';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'date' });
        }
        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('IndexedDB blocked'));
    } catch (err) {
      reject(err);
    }
  });
}

// Memory fallback when IndexedDB is unavailable
const memoryStore: Record<string, any> = {};

async function getFromStore(storeName: string, key: string): Promise<any> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => {
        db.close();
        resolve(request.result);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    // Fallback to memory store
    const cacheKey = `${storeName}:${key}`;
    return memoryStore[cacheKey] || null;
  }
}

async function putInStore(storeName: string, value: any): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(value);
      request.onsuccess = () => {
        db.close();
        resolve();
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    // Fallback to memory store
    const key = value.date || value.id || 'default';
    const cacheKey = `${storeName}:${key}`;
    memoryStore[cacheKey] = value;
  }
}

async function getAllFromStore(storeName: string): Promise<any[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => {
        db.close();
        resolve(request.result);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    // Fallback to memory store
    return Object.entries(memoryStore)
      .filter(([k]) => k.startsWith(`${storeName}:`))
      .map(([, v]) => v);
  }
}

export function useIndexedDB() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Set a timeout to avoid hanging if IndexedDB is slow
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 2000);

    openDB()
      .then(() => setIsReady(true))
      .catch(() => {
        // IndexedDB not available - use memory fallback
        console.warn('IndexedDB unavailable, using memory storage');
        setIsReady(true);
      })
      .finally(() => clearTimeout(timeout));

    return () => clearTimeout(timeout);
  }, []);

  const getProgress = useCallback(async (date: string): Promise<DailyProgress | null> => {
    return getFromStore('progress', date);
  }, []);

  const saveProgress = useCallback(async (progress: DailyProgress): Promise<void> => {
    await putInStore('progress', progress);
  }, []);

  const getAllProgress = useCallback(async (): Promise<DailyProgress[]> => {
    return getAllFromStore('progress');
  }, []);

  const getStats = useCallback(async (): Promise<UserStats | null> => {
    return getFromStore('stats', 'user');
  }, []);

  const saveStats = useCallback(async (stats: UserStats): Promise<void> => {
    await putInStore('stats', { ...stats, id: 'user' });
  }, []);

  return {
    isReady,
    getProgress,
    saveProgress,
    getAllProgress,
    getStats,
    saveStats,
  };
}
