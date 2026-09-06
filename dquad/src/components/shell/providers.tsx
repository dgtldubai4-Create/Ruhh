"use client";
import { LanguageProvider } from "@/lib/i18n/provider";
import { ToastProvider } from "@/components/ui/overlays";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ToastProvider>
        <div className="paper-grain">{children}</div>
      </ToastProvider>
    </LanguageProvider>
  );
}
