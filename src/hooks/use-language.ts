"use client";

import { useCallback } from "react";
import { translations, type Language, type TranslationKey } from "@/lib/i18n";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

export function useLanguage() {
  const [language, setLanguage] = useLocalStorageState<Language>("sgm.language", "th");
  const t = useCallback((key: TranslationKey) => translations[language][key], [language]);

  return { language, setLanguage, t };
}
