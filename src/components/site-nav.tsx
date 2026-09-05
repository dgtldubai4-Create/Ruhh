"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart-context";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order" },
  { href: "/track", label: "Track" },
  { href: "/custom-cakes", label: "Custom" },
];

export function CartPill() {
  const { count, hydrated } = useCart();
  return (
    <Link href="/order" className="flex shrink-0 items-center gap-1.5 rounded-full bg-rose-deep px-3.5 py-1.5 text-[12px] text-white" aria-label="View cart">
      Cart
      <span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-rose-deep">
        {hydrated ? count : 0}
      </span>
    </Link>
  );
}

export function NavTabs() {
  const path = usePathname();
  return (
    <div className="order-3 flex w-full justify-between gap-0.5" role="tablist">
      {TABS.map((t) => {
        const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            role="tab"
            aria-selected={active}
            className={`flex-1 rounded-full px-2 py-1.5 text-center text-[12px] transition ${active ? "bg-rose font-bold text-rose-deep" : "text-muted hover:text-rose-deep"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
