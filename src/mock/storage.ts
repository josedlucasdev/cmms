/**
 * Wrapper sobre `localStorage` con namespace `promaintenance:*` y soporte JSON.
 * En SSR o pruebas donde `localStorage` no exista, cae a un Map en memoria.
 */

const memoryStore = new Map<string, string>();
const NS = 'promaintenance:';

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

export const storage = {
  get<T>(key: string, fallback: T): T {
    const fullKey = NS + key;
    try {
      const raw = hasLocalStorage()
        ? window.localStorage.getItem(fullKey)
        : memoryStore.get(fullKey) ?? null;
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    const fullKey = NS + key;
    const raw = JSON.stringify(value);
    if (hasLocalStorage()) {
      window.localStorage.setItem(fullKey, raw);
    } else {
      memoryStore.set(fullKey, raw);
    }
  },

  remove(key: string): void {
    const fullKey = NS + key;
    if (hasLocalStorage()) {
      window.localStorage.removeItem(fullKey);
    } else {
      memoryStore.delete(fullKey);
    }
  },

  clearAll(): void {
    if (hasLocalStorage()) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(NS)) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    }
    memoryStore.clear();
  },
};
