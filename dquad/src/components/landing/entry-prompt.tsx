"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sheet } from "@/components/ui/overlays";
import { setSession } from "@/lib/store/actions";
import { useLang } from "@/lib/i18n/provider";
import { UserCircle, Buildings } from "@phosphor-icons/react";

/** Opens when a portal redirected here without a session: /?enter=creator&next=/creator/quests */
export function EntryPrompt() {
  const params = useSearchParams();
  const router = useRouter();
  const { t } = useLang();
  const enter = params.get("enter");
  const next = params.get("next");
  const [dismissed, setDismissed] = useState<string | null>(null);
  if (!enter) return null;
  const mode = enter === "admin" ? "admin" : "creator";
  const open = (enter === "creator" || enter === "admin") && dismissed !== enter;
  const go = () => {
    setSession({ mode });
    setDismissed(enter);
    router.push(next && next.startsWith(`/${mode}`) ? next : `/${mode}`);
  };
  return (
    <Sheet
      open={open}
      onClose={() => {
        setDismissed(enter);
        router.replace("/");
      }}
      title={mode === "creator" ? t.hero.ctaCreator : t.hero.ctaBrand}
      footer={
        <button className="btn-grass" onClick={go} autoFocus>
          {mode === "creator" ? <UserCircle size={20} weight="bold" /> : <Buildings size={20} weight="bold" />}
          {mode === "creator" ? t.nav.creatorView : t.nav.brandView}
        </button>
      }
    >
      <p className="text-[14.5px] text-stone">{t.hero.note}</p>
      <p className="mt-2 text-[14.5px] text-stone">{mode === "creator" ? "You will enter as Layla Al Mansoori, a verified creator in Dubai with campaigns, quests and points already in motion." : "You will enter as a Super Admin. Switch roles from the menu to see how permissions change."}</p>
    </Sheet>
  );
}
