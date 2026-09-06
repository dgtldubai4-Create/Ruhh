import Image from "next/image";
import Link from "next/link";
import { categoryCover, getApprovedReviews, getCategories, getFeatured, getMenu, getSettings, getSpecials, itemHasOptions, itemMinPrice } from "@/lib/data";
import { categoryArt } from "@/lib/category-art";
import { aed } from "@/lib/format";
import { SpecialCard } from "@/components/special-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { InstagramIcon } from "@/components/icons";
import { Stars } from "@/components/stars";

export const revalidate = 60;

const STEPS = [
  { icon: "🧺", title: "Pick your treats", text: "Browse the menu, choose sizes and mix your own boxes." },
  { icon: "🔥", title: "Baked to order", text: "Nothing sits on a shelf. Every order is made fresh for your date." },
  { icon: "🚗", title: "Delivered or collected", text: "Across Dubai by area, or pick up for free." },
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
  const cats = categories.filter((c) => items.some((i) => i.category_id === c.id));
  const ig = settings.instagram_handle?.replace(/^@/, "");

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="m-fade-up relative -mx-5 -mt-5 mb-6 overflow-hidden">
        {settings.hero_image_url ? (
          <>
            <Image src={settings.hero_image_url} alt="" fill priority sizes="(max-width: 680px) 100vw, 680px" className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c1a1a]/85 via-[#2c1a1a]/35 to-[#2c1a1a]/10" />
          </>
        ) : (
          <div className="absolute inset-0 bg-cream2">
            <div aria-hidden className="m-float absolute -left-8 -top-10 h-40 w-40 rounded-full bg-rose/70 blur-2xl" />
            <div aria-hidden className="m-float absolute -bottom-12 -right-6 h-44 w-44 rounded-full bg-lav/70 blur-2xl [animation-delay:-3s]" />
          </div>
        )}
        <div className={`relative px-7 pb-8 pt-16 text-center ${settings.hero_image_url ? "text-white" : "text-ink"}`}>
          <span className={`mb-4 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[2px] ${settings.hero_image_url ? "bg-white/15 text-white backdrop-blur" : "bg-rose text-rose-deep"}`}>
            Home baked · Dubai · est. 2019
          </span>
          <h1 className="mx-auto mb-2 max-w-[14ch] text-[38px] leading-[1.08]">
            Baked to <em className={`font-normal italic ${settings.hero_image_url ? "text-rose" : "text-rose-deep"}`}>perfection</em>, with soul.
          </h1>
          <p className={`mx-auto mb-6 max-w-[380px] text-[14px] leading-[1.7] ${settings.hero_image_url ? "text-white/85" : "text-muted"}`}>
            Cookies, cheesecakes, tiramisu and tea cakes made slowly from scratch by {first}, and delivered to your door.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link href="/menu" className="btn-p press px-6 py-3 text-[14px]">
              Order now
            </Link>
            <Link href="/custom-cakes" className={`press inline-flex items-center rounded-full border-[1.5px] px-5 py-2.5 text-[13px] transition ${settings.hero_image_url ? "border-white/60 text-white hover:bg-white/10" : "border-rose-deep text-rose-deep hover:bg-rose"}`}>
              Custom cakes
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <ol className="m-stagger mb-7 grid grid-cols-3 gap-2">
        {STEPS.map((s, i) => (
          <li key={s.title} style={{ "--i": i } as React.CSSProperties} className="rounded-[14px] border border-line bg-white p-3 text-center">
            <div className="mb-1 text-[22px]">{s.icon}</div>
            <div className="text-[12px] font-bold leading-tight">{s.title}</div>
            <div className="mt-1 text-[10.5px] leading-snug text-muted">{s.text}</div>
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
                <SpecialCard special={s} leadTimeHours={settings.default_lead_time_hours} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------- categories ---------- */}
      {cats.length > 0 && (
        <>
          <h2 className="sec-head">Shop by category</h2>
          <div className="m-stagger mb-6 flex gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cats.map((c, i) => (
              <Link
                key={c.id}
                href={`/menu?cat=${c.id}`}
                style={{ "--i": i } as React.CSSProperties}
                className="lift group relative h-[120px] w-[140px] shrink-0 overflow-hidden rounded-[14px] bg-cream2"
              >
                <Image src={categoryCover(items, c.id) ?? categoryArt(c.name)} alt="" fill sizes="140px" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2c1a1a]/75 to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-[12px] font-bold leading-tight text-white">{c.name}</div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ---------- bestsellers ---------- */}
      {featured.length > 0 && (
        <>
          <h2 className="sec-head">Customer favourites</h2>
          <div className="m-stagger mb-6 grid grid-cols-2 gap-3">
            {featured.map((m, i) => {
              const cat = categories.find((c) => c.id === m.category_id);
              return (
                <Link key={m.id} href={`/menu?cat=${m.category_id ?? ""}`} style={{ "--i": i } as React.CSSProperties} className="card lift group overflow-hidden">
                  <div className="relative h-[130px] overflow-hidden bg-cream2">
                    <Image src={m.image_url ?? categoryArt(cat?.name)} alt={m.name} fill sizes="(max-width: 680px) 50vw, 300px" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                  </div>
                  <div className="p-3">
                    <div className="text-[12.5px] font-bold leading-tight">{m.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted">{m.description}</div>
                    <div className="mt-1.5 text-[13px] font-bold text-rose-deep">
                      {itemHasOptions(m) && <small className="font-normal text-muted">from </small>}
                      {aed(itemMinPrice(m))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* ---------- about ---------- */}
      <h2 className="sec-head">Say hello to {first}</h2>
      <div className="m-fade-up card mb-6 overflow-hidden">
        {settings.about_image_url && (
          <div className="relative h-[170px]">
            <Image src={settings.about_image_url} alt={`${first} baking`} fill sizes="(max-width: 680px) 100vw, 640px" className="object-cover" unoptimized />
          </div>
        )}
        <div className="flex items-start gap-4 p-5">
          <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full border-2 border-rose-mid bg-rose text-[18px] font-bold text-rose-deep">
            {first.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="mb-1 text-[15px] font-bold">{first}, baker &amp; founder</div>
            <p className="text-[12.5px] leading-[1.7] text-muted">{settings.about_text}</p>
            <div className="mt-3">
              <WhatsAppButton number={settings.whatsapp_number} message={`Hi ${first}! I found ${settings.business_name} and would love to know more.`} className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-4 py-2 text-[12px] font-bold text-white">
                Chat on WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- reviews ---------- */}
      {reviews.length > 0 && (
        <>
          <h2 className="sec-head">What customers say</h2>
          <div className="m-stagger mb-6 grid gap-2.5">
            {reviews.map((r, i) => (
              <div key={r.id} style={{ "--i": i } as React.CSSProperties} className="card lift p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[13px] font-bold">{r.customer_name}</span>
                  <Stars n={r.rating} />
                </div>
                <p className="text-[12px] leading-[1.6] text-muted">{r.body}</p>
              </div>
            ))}
          </div>
          <div className="-mt-3 mb-6 text-center">
            <Link href="/reviews" className="text-[12px] text-rose-deep underline">
              Read all reviews or leave yours
            </Link>
          </div>
        </>
      )}

      {/* ---------- instagram ---------- */}
      {ig && (
        <a
          href={`https://instagram.com/${ig}`}
          target="_blank"
          rel="noopener noreferrer"
          className="m-fade-up lift flex items-center justify-between rounded-[14px] bg-gradient-to-r from-lav to-rose p-4"
        >
          <div>
            <div className="text-[13px] font-bold text-ink">Follow along on Instagram</div>
            <div className="text-[11px] text-muted">New bakes, behind the scenes and this week&apos;s specials first.</div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-rose-deep">
            <InstagramIcon /> @{ig}
          </span>
        </a>
      )}
    </>
  );
}
