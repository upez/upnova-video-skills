---
name: upnova-illustrations
description: "Son's library of drop-in animated illustrations for Upnova ads and Instagram Reels (9:16), styled from the Upnova website Figma. Use whenever a video shows an Upnova upsell widget (free gift with purchase first: the product page banner and the cart unlock, built from the real widgets, never redrawn), and when an Upnova ad, reel or VSL needs a stat count-up, before/after bars, ROAS or revenue chart, a Shopify cart upsell, free-shipping bar, offer morph (free gift / bundle / buy X get Y / volume), crossed-out \"old way\" cards, a checklist, the 600+ stores logo wall, a before/after split, an offer build-up claim, a logo wall behind the cut-out speaker, brand B-roll, results with brand logos, phone feature shots, a pixel-reveal step list, a 3D data report, upsell types, an A/B test, AOV charts, an \"all handled\" checklist, a book-a-call card, a closing call to action, founder video testimonials (wide or narrow card) or written review cards. Also use when asked for \"the illustration library\", \"reference animations\" or \"the Figma style\"."
---

# Upnova illustration library

Built October 2026 in the HyperFrames project "Upnova Ad Animation References" (first called "Untitled 3";
catalog video, 172.3 s, 1080x1920, 31 numbered sections). Sections 01-12 are the original illustrations;
13-29 (added 2026-10-20) are the reusable pieces of the 1019 reel; 30-31 (2026-10-25) are the real free
gift with purchase widgets, running live (see "Real Upnova widgets"). **The catalog holds reusable pieces only,
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
2026-10-25). **Videos run the real widget code**: the React component from the private `upez/widgets` repo,
built into one file, mounted in the video, and driven by the video's clock.

**Free gift with purchase** (pilot, 2026-10-25, Upnova's own demo look = the Storybook's):

| Template | Length | What it shows |
| --- | --- | --- |
| free-gift-banner | 6.6 s | The real product page banner (`FreeGiftPdpBanner`) in a phone-width page. At each beat the video sets the cart total ($25, $42, $50) and the banner animates itself: its bar fill, "You're $X away from getting a free gift", then green with "✓ Unlocked" and "Nice! You've unlocked your free gift" |
| free-gift-cart | 9.5 s | The real cart (`cart-winston`) with the **linear-progress** goals bar (`goalsTemplate`), in a phone-sized page. It starts flat and whole, then the camera tilts in 3D and pushes in close on the goals bar ("You are $58.40 away from Free Lip Gloss", tier nodes); at `B.tap` the video sets the quantity to 5, as a shopper would, and the cart does the rest with its own timing: the stepper spins while it updates, the prices fade in, the bar fills, the gift node turns to "Claim"; the camera pulls back and the cart opens its own claim sheet ("Choose gift →", $0). Camera shots in `SHOTS` (scale, X/Y tilt, the point looked at); the cart is drawn at 3.4x (`Z`) so the close-up stays sharp |

Settings at the top of each template: banner `OFFER` (tiers, gifts, the widget's own `settings` such as
`label`, `headline`, `accent_color`) and `CART` (the totals at each beat); cart `OFFER` (goals, gift, photos,
quantities). Beats are in `B`. Photos live in `assets/widgets/free-gift/` (Storybook demo photos: swap the
files for a brand's products).

**How it works** (`widgets/live/` and `assets/widgets/`):
- Each widget runs in its own phone-sized page in an iframe (`free-gift/banner-frame.html`,
  `free-gift/cart-frame.html`), so it lays out as on a phone (its breakpoints read the window width).
- **The page runs on the video's clock** (`virtual-clock.js`, loaded first): `performance.now`, `Date`,
  timers, `requestAnimationFrame` and every CSS animation, including those inside the widget's shadow roots,
  only move when the video says so. The widget's own code runs for real, with its own animations and
  timing (motion, count-ups, transitions, the mock cart's one-second update), so every frame matches what a
  shopper sees, and every render is identical. Animations whose time is up are finished for real, because
  `motion` waits for that before its next step.
- `widget-frame-host.js` drives it: `UpnovaWidgetFrame(iframe, { global, options, actions, section })`
  mounts the widget, lets it settle, runs `actions` at their seconds (what a shopper does: set the cart total,
  change a quantity), and `show(seconds)` advances the widget's clock to that moment. The section's timeline
  calls it every frame, and the renderer waits for it through the `hf-seek` event (`waitUntil`). Going
  backwards reloads the page and replays to the moment (a short wait when scrubbing back in Studio).
- `<name>.tsx` mounts the component into a shadow root (as on a store) with mock data and returns the
  functions the actions use (`setCart`, `changeQuantity`).
- Nothing loads from the internet at render time: nested widgets the cart fetches from Upnova's servers are
  bundled and handed over through the cart's component cache, and outside photo links are swapped for local
  files (`localImages`).
- Templates register their timeline once the widget is ready, then call `window.__hfForceTimelineRebind()`.
- `widgets/live/build.sh [name]` clones or updates `upez/widgets` (needs `gh auth login` with access to
  `upez`), builds each entry into `assets/widgets/free-gift/<name>.js` and prints the widgets commit it
  used. **Rebuild when the widgets change** so videos show the current widget.
- Time the camera around the widget's real moments (the cart takes ~1 s to update after a change and opens the
  claim sheet ~3.5 s after it): take stills every half second first to see when things happen.

**Adding another widget** (bundle builder next):
1. Find its story in the Storybook (`https://upnova-widgets.vercel.app/index.json`) and read the story file
   in `upez/widgets`: it shows the props and the `window.UPEZ__*` globals the widget reads.
2. Copy `free-gift-banner.tsx` (a widget that takes a cart prop) or `free-gift-cart.tsx` (anything inside the
   cart drawer) to `<name>.tsx`, set up the same globals, and return the functions the actions call; never turn its animations off.
3. `widgets/live/build.sh <name>`, then a template like `free-gift-*.html`, then `hyperframes check` and
   stills of every beat. If a still shows something stuck halfway, check that its animations are inside the clock's reach (a shadow root it saw being created).
4. Text inside the widget keeps its real size (under 56px); that is the allowed UI exception.

**Free gift wording, as the widget writes it** (for scripts and claims): badge `FREE GIFT`; `Spend $X, get a
free gift`; `You're $Y away from getting a free gift`; unlocked `✓ Unlocked`, `Nice! You've unlocked your
free gift`; in the cart `Spend $500 / Free Lip Gloss` → `Claim`, `You are $58.40 away from Free Lip Gloss`,
`Claim your Free Lip Gloss`, `Choose gift →`.

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
