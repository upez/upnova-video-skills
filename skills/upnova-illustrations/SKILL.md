---
name: upnova-illustrations
description: "Son's library of drop-in animated illustrations for Upnova ads and Instagram Reels (9:16), styled from the Upnova website Figma. Use whenever a video shows an Upnova upsell widget (free gift, bundle builder, product volume or buy X get Y, built from real widgets and recorded from Storybook, never redrawn), and when an Upnova ad, reel or VSL needs a stat count-up, before/after bars, ROAS or revenue chart, Shopify cart offer, crossed-out old-way cards, checklist, logo wall, before/after split, offer claim, brand B-roll, phone feature shot, 3D data report, A/B test, AOV chart, CTA or founder testimonial."
---

# Upnova illustration library

Built October 2026 in the HyperFrames project "Upnova Ad Animation References" (first called "Untitled 3";
catalog video, 197.46 s, 1080x1920, 35 numbered sections). Sections 01-12 are the original illustrations;
13-28 (added 2026-10-20) are reusable pieces of the 1019 reel; 29-30 are real free-gift widgets; 31-35
are real bundle builder, product-volume and buy-X-get-Y widgets (see "Real Upnova widgets"). **The catalog holds reusable pieces only,
each playing on its own over black** (Son, 2026-10-20: "you just add parts of the illustrations or assets
that could be reusable", not the whole video). No speaker footage, voice-over or running captions in the
catalog; founder testimonials keep their own clip and sound, and each section keeps its own sound cues.
Style source: Figma "Upnova website", page "Web Component Library"
(https://www.figma.com/design/XkRTHbJxUbfjmYEJ8lZMiJ/Upnova-website?node-id=195-2), frames
"AOV increase", "progress bar focus", "feature morph", "banner-dark-grid", "banner-green-bg",
"Backgrounds", "Color", "Typography", "Stage 1-3".

## Setup: install, update and get the assets

These skills live in the private GitHub repo **upez/upnova-video-skills**. Install or update both
(the reels skill uses this skill's assets and templates, so install them together):

```
npx skills add upez/upnova-video-skills
```

Run the same line again to pick up Son's latest changes. Cloning needs access to the `upez` org
(`gh auth login` once).

**Assets** (fonts, Upnova and client logos, backdrops, sounds, founder videos, B-roll, phone
recordings) are listed in this skill's `assets.tsv`. Small files ship inside this skill; videos and screenshots
stay in the repo's `media/` folder.
Never hunt for them by hand: copy what a template needs into the project with

```
"<this skill>/scripts/fetch-assets.sh" <project-folder> <template-name or assets/path>...
```

where `<this skill>` is the folder this SKILL.md is in. Examples: `fetch-assets.sh . captions
offer-claim brand-broll`, `fetch-assets.sh . assets/fonts/ assets/logos/`. It puts each file at the
path the templates use, looks in the skill first, then a local clone of the repo
(`$UPNOVA_VIDEO_SKILLS_REPO` or `~/Projects/upnova/upnova-video-skills`), then downloads it from
GitHub. If a download fails, say so: the person needs `gh auth login` with access to `upez`.
Original videos named below as `media/sources/...` come the same way (pass that path).

## How to reuse a section

1. Copy `templates/<name>.html` into the new project's `compositions/`.
2. Get what it uses: `scripts/fetch-assets.sh <project> <name>` copies every file the template names
   (fonts, backdrops, products, logos, videos) to the same path in the project.
3. Mount it: `<div id="<name>" class="clip" data-composition-id="<name>" data-composition-src="compositions/<name>.html" data-start=".." data-duration=".." data-width="1080" data-height="1920" style="position:absolute;inset:0">`.
4. Change the words and numbers at the top of each file's script (VALUE, BEFORE/AFTER, FROM/TO),
   and retime with its `B` object so each beat lands on the spoken word.

| Template | Length | What it shows |
| --- | --- | --- |
| stat-count | 4.5 s | Tag pill, big number counts up, green S-curve draws (Figma "AOV increase") |
| bars-grow | 4.5 s | Green pixel backdrop, "MORE FROM EVERY ORDER.", before/after bars, gain chip |
| roas-target | 4.5 s | Dashed target line, ROAS line climbs past it, dot ripples, result pill |
| revenue-climb | 4.5 s | USD 60M+ count-up (shown with the dollar sign) with the green light streak rising |
| free-shipping | 4.5 s | "UNLOCKED." one-word slam on the green pixel backdrop |
| offer-morph | 6 s | One widget card resizes through Free gift, Bundles, Buy X get Y, Volume deals with a 4-part tracker. **Son removed it from the catalog on 2026-10-20**: template kept, don't use unless asked |
| crossed-out | 4.5 s | Three "old way" cards get red X's and dim, "Not anymore." lands green |
| checklist | 4.5 s | "3 MINUTES.": Studying your store, Building your offers, Ready for launch tick off |
| logo-wall | 4.5 s | Customer logos drift in rows behind a 600+ count |
| testimonial | 6.6 s | Brand founder on camera (Stantt, Matt) with synced captions; +34% / +30% count up on his words |
| caption-guide | 14.1 s | How to add captions: 3-step tracker over a talking-head clip (1 transcribe: words + times, 2 group: 3-4 word phrases light up, 3 style + sync: house captions) |
| screenshot-highlight | 9 s | Guide: highlight a feature in a screenshot. 1 plain flat 2D entrance; 2 3D camera move (perspective 1600, transform-origin on the feature, z +820, y -560, rotationX 12, rotationY -24 (Son: X tilt must stay gentle, use Y turn to push in), emilInOut 1.8s) with long-lens depth of field: the sharp screenshot plus two blurred copies (5px and 16px) masked by radial gradients centred on the feature so the feature stays sharp and blur grows with distance; no dimming; 3 ring drawn ON the tilted screen (svg inside the phone), flat label above with arrow down. Son: "start normal 2D, then 3D push in, tilt, change camera distance; blur like lens blur on a high focal lens", not a swing-in from an angle |
| before-after | 4.5 s | Dark "Without Upnova" top half vs green "With Upnova" bottom half, gain chip on the seam |

### From the 1019 reel (catalog sections 13-29, added 2026-10-20)

Copied from the HyperFrames project "Upnova Reels Video Testimonials". Templates marked *reel only* are
kept here for reels but are not in the catalog (they need the speaker footage or duplicate an older section). Their asset paths are the reel's:
`assets/brand/` (white brand logos), `assets/logos/`, `assets/broll/`, `assets/upsells/`,
`assets/testimonials/` (`grid/`, `quotes/`, founder clips); fetch-assets gets them all. In the catalog
project the same files are under `assets/reel/`. Timings inside each file are set to the reel's words: retime with its beats.

| Template | Length | What it shows |
| --- | --- | --- |
| offer-claim | 9.25 s | The offer as one big lower-half claim: each line rises in on its first word and stays; earlier lines blur away so the last line ("you don't pay.") gets its own frame. Pair it with a snap zoom on the speaker (scale 1 -> 1.28 in 0.35 s expo.out, ease back out 0.6 s after) |
| captions-reel | whole reel | The house captions with the Upnova wordmark rising in on the spoken name, and `RANGES`: phrases inside a full-screen scene move to the bottom (class `low`). Its ids are `captions`; rename if the project already has one | *reel only*.
| logo-wall-speaker | 2.6 s | Customer logos drifting behind the cut-out speaker; cut-out kept to head and shoulders with a CSS mask (`linear-gradient(180deg,#000 0 1100px,transparent 1260px)`), dim layer fades out at the same height. Ids are `logo-wall`: rename next to the library's own `logo-wall` | *reel only*.
| brand-broll | 4.6 s | Hard cut on each spoken brand name to its lifestyle footage, the brand's white logo rising in at the centre |
| results-teaser | 4.15 s | Tilted grid of founder videos, then result figures each centred with its brand's white logo centred under it (no slat backdrop over the grid) |
| phone-features | 3.72 s | Phone sized to each recording's aspect ratio, held zoomed (1.25-1.75) with the feature in the middle, lens blur around it, hard cuts, no tag pills (reel id `upsell-wall`) |
| three-steps | 2.36 s | "3 STEPS." list, cards un-pixelate (odd block sizes 45/27/15/9, then sharp); step 1 glides up and shrinks onto the next section's tag |
| step-data | 6.77 s | 3D camera over a store report; frames the whole KPI row (never crops a card), short KPI names (CVR, AOV), close-ups in the middle of the screen |
| build-offers | 7.93 s | Upsell types one after another, name pill above a real widget screenshot |
| ab-test | 3.44 s | "A/B TEST": Offer A (gray) vs Offer B (green) bars |
| aov-up | 2.64 s | "AOV keeps going up" with a green line climbing over the green streak |
| handled | 2.93 s | "ALL HANDLED" checklist: data studied, offers built, tests running |
| book-call | 3.14 s | Booking card: a day gets picked, "Book a call" |
| aov-lift | 3.06 s | "YOUR AOV": Before (gray) vs With Upnova (green) bars |
| closing-cta | 3.77 s | White Upnova wordmark, "BOOK YOUR / free call." over a dimmed speaker, the closing line in the captions |
| testimonial-stantt | 6.6 s | Wide founder card (Matt, Stantt): name pill with real wordmark above, captions in the card, +34% / +30% count up on his words | *reel only*.
| testimonial-devonlang | 4 s | Same layout, Tyler, Devon & Lang |
| testimonial-bluecorn | 6.4 s | Tessa, Bluecorn: crop shows the whole head above the burned-in captions, clip runs to the silence after her last word |
| testimonial-cannanda | 4 s | Narrow 540x960 card for a low-res clip (Dr. Lee Know), captions under the card |
| review-quotes | 12.8 s | Four written Shopify App Store reviews over each brand's lifestyle photo: brand logo, result figure in glossy Apple Garamond, the quote, 5 stars |

## Rules from the 1019 reel (Son, 2026-10-20)

- **Full-screen graphic scenes are centred** top to bottom (tag pill + content around y 900-960), clear of
  the captions, which **drop to the bottom** (top ~1460px) while a scene is on screen. Keep `RANGES` in the
  captions file in sync with the scenes' seconds, measured from the captions section's own start, and shift
  it whenever sections move.
- **Result figure + brand:** figure centred, the brand's white logo centred under it, never off to the side.
- **Phone recordings:** size the phone to the recording, no push-in on shots under ~1 s, keep the feature in
  the middle and sharp, blur the rest, no badges.
- **3D over a report or screenshot:** never crop a row of cards; frame the whole row.
- **Pixel reveal:** odd block sizes with one sample pixel per block, then `filter: none`. Even sizes or
  steps under ~9px look glitchy.
- **Hand-off:** an item that leads into the next part glides onto the next section's tag spot while the rest
  blur away; the next tag fades in on the spot.
- **Cut-out speaker:** head and shoulders only; the matte breaks up around hands, desk and mic.
- **Snap zoom on the speaker**, not a slow push.
- **Testimonials:** never crop the face, never cut the line short; testimonials go at the very end of a reel,
  results first, a few seconds per founder; whoosh between founders, low boom on each figure.
- **Sounds** (reel files: "Fast airy whoosh", "Low cinematic boom", "Cinematic whoosh impact"): airy whoosh
  ~0.2 into each scene, boom ~0.26 on figures and claim lines, whoosh-into-impact ~0.22-0.24 on "600 brands"
  and the call to action, each starting so its peak lands on the word.


## Real Upnova widgets: load the real component, never draw or copy it

Claude kept getting Upnova upsells wrong when it drew them (made-up layouts, wording, colours; Son: "this is
not Upnova design"), and a copy of the widget's markup animated by hand was "not good" either (Son,
2026-10-25). Running the component on a synthetic video clock was also laggy and inconsistent when seeking.
**Build the real widget, run it on the browser's real clock, record the interaction, then use that recording
inside the HyperFrames camera scene.** Never recreate its progress fill, text swap, loading state or sheet
animation in GSAP.

**Mock data: real products from real stores, in a use case that makes sense** (Son, 2026-10-26: "use mockup
products that are real products from real stores, not random images or a random use case"). Every product,
gift, price and photo in a widget recording comes from one real store's catalog, and the offer is one that
store could run: the gift is something the store really gives away (a deluxe sample, a mini), the cart holds
that store's products, and the amounts add up. Never picsum or stock photos, never a gift from another
category (no lip gloss gift in a hoodie cart). Real catalogs are in `upez/widgets` `src/mockData/` (Rare
Beauty, Gorjana, Monica Vinader, Pixi, Dermalogica, Nude Project, Oak & Luna, Zipster Baby, Tru Supplements,
Klipsta); a client's own store works too (`https://<store>/products.json`). Put the products in a fixture
(`widgets/fixtures/*.json`, with product and variant IDs and where they came from) and save the photos in
`assets/widgets/<widget>/<store>/`.

**Free gift with purchase** (2026-10-26, Rare Beauty, `widgets/fixtures/rare-beauty-free-gift.json`):

| Template | Length | What it shows |
| --- | --- | --- |
| free-gift-banner | 6.6 s | A recording of the real product page banner (`FreeGiftPdpBanner`): "Spend $100, get a free deluxe mini" with the two real Rare Beauty deluxe samples. The cart goes $30 → $66 → $102 and the banner animates itself: its bar fill ("You're $70 away…", "$34 away…"), then green with "✓ Unlocked" and "Nice! You've unlocked your free gift" |
| free-gift-cart | 8.5 s | A recording of the real cart (`cart-winston`, **linear-progress** goals bar): 1 Soft Pinch Cheek & Lip Trio + 1 Find Comfort Body Mousse ($66), "You are $34 away from Free Deluxe Mini". At 2.6 s the shopper adds a second trio ($102) and the cart does the rest: the stepper spins, the goals bar fills, "Claim", and its claim sheet with Soft Pinch Tinted Lip Oil and Liquid Blush deluxe samples ($0). HyperFrames only adds the 3D camera (`SHOTS`: scale, X/Y tilt, point looked at), entrance and exit; `B.tap` matches the recording's tap |

**Other offers** (2026-10-26, The Booze Outlet; real wine and whiskey catalog products):

| Template | Length | What it shows |
| --- | --- | --- |
| bundle-builder-page | 8.5 s | Real `ModernBundleBuilder` wine-case page. The shopper adds two real wines; the widget applies its own 10% tier, changes prices and advances the native tier tracker |
| bundle-builder-cart | 7.5 s | Real `cart-winston` bundle progress. The shopper increases Austin Hope Cabernet from 1 to 2; cart count becomes 3, 10% unlocks, prices and checkout total update |
| product-volume-blueberry | 6.5 s | Real Blue Berry product-volume template for Buffalo Trace 1L. The shopper selects Buy 3 / Save 10%; the real tier card selection and page positioning are recorded |
| buy-x-get-y-bottom | 7.5 s | Real cart-bottom cross-sell: Maker's Mark + Wild Turkey, then add a real Jim Beam offer at 20% off. The cart inserts it and updates count and total |
| buy-x-get-y-below-item | 7.5 s | The same real buy-X-get-Y offer through the native `IN_CART_ITEM_UPSELL` / `horizontal-cart-item-cross-sell` template below the matching cart item; Add inserts the real product |

To change products, amounts or wording: edit the fixture, rebuild (`widgets/live/build.sh`) if the widget code
changed, rerecord (`node widgets/record/record.cjs cart|banner <fixture> <out.mp4>`), then retime `B` from the
`<out>.json` it writes. Keep every cart line under 3: the Storybook mock cart adds its own "3+ for 20% off".

**How it works** (`upez/widgets`, Storybook, and `assets/widgets/`):
- **The tools are saved in this skill:** `widgets/live/build.sh` clones/updates `upez/widgets` and builds each
  entry (`widgets/live/<name>.tsx`: the real component plus a `mount(host, fixture)` that sets up its data and
  exposes the shopper's actions) into `assets/widgets/<widget>/<name>.js`. `widgets/record/cart.html` and
  `banner.html` are the capture pages (430×932 / 430×232 CSS px) that load those bundles, and
  `widgets/record/record.cjs` records them: it mounts the widget with the fixture, records the screen at 3x
  through Chrome's screencast on the real clock, does what a shopper does at the fixture's times, and writes a
  constant 30 fps MP4 (each frame = what was on screen at that moment) plus a `.json` with the action times and
  frame counts. Needs puppeteer-core, Chrome and ffmpeg (see the top of `record.cjs`).
- For an existing Storybook story, build Storybook to a static folder and use
  `node widgets/record/storybook-record.cjs <storybook-dir> <mode> <out.mp4>`. Modes saved here are
  `bundle-page`, `bundle-cart`, `volume-blueberry`, `bxgy-bottom`, and `bxgy-below-item`. The recorder serves
  the static build inside Chrome without starting a server, performs a real pointer/quantity interaction,
  and writes the same constant-30-fps MP4 plus action metadata. `bxgy-below-item` expects the story variant
  to configure `IN_CART_ITEM_UPSELL`, add collection membership to matching cart lines, and use the widget's
  own `horizontal-cart-item-cross-sell` template; never move the bottom-cart DOM into place after rendering.
- The widget's own data: the fixture sets template, products, photos, quantities, thresholds, colours and copy.
  Trigger the same action a shopper performs (quantity change, cart-total update, Claim click). Do not call
  `skipAnimations`, fake intermediate states, interpolate displayed money, or replace the widget's transitions.
- Keep enough time before the action (`hold`) for the camera to arrive and after it (`after`) for every native
  animation to settle; set `hold` so the tap lands on the section's beat and the recording can start at 0.
- Inspect frames before using the recording. Browser recording can letterbox when the CSS viewport occupies
  fewer encoded pixels: the failed free-gift capture had gray padding on the right and bottom. Crop only the
  recorder padding, scale the real widget canvas to the phone width, and pad any remaining bottom area with
  the widget background colour. Never stretch unequal axes or crop widget UI.
- Trim and hold the capture so its native action lands on the section's intended beat. Put the resulting local
  WebM/MP4 inside the phone/card; HyperFrames animates only the outer camera (3D tilt, zoom, pullback, entrance,
  exit). This makes preview seeking and rendering deterministic because seeking reads a video frame instead of
  replaying React and browser animations.
- Nothing loads from the internet during a HyperFrames render. Bundle or localize every product and gift image
  before recording. Rebuild and rerecord when widget code, fixture values, products, colours or wording change.
- Validate the recording itself at the initial state, mid-transition, settled state and claim sheet, then run
  `hyperframes check` and snapshot those same beats in the final 3D scene.

**Adding another widget:**
1. Find its story in the Storybook (`https://upnova-widgets.vercel.app/index.json`) and read the story file
   in `upez/widgets`: it shows the props and the `window.UPEZ__*` globals the widget reads.
2. Make a phone-sized capture entry that mounts the real component with local fixtures and exposes only the
   shopper actions the recording needs; never turn its animations off.
3. Build Storybook, record the native interaction, remove recorder-only padding, and place the resulting video
   in a template like `free-gift-*.html`. Run `hyperframes check` and inspect stills of every beat.
4. Text inside the widget keeps its real size (under 56px); that is the allowed UI exception.

**Free gift wording, as the widget writes it** (for scripts and claims): badge `FREE GIFT`; `Spend $X, get a
free gift`; `You're $Y away from getting a free gift`; unlocked `✓ Unlocked`, `Nice! You've unlocked your
free gift`; in the cart `Spend $100 / Free Deluxe Mini` → `Claim`, `You are $34 away from Free Deluxe Mini`,
`Claim your Free Deluxe Mini`, `Choose gift →` (the tier's title is whatever the merchant names it).

## The look (from the Figma)

- Two backdrops only: **black with soft white light slats** at the bottom (`dark-slats.jpg`), and
  **light green pixel grid** (`green-pixels.jpg`) with dark ink `#151715`. `green-streak.jpg` for
  money moments. Backdrops drift slowly for the whole section.
- Brand green **#C5EEA8** (design system value). Darker greens from the ramp only on light
  backdrops (`#6fb43f` fills, `#1d5a2a` lead lines).
- Type: Inter **Bold**, uppercase, tight tracking (-0.04em) for slams and numbers; Inter 400/500
  56px for lines under them. Tag pill: outlined, green dot, uppercase, letter-spaced.
- Shopify UI is drawn the way it looks in the Figma: off-white drawer `#f7f6f3`, red sale prices,
  struck-through old price, store-colored buttons (`--store` variable, default rose `#c9727a`).
- Keep the reels rules from `upnova-reels-video`: Upnova spelling, real logo, no yellow, one idea
  per screen, motion lands on the word.

## Gotchas found while building

- Bold uppercase runs wide: ~0.68 x font-size per character. 130px fits ~12 characters in 880px.
- When a tween fills a bar in steps, use `fromTo` for the first step and `to` for the rest, or
  the later steps' start values show at frame 0.
- Sparks/pop-ins that start at opacity 1: fade them in with a 0.05 s `fromTo` from 0 first.
- Mark drifting backdrops `data-layout-allow-overflow` and cross-fading text pairs
  `data-layout-allow-overlap` so `hyperframes check` stays clean.

## Son's feedback (October 2026)

- Show **real Upnova widgets**, never drawn lookalikes: screenshot stories from
  https://upnova-widgets.vercel.app (iframe.html?id=<story>&viewMode=story, Chrome headless at 430px wide, 2x) and
  animate the pieces. Don't invent widget UI like a "You're 12 dollars away" card. Since 2026-10-25: load the
  real component (see "Real Upnova widgets"), not screenshots or copies.
- No bouncy/overshoot eases (no back.out) on bars and chips: use power3.out / expo.out.
- Solid gray for "before" elements, not transparent.
- A green chip on the green pixel backdrop is unreadable: use dark chip with green text there.
- A result label belongs above its chart dot.
- Backdrops like the green streak can go full screen; fade their top edge with a mask.
- Testimonials: ready-cut founder clips are `assets/testimonials/*.mp4`; full originals are in the repo's
  `media/sources/` (Stantt `testimonial-matt.mp4` is the clean take; the website's v3 has burned captions).
  More case-study videos: `upez/upnova-website` repo, `public/case-studies/*/assets`. Use the numbers as spoken
  (Matt says 34% conversion and 30% RPV; the written case study says +32% and +27%).
- `<img>` inside a sub-composition gets a default 3 s clip window: use background-image divs instead.

- Caption phrases mixing plain and green words: wrap the spans in a block inside the flex box, or the spaces between them disappear ("tobuy").
- Captions (Oct 2026 update): no black outline; Inter Bold 700, ~92px (box 60px from each side, 960 wide), letter-spacing -0.08em, soft drop shadow only, emphasis words in glass-green Apple Garamond Bold, hard cuts between phrases (no fade/slide).
- Big result figures (+34%, +30%) use the same glossy tight Apple Garamond Bold (letter-spacing -0.06em, sheen sweep as they count). Put figure and its label in one flex row with align-items: baseline so the label sits on the number's baseline.
- Name a brand with its real logo, not its name in text: logos are in `assets/brand/` (Stantt wordmark `stantt-wordmark.png`; more in the `upez/upnova-website` repo, `public/testimonials/logos/`); show it white with filter brightness(0) invert(1).
- Son removed the cart-upsell "real widget" section (screenshots of the bundle builder) from the library on 2026-10-19; don't rebuild it unless asked.

## Motion: Emil Kowalski easing (Son hates bouncy easing)

Emil Kowalski's design-engineering rules: Every template registers `emilOut` = cubic-bezier(0.23, 1, 0.32, 1) for entrances/exits and `emilInOut` = cubic-bezier(0.77, 0, 0.175, 1) for on-screen moves and fills (CustomEase; the project's index.html must load `gsap@3.14.2/dist/CustomEase.min.js`, otherwise they fall back to expo.out / expo.inOut). Never use back.out, elastic, overshoot, scale yoyo pulses, shakes or wiggles. Pop-ins start at scale 0.9-0.95 with opacity 0, never from 0. Linear (`none`) only for slow backdrop drifts and progress segments.
