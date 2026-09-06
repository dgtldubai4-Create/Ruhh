"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useLang } from "@/lib/i18n/provider";
import { Reveal, useReduce } from "@/components/motion";
import { Art, PaperScene, PointsCoin, Leaf } from "@/components/art/scenes";
import { fmtPoints } from "@/lib/format";

export function Growth() {
  const { t } = useLang();
  return (
    <section id="growth" className="container-x scroll-mt-24 py-24 sm:py-32" aria-labelledby="growth-title">
      <div className="grid items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <h2 id="growth-title" className="display-lg text-balance">
              {t.growth.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lede mt-5 max-w-[48ch]">{t.growth.body}</p>
          </Reveal>
          <ol className="mt-8 flex flex-col">
            {t.growth.tiers.map((tier, i) => (
              <Reveal key={tier.t} as="li" delay={0.15 + i * 0.08} className="flex items-start gap-4 border-t border-line py-4 last:border-b">
                <Leaf style={{ width: 28 + i * 10, transform: `rotate(${-30 + i * 15}deg)`, marginTop: 4 }} color={["var(--color-mint)", "var(--color-grass)", "var(--color-grass-deep)"][i]} />
                <div>
                  <div className="display-sm">{tier.t}</div>
                  <p className="text-[14px] text-stone">{tier.b}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-7">
          <Reveal delay={0.1}>
            <div className="card-paper overflow-hidden">
              <Art id="growthPlant" alt="Studio photograph of a creator at work" className="aspect-[16/9] w-full" fallback={<PaperScene accent="sun" shape="jar" label="Honey" />} />
            </div>
          </Reveal>
          <Reveal delay={0.2} className="mt-5">
            <LedgerDemo />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Pending to available: the loyalty moment, replayed on a loop. */
function LedgerDemo() {
  const { t } = useLang();
  const reduce = useReduce();
  const [flip, setFlip] = useState(false);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setFlip((r) => !r), 3200);
    return () => clearInterval(id);
  }, [reduce]);
  const released = reduce ? true : flip;
  const pending = released ? 0 : 1000;
  const available = released ? 1750 : 750;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-card border border-line bg-card p-5 sm:gap-6" aria-live="polite">
      <div>
        <div className="text-[12.5px] font-semibold text-stone">{t.growth.pending}</div>
        <motion.div key={`p${pending}`} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-display text-[34px] font-bold leading-none tabular">
          {fmtPoints(pending)}
        </motion.div>
      </div>
      <div className="relative flex h-16 w-24 items-center justify-center" aria-hidden>
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line-strong" />
        <motion.span className="absolute" animate={reduce ? {} : { x: released ? 34 : -34 }} transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}>
          <PointsCoin size={40} spin={!reduce} />
        </motion.span>
      </div>
      <div className="text-end">
        <div className="text-[12.5px] font-semibold text-stone">{t.growth.available}</div>
        <motion.div key={`a${available}`} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-display text-[34px] font-bold leading-none tabular text-grass">
          {fmtPoints(available)}
        </motion.div>
      </div>
    </div>
  );
}
