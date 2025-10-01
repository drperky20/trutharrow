import { useState, useEffect } from 'react';

const ALIAS_STORAGE_KEY = 'trutharrow:lastAlias';

export const useAlias = () => {
  const [alias, setAliasState] = useState<string>('');

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem(ALIAS_STORAGE_KEY);
    if (saved) {
      setAliasState(saved);
    }
  }, []);

  const setAlias = (value: string) => {
    const trimmed = value.trim();
    setAliasState(trimmed);
    if (trimmed) {
      localStorage.setItem(ALIAS_STORAGE_KEY, trimmed);
      // Also set cookie for cross-tab sync
      document.cookie = `${ALIAS_STORAGE_KEY}=${encodeURIComponent(trimmed)}; path=/; max-age=31536000`;
    }
  };

  return { alias, setAlias };
};
