"use client";
import { motion } from "motion/react";
import { useLang } from "@/lib/i18n/provider";
import { useAppState } from "@/lib/store/hooks";
import { DemoEntryButtons } from "@/components/shell/demo-entry";
import { Art, PointsCoin, Sticker, PaperScene } from "@/components/art/scenes";
import { Pack } from "@/components/art/pack";
import { Parallax, Counter, useReduce } from "@/components/motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Hero() {
  const { t, lang } = useLang();
  const s = useAppState();
  const reduce = useReduce();
  const released = s.ledger.filter((l) => l.type === "earned" && l.released).reduce((a, l) => a + l.points, 0);
  const openBrands = new Set(s.campaigns.filter((c) => c.stage !== "draft" && c.stage !== "completed").map((c) => c.brandId)).size;

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36" aria-labelledby="hero-title">
      {/* stage light */}
      <span className="pointer-events-none absolute -top-40 start-1/2 h-[70vh] w-[120vw] -translate-x-1/2" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(70,178,87,0.16) 0%, rgba(15,20,17,0) 60%)" }} aria-hidden />

      <div className="container-x relative grid items-end gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <motion.p {...rise(0)} className="mb-5 flex items-center gap-3 font-display text-[15px] font-semibold uppercase tracking-[0.18em] text-grass">
            <span className="inline-block h-px w-10 bg-grass" aria-hidden />
            {t.brand}
          </motion.p>
          <motion.h1 {...rise(0.08)} id="hero-title" className="display-xl max-w-[10ch] text-balance">
            {t.tagline}
          </motion.h1>
          <motion.p {...rise(0.16)} className="lede mt-7 max-w-[50ch]">
            {t.hero.lede}
          </motion.p>
          <motion.div {...rise(0.24)} className="mt-9">
            <DemoEntryButtons large />
            <p className="mt-3 text-[13px] text-stone">{t.hero.note}</p>
          </motion.div>
        </div>

        <motion.div initial={reduce ? false : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.25, ease: EASE }} className="relative lg:col-span-5" aria-hidden>
          <div className="relative overflow-hidden rounded-card border border-line-strong">
            <Art id="heroCommunity" alt="" priority className="aspect-[4/5] w-full sm:aspect-[16/11] lg:aspect-[4/5]" fallback={<PaperScene accent="grass" shape="bottle" label="Amla" sub="hair oil" />} />
            <span className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(180deg, rgba(15,20,17,0), rgba(15,20,17,0.85))" }} />
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
              <div>
                <div className="font-display text-[15px] font-bold">Layla Al Mansoori</div>
                <div className="text-[12.5px] text-stone">@layla.makes, Dubai</div>
              </div>
              <Sticker accent="grass" rotate={0}><PointsCoin size={18} spin={false} /> +1,200 {t.common.pts}</Sticker>
            </div>
          </div>
          <Parallax speed={0.3} className="absolute -start-8 top-8 hidden sm:block">
            <div className="anim-float" style={{ ["--rot" as string]: "-8deg" }}>
              <Pack shape="jar" accent="sun" label="Honey" size={64} />
            </div>
          </Parallax>
          <Parallax speed={0.18} className="absolute -end-6 top-1/3 hidden sm:block">
            <div className="anim-float-slow" style={{ ["--rot" as string]: "7deg" }}>
              <Pack shape="tube" accent="sky" label="Herb'l" sub="neem" size={56} />
            </div>
          </Parallax>
          <p className="mt-3 text-[12px] text-stone">{lang === "ar" ? "صورة مولّدة للنموذج" : "Photograph generated for the prototype"}</p>
        </motion.div>
      </div>

      <motion.dl {...rise(0.4)} className="container-x mt-16 grid grid-cols-3 gap-0 border-t border-line py-6 sm:mt-20">
        {[
          { v: s.creators.length, l: t.hero.stat1 },
          { v: openBrands, l: t.hero.stat2 },
          { v: released, l: t.hero.stat3 },
        ].map((st, i) => (
          <div key={st.l} className={i > 0 ? "border-s border-line ps-5 sm:ps-8" : ""}>
            <dt className="sr-only">{st.l}</dt>
            <dd className="font-display text-[clamp(1.8rem,3.4vw,2.8rem)] font-bold leading-none">
              <Counter value={st.v} />
            </dd>
            <dd className="mt-2 text-[12.5px] text-stone sm:text-[13.5px]">{st.l}</dd>
          </div>
        ))}
      </motion.dl>
    </section>
  );
}
