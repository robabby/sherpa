"use client";

import { useState, useCallback, useSyncExternalStore } from "react";

/**
 * Persists a boolean value to localStorage with SSR-safe hydration.
 *
 * Uses useSyncExternalStore to avoid hydration mismatches — server
 * always returns `defaultValue`, client reads from localStorage.
 *
 * @returns [value, setValue] tuple matching the useState signature
 */
export function usePersistedState(
  storageKey: string,
  defaultValue: boolean,
): [boolean, (value: boolean) => void] {
  const key = `collapsible-${storageKey}`;

  const subscribe = useCallback(
    (callback: () => void) => {
      const handler = (e: StorageEvent) => {
        if (e.key === key) callback();
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
    [key],
  );

  const getSnapshot = useCallback(() => {
    const stored = localStorage.getItem(key);
    return stored === null ? defaultValue : stored === "true";
  }, [key, defaultValue]);

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  const persisted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const [value, setValueState] = useState(persisted);

  const setValue = useCallback(
    (newValue: boolean) => {
      setValueState(newValue);
      localStorage.setItem(key, String(newValue));
    },
    [key],
  );

  return [value, setValue];
}
