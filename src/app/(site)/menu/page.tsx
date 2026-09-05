import type { Metadata } from "next";
import { getCategories, getMenu, getSettings } from "@/lib/data";
import { MenuBrowser } from "@/components/menu-browser";

export const revalidate = 60;
export const metadata: Metadata = { title: "Menu" };

export default async function MenuPage() {
  const [items, cats, settings] = await Promise.all([getMenu(), getCategories(), getSettings()]);
  return <MenuBrowser items={items} categories={cats} settings={settings} />;
}
