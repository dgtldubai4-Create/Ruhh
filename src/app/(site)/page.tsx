import { Photo } from "@/components/photo";
import Link from "next/link";
import {
  categoryCover,
  getApprovedReviews,
  getCategories,
  getFeatured,
  getMenu,
  getSettings,
  getSpecials,
  itemHasOptions,
  itemMinPrice,
} from "@/lib/data";
import { categoryArt } from "@/lib/category-art";
import { aed } from "@/lib/format";
import { SpecialCard } from "@/components/special-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { InstagramIcon } from "@/components/icons";
import { Stars } from "@/components/stars";
import { Reveal } from "@/components/reveal";
import { Marquee } from "@/components/marquee";

export const revalidate = 60;

const STEPS = [
  {
    icon: "🧺",
    title: "Pick your treats",
    text: "Browse the menu, choose sizes and mix your own boxes.",
  },
  {
    icon: "🔥",
    title: "Baked to order",
    text: "Nothing sits on a shelf. Every order is made fresh for your date.",
  },
  {
    icon: "🚗",
    title: "Delivered or collected",
    text: "Across Dubai by area, or pick up for free.",
  },
];

export default async function HomePage() {
  const [settings, specials, reviews, items, categories] = await Promise.all([
    getSettings(),
    getSpecials(),
    getApprovedReviews(3),
    getMenu(),
    getCategories(),
  ]);
  const first = settings.owner_name;
  const featured = getFeatured(items, 4);
  const cats = categories.filter((c) =>
    items.some((i) => i.category_id === c.id),
  );
  const ig = settings.instagram_handle?.replace(/^@/, "");

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="m-fade-up relative mb-6 grid items-center gap-7 pt-4 sm:grid-cols-[1.05fr_0.95fr] sm:gap-6 sm:pt-6">
        <div>
          <div className="mb-4 flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[2.2px] text-peach-deep">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
              <path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
            </svg>
            Small batches · made to order
          </div>
          <h1 className="words mb-4 text-[42px] leading-[0.98] tracking-[-0.02em] sm:text-[46px]">
            <span style={{ "--w": 0 } as React.CSSProperties}>The</span>{" "}
            <span style={{ "--w": 1 } as React.CSSProperties}>kind</span>{" "}
            <span style={{ "--w": 2 } as React.CSSProperties}>of</span>
            <br />
            <span style={{ "--w": 3 } as React.CSSProperties}>sweet</span>{" "}
            <span style={{ "--w": 4 } as React.CSSProperties}>thing</span>
            <br />
            <span style={{ "--w": 5 } as React.CSSProperties}>worth</span>{" "}
            <em className="font-normal italic text-rose-clay">
              <span style={{ "--w": 6 } as React.CSSProperties}>making</span>
              <br />
              <span style={{ "--w": 7 } as React.CSSProperties}>room</span>{" "}
              <span style={{ "--w": 8 } as React.CSSProperties}>for.</span>
            </em>
          </h1>
          <p className="mb-6 max-w-[38ch] text-[14px] leading-[1.7] text-muted">
            Thoughtful bakes for slow weekends, good news and the people you
            want to keep close. Made by hand by {first} in Dubai.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/menu"
              className="press inline-flex items-center gap-2 rounded-[10px] bg-ink px-5 py-3 text-[13.5px] font-bold text-cream transition hover:bg-rose-deep"
            >
              Explore the menu <span aria-hidden>→</span>
            </Link>
            <a
              href="#about"
              className="group inline-flex items-center gap-1 border-b border-rose-clay/60 pb-0.5 text-[13.5px] font-bold text-ink transition hover:border-rose-deep"
            >
              Our little story{" "}
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              >
                ›
              </span>
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[340px] sm:max-w-none">
          {/* offset outline arch */}
          <div
            aria-hidden
            className="absolute -left-3 -top-3 h-full w-full rounded-t-full rounded-b-[18px] border border-rose-deep/25"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[18px] bg-cream2 shadow-[0_24px_50px_-30px_rgba(44,26,26,0.45)]">
            <Photo
              src={settings.hero_image_url ?? categoryArt("Cheesecakes")}
              alt={
                settings.hero_image_url ? `${settings.business_name} bakes` : ""
              }
              fill
              priority
              sizes="(max-width: 680px) 90vw, 340px"
              className="hero-photo object-cover"
            />
          </div>
          <div className="absolute -bottom-3 -right-2 rotate-[-4deg] rounded-[6px] bg-cream px-3.5 py-2 text-[12.5px] italic text-ink shadow-[0_10px_24px_-14px_rgba(44,26,26,0.5)] sm:-right-4">
            Baked with a little more care
          </div>
        </div>
      </section>

      <Marquee items={cats.map((c) => c.name)} />

      {/* ---------- how it works ---------- */}
      <ol className="m-stagger mb-7 grid grid-cols-3 gap-2">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            style={{ "--i": i } as React.CSSProperties}
            className="rounded-[14px] border border-line bg-white p-3 text-center"
          >
            <div className="mb-1 text-[22px]">{s.icon}</div>
            <div className="text-[12px] font-bold leading-tight">{s.title}</div>
            <div className="mt-1 text-[10.5px] leading-snug text-muted">
              {s.text}
            </div>
          </li>
        ))}
      </ol>

      {/* ---------- specials ---------- */}
      {specials.length > 0 && (
        <>
          <h2 className="sec-head">This week from the oven</h2>
          <div className="m-stagger mb-6">
            {specials.map((s, i) => (
              <div key={s.id} style={{ "--i": i } as React.CSSProperties}>
                <SpecialCard
                  special={s}
                  leadTimeHours={settings.default_lead_time_hours}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------- categories ---------- */}
      {cats.length > 0 && (
        <Reveal>
          <h2 className="sec-head">Shop by category</h2>
          <div className="m-stagger mb-6 flex gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cats.map((c, i) => (
              <Link
                key={c.id}
                href={`/menu?cat=${c.id}`}
                style={{ "--i": i } as React.CSSProperties}
                className="lift group relative h-[120px] w-[140px] shrink-0 overflow-hidden rounded-[14px] bg-cream2"
              >
                <Photo
                  src={categoryCover(items, c.id) ?? categoryArt(c.name)}
                  alt=""
                  fill
                  sizes="140px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2c1a1a]/75 to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-[12px] font-bold leading-tight text-white">
                  {c.name}
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      {/* ---------- bestsellers ---------- */}
      {featured.length > 0 && (
        <Reveal>
          <h2 className="sec-head">Customer favourites</h2>
          <div className="m-stagger mb-6 grid grid-cols-2 gap-3">
            {featured.map((m, i) => {
              const cat = categories.find((c) => c.id === m.category_id);
              return (
                <Link
                  key={m.id}
                  href={`/menu?cat=${m.category_id ?? ""}`}
                  style={{ "--i": i } as React.CSSProperties}
                  className="card lift group overflow-hidden"
                >
                  <div className="relative h-[130px] overflow-hidden bg-cream2">
                    <Photo
                      src={m.image_url ?? categoryArt(cat?.name)}
                      alt={m.name}
                      fill
                      sizes="(max-width: 680px) 50vw, 300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-[12.5px] font-bold leading-tight">
                      {m.name}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted">
                      {m.description}
                    </div>
                    <div className="mt-1.5 text-[13px] font-bold text-rose-deep">
                      {itemHasOptions(m) && (
                        <small className="font-normal text-muted">from </small>
                      )}
                      {aed(itemMinPrice(m))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Reveal>
      )}

      {/* ---------- about ---------- */}
      <Reveal>
        <h2 className="sec-head">Say hello to {first}</h2>
        <div className="card mb-6 overflow-hidden">
          {settings.about_image_url && (
            <div className="relative h-[170px]">
              <Photo
                src={settings.about_image_url}
                alt={`${first} baking`}
                fill
                sizes="(max-width: 680px) 100vw, 640px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex items-start gap-4 p-5">
            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full border-2 border-rose-mid bg-rose text-[18px] font-bold text-rose-deep">
              {first.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="mb-1 text-[15px] font-bold">
                {first}, baker &amp; founder
              </div>
              <p className="text-[12.5px] leading-[1.7] text-muted">
                {settings.about_text}
              </p>
              <div className="mt-3">
                <WhatsAppButton
                  number={settings.whatsapp_number}
                  message={`Hi ${first}! I found ${settings.business_name} and would love to know more.`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-4 py-2 text-[12px] font-bold text-white"
                >
                  Chat on WhatsApp
                </WhatsAppButton>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ---------- reviews ---------- */}
      {reviews.length > 0 && (
        <Reveal>
          <h2 className="sec-head">What customers say</h2>
          <div className="m-stagger mb-6 grid gap-2.5">
            {reviews.map((r, i) => (
              <div
                key={r.id}
                style={{ "--i": i } as React.CSSProperties}
                className="card lift p-4"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[13px] font-bold">
                    {r.customer_name}
                  </span>
                  <Stars n={r.rating} />
                </div>
                <p className="text-[12px] leading-[1.6] text-muted">{r.body}</p>
              </div>
            ))}
          </div>
          <div className="-mt-3 mb-6 text-center">
            <Link
              href="/reviews"
              className="text-[12px] text-rose-deep underline"
            >
              Read all reviews or leave yours
            </Link>
          </div>
        </Reveal>
      )}

      {/* ---------- instagram ---------- */}
      {ig && (
        <Reveal>
          <a
            href={`https://instagram.com/${ig}`}
            target="_blank"
            rel="noopener noreferrer"
            className="lift flex items-center justify-between rounded-[14px] bg-gradient-to-r from-lav to-rose p-4"
          >
            <div>
              <div className="text-[13px] font-bold text-ink">
                Follow along on Instagram
              </div>
              <div className="text-[11px] text-muted">
                New bakes, behind the scenes and this week&apos;s specials
                first.
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-rose-deep">
              <InstagramIcon /> @{ig}
            </span>
          </a>
        </Reveal>
      )}
    </>
  );
}
