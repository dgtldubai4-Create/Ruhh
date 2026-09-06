"use client";
import { motion } from "motion/react";
import { useLang } from "@/lib/i18n/provider";
import { useAppState } from "@/lib/store/hooks";
import { DemoEntryButtons } from "@/components/shell/demo-entry";
import { Art, PointsCoin, Sticker, Leaf, PaperScene } from "@/components/art/scenes";
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
    <section className="relative overflow-hidden pt-28 sm:pt-32 lg:min-h-[100dvh] lg:pt-36" aria-labelledby="hero-title">
      {/* paper hills */}
      <span className="pointer-events-none absolute -bottom-[18%] -start-[10%] h-[46%] w-[70%] rounded-[50%] bg-grass-soft" aria-hidden />
      <span className="pointer-events-none absolute -bottom-[26%] start-[30%] h-[44%] w-[80%] rounded-[50%] bg-grass" aria-hidden />

      <div className="container-x relative grid items-center gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-6">
          <motion.p {...rise(0)} className="mb-3 font-display text-[clamp(1.1rem,2vw,1.4rem)] font-semibold text-grass">
            {t.brand}
          </motion.p>
          <motion.h1 {...rise(0.08)} id="hero-title" className="display-xl max-w-[12ch] text-balance">
            {t.tagline}
          </motion.h1>
          <motion.p {...rise(0.16)} className="lede mt-6 max-w-[52ch]">
            {t.hero.lede}
          </motion.p>
          <motion.div {...rise(0.24)} className="mt-8">
            <DemoEntryButtons large />
            <p className="mt-3 text-[13px] text-stone">{t.hero.note}</p>
          </motion.div>

          <motion.dl {...rise(0.34)} className="mt-10 grid max-w-[520px] grid-cols-3 gap-3">
            {[
              { v: s.creators.length, l: t.hero.stat1 },
              { v: openBrands, l: t.hero.stat2 },
              { v: released, l: t.hero.stat3 },
            ].map((st) => (
              <div key={st.l} className="rounded-card border border-line bg-card/80 px-4 py-3">
                <dt className="sr-only">{st.l}</dt>
                <dd className="font-display text-[28px] font-bold leading-none">
                  <Counter value={st.v} />
                </dd>
                <dd className="mt-1 text-[12.5px] text-stone">{st.l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Layered paper stage with depth */}
        <div className="relative mt-6 lg:col-span-6 lg:mt-0" aria-hidden>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 40, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 1, delay: 0.2, ease: EASE }}
            className="perspective relative mx-auto max-w-[640px]"
          >
            <div className="card-paper overflow-hidden rounded-card">
              <Art id="heroCommunity" alt="" priority className="aspect-[16/11] w-full" fallback={<PaperScene accent="sun" />} />
            </div>

            <Parallax speed={0.35} className="absolute -start-6 top-10 sm:-start-10">
              <div className="anim-float" style={{ ["--rot" as string]: "-8deg" }}>
                <Pack shape="bottle" accent="grass" label="Amla" sub="hair oil" size={78} />
              </div>
            </Parallax>
            <Parallax speed={0.2} className="absolute -end-4 top-1/3 sm:-end-8">
              <div className="anim-float-slow" style={{ ["--rot" as string]: "9deg" }}>
                <Pack shape="jar" accent="sun" label="Honey" size={70} />
              </div>
            </Parallax>
            <Parallax speed={0.5} className="absolute -bottom-6 start-1/4">
              <div className="anim-float" style={{ ["--rot" as string]: "4deg", animationDelay: "1.2s" }}>
                <Pack shape="tube" accent="sky" label="Herb'l" sub="neem" size={60} />
              </div>
            </Parallax>
            <Parallax speed={0.28} className="absolute -top-5 end-10">
              <Sticker accent="sun" rotate={6}>
                <PointsCoin size={22} spin={false} /> +1,200 {t.common.pts}
              </Sticker>
            </Parallax>
            <Parallax speed={0.15} className="absolute -bottom-3 -end-2">
              <PointsCoin size={64} />
            </Parallax>
            <Leaf className="absolute -start-10 bottom-1/4 anim-wiggle" style={{ width: 54, transform: "rotate(-30deg)" }} color="var(--color-mint)" />
          </motion.div>
          <p className="mt-4 text-center text-[12px] text-stone lg:text-start">{lang === "ar" ? "رسوم ورقية مولّدة للنموذج" : "Paper-cut illustration, generated for the prototype"}</p>
        </div>
      </div>
    </section>
  );
}
