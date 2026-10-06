# BIRDEX public website

Independent React / TypeScript / Vite public website. The Mini App and API are maintained separately; this repository contains the public website.

## Run

```sh
npm install
cp .env.example .env.local
npm run dev
npm run build
npm test
```

On Windows, use `Copy-Item .env.example .env.local`. Local preview: http://127.0.0.1:5173.

## Configuration

Configure `VITE_MINI_APP_URL`, `VITE_TELEGRAM_URL`, and `VITE_X_URL` with verified official destinations. Missing URLs open an accessible informational dialog; no guessed social handles are used.

Set `VITE_API_BASE_URL` to https://birdex.online/api. The API must allow the website origin through CORS. No private credentials belong in Vite environment variables; they are public at build time.

`GET /api/public/season`:

```json
{"id":"season_01","name":"Season 01","status":"live","startsAt":"2026-09-25T21:00:00Z","endsAt":"2027-01-23T21:00:00Z","totalBirdPoints":0,"network":"TON"}
```

`GET /api/public/rewards`:

```json
{"pool":null,"currency":"TON","status":"planned","description":"Official reward announcement text"}
```

These are contract examples, not production statistics. The service validates responses. Partial errors preserve available data and provide retry. Without an API, production shows unavailable values. Sample fixtures are enabled only when `import.meta.env.DEV` and `VITE_USE_MOCK_DATA=true`; they are labeled on the page and excluded from the production bundle.

## Deployment

Deploy `dist/` to your existing hosting provider. Configure SPA fallback to `index.html` for `/season`, `/rewards`, and `/docs`. Place the public website at its own domain/subdomain to keep it separate from the Mini App and admin. The public website is deployed at https://birdex-app.andreyymka533.workers.dev.

The phone artwork was supplied by the project owner and converted to transparent WebP. Reward language intentionally makes no guaranteed payout claims. Google Fonts has a system-font fallback; self-host fonts if external font requests are unsuitable.

## Motion and accessibility

Unified subtle motion: reveals, one-time count-up, button magnetism (3 px per axis), interpolated mascot parallax (5 px), doodles at 10–13 px, card tilt (0.75 degrees), a moving navigation indicator and a contrast-aware pointer follower. Themes transition over 380 ms. Fine-pointer detection disables pointer interactions on touch and small screens. Reduced-motion preference disables these effects. Frames stop after settling and while the document is hidden. Theme persists in local storage. Keyboard focus, skip navigation and a native modal dialog are included.

`@tsparticles/slim` is loaded separately from the main page bundle. The fixed background contains 33 particles on desktop and 17 on tablet; gold is at most 12.2% of particles. Most are 1–2 px dots with 0.08–0.18 opacity. Three custom SVG paths (plus, egg, crown) are rendered directly by the slim engine. There are no links, glow, click effects, or emitters. The cursor gently repels within 150 px, with smooth restoration. Mobile under 600 px and reduced-motion users receive no particle canvas. Background containers are destroyed on theme/media changes and unmount; queued initialization prevents races. Visibility changes pause/resume animation.

Cursor controls: `data-cursor="dark"` and `data-cursor="light"` override contrast; `data-cursor="open"` and `data-cursor="view"` add a centered, contrast-backed label while choosing contrast from the underlying surface. Anchors, buttons, summaries, `[role="button"]`, `[data-clickable]` and `[data-cursor]` trigger the 40 px interactive ring. Default is a 4 px dot and 26 px follower. Inside native modal dialogs, the native cursor is retained because the browser top layer is above normal document overlays.

The golden egg is part of the existing raster artwork and moves with the chicken; the artwork is not cut apart or regenerated.

### Motion validation

Build and 20 tests pass, including cursor contrast, data API, desktop/tablet particle budgets, touch/reduced-motion disablement, visibility pause, delayed initialization cancellation, and cleanup under React Strict Mode. Browser checks covered Light/Dark, CTA hover, navigation, native dialogs, 1440 px desktop, 768 px tablet and 320 px mobile. The canvas count remains one through theme/navigation changes and zero on mobile.

