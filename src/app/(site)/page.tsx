import Link from "next/link";
import { getApprovedReviews, getSettings, getSpecials } from "@/lib/data";
import { SpecialCard } from "@/components/special-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Stars } from "@/components/stars";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, specials, reviews] = await Promise.all([getSettings(), getSpecials(), getApprovedReviews(3)]);
  const first = settings.owner_name;
  return (
    <>
      <section className="relative mb-5 overflow-hidden rounded-[16px] border-[1.5px] border-line bg-cream2 px-7 pb-7 pt-9 text-center">
        <span className="mb-3.5 inline-block rounded-full bg-rose px-3 py-1 text-[10px] font-bold uppercase tracking-[2px] text-rose-deep">
          Home baked · Dubai
        </span>
        <h1 className="mb-1.5 text-[30px] leading-[1.2]">
          Baked to <span className="italic text-rose-deep">perfection</span>.
        </h1>
        <p className="mx-auto mb-1.5 max-w-[420px] text-[13px] leading-[1.7] text-muted">
          Handmade pastries, cakes &amp; bread, made slowly and from the heart by {first}, delivered straight to your door.
        </p>
        <div className="mb-5 text-[11px] tracking-[1px] text-lav-deep">— by {first} · est. 2019 —</div>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Link href="/menu" className="btn-p">
            Browse the menu
          </Link>
          <Link href="/custom-cakes" className="btn-o">
            Custom cake enquiry
          </Link>
        </div>
      </section>

      <h2 className="sec-head">This week&apos;s specials</h2>
      {specials.length ? (
        <div className="mb-5">
          {specials.map((s) => (
            <SpecialCard key={s.id} special={s} leadTimeHours={settings.default_lead_time_hours} />
          ))}
        </div>
      ) : (
        <p className="mb-5 text-[12px] text-muted">No specials posted this week — check back soon.</p>
      )}

      <h2 className="sec-head">Say hello to {first}</h2>
      <div className="mb-5 flex items-center gap-4 rounded-[16px] border border-line bg-cream2 p-5">
        <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border-2 border-rose-mid bg-rose text-[22px] font-bold text-rose-deep">
          {first.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="mb-0.5 text-[14px] font-bold">{first}, baker &amp; founder</div>
          <p className="text-[12px] leading-[1.7] text-muted">{settings.about_text}</p>
        </div>
      </div>
      <WhatsAppButton number={settings.whatsapp_number} message={`Hi ${first}! I found ${settings.business_name} and would love to know more.`}>
        Chat with {first} on WhatsApp
      </WhatsAppButton>

      {reviews.length > 0 && (
        <>
          <h2 className="sec-head mt-6">What customers say</h2>
          <div className="grid gap-2.5">
            {reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[13px] font-bold">{r.customer_name}</span>
                  <Stars n={r.rating} />
                </div>
                <p className="text-[12px] leading-[1.6] text-muted">{r.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center">
            <Link href="/reviews" className="text-[12px] text-rose-deep underline">
              Read all reviews or leave yours
            </Link>
          </div>
        </>
      )}
    </>
  );
}
