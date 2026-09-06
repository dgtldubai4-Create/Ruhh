"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { LangSwitch } from "./lang-switch";
import { useLang } from "@/lib/i18n/provider";
import { cx } from "@/lib/format";
import { DemoEntryButtons } from "./demo-entry";

const SECTIONS = ["campaigns", "quests", "how", "growth", "brands"] as const;

export function LandingNav() {
  const { t } = useLang();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const labels: Record<(typeof SECTIONS)[number], string> = { campaigns: t.nav.campaigns, quests: t.nav.quests, how: t.nav.how, growth: t.nav.growth, brands: t.nav.brands };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={cx("pill-nav w-full max-w-[1100px] justify-between transition-[padding,background-color] duration-300", scrolled ? "bg-card" : "bg-card/80")}
        aria-label="Primary"
      >
        <Link href="/" className="flex items-center gap-2 rounded-pill ps-2 pe-3 py-1.5 font-display text-[17px] font-bold">
          <span className="inline-block h-6 w-6 rounded-[100%_0_100%_0] bg-grass" aria-hidden />
          {t.brand}
        </Link>
        <div className="hidden items-center gap-0.5 lg:flex">
          {SECTIONS.map((id) => (
            <a key={id} href={`#${id}`} className={cx("pill-link", active === id && "pill-link-active")}>
              {labels[id]}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <LangSwitch />
          <DemoEntryButtons compact />
        </div>
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-pill lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
          {open ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
        </button>
      </nav>
      {open && (
        <div className="absolute inset-x-4 top-[72px] rounded-card border-2 border-ink bg-card p-4 lg:hidden" style={{ boxShadow: "6px 6px 0 0 var(--color-ink)" }}>
          <div className="flex flex-col gap-1">
            {SECTIONS.map((id) => (
              <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="pill-link">
                {labels[id]}
              </a>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
            <LangSwitch />
            <DemoEntryButtons />
          </div>
        </div>
      )}
    </header>
  );
}
