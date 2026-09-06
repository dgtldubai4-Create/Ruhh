"use client";
import Link from "next/link";
import { ArrowRight, Compass, Megaphone } from "@phosphor-icons/react";
import { useLang } from "@/lib/i18n/provider";
import { Reveal, Tilt } from "@/components/motion";
import { Art, PaperScene, Sticker } from "@/components/art/scenes";
import { Pack } from "@/components/art/pack";

export function Pathways() {
  const { t, dir } = useLang();
  const flip = dir === "rtl" ? "rotate-180" : "";
  return (
    <section className="container-x py-24 sm:py-32" aria-labelledby="paths-title">
      <Reveal>
        <h2 id="paths-title" className="display-lg max-w-[18ch] text-balance">
          {t.paths.title}
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-12">
        <Reveal className="lg:col-span-7" delay={0.05}>
          <Tilt max={3} scale={1.005} className="h-full">
            <article id="campaigns" className="relative flex h-full min-h-[520px] flex-col justify-end overflow-hidden rounded-card border border-line-strong scroll-mt-28">
              <Art id="momentHair" alt="Studio still life of a hair oil ritual" className="absolute inset-0 h-full w-full" fallback={<PaperScene accent="grass" shape="bottle" label="Amla" sub="hair oil" />} />
              <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,20,17,0.1) 30%, rgba(15,20,17,0.92) 100%)" }} aria-hidden />
              <div className="relative flex flex-col gap-4 p-7 sm:p-9">
                <div className="flex items-center gap-2 text-grass">
                  <Megaphone size={22} weight="fill" />
                  <h3 className="display-md">{t.paths.campaignsTitle}</h3>
                </div>
                <p className="lede max-w-[52ch] text-ink/85">{t.paths.campaignsBody}</p>
                <div className="pt-2">
                  <Link href="/?enter=creator&next=/creator/campaigns" className="btn-grass">
                    {t.paths.campaignsCta} <ArrowRight size={18} weight="bold" className={flip} />
                  </Link>
                </div>
              </div>
            </article>
          </Tilt>
        </Reveal>

        <Reveal className="lg:col-span-5" delay={0.15}>
          <Tilt max={4} scale={1.005} className="h-full">
            <article id="quests" className="relative flex h-full min-h-[520px] flex-col overflow-hidden rounded-card border border-line-strong bg-paper-2 scroll-mt-28">
              <div className="relative h-[240px]" aria-hidden>
                <span className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(242,198,81,0.22), rgba(15,20,17,0) 65%)" }} />
                <div className="absolute start-8 top-12 anim-float" style={{ ["--rot" as string]: "-6deg" }}>
                  <Pack shape="tube" accent="sky" label="Herb'l" size={66} />
                </div>
                <div className="absolute start-1/2 top-8 -translate-x-1/2 anim-float-slow" style={{ ["--rot" as string]: "4deg" }}>
                  <Pack shape="carton" accent="coral" label="Real" sub="mango" size={72} />
                </div>
                <div className="absolute end-8 top-14 anim-float" style={{ ["--rot" as string]: "9deg", animationDelay: "0.8s" }}>
                  <Pack shape="spray" accent="sky" label="Odonil" size={58} />
                </div>
                <Sticker accent="sun" rotate={-4} className="absolute bottom-4 start-7">+150 {t.common.pts}</Sticker>
                <Sticker accent="mint" rotate={3} className="absolute bottom-8 end-8">+300 {t.common.pts}</Sticker>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-7 sm:p-9">
                <div className="flex items-center gap-2 text-sun">
                  <Compass size={22} weight="fill" />
                  <h3 className="display-md text-ink">{t.paths.questsTitle}</h3>
                </div>
                <p className="lede max-w-[46ch]">{t.paths.questsBody}</p>
                <div className="mt-auto pt-2">
                  <Link href="/?enter=creator&next=/creator/quests" className="btn-ink">
                    {t.paths.questsCta} <ArrowRight size={18} weight="bold" className={flip} />
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
