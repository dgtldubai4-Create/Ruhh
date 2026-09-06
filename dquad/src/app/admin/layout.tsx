"use client";
import { SquaresFour, Megaphone, UsersThree, Eye, Truck, Coins, Package } from "@phosphor-icons/react";
import { PortalShell } from "@/components/shell/portal-shell";
import { useLang } from "@/lib/i18n/provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const items = [
    { href: "/admin", label: t.admin.overview, icon: SquaresFour },
    { href: "/admin/campaigns", label: t.admin.campaigns, icon: Megaphone },
    { href: "/admin/creators", label: t.admin.creators, icon: UsersThree },
    { href: "/admin/review", label: t.admin.review, icon: Eye },
    { href: "/admin/logistics", label: t.admin.logistics, icon: Truck },
    { href: "/admin/loyalty", label: t.admin.loyalty, icon: Coins },
    { href: "/admin/products", label: t.admin.products, icon: Package },
  ];
  return (
    <PortalShell mode="admin" items={items} accent="ink">
      {children}
    </PortalShell>
  );
}
