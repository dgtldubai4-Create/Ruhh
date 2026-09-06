"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { dictionaries, type Dictionary, type Lang } from "./dictionary";

type Ctx = { lang: Lang; dir: "ltr" | "rtl"; t: Dictionary; setLang: (l: Lang) => void; toggle: () => void };
const LangContext = createContext<Ctx | null>(null);
const KEY = "dquad.lang";

/* Tiny external store so the persisted language is read without setState-in-effect. */
const listeners = new Set<() => void>();
function readLang(): Lang {
  try {
    const stored = window.localStorage.getItem(KEY);
    return stored === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}
function writeLang(l: Lang) {
  try {
    window.localStorage.setItem(KEY, l);
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readLang, () => "en" as Lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: Lang) => writeLang(l), []);

  const value = useMemo<Ctx>(
    () => ({ lang, dir: lang === "ar" ? "rtl" : "ltr", t: dictionaries[lang], setLang, toggle: () => setLang(lang === "ar" ? "en" : "ar") }),
    [lang, setLang],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
