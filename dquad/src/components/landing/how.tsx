"use client";
import { EnvelopeOpen, NotePencil, UploadSimple, ChatsCircle, ShareNetwork, Gift } from "@phosphor-icons/react";
import { useLang } from "@/lib/i18n/provider";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { ACCENT } from "@/components/ui/accent";
import type { Accent } from "@/lib/store/types";

const ICONS = [EnvelopeOpen, NotePencil, UploadSimple, ChatsCircle, ShareNetwork, Gift];
const TONES: Accent[] = ["coral", "sky", "sun", "mint", "berry", "amber"];

/** Six steps on a horizontal paper path. Scroll-snap rail on small screens. */
export function HowItWorks() {
  const { t } = useLang();
  return (
    <section id="how" className="scroll-mt-24 border-y border-line bg-paper-2 py-24 sm:py-32" aria-labelledby="how-title">
      <div className="container-x">
        <Reveal>
          <h2 id="how-title" className="display-lg max-w-[16ch] text-balance">
            {t.how.title}
          </h2>
        </Reveal>
      </div>
      <div className="relative mt-12">
        <span className="pointer-events-none absolute inset-x-0 top-[52px] hidden h-px bg-line-strong lg:block" aria-hidden />
        <Stagger as="ol" className="rail container-x flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-6 lg:overflow-visible">
          {t.how.steps.map((step, i) => {
            const Icon = ICONS[i];
            const a = ACCENT[TONES[i]];
            return (
              <StaggerItem key={step.t} as="li" className="w-[260px] shrink-0 snap-start lg:w-auto">
                <div className="relative flex h-full flex-col rounded-card border border-line bg-card p-5 pt-24">
                  <span className="absolute start-5 top-5 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: a.softHex, color: a.hex }} aria-hidden>
                    <Icon size={26} weight="fill" />
                  </span>
                  <span className="absolute end-5 top-5 font-display text-[44px] font-bold leading-none text-ink/8" aria-hidden>
                    {i + 1}
                  </span>
                  <h3 className="display-sm mt-2">{step.t}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-stone">{step.b}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
