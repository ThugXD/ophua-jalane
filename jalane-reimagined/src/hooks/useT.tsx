import { useCallback } from "react";
import { useLang } from "@/hooks/useLang";
import { translations, type TranslationKey } from "@/i18n/translations";

export function useT() {
  const [lang] = useLang();
  const t = useCallback(
    (key: TranslationKey): string => translations[key][lang],
    [lang],
  );
  return { t, lang };
}
