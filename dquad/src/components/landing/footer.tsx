"use client";
import { useState } from "react";
import { useLang } from "@/lib/i18n/provider";
import { DemoEntryButtons } from "@/components/shell/demo-entry";
import { Reveal } from "@/components/motion";
import { Sheet, useToast } from "@/components/ui/overlays";
import { resetDemo } from "@/lib/store/actions";
import { Leaf } from "@/components/art/scenes";

export function SunshineFooter() {
  const { t } = useLang();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState(false);
  return (
    <footer className="relative mt-10 overflow-hidden bg-sun pb-28 pt-24 sm:pb-16" aria-labelledby="footer-title">
      <span className="pointer-events-none absolute -top-40 end-[8%] h-80 w-80 rounded-full bg-card/60 anim-spin-slow" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="absolute left-1/2 top-1/2 h-1.5 w-48 origin-left bg-card/60" style={{ transform: `rotate(${i * 30}deg)` }} />
        ))}
      </span>
      <Leaf className="pointer-events-none absolute -start-6 bottom-10 anim-wiggle" style={{ width: 90, transform: "rotate(-20deg)" }} color="var(--color-grass)" />
      <div className="container-x relative">
        <Reveal>
          <h2 id="footer-title" className="display-lg max-w-[14ch] text-balance">
            {t.footer.title}
          </h2>
          <p className="mt-4 max-w-[60ch] text-[16px] leading-relaxed text-ink/80">{t.footer.body}</p>
        </Reveal>
        <Reveal delay={0.1} className="mt-8">
          <DemoEntryButtons large />
        </Reveal>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink/20 pt-6 text-[13px]">
          <span className="font-semibold">{t.footer.legal}</span>
          <button className="btn-ghost btn-sm underline underline-offset-4" onClick={() => setConfirm(true)}>
            {t.footer.reset}
          </button>
        </div>
      </div>
      <Sheet
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t.common.resetDemo}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setConfirm(false)}>{t.common.cancel}</button>
            <button
              className="btn-ink"
              onClick={() => {
                resetDemo();
                setConfirm(false);
                toast("Demo reset", "Seeded scenario restored.");
              }}
            >
              {t.common.confirm}
            </button>
          </>
        }
      >
        <p className="text-[14.5px] text-stone">Every campaign, submission, point and parcel goes back to the seeded scenario.</p>
      </Sheet>
    </footer>
  );
}
