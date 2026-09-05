# Ruhh — Boutique Bakery App: Audit & Build Plan

Ruhh is a home bakery in Dubai run by Shweta. This document audits the
existing single-file prototype (`prototype/ruhh-prototype.html`) and lays out
the plan to turn it into a professionally built, deployable, fully functional
app. Open questions at the bottom must be answered before Phase 1 starts.

---

## 1. What the prototype does today

Customer side (mobile-first, max 680px):
- Home: hero, weekly specials cards, "about Shweta", WhatsApp chat button.
- Menu: search, category filter, item cards. Items have serving sizes
  (label / piece count / price), optional flavours, and "mix your box"
  (split a box of N across flavours).
- Order: cart, delivery vs pickup, address, name, WhatsApp number, time slot,
  notes, notification toggles. "Confirm" saves the order locally and opens a
  pre-filled WhatsApp message to Shweta.
- Track: shows the last order with a 4-step progress bar and past orders.

Admin side (hidden behind a "·" dot in the footer, no login):
- Edit menu items (name, category, description, photo, flavours, mixable,
  sizes), categories, weekly specials, logo, WhatsApp number, delivery fee.

Menu data (6 categories, 19 items) is real, except Chocolate Barks are all
priced AED 0 ("prices pending").

## 2. Why it is not deployable as-is

These are structural, not cosmetic:

1. **Admin edits never reach customers.** Menu, specials, settings and logo
   are saved to `localStorage` in whichever browser Shweta is using. Every
   customer sees the hard-coded defaults. There is no server or database.
2. **Orders exist only on the customer's phone.** Shweta receives the order
   only if the customer actually presses Send in WhatsApp. There is no order
   list for Shweta, and the Track page never advances past "Confirmed"
   because nothing can update it.
3. **No authentication on the admin panel.** Anyone who finds the dot can
   edit the menu (in their own browser only, but still wrong).
4. **Order numbers collide.** IDs are `RUH-YYMMDD-<count in this browser>`, so
   every customer's first order of the day is `…-001`.
5. **Images stored as base64 in localStorage** (5 MB cap). A logo plus a few
   photos will hit the quota and silently fail to save.
6. **Notification toggles are decorative.** Automated WhatsApp updates need
   the WhatsApp Business (Cloud) API; click-to-chat links cannot send anything.

Smaller bugs found in the code:
- Renaming a category orphans its items (they show as "(removed)"), despite
  the admin copy promising the opposite.
- Barks can be added to cart and ordered at AED 0.
- "Reset to defaults" also wipes the WhatsApp number and logo.
- No date selection; a "time slot" implicitly means today. Cakes and
  cheesecakes normally need lead time.
- No delivery area, minimum order, or closed-days logic.
- Category/flavour names containing quotes break inline `onclick` handlers.
- Success screen depends on the user manually pressing Send in WhatsApp; if
  they close it, the order is lost to Shweta.

What is worth keeping: the brand system (colours, serif type, rounded cards),
the menu data model (sizes + flavours + mixable boxes), the copy and tone,
the mobile-first layout, and the WhatsApp-centric ordering flow.

## 3. Proposed architecture (recommended)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript + Tailwind | One codebase for customer site, admin, and API routes. Vercel deploys from GitHub on push. |
| Database | Supabase Postgres | Free tier is enough for a home bakery. Row-level security for admin vs public. |
| Auth | Supabase Auth (email magic link) for Shweta only | Customers stay guests. No passwords to manage. |
| Images | Supabase Storage | Menu photos and logo as real files with CDN URLs, not base64. |
| Hosting | Vercel | Free, HTTPS, custom domain, preview URLs per branch. |
| Ordering | Order saved to DB first, then WhatsApp deep link with order ref | Shweta always has the order even if the customer never hits Send. |
| Notifications | Phase 1: click-to-chat. Phase 2 (optional): WhatsApp Cloud API | API needs Meta business verification and template approval; not a blocker for launch. |
| Payments | Phase 2 (optional): Stripe or Ziina | Launch with pay-on-confirmation (cash / bank transfer), which matches how the business runs now. |
| PWA | Web manifest + service worker | "Add to home screen" on iOS/Android without app stores. |

