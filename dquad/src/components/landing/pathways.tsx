"use client";
import Link from "next/link";
import { ArrowRight, Compass, Megaphone } from "@phosphor-icons/react";
import { useLang } from "@/lib/i18n/provider";
import { Reveal, Tilt } from "@/components/motion";
import { Art, PaperScene, Sticker } from "@/components/art/scenes";
import { Pack } from "@/components/art/pack";

export function Pathways() {
  const { t, dir } = useLang();
  const Arrow = ArrowRight;
  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="paths-title">
      <Reveal>
        <h2 id="paths-title" className="display-lg max-w-[18ch] text-balance">
          {t.paths.title}
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-5 lg:grid-cols-12">
        <Reveal className="lg:col-span-7" delay={0.05}>
          <Tilt max={4} scale={1.01} className="h-full">
            <article id="campaigns" className="card-paper flex h-full flex-col overflow-hidden scroll-mt-28">
              <Art id="momentHair" alt="Paper-cut still life of a hair oil ritual" className="aspect-[16/9] w-full lg:aspect-[16/8]" fallback={<PaperScene accent="coral" />} />
              <div className="flex flex-1 flex-col gap-4 p-6 sm:p-8">
                <div className="flex items-center gap-2 text-grass">
                  <Megaphone size={22} weight="fill" />
                  <h3 className="display-md">{t.paths.campaignsTitle}</h3>
                </div>
                <p className="lede max-w-[54ch]">{t.paths.campaignsBody}</p>
                <div className="mt-auto pt-2">
                  <Link href="/?enter=creator&next=/creator/campaigns" className="btn-grass">
                    {t.paths.campaignsCta} <Arrow size={18} weight="bold" className={dir === "rtl" ? "rotate-180" : ""} />
                  </Link>
                </div>
              </div>
            </article>
          </Tilt>
        </Reveal>

        <Reveal className="lg:col-span-5" delay={0.15}>
          <Tilt max={5} scale={1.01} className="h-full">
            <article id="quests" className="relative flex h-full flex-col overflow-hidden rounded-card border-2 border-ink bg-sun-soft scroll-mt-28" style={{ boxShadow: "6px 6px 0 0 var(--color-ink)" }}>
              <div className="relative h-[220px] sm:h-[260px]" aria-hidden>
                <span className="absolute -end-10 -top-10 h-44 w-44 rounded-full bg-sun" />
                <div className="absolute start-8 top-10 anim-float" style={{ ["--rot" as string]: "-6deg" }}>
                  <Pack shape="tube" accent="sky" label="Herb'l" size={70} />
                </div>
                <div className="absolute start-1/2 top-16 anim-float-slow" style={{ ["--rot" as string]: "5deg" }}>
                  <Pack shape="carton" accent="coral" label="Real" sub="mango" size={68} />
                </div>
                <div className="absolute end-10 top-6 anim-float" style={{ ["--rot" as string]: "10deg", animationDelay: "0.8s" }}>
                  <Pack shape="spray" accent="sky" label="Odonil" size={56} />
                </div>
                <Sticker accent="coral" rotate={-6} className="absolute bottom-6 start-6">+150 {t.common.pts}</Sticker>
                <Sticker accent="mint" rotate={4} className="absolute bottom-10 end-8">+300 {t.common.pts}</Sticker>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6 sm:p-8">
                <div className="flex items-center gap-2 text-ink">
                  <Compass size={22} weight="fill" />
                  <h3 className="display-md">{t.paths.questsTitle}</h3>
                </div>
                <p className="lede max-w-[46ch] text-ink/80">{t.paths.questsBody}</p>
                <div className="mt-auto pt-2">
                  <Link href="/?enter=creator&next=/creator/quests" className="btn-ink">
                    {t.paths.questsCta} <Arrow size={18} weight="bold" className={dir === "rtl" ? "rotate-180" : ""} />
                  </Link>
                </div>
              </div>
            </article>
          </Tilt>
        </Reveal>
      </div>
    </section>
  );
}