A temporary, removed frame probe sampled 120 browser animation-frame intervals at 1440 px with the particle background active: 131.9 callbacks/sec on this high-refresh display, maximum interval 21 ms, zero intervals above 33.4 ms. This verifies available frame cadence on the test device, not universal rendered FPS. Particle rendering is capped at 60 FPS.

The existing layout overflows horizontally at 320 px (hero CTA row) and 768 px (oversized hero artwork/orbit). These pre-existing layout issues were preserved because this iteration explicitly authorizes motion changes only and forbids layout/size changes.

## Artwork

`public/assets/chicken.webp` (with PNG fallback) was generated using the built-in imagegen tool. Final prompt: premium detailed 3D white chicken with red comb, black angular sunglasses, holding a golden egg embossed with a crown; seated on worn wooden crates, with a few coins, two cream eggs and a small dark case; warm studio lighting, complete centered character, genuine transparent background, no UI, typography or watermark.


## Live statistics integration (October 6, 2026)

The Mini App backend includes anonymous GET /api/public/season and GET /api/public/rewards. Season points are summed directly from D1 saved states for season 1, excluding banned users and invalid balances. No player IDs or state details are exposed. The aggregate is cached for 60 seconds; the website refreshes every minute and when the tab becomes visible. Reward pool remains TBA because the application has no official pool configured.

The shared season runs from September 26, 2026 00:00 through January 24, 2027 00:00 Moscow time (120 days total, with 110 days remaining on October 6). New accounts and existing saves receive the same dates without losing accumulated points. The website keeps the announced dates visible if the server cannot be reached; unavailable points display a dash, never demo numbers.

The public statistics API is available at https://birdex.online/api. The public website remains a separate deployment. The supplied .env.example targets the live API with sample data disabled.

Validation: public website production build and all 20 tests passed.

## Animated header logo

BirdexLogo uses the owner-supplied transparent logo-mascot.png, isolated with SVG paths/masks into head, comb, beak and glasses layers. Feather backing fills only tiny areas uncovered by moving layers; the source PNG is unchanged. GSAP animates independent wrappers for idle, pointer tracking and click reactions, so effects do not compete for the same transform. The wordmark stays static.

Idle motion uses different 3.7–4.9 second periods and one randomly scheduled 5–12 second gesture via delayedCall, rescheduled after completion. Mouse tracking uses quickTo with capped 2.5 px / 2 px translation and 3 degree rotation; it is disabled for touch. Clicking navigates to Home immediately while the persistent Header completes a 540 ms reaction. Five clicks within 1.5 seconds reveal a small vector golden egg for 700 ms.

Animation pauses while the document is hidden. Dynamic reduced-motion preferences disable animation entirely. gsap.context reverts animations and all event/media listeners are removed on unmount. Mascot size is 44 px desktop and 34 px mobile, without changing header height. GSAP is packaged in a separate vendor chunk. Twenty tests and the production build pass, including pointer limits, touch/reduced-motion behavior, navigation and cleanup.

## Cloudflare Workers

The repository includes wrangler.jsonc with the exact Worker name birdex-app. Static files come from dist; SPA fallback serves /season, /rewards and /docs. No Mini App database or domain binding is required for this website.

For a Git-connected Cloudflare Worker, use:

- Repository: deluxeres/birdex-app
- Production branch: main
- Root directory: repository root (/)
- Build command: npm run build
- Deploy command: npx wrangler deploy

The public .env.production file supplies the API and Telegram URLs during the Vite build. VITE_* values are public browser configuration, not secrets. Override them in Cloudflare build variables when needed; Worker runtime secrets do not configure an already-built Vite client.

For local deployment, authenticate in the correct Cloudflare account and run npm run deploy. With multiple accounts, set CLOUDFLARE_ACCOUNT_ID to the account that owns this Worker. If the dashboard says Failed to find Worker before the first successful deployment, verify that this is a Workers project, its account and Worker name are correct, and its latest build has completed.