Data model (Postgres):
- `categories` (id, name, sort_order)
- `menu_items` (id, category_id, name, description, emoji, image_url,
  mixable, is_available, sort_order)
- `item_sizes` (id, item_id, label, piece_count, price_aed, sort_order)
- `item_flavours` (id, item_id, name, sort_order)
- `specials` (id, name, description, price_aed, old_price_aed, tag, accent,
  active_from, active_to, item_id nullable)
- `orders` (id, ref, status, mode, customer_name, phone, address, slot_date,
  slot_label, notes, subtotal, delivery_fee, total, created_at)
- `order_items` (id, order_id, item_name, size_label, flavour_text,
  unit_price, qty)
- `settings` (single row: whatsapp_number, delivery_fee, min_order,
  lead_time_hours, closed_days, logo_url, business_name, tagline)

## 4. Phases

**Phase 0 — Decisions** (this document). Answer the open questions below.

**Phase 1 — Deployable core**
- Scaffold Next.js app, Tailwind theme from prototype colours, Supabase schema
  + seed with the real menu.
- Customer: Home, Menu (server-rendered from DB), item picker with sizes /
  flavours / mix-box, cart (client, persisted), checkout with date + slot
  validation against lead time and closed days, order saved to DB, WhatsApp
  hand-off with server-generated unique ref.
- Track: lookup by order ref + phone; status reflects DB.
- Admin (`/admin`, login required): orders board with status changes
  (Confirmed → Baking → Out for delivery → Delivered / Cancelled), menu &
  category CRUD with photo upload, specials, settings.
- Deploy to Vercel with custom domain, PWA manifest, SEO metadata, OG image.

**Phase 2 — Enhancements (pick after launch)**
- WhatsApp Cloud API for automated status messages.
- Online payments.
- Customer accounts / reorder.
- Arabic (RTL) translation.
- Analytics (Vercel Analytics or Plausible).

## 5. Open questions (answers change the build)

Recommended defaults are marked so "go with your defaults" is a valid answer.

1. **Hosting & backend.** Vercel + Supabase, both free tier, as above?
   *(default: yes)*. Do you already have accounts, or should the setup guide
   assume you create them?
2. **Domain.** Do you own a domain (e.g. ruhh.ae)? If not, the app will
   launch on a `*.vercel.app` URL until you buy one.
3. **Payments at launch.** WhatsApp confirmation + cash / bank transfer
   *(default)*, or online card payment from day one? If online: Stripe
   (needs UAE trade licence) or a local gateway like Ziina / Tap?
4. **Order tracking.** Should Shweta update order status from an admin
   orders board so customers see live progress *(default: yes)*, or is
   WhatsApp the only channel and Track can be dropped?
5. **Automated WhatsApp messages.** Keep click-to-chat only for now
   *(default)*, or do you want the WhatsApp Business API (requires Meta
   business verification, takes days to weeks)?
6. **Lead time & availability.** Minimum notice per category (e.g. cookies
   same-day, cakes 24 h, custom 48 h)? Which days is Ruhh closed? Any daily
   order cap?
7. **Delivery rules.** Flat AED 15 everywhere in Dubai *(current)*, or by
   area? Minimum order for delivery? Free delivery above a threshold?
8. **Real data needed from you.** Shweta's actual WhatsApp number, Chocolate
   Bark prices, logo file, product photos (or confirm illustrated tiles for
   launch), pickup address, Instagram handle.
9. **Admin access.** Only Shweta, by email magic link *(default)*? Or a
   second admin?
10. **Language.** English only *(default)*, or English + Arabic?
11. **Anything to add or remove** from the prototype's feature list before I
    build (e.g. gifting / dedication cards, custom cake enquiry form,
    Instagram feed, reviews)?
