"use client";
import { useLang } from "@/lib/i18n/provider";
import { cx } from "@/lib/format";

export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div className={cx("inline-flex rounded-pill border border-line bg-card p-1", className)} role="group" aria-label="Language">
      {(["en", "ar"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cx("rounded-pill px-3 py-1.5 text-[13px] font-semibold transition-colors", lang === l ? "bg-ink text-card" : "text-ink hover:bg-paper-2")}
          lang={l}
        >
          {l === "en" ? "EN" : "ع"}
        </button>
      ))}
    </div>
  );
}
