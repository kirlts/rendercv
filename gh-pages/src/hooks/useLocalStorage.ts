import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T, debounceMs: number = 0): [T, (val: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const saveToStorage = () => {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(error);
      }
    };

    if (debounceMs > 0) {
      timeoutId = setTimeout(saveToStorage, debounceMs);
    } else {
      saveToStorage();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [key, storedValue, debounceMs]);

  return [storedValue, setStoredValue];
}
