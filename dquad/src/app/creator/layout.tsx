"use client";
import { House, Megaphone, Compass, Gift, UserCircle } from "@phosphor-icons/react";
import { PortalShell } from "@/components/shell/portal-shell";
import { useLang } from "@/lib/i18n/provider";

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const items = [
    { href: "/creator", label: t.creator.home, icon: House },
    { href: "/creator/campaigns", label: t.creator.campaigns, icon: Megaphone },
    { href: "/creator/quests", label: t.creator.quests, icon: Compass },
    { href: "/creator/rewards", label: t.creator.rewards, icon: Gift },
    { href: "/creator/profile", label: t.creator.profile, icon: UserCircle },
  ];
  return (
    <PortalShell mode="creator" items={items}>
      {children}
    </PortalShell>
  );
}
