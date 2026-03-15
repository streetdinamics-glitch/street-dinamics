import { useState } from 'react';

const LANG_KEY = 'sd_lang';

export function useLang() {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || 'en'; } catch { return 'en'; }
  });

  const setLang = (newLang) => {
    try { localStorage.setItem(LANG_KEY, newLang); } catch {}
    setLangState(newLang);
  };

  return [lang, setLang];
}