import React, { createContext, useContext, useState, useCallback } from 'react';

const LANG_KEY = 'sd_lang';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || 'it'; } catch { return 'it'; }
  });

  const setLang = useCallback((newLang) => {
    try { localStorage.setItem(LANG_KEY, newLang); } catch {}
    setLangState(newLang);
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return [ctx.lang, ctx.setLang];
}