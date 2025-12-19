const CACHE_PREFIX = 'identity_asset_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheData<T> {
  data: T;
  timestamp: number;
}

export const storageUtils = {
  set: <T>(key: string, data: T): void => {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheData));
  },

  get: <T>(key: string): T | null => {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    try {
      const cacheData: CacheData<T> = JSON.parse(cached);
      const now = Date.now();

      if (now - cacheData.timestamp > CACHE_DURATION) {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }

      return cacheData.data;
    } catch {
      return null;
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  },

  clear: (): void => {
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  },

  setPreference: (key: string, value: any): void => {
    localStorage.setItem(`${CACHE_PREFIX}pref_${key}`, JSON.stringify(value));
  },

  getPreference: <T>(key: string, defaultValue: T): T => {
    const stored = localStorage.getItem(`${CACHE_PREFIX}pref_${key}`);
    if (!stored) return defaultValue;

    try {
      return JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  },
};
