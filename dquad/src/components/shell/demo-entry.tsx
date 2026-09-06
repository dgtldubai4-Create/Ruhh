"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserCircle, Buildings } from "@phosphor-icons/react";
import { setSession } from "@/lib/store/actions";
import { useLang } from "@/lib/i18n/provider";
import { cx } from "@/lib/format";

/** Demo entry: creator or brand team. Simulated auth, no credentials. */
export function DemoEntryButtons({ compact, large }: { compact?: boolean; large?: boolean }) {
  const router = useRouter();
  const { t } = useLang();
  const [busy, setBusy] = useState<"creator" | "admin" | null>(null);
  const go = (mode: "creator" | "admin") => {
    setBusy(mode);
    setSession({ mode });
    setTimeout(() => router.push(mode === "creator" ? "/creator" : "/admin"), 260);
  };
  return (
    <div className={cx("flex gap-2", large ? "flex-col sm:flex-row" : "")}>
      <button className={cx("btn-grass", compact && "btn-sm", large && "btn-lg")} onClick={() => go("creator")} disabled={busy !== null} aria-busy={busy === "creator"}>
        <UserCircle size={large ? 22 : 18} weight="bold" /> {compact ? t.nav.creatorView : t.hero.ctaCreator}
      </button>
      <button className={cx("btn-paper", compact && "btn-sm", large && "btn-lg")} onClick={() => go("admin")} disabled={busy !== null} aria-busy={busy === "admin"}>
        <Buildings size={large ? 22 : 18} weight="bold" /> {compact ? t.nav.brandView : t.hero.ctaBrand}
      </button>
    </div>
  );
}
