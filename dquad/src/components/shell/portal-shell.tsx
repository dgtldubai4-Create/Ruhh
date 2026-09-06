"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Icon } from "@phosphor-icons/react";
import { InboxButton } from "./inbox";
import { RoleMenu } from "./menu";
import { useAppState, useHydrated } from "@/lib/store/hooks";
import { useLang } from "@/lib/i18n/provider";
import { cx } from "@/lib/format";
import { SimTag } from "@/components/ui/primitives";

export type NavItem = { href: string; label: string; icon: Icon };

/**
 * Shared shell for the creator and admin portals: floating pill nav on
 * desktop, bottom pill nav on mobile, inbox drawer and role menu.
 */
export function PortalShell({ mode, items, children, accent = "grass" }: { mode: "creator" | "admin"; items: NavItem[]; children: React.ReactNode; accent?: "grass" | "ink" }) {
  const path = usePathname();
  const router = useRouter();
  const s = useAppState();
  const hydrated = useHydrated();
  const { t } = useLang();

  // Demo entry gate: enter through the landing page if there is no session for this mode.
  useEffect(() => {
    if (hydrated && s.session.mode !== mode) {
      router.replace(`/?enter=${mode}`);
    }
  }, [hydrated, s.session.mode, mode, router]);

  const isActive = (href: string) => (href === `/${mode}` ? path === href : path.startsWith(href));

  return (
    <div className="min-h-dvh pb-24 md:pb-10">
      <header className="sticky top-0 z-40 flex justify-center px-3 pt-3 sm:px-5">
        <div className="pill-nav w-full max-w-[1280px] justify-between bg-card">
          <Link href={`/${mode}`} className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-pill ps-2 pe-3 py-1.5 font-display text-[16px] font-bold">
            <span className={cx("inline-block h-6 w-6 rounded-[100%_0_100%_0]", accent === "grass" ? "bg-grass" : "bg-ink")} aria-hidden />
            <span className="hidden sm:inline">{t.brand}</span>
            <span className="hidden whitespace-nowrap text-[12px] font-semibold text-stone xl:inline">{mode === "creator" ? t.nav.creatorView : t.nav.brandView}</span>
          </Link>
          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Portal">
            {items.map((it) => (
              <Link key={it.href} href={it.href} className={cx("pill-link inline-flex items-center gap-1.5 whitespace-nowrap", isActive(it.href) && "pill-link-active")} aria-current={isActive(it.href) ? "page" : undefined}>
                <it.icon size={17} weight={isActive(it.href) ? "fill" : "regular"} />
                {it.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden lg:inline"><SimTag>{t.common.simulated}</SimTag></span>
            <InboxButton audience={mode} />
            <RoleMenu mode={mode} />
          </div>
        </div>
      </header>

      <main className="container-x pt-6 sm:pt-8">{children}</main>

      <nav className="fixed inset-x-3 bottom-3 z-40 md:hidden" aria-label="Portal mobile">
        <div className="pill-nav w-full justify-between bg-card">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className={cx("flex flex-1 flex-col items-center gap-0.5 rounded-pill px-1 py-1.5 text-[10.5px] font-semibold", isActive(it.href) ? "bg-ink text-card" : "text-ink")} aria-current={isActive(it.href) ? "page" : undefined}>
              <it.icon size={20} weight={isActive(it.href) ? "fill" : "regular"} />
              {it.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function PageHeader({ title, lede, aside, children }: { title: React.ReactNode; lede?: React.ReactNode; aside?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display-lg">{title}</h1>
        {lede && <p className="lede mt-2 max-w-[62ch]">{lede}</p>}
        {children}
      </div>
      {aside && <div className="flex shrink-0 flex-wrap gap-2">{aside}</div>}
    </div>
  );
}
