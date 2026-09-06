# D'QuAD prototype (Dabur Squad)

A polished, fully interactive prototype of a creator growth community for Dabur brand teams
and creators across the UAE and KSA: a public landing experience, a creator portal and an
admin / brand-team workspace, backed by a persistent local prototype store.

**Internal demo.** Identity, verification, email, analytics, courier tracking and video
analysis are all simulated and labelled as such in the UI. Not an official Dabur property.

## Run it

```bash
cd dquad
npm install
npm run dev        # http://localhost:3000
npm run check      # lint + typecheck + unit tests
```

Deploy on Vercel with the project root set to `dquad/`. No environment variables are needed.

## What is inside

| Area | Routes | Notes |
|---|---|---|
| Landing | `/` | Floating pill nav, layered paper hero with parallax packs, two pathways, six-step journey, growth and loyalty, twelve-brand mosaic, sunshine footer, EN/AR switch |
| Creator portal | `/creator`, `/creator/campaigns`, `/creator/campaigns/[id]`, `/creator/quests`, `/creator/rewards`, `/creator/profile` | Invitations, brief, script, upload with deterministic simulated score, feedback thread, unlimited revisions, publishing, verification, pending to available points, quests, reward redemption with shipments, editable profile, inbox drawer, reset demo |
| Admin portal | `/admin`, `/admin/campaigns`, `/admin/campaigns/[id]`, `/admin/creators`, `/admin/review`, `/admin/logistics`, `/admin/loyalty`, `/admin/products` | Stage board, campaign CRUD, creator matching and invites, review queue with weighted score, five-step logistics, loyalty and finance, product library with source URLs, six simulated roles |

### Architecture

- Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Motion (`motion/react`), Phosphor icons.
- `src/lib/store`: typed domain model (`types.ts`), deterministic seed scenario (`seed.ts`),
  mutations (`actions.ts`), deterministic scoring and match logic (`scoring.ts`), role matrix
  (`permissions.ts`). State is persisted to `localStorage` so every flow survives navigation
  and reload; **Reset demo** restores the seed exactly.
- `src/lib/i18n`: English and Arabic dictionaries, `dir="rtl"` switching, logical CSS properties throughout.
- `src/components/motion`: reveal, stagger, 3D tilt, parallax, counters, paper confetti. Everything
  collapses under `prefers-reduced-motion`.
- `src/components/art`: product-like pack illustrations built from layered paper shapes, composed
  paper scenes, and generated paper-cut illustrations (see below).

### Illustrations

The paper-cut illustrations (hero community scene, product moments, creator portraits, rewards,
delivery, brand team) were generated with the Porter Metrics creative studio for this prototype
and are referenced by their permanent asset URLs in `src/components/art/manifest.ts`. If an asset
cannot load, the layout falls back to a composed paper scene. Replace them with approved Dabur
photography or commissioned art before any public use.

### Product catalogue

The twelve-brand list is provisional: it is drawn from the Dabur International portfolio and
could not be validated against the UAE site from the build environment. Every brand and product
carries a `sourceUrl`, and the Product Library shows the sync status, SKU count and sync date so
the gap is visible rather than hidden. No ingredient or benefit claims beyond a hero ingredient
are made. KSA availability is a mock flag over the same catalogue.

### Simulated scoring

Uploads are scored from a hash of the file name across five criteria (hook 25, product clarity 25,
brand fit 20, storytelling 15, audio and captions 15). The same file name always produces the same
score. There is no minimum score; feedback is guidance only.

## Tests

`tests/` covers scoring determinism, match scoring, invitation state, the full campaign points
journey, unlimited revisions, redemption and stock, logistics progression, quest completion and reset.
