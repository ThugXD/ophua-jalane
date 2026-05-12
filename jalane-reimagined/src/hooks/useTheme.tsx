import { useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const EVENT = "theme-change";

function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "light" ? "light" : "dark";
}

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const initial = readTheme();
    setThemeState(initial);
    applyTheme(initial);
    const onChange = () => {
      const next = readTheme();
      setThemeState(next);
      applyTheme(next);
    };
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
    setThemeState(t);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [theme, setTheme];
}
