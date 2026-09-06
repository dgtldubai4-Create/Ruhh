import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories, getMenu, getSettings } from "@/lib/data";
import { MenuBrowser } from "@/components/menu-browser";

export const revalidate = 60;
export const metadata: Metadata = { title: "Menu" };

export default async function MenuPage() {
  const [items, cats, settings] = await Promise.all([getMenu(), getCategories(), getSettings()]);
  return (
    <Suspense fallback={null}>
      <MenuBrowser items={items} categories={cats} settings={settings} />
    </Suspense>
  );
}
