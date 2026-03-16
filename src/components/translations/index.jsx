import { en } from './en';
import { it } from './it';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { ar } from './ar';

export const translations = { en, it, es, fr, de, ar };

export const useTranslation = (lang = 'en') => {
  return (key) => translations[lang]?.[key] || translations.en[key] || key;
};