import { useEffect, useState, useCallback } from "react";

export type Lang = "pt" | "en";

const STORAGE_KEY = "lang";
const EVENT = "lang-change";

function readLang(): Lang {
  if (typeof window === "undefined") return "pt";
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "en" ? "en" : "pt";
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    setLangState(readLang());
    const onChange = () => setLangState(readLang());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    window.dispatchEvent(new Event(EVENT));
    setLangState(l);
  }, []);

  return [lang, setLang];
}
