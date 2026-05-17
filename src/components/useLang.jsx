// Re-export from global LangContext so all existing imports keep working.
// Language is now shared across all pages via React context.
export { useLang } from '@/lib/LangContext';