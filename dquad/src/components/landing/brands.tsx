"use client";
import { useLang } from "@/lib/i18n/provider";
import { useAppState } from "@/lib/store/hooks";
import { Reveal, Stagger, StaggerItem, Tilt } from "@/components/motion";
import { Art, PaperScene } from "@/components/art/scenes";
import { Pack } from "@/components/art/pack";
import { ACCENT } from "@/components/ui/accent";
import { cx } from "@/lib/format";

/** Editorial mosaic: three illustrated moments plus nine pack tiles. Twelve cells, twelve brands. */
const MOMENTS: Record<string, { art: string; span: string }> = {
  b_amla: { art: "momentHair", span: "col-span-2 row-span-2" },
  b_honey: { art: "momentBreakfast", span: "col-span-2" },
  b_herbl: { art: "momentSmile", span: "" },
};

export function BrandShowcase() {
  const { t } = useLang();
  const s = useAppState();
  return (
    <section id="brands" className="container-x scroll-mt-24 py-24 sm:py-32" aria-labelledby="brands-title">
      <Reveal>
        <h2 id="brands-title" className="display-lg max-w-[18ch] text-balance">
          {t.brands.title}
        </h2>
        <p className="lede mt-4 max-w-[54ch]">{t.brands.body}</p>
      </Reveal>

      <Stagger as="ul" className="mt-10 grid auto-rows-[170px] grid-cols-2 gap-4 sm:auto-rows-[200px] sm:grid-cols-4 [grid-auto-flow:dense]" amount={0.1}>
        {s.brands.map((b) => {
          const moment = MOMENTS[b.id];
          const a = ACCENT[b.accent];
          return (
            <StaggerItem key={b.id} as="li" className={cx(moment?.span)}>
              <Tilt max={7} className="h-full">
                <div className="relative h-full overflow-hidden rounded-card border border-line bg-card">
                  {moment ? (
                    <>
                      <Art id={moment.art} alt={`${b.name} product moment`} className="h-full w-full" fallback={<PaperScene accent={b.accent} shape={b.packShape} label={b.name.replace("Dabur ", "")} />} />
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                        <span className="rounded-pill bg-paper/80 px-3 py-1 font-display text-[15px] font-bold backdrop-blur-sm">{b.name}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-end p-4" style={{ background: `radial-gradient(ellipse at 50% 25%, ${a.softHex}, rgba(25,31,27,0) 70%)` }}>
                      <div className="absolute inset-x-0 top-5 flex justify-center">
                        <Pack shape={b.packShape} accent={b.accent} label={b.name.replace("Dabur ", "")} size={62} tilt={-6} />
                      </div>
                      <span className="font-display text-[15px] font-bold">{b.name}</span>
                      <span className="mt-0.5 text-[12px] text-stone">{b.tagline}</span>
                    </div>
                  )}
                </div>
              </Tilt>
            </StaggerItem>
          );
        })}
      </Stagger>
      <p className="mt-5 text-[12.5px] text-stone">{t.brands.caveat}</p>
    </section>
  );
}
