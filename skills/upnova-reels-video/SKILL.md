---
name: upnova-reels-video
description: "Son's house style for Upnova Instagram Reels / short vertical talking-head + screen-demo videos in HyperFrames. Use when editing an Upnova (or Son's) reel, including when asked to \"use the video reels edit skill\", \"edit this reel\", \"caption this reel\", \"make the hook pop\", \"add sounds\", add proof claims, an offer claim, a logo wall behind the speaker, brand B-roll on customer name-drops, a motion-design section, founder testimonials at the end, a feature highlight on a screenshot, or a client's real store and cart in 3D, or to reuse the style from earlier reels. Encodes every piece of feedback Son has given: font, brand color, caption style (Inter Bold, very tight, glass-green Apple Garamond emphasis, hard cuts), caption placement, grouping and sync, offer-name phrases, claim sections, real logos, client stores and brand colours, widgets, Emil Kowalski easing (no bounce), the Upnova Figma look, cinematic SFX and music taste."
---

# Upnova Reels video style

Collected from Son's feedback on:

1. A 2-minute Upnova reel: talking head on camera, a screen demo with a round face bubble, back on
   camera to close.
2. "Free gift tip ad" (69.5s, October 2026): talking head and screen demo, proof claims on camera, a
   brand-logo wall behind the cut-out speaker, a full-screen AI motion-design section, and a closing.
3. The Upnova illustration library (HyperFrames project "Upnova Ad Animation References", first
   called "Untitled 3", 19 October 2026): a 9:16
   catalog of drop-in animated sections, a caption guide, a video testimonial and a screenshot
   feature highlight. Its feedback **overrides the older reels** wherever they disagree.
4. "1019" reel (HyperFrames project "Untitled 5", 19 October 2026, 92s): Son on camera pitching a
   done-for-you upsell service, the offer as a build-up claim, the Upnova logo in the caption, a logo
   wall on "600 brands", brand B-roll on the customer name-drop, and founder testimonials at the end.
   Its feedback is collected in §0b below.
5. The same "1019" reel, second round (HyperFrames project "Upnova Reels Video Testimonials",
   20 October 2026, ~117s): full-screen graphic scenes between the on-camera parts, phone feature
   shots, a 3D store report, four founder testimonials and a re-shot intro. Its feedback is collected
   in §0c below.
6. "Price Preview" reel (HyperFrames project "Upnova Reels Video Project", 23 October 2026, 59s): Son
   on camera telling one client's story (Stantt): the store's deal, why nobody saw it, the new feature,
   an A/B test and the result. Full-screen scenes built from the client's real store. Its feedback is
   the **newest** and is collected in §0d below.

**Dollar amounts in this file are written as "USD 6", "USD 60M+".** The skill loader swaps a dollar
sign followed by a digit for the words the person typed after the skill's name, so the real form
garbles here. On screen, always show them with the dollar sign.

Every rule below came from Son, either directly or as the fix for something Son flagged. Where
sources disagree, the **newest wins**, and the rule says so. Follow them by default on the next reel.

## Setup: install, update and get the assets

These skills live in the private GitHub repo **upez/upnova-video-skills**. Install or update both
(the reels skill uses the illustration skill's assets and templates, so install them together):

```
npx skills add upez/upnova-video-skills
```

Run the same line again to pick up Son's latest changes. Cloning needs access to the `upez` org
(`gh auth login` once).

**Assets** (fonts, Upnova and client logos, backdrops, sounds, founder videos, B-roll, phone
recordings) are listed in `assets.tsv` in the `upnova-illustrations` skill (installed next to this
one). Small files ship inside that skill; videos and screenshots stay in the repo's `media/` folder.
Never hunt for them by hand: copy what a template needs into the project with

```
"$SKILLS/upnova-illustrations/scripts/fetch-assets.sh" <project-folder> <template-name or assets/path>...
```

where `$SKILLS` is the folder both skills are installed in (the parent of this skill's folder; for
example `.claude/skills` in the project or `~/.claude/skills`). Examples: `fetch-assets.sh . captions
offer-claim brand-broll`, `fetch-assets.sh . assets/fonts/ assets/logos/`. It puts each file at the
path the templates use, looks in the skill first, then a local clone of the repo
(`$UPNOVA_VIDEO_SKILLS_REPO` or `~/Projects/upnova/upnova-video-skills`), then downloads it from
GitHub. If a download fails, say so: the person needs `gh auth login` with access to `upez`.
Original videos named below as `media/sources/...` come the same way (pass that path).

## 0. How to work with Son

- Son asked for **the plan first, before any edit**. Show a short plan in plain words, ask the open
  questions (which claims, which offers, full-screen or face bubble), and wait for "go".
- Son may call this skill "video reels edit". That means this skill.
- Son points at elements and numbers requests. Apply each numbered item to its own element.
- Son judges from the preview. After an edit, snapshot the changed moments and look at them before
  replying; say plainly what was not verified (motion at full speed, the sound mix).

## 0b. Do these by default (Son had to ask for each on the 1019 reel)

Put every one of these in the first plan and build it without waiting to be asked:

1. **The offer / guarantee at the opening becomes one big build-up claim** (`templates/offer-claim.html`).
   Son: "the captions have to form into a big claim text all in 1 screen." Each spoken line rises in on
   its first word and **stays**, so the whole promise ("In the next 3 DAYS / we'll build you an upsell
   system / that bumps your Average Order Value by / **10–30%** / And if it doesn't, / **you don't
   pay.**") reads on one screen in the lower half. Captions are off for that stretch and resume on the
   next line ("Simple."). This overrides §5's "use synced captions for an on-camera opening".
2. **Claim text is punchy, not transcribed** (`three days,` → **`3 DAYS`**): in claims and other big
   emphasis, write quantities as **digits**, set the key short term in **UPPERCASE**, and **drop
   trailing commas/periods on the emphasised term**. Applies to every number word ("ten percent" →
   "10%", "three minutes" → "3 MINUTES", "six dollars" → "USD 6" shown with the dollar sign). The values still match what was said
   (§4); only the form changes.
3. **Mixed fonts sit on one baseline.** Any row or caption phrase that mixes Inter and the Apple
   Garamond emphasis needs `align-items: baseline` on its flex box (`captions.html` has it now);
   inline-blocks get `vertical-align: baseline`. Son: "the text with the 2 fonts are not aligned on the
   baseline."
4. **When Son says "Upnova" as the brand intro** ("I'm Son Chu, founder of Upnova"), the caption shows
   the **real white Upnova wordmark** in place of the word, rising in on the spoken name (caption word
   style `logo`, see `captions.html`). The wordmark SVG (`assets/brand/upnova-wordmark.svg`, from
   fetch-assets) already includes the swoosh mark, so **don't put the round mark next to it**.
5. **"600 brands" / "600+ stores" always gets the logo wall** behind the cut-out speaker (§6), from the
   word before the number to the end of that claim (~2.6s), with a whoosh-into-impact whose peak lands
   on the number.
6. **Customer name-drops get brand B-roll** (`templates/brand-broll.html`). When Son names client brands
   ("Fashion brands like Leelo Active, Stantt and Billy Bones Club"), full-screen hard cuts to **each
   brand's own lifestyle footage** on its name, with the **brand's real logo (white) rising in at the
   centre**; captions keep running below. See §6b for where to find the footage and logos.
7. **Testimonials go at the very end, after Son's last line, and are short**: only the sentence with
   the result (numbers first), a few seconds per founder (§7). Son: "short cut, few seconds, just
   enough to highlight the result."

## 0c. Full-screen graphic scenes (newest, 20 October 2026)

Son flagged each of these on the second round of the 1019 reel. Build them this way from the start:

1. **Captions drop to the bottom during full-screen graphic scenes.** Son: "the caption don't have to
   be center for the overlaying scenes, it's making it hard to show everything else on screen." On
   camera they stay at top ~1110px; over a graphic scene a phrase gets class `low` (top ~1460px,
   height ~230px). In `captions.html` keep a `RANGES` list of the scenes' root seconds and add `low` to
   any phrase whose middle falls inside one. Reading the scene hosts' `data-start` from the page at
   build time did **not** work; hard-code the seconds, and **shift `RANGES` whenever sections move**.
   Move any dark band behind the captions to the bottom too (top ~1280px, darker towards the bottom).
2. **Centre every graphic scene on screen**, top to bottom. Son asked for it on the 3 steps, the A/B
   test, "All handled", the AOV bars, the offers and the booking card: content had been parked near
   the top with empty space below. Centre the whole block (tag pill + content) around y ~900–960,
   keeping clear of the bottom captions.
3. **Results with brand logos:** each figure centred, with its brand's white logo **centred below it**
   (not off to the right). No slat backdrop over a busy footage grid (Son removed it).
4. **The last line of a build-up claim gets its own frame.** In the offer claim, the earlier lines blur
   and fade away just before "And if it doesn't, / you don't pay." rises in alone. Leave the number
   line ("10–30%") on screen at least ~0.4s after it is said before clearing.
5. **Phone screen recordings (feature shots):**
   - Size each phone to **its recording's aspect ratio** (`ffprobe` it) so nothing is cropped at the
     sides; 1180px tall from top 230 worked.
   - Shots under ~1s: **no push-in**. Hold each shot **already zoomed in, with the feature in the
     middle of the screen** (Son: "the focus area should always in the middle of the screen"). Scale
     the stage with `transformOrigin: "0px 0px"`, `x = 540 − S·fx`, `y = 880 − S·fy`. Zoom 1.25–1.75.
   - Keep the feature sharp and blur the rest (blurred copy with a radial mask centred on the
     feature). Ask which part is the feature if unsure: on the order-volume cart it was the discount
     tiers, on free gift the progress bar, on cross-sells the product row.
   - **No tag pills / badges** on these quick feature shots (Son removed them).
6. **3D camera over a report or screenshot: never crop a row of cards.** Frame the whole KPI row
   (scale ~1.1) rather than zooming into two cards. Short KPI names that fit their box: **CVR**,
   **AOV**. Close-ups go in the middle of the screen, not near the top.
7. **Pixelated reveal** (`templates/three-steps.html`): an SVG filter per card (`feFlood` 1×1 →
   `feComposite` tile → `feTile` → `feComposite in` → `feMorphology dilate`), block sizes stepped by a
   tween's `onUpdate`. Use **odd sizes with one sample pixel per block** (`[45, 27, 15, 9]`,
   radius (size−1)/2) and then switch to sharp (`filter: none`). Even sizes, a 2×2 sample, or steps
   below ~9px overlap the blocks: thick, crunchy text and jittering edges ("this part is glitchy").
8. **Hand-off into the next section:** when a list item leads into the next part (step 1 → "Step 1 ·
   Your data"), glide that item up and shrink it onto the next section's tag spot while the other
   items blur away, and have the next section's tag fade in on the spot instead of rising.
9. **Cut-out speaker in front of the logo wall:** the background-removal matte breaks up around fast
   hands, the desk and the mic ("the cut out here is glitchy"). Keep the cut-out only for head and
   shoulders with a CSS mask (`linear-gradient(180deg, #000 0 1100px, transparent 1260px)`) and fade
   the logo wall's dim layer out at the same height, so the lower body shows the plain footage.
10. **Testimonials: don't crop the face, don't cut the line short.** Recut from the original source
    with a crop that shows the whole head (stay above any burned-in captions), and run the clip to
    the silence after the last word (`silencedetect`). Lengthening a testimonial moves every later
    section, its sounds and the root length; booms tied to that testimonial stay put.
11. **Zoom on the speaker: quick and snappy.** Son preferred a snap over a slow push: scale the
    on-camera clip 1 → ~1.28 in ~0.35s `expo.out` on the moment (the offer starting), hold, then ease
    back out (~0.6s) once the claim clears. **Keep the head in the upper part of the frame** while a
    claim sits in the lower half (§0d.5).
12. **Replacing a stretch of footage** (a re-shot intro): transcribe the new clip, find the silence in
    the old footage where its last line ends, start the old clip there with `data-media-start`,
    re-time everything inside the new stretch to the new words (claim rows, captions, the logo
    rise, sound hits), shift everything after by the difference, and update the root length.

## 0d. Client stores and screenshots (newest, 23 October 2026, Price Preview reel)

Son flagged each of these on a reel that tells one client's story. Build them this way from the start:

1. **The client is shown by its real logo and its real store, not by the word "Shopify".** When Son
   says "this brand's Shopify store", show the client's logo rising in, then a real screenshot of the
   client's **desktop store** in a simple browser-window card (grey bar with three dots, rounded
   corners, slow 1 → 1.05 drift). **Don't give "Shopify" the green emphasis** in captions (Son: "don't
   highlight Shopify"); it is no longer in `build_groups.py`'s `HI` list. Use the client's logo again
   under the result figures (§0c.3).
2. **Real client UI first; draw only as the last resort.** Son sent the real Stantt cart to replace a
   drawn one ("here's how Stantt cart look"). In this order:
   - Screenshot the client's real pages. Store popups ("You've got a mystery discount", Klaviyo) cover
     every frame of `app.capture` / `hyperframes capture`. Chrome headless with the popup hosts
     blocked worked:
     `timeout 60 "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --user-data-dir=/tmp/<dir>/prof --host-resolver-rules="MAP *.klaviyo.com 127.0.0.1, MAP *.attn.tv 127.0.0.1, MAP *.privy.com 127.0.0.1, MAP *.justuno.com 127.0.0.1" --window-size=1440,900 --force-device-scale-factor=1.5 --virtual-time-budget=8000 --screenshot=/tmp/<dir>/home.png https://<store>/`
     (without `timeout` and its own `--user-data-dir` it hung for 10 minutes). Crop off the cookie
     banner with ffmpeg `crop`.
   - For a page you can't reach (a cart with items, a logged-in view), **ask Son for a screenshot** in
     the plan.
   - Only if neither works, draw the page from the store's real product photos, names and prices
     (`https://<store>/collections/<handle>/products.json`), in the store's own colours (next point),
     and tell Son it is drawn.
3. **Match the client's brand colours element by element.** Read them from the capture's
   `extracted/tokens.json` (`colors`, and `colorStats` where `interactiveBg` counts buttons), then
   check each against a real screenshot before using it. Stantt: **buttons navy `#373D61`** (Add to
   cart, Secure Checkout), **sale prices and discount tags orange `#CC662A`**. Son corrected this twice:
   first "Stantt use orange color, not black", then "keep the buttons the same brand color as Stantt's
   button color". Orange went on the buttons by mistake; a screenshot check would have caught it.
4. **3D push-in on a screenshot: tight.** Son: "zoom in more, much tighter." Push in until the
   feature fills most of the frame's width, about **3x** (`z` ~1080 with `perspective: 1600px`; 1.6x
   was too loose), and land it in the **middle of the screen**. With `transform-origin` on the feature
   (screen position F), perspective origin P and the screen spot you want G, the move is
   `x, y = P − F + (G − P) · (1600 − z) / 1600` (Stantt cart: F (869, 614), P (540, 900),
   G (540, 880), z 1080 → x −329, y 280). Keep the gentle 12° tilt and −24° turn (§7). The ring sits on
   the feature; the label pill and its arrow go **below** it, clear of the bottom captions.
5. **Snap zoom on the speaker: head in the upper area.** Son: "zoom in is fine but have the head in the
   upper area so it doesn't lay under the text." Set the zoom's `transformOrigin` low (`"50% 90%"`):
   the point at the origin stays put, so everything above it, the head included, moves up as it
   scales. Set it with `tl.set` at each snap so other zooms keep their own origin. Snapshot the zoomed
   frame and check the chin is above the claim's first line.
6. **Logos white or black, depending on what is behind them.** On footage and dark scenes show the
   logo **white** (`filter: brightness(0) invert(1)` on a black logo); on light UI (a store header, a
   white card) keep it **black**. When the element also animates `filter` (the blur rise-in), put the
   colour filter on an **inner layer**: the tween replaces the whole `filter` value, and a white
   wordmark turned dark at the end of the reel.

## Templates

Working files are in `templates/`. Copy them into the new project's `compositions/`, run
`fetch-assets.sh <project> <template-name>` for their files (see Setup), then change the text, the
timings and the GROUPS data:

| File | What it is |
| ---- | ---------- |
| `templates/captions.html` | Captions in the current style: 3–4 words per phrase, Inter Bold, very tight, glass-green Apple Garamond emphasis, hard cuts (id `captions`) |
| `templates/claims.html` | Proof claims in the lower half with count-ups (id `proof`) |
| `templates/closing-claims.html` | Closing claims and call to action, lower half (id `closing`) |
| `templates/ai-build.html` | Full-screen motion section: AI builds the five offers (id `ai-build`) |
| `templates/logo-wall.html` | Customer logos drifting behind the cut-out speaker (id `logo-wall`) |
| `templates/offer-claim.html` | The opening offer building up line by line into one big lower-half claim (id `offer-claim`, §0b.1) |
| `templates/brand-broll.html` | Brand lifestyle B-roll with the brand's logo centred, hard cut on each name (id `brand-broll`, §6b) |
| `templates/three-steps.html` | "3 steps" list: pixelated card reveal, then step 1 glides onto the next section's tag (id `three-steps`, §0c.7–8) |
| `templates/phone-features.html` | Phone feature shots: phone sized to each recording, held zoomed with the feature centred, lens blur around it, hard cuts (id `upsell-wall`, §0c.5) |
| `templates/testimonial-narrow.html` | Founder testimonial for a low-res vertical clip: narrow 540x960 card, captions under it (id `testimonial-cannanda`, §7) |
| `templates/index-example.html` | How the sections, the cut-out clip and the sound cues were wired in the root |
| `scripts/build_groups.py` | Transcript to caption groups (offer names and terms kept whole, brand spelling fixed) |
| `templates/older/` | First reel's versions Son later rejected (top-of-frame claims, word-by-word captions). Reference only. |

**More sections live in the `upnova-illustrations` skill** (its `templates/` folder, installed next to this one):
stat count-up, before/after bars, ROAS past target, revenue count-up, "Unlocked" headline, offer morph,
crossed-out old way, checklist, 600+ stores logo wall, before/after split, **video testimonial**
(`testimonial.html`), **caption guide** (`caption-guide.html`) and **screenshot feature highlight**
(`screenshot-highlight.html`). Read that skill when a reel needs any of them.
Since 2026-10-20 it also holds every section of the 1019 reel's second round (results with brand logos,
3D data report, upsell types, A/B test, AOV charts, all handled, book-a-call card, closing, the four
founder testimonials and the written reviews). The catalog project "Upnova Ad Animation References" shows
the reusable ones on their own as sections 13-29 (no speaker footage, voice or captions: Son wants only
reusable pieces in the library). Offer morph is out of the catalog.

All templates follow the newest rules (converted 2026-10-19): Emil easing with no bounce or pulses (§8),
brand green #c5eea8, Inter Bold headlines, and result figures (`.grad` in the claims) in glossy
glass-green Apple Garamond (§3). The project's `index.html` must load `CustomEase.min.js`, Inter Bold and
Apple Garamond Bold, as `index-example.html` does.

Before you edit, read the HyperFrames core skill. Work only in the project's `index.html`,
`compositions/` and `assets/`.

## 1. Canvas

- Reels are vertical: set the root to **1080x1920**. That means the root `data-width`/`data-height`,
  the viewport meta and the body size. Check the source footage with `ffprobe` first. Son's camera
  footage is already 1080x1920, and new projects often start widescreen, which crops it.

## 2. Brand and look

- Brand name spelling: **Upnova** (capital U only). Never "UpNova". Transcription mishears it
  ("AppNova", "Altonova", "Aupnova", "up Nova"), so fix it every time.
- Brand green: **#C5EEA8** (Upnova design system; older reels used #c4eda7, same color).
  **Never yellow.** Dark ink for text on green: `#0b0d0a`.
- **The Upnova Figma is the style source** ("Upnova website" file, page "Web Component Library",
  https://www.figma.com/design/XkRTHbJxUbfjmYEJ8lZMiJ/Upnova-website?node-id=195-2). Its look:
  - Two backdrops: **black with soft white light slats** along the bottom, and a **light green pixel
    grid**. A **green light streak** for money moments. Backdrops drift slowly; they can fill the
    whole screen (fade a hard edge with a mask). They are
    `assets/backgrounds/dark-slats.jpg`, `green-pixels.jpg` and `green-streak.jpg` (fetch-assets).
  - Headlines: Inter Bold, uppercase, tracking around −0.04em. Lines under them Inter 400/500, 56px.
  - Tag pill: outlined, uppercase, letter-spaced, with a small green dot.
- **Use real things, never redrawn ones:**
  - The real Upnova logo: `assets/brand/upnova-mark.svg` (round pistachio-green mark) and
    `assets/brand/upnova-wordmark.svg` (fetch-assets; originally from the Upnova Design System). The wordmark is black: on dark backgrounds show it white
    with `filter: brightness(0) invert(1)`, without changing its shape.
  - **Brands by their real logo, not their name in text** (e.g. "Matt · CEO, [STANTT wordmark]"),
    white or black to suit the background (§0d.6).
    Brand logos already prepared: `assets/brand/` (Stantt, Bluecorn, Cannanda, Devon & Lang, Leelo
    Active, Billy Bones Club). More are in the `upez/upnova-website` repo, `public/testimonials/logos/`.
  - Customer logos for "600+ stores" claims: the 18 files `assets/logos/logo-1.webp` to
    `logo-18.webp` (fetch-assets; from the website's homepage marquee).
  - **Real Upnova widgets**, not drawn lookalikes: the Storybook at https://upnova-widgets.vercel.app
    (screenshot a story with Chrome headless at 430px wide, 2x:
    `iframe.html?id=<story-id>&viewMode=story`; story ids are in `/index.json`). Never invent widget
    UI (Son rejected a made-up "You're 12 dollars away from free shipping" card: "this is not Upnova design").
    Son later removed the screenshot-built cart section from the library too, so ask before building
    a section out of widget screenshots.
- Fonts: Inter Regular, Medium, SemiBold and Bold and Apple Garamond (Bold and Regular) come with
  `fetch-assets.sh <project> assets/fonts/` into `assets/fonts/`; load them with `@font-face`.
  Apple Garamond is Apple's font: keep it inside Upnova projects, never in anything published.
- Small design calls Son made: "before"/inactive elements are **solid gray** (#b4b8b1), not
  transparent; a green chip on the green pixel backdrop is unreadable, so use a **dark chip with green
  text** there; text labels on the green half are **black** (#151715), not dark green; a chart's
  result label sits **above its dot**.

## 3. Captions

**Style (newest, 2026-10-19; overrides the older Inter 500 + black outline style)**
- Font: **Inter Bold (700)**, about **92px**, fitted with `window.__hyperframes.fitTextFontSize`
  (fontWeight 700, maxWidth 960, base 92, min 70).
- **Letter spacing −0.08em.** Son asked for it tighter three times; keep it very tight.
- White with **only a soft drop shadow**: `0 2px 6px rgba(0,0,0,.45), 0 8px 28px rgba(0,0,0,.45)`.
  **No black outline** (Son: "I don't like the black stroke").
- Caption box: top ~1110px, height ~260px, **left/right 60px** (960 wide).
- **No text anywhere in the video below 56px** (Son's rule), except text inside an app mock-up or a
  guide's interface; mention it to Son.

**Emphasis words: glossy glass-green Apple Garamond**
- **Apple Garamond Bold** at **1.2em**, letter spacing **−0.06em**.
- **Shiny glass green**, a little more saturated than the brand green but not neon:
  `background-clip: text` with a vertical gradient `#effbe6 0%, #b3e891 34%, #74c84b 50%, #8fd86a 72%, #dcf7c9 100%`
  plus a white diagonal sheen layer
  (`linear-gradient(105deg, transparent 38%, rgba(255,255,255,.9) 50%, transparent 62%)`, size 260%)
  that sweeps across once (~0.9s) when the phrase appears; soft drop-shadow `filter`, no stroke.
- Use it for the `hi` and `mark` words (below). The same style is used for big result figures
  (+34%, +30%) in testimonials and claims.
- When a phrase mixes plain and emphasis words inside a flex box, wrap the spans in one block element,
  or the space between them disappears ("tobuy more").

**Placement: below the middle of the frame** (over full-screen graphic scenes: at the bottom, §0c.1)
- Son: "Usually captions on social media are below the middle line of the video." That is about
  60–70% down the frame. On demo shots it sits between the app UI and the face bubble; on camera it
  sits on the chest.

**Grouping and motion**
- Son: "I don't like the word by word appearing. Show 3–4 words at a time, but keep terms attached."
- **Hard cuts (newest):** each phrase switches on at its first word and off when the next phrase
  starts: `tl.set(el, {opacity: 1, visibility: "visible"}, start)` and
  `tl.set(el, {opacity: 0, visibility: "hidden"}, end)`. **No fade, slide, scale or blur** between
  phrases (Son: "don't use animation at all"). This replaces the older rise/blur motion.
- **Terms are never split across two phrases**: "cheat code", "Average Order Value", "one minute",
  "store data", "six dollars", "AI agent", and every offer name below. Add new ones to `TERMS` in
  `build_groups.py`.

**Emphasis (keep it sparse)**
- `hi`: AI agent, Upnova, Average Order Value, upsell, premium, launch, go live,
  "Not at all", "takes off", "Claim. Done.", "buy more".
- `mark`: numbers and claims: 15%, 20%, 34%, five, six dollars, cheat code, one minute, AOV, guarantee.
- Both render in the glass-green Apple Garamond style above.
- `offer`: see the next rule.

**Offer and product names are ONE unit.** Never split, never broken up. Each shows as a single green
pill (`#c5eea8` background, dark text):
- bundle builder
- free gift with purchase (shown this way even when spoken as "free gift purchase")
- order volume (Whisper hears it as "auto volume")
- product volume
- buy X, get Y

`build_groups.py` handles all of this. Add new product names to its `OFFERS` list.

**Captions are off during sections that carry their own words** (proof claims, the AI motion
section, the closing). End the captions clip exactly where the next section starts.

**Caption guide:** `upnova-illustrations` → `caption-guide.html` shows the method on a real
talking-head clip in three steps (transcribe with word times, group 3–4 words, style + sync).

## 4. Caption sync: text must match the voice

Son checks the opening closely ("make sure the captions from the first 7 seconds match what's being
said") and caught a line showing about a second before it was spoken. So:

- Transcribe with an accurate model, into a temp folder outside the project.
  - In the HyperFrames desktop app, use its `transcribe_audio` tool on an audio file extracted into the
    project (`ffmpeg -i clip.mp4 -vn -ac 1 -ar 16000 -b:a 64k assets/<name>.mp3`). With no HeyGen API
    key saved it falls back to this Mac's own speech model, free. Delete the extracted audio after.
  - From the CLI: `hyperframes transcribe <audio> -m medium.en --json`. Never the default `small`.
    Parakeet still failed to install on macOS in October 2026 (sherpa-onnx).
- **Check the timing against the audio itself**, at least for the first ~10 seconds and every claim
  moment:
  - Loudness every 0.1s: `ffmpeg -i a.wav -af "asetnsamples=n=1600,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-" -f null -`
  - Pauses: `ffmpeg -i a.wav -af silencedetect=noise=-35dB:d=0.15 -f null -`. A word the model puts
    inside a silence really starts at the silence's end; move it there.
  - For a doubtful line, cut a short window around it with `ffmpeg -ss`, transcribe just that, and
    add the window start back to the times.
- A phrase starts when its first word is heard, never earlier.
- Skim for suspicious timing: words exactly 0.70s apart, or a word that starts long before the sound.
- Fix obvious mishearings by hand: brain→brand, card→cart, "by two"→"buy two",
  "you just want items away"→"you're just one item away", "Zand"→"Z, and", "Yoffer"→"Y offer",
  "average value"→"Average Order Value", "storage data"→"store data", "son"→"Son",
  "up Nova"→"Upnova", "PV"→"RPV", "Sun"→"Son", "Stant"→"Stantt", "Lilo Active"→"Leelo Active",
  "Cananda"→"Cannanda", "Lee No"→"Lee Know", "UpNova"→"Upnova".
- Whisper often drops sentence periods ("Upnova We've worked…"), so phrases run across sentences.
  Add the missing periods to the transcript before `build_groups.py`, then merge any phrase shorter
  than ~0.45s into its neighbour (no flash captions like "In the" for 0.08s).
- Otherwise keep what was actually said. Don't "improve" the script. Show numbers **as spoken**
  (Matt says 34% / 30%; the written Stantt case study says +32% / +27%; the video uses 34 / 30).

## 5. Claim sections

Son on the first reel: "The hook is important… the text should leverage the empty space around the
person and be really impressive… animation must be different from the rest of the video. Something
Apple would do. These are claims, and claims need to show very clearly."

**Where they go**
- **Put claim cards in the lower half**: stage top ~1030px, height ~500px, left/right 108px. Son
  rejected text at the top on the free-gift reel.
- The dark fade comes **up from the bottom**: 1000px tall,
  `linear-gradient(0deg, rgba(6,8,5,.72) 0%, rgba(6,8,5,.5) 45%, transparent 100%)`. It fades in with
  the section and out at the cut.
- When the opening is the speaker talking straight to camera, use **synced captions** for the lines
  around it, but **the offer / guarantee itself is a build-up claim** (§0b.1, newest, overrides the
  older "captions only" rule). Claim cards also go on the strong proof moments: numbers, store counts.
- Add proof claims wherever the speaker says strong numbers on camera mid-video, not only at the
  start and end.

**Type**
- Headline words: Inter Bold, 132–168px, tracking around −0.045em.
- **Big result figures (percentages, multipliers): the glossy glass-green Apple Garamond** from §3,
  tracking −0.06em, with one sheen sweep while they count. Put the figure and its label in one flex
  row with `align-items: baseline` so the label sits on the number's baseline.
- Small lines above and below the headline: Inter 400, **56px**, line-height 66px. They may wrap.
- Put any `background-clip:text` gradient on the **element that animates**, not its parent, or the
  text renders clipped or invisible.

**Motion** (eases from §8)
- Rise in: opacity 0→1, y 36→0, scale 1.06→1, blur 16→0, 0.8–1.1s `emilOut`.
- Numbers count up while they rise (0→10%, 0→600+), using a tween on a proxy object whose
  `onUpdate` writes the text.
- The small lines swap in step with the speech.
- Supporting visuals stay minimal: a green progress line, a green strike-through, a thin divider.
- Each claim sits in its own card. Show it with `tl.set`, fade it out over the last 0.4s, then
  hard-hide it.
- No "breathing" scale pulses on numbers, and **don't** run a blur or a slow zoom on whole cards for
  their full length (that froze the preview).

**What the claims looked like** (reuse the pattern)
- Free-gift reel, proof: "**10%** more" / "**600+** Shopify stores" (over the logo wall) /
  "**Guaranteed.** It works."
- Free-gift reel, closing: the white Upnova wordmark, "click the link below" / **Get started.** with a
  small arrow. Keep the logo clear of the speaker's head.
- First reel, opening: "will boost your average value" / **10–30%** / "Or else you don't pay.",
  **I'm serious.**, **600+** stores | **USD 60M+**, **3 minutes** + progress line, **Minutes,** *not ~~days~~.*

## 6. Logo wall behind the speaker

Son asked for "multiple brand logos in the background" at the "600+ Shopify stores" moment, with the
speaker masked out in front. How it was built (see `templates/logo-wall.html` and `index-example.html`):

1. Cut that stretch of footage with a little margin, high quality, no audio:
   `ffmpeg -ss <start-0.08> -i <video> -t <len+0.2> -an -c:v libx264 -crf 12 -pix_fmt yuv420p /tmp/<dir>/seg.mp4`
2. `hyperframes remove-background /tmp/<dir>/seg.mp4 -o assets/presenter-cutout-<name>.webm --quality best`
   (about 10 MB for 5.5s). In the desktop app, use its video background-removal tool instead.
3. Layers, bottom to top: original footage, logo wall, cut-out speaker (`data-media-start` = the
   margin, `muted`), then the claim card on top.
4. Logo wall: dark dim (rgba(6,8,5,.62)), 7 rows of the 18 customer logos turned white
   (`filter: brightness(0) invert(1)`, opacity .85), rows drifting sideways in alternating directions,
   fading in at the start and out over the last 0.4s. Mark the rows `data-layout-allow-overflow`.
5. Snapshot a few frames and check the cut-out edges.

## 6b. Brand B-roll on customer name-drops

Son: "Leelo Active, Stantt, and Billy Bones → go to their website and Instagram and find lifestyle
videos for the B-rolls, then put their logos in the center of the footage." Built in
`templates/brand-broll.html` (1019 reel: 19.6s to 24.2s, three shots of ~1.85s / 0.85s / 1.9s).

- **Footage, in this order:** the brand's Shopify site first. Homepage HTML has `cdn/shop/videos/...mp4`
  links; product videos come from `https://<site>/products.json?limit=250` then
  `https://<site>/products/<handle>.js` → `media[]` with `media_type: "video"` (take the highest mp4).
  Then the brand's Instagram reels (`import_video_url` needs an exact reel URL; profiles need a login,
  so ask Son for a link). **Reject YouTube results shot by retailers** (both Stantt hits were stores
  reviewing the shirts, with "Subscribe" banners). If no video exists, use a real lifestyle photo from
  the brand's site with a slow push-in (scale 1 → 1.06) and **tell Son**.
- Known sources: **Leelo Active** product videos (vertical 606x1080, e.g. the cream set walking clip);
  **Billy Bones Club** homepage lifestyle videos (golf course, pink polo); **Stantt** has no video on
  stantt.com, only lifestyle photos (`cdn/shop/files/ss26_...jpg`, man in a striped linen shirt).
- Cut each shot to the vertical canvas with ffmpeg (`scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920`,
  no audio) into `assets/broll/`.
- **Logos:** the brand's own header logo in **white**, at full resolution (the website's
  `assets/logos/logo-*.webp` files are only 240px wide and go soft when large). Leelo Active:
  `leeloactive.com/cdn/shop/files/WhiteLogo.svg`; Billy Bones Club:
  `BBC_Primary_Logo-2022-White_*.png`; Stantt: the inline `<svg>` inside `a.header__logo` on stantt.com,
  saved with `fill="#ffffff"`. Show at ~620–660px wide, centred at y ~900, rising in (opacity, y 24,
  scale .94, blur 10 → 0, 0.5s emilOut) on each hard cut, over a soft radial dim.
- Each shot cuts **on the spoken name**. Names said close together (Stantt got 0.3s) still get at
  least ~0.8s: start that shot a little before its name rather than flashing it.

## 7. Full-screen sections

**AI motion design.** For a line like "Upnova's AI builds your entire upsell system in one go", Son
asked for "animations, illustrations, and motion design", **full-screen graphics with no face
bubble**, the real logo, and the five offers (bundle builder, free gift with purchase, order volume,
product volume, buy X get Y). See `templates/ai-build.html`: the white wordmark rises in, a prompt bar
types "Build my entire upsell system" as it is said, five empty slots appear, and on "in one go" they
all fill at once as the five offers with icons and green "Live" tags. Dark stage. The voice keeps
playing underneath; captions are off. "AI" gets a soft one-way green glow, no pulse.

**Brand video testimonial** (`upnova-illustrations` → `testimonial.html`). Son: "a section to show
video testimonial from a brand, highlighting a result."
- Use a real founder video. Ready-cut clips (fetch-assets): `assets/testimonials/stantt-matt.mp4`,
  `stantt-matt-short.mp4`, `devonlang-tyler.mp4`, `bluecorn-tessa-full.mp4`, `cannanda-lee.mp4`. Full
  originals to recut from: `media/sources/stantt/testimonial-matt.mp4` (the clean take; the website's
  v2/v3 files have burned-in captions), `media/sources/cannanda/testimonial-dr-lee-know.mp4`,
  `media/sources/bluecorn/tessa-testimonial-720p.mp4`. Other case-study videos are in the
  `upez/upnova-website` repo, `public/case-studies/<brand>/assets/`.
- Cut to the sentence that states the result (Stantt: 22.45s to 28.95s, "In our last test alone, we
  increased conversion rate 34% and our RPV 30%"), framed in a rounded card. Mark the video
  `data-has-audio="true"`.
- Name pill **centered above the video**, outlined: "Matt · CEO," + the brand's real wordmark.
- Captions inside the card in the §3 style with hard cuts; the result figures below the card in
  glossy Apple Garamond, counting up on the words that say them, labels on the same baseline.
- **Which founder videos exist** (checked 2026-10-19): only two spoken ones. The 14 clips in
  `public/testimonials/videos/` are 2–8s **silent** loops, not testimonials.
  - **Stantt, Matt** (`media/sources/stantt/testimonial-matt.mp4`, 1280x720, has the result):
    22.0s to 28.35s, "In our last test alone, we increased conversion rate 34% and RPV 30%." (In at
    +0.07, "we increased" +2.0, "conversion rate 34%" +2.98, "and RPV 30%." +4.5; 34% lands +3.52,
    30% +5.36.) Crop with `object-position: 47% 50%`.
  - **Cannanda, Dr. Lee Know** (`media/sources/cannanda/testimonial-dr-lee-know.mp4`, only
    204x360, no numbers): 23.85s to 27.55s, "When we asked on Thursday, it was implemented on Monday."
    Use the **narrow card** (`templates/testimonial-narrow.html`: 540x960, upscaled with lanczos,
    captions at 92px under the card) so the low resolution doesn't show. Logo:
    `assets/brand/cannanda-wordmark.png`.
  - **Bluecorn, Tessa** (`media/sources/bluecorn/tessa-testimonial-720p.mp4`, a YouTube download,
    1280x720 with a portrait panel and burned-in captions at the bottom): 17.3–19.0s "And since then,
    yeah, it's up 10%" + 23.45–27.75s "…top line sales in our Shopify store are up 30%." Crop
    `386:520:722:40` (whole head, above the burned captions), scale to 640x862. Her chin is cut in the
    recording itself.
- Order: the founder with a number first. Hard cuts between founders with a soft whoosh; a low boom on
  each result figure.

**Highlight a feature in a screenshot** (`upnova-illustrations` → `screenshot-highlight.html`).
Son: show the screen, then focus on the feature and point at it.
1. **Show it in plain 2D first**: the whole screenshot rises in, flat and sharp.
2. **Then a 3D camera move** to focus: push in tight (closer camera, `z` ~1080, about 3x, feature in
   the middle of the screen, §0d.4), a **gentle X tilt (~12°)**
   and a stronger **Y turn (~−24°)**, `transform-origin` on the feature, inside a parent with
   `perspective: 1600px`. Son rejected a steep X tilt (34°) and a swing-in from an angle at the start.
3. **Lens blur like a long focal lens**, not dimming: the sharp screenshot plus two blurred copies
   (5px and 16px) masked by radial gradients centred on the feature, so it stays sharp and the blur
   grows with distance. They fade in during the camera move.
4. **Point and name it**: a hand-drawn ring drawn **on the screen itself** (an SVG inside the 3D
   phone, so it follows the perspective), a plain-words label pill, and an arrow drawing from the
   label to the ring. Hide each line until it starts drawing, or its round cap shows as a dot.

## 8. Motion: Emil Kowalski easing (Son hates bouncy easing)

Emil Kowalski's design-engineering rules, in short:
- Register two eases with CustomEase (load `gsap@3.14.2/dist/CustomEase.min.js` in `index.html`):
  `emilOut` = cubic-bezier(0.23, 1, 0.32, 1) for entrances and exits, `emilInOut` =
  cubic-bezier(0.77, 0, 0.175, 1) for on-screen moves, line draws and fills. Each template guards for
  a missing CustomEase and falls back to expo.out / expo.inOut.
- **Never** `back.out`, elastic, overshoot, scale yoyo pulses, "breathing" numbers, shakes or wiggles.
- Pop-ins start at scale 0.9–0.95 with opacity 0, never from 0 (nothing appears from nothing).
- Linear (`none`) only for slow backdrop drifts and progress segments.
- Captions are the exception: they don't animate at all (hard cuts, §3).

## 9. Sound

Son asked for "cinematic sounds: whoosh, rise, hits, don't overdo it", then for more in the hook:
"ambient, fillers, maybe music, something to grab attention, but don't go over the top."

**Sound effects**
- Get them with the `find_sound_effect` tool. Start each one at `moment − peakOffset` so the
  peak lands on the word.
- Keep levels low, under the voice: `data-volume` 0.2–0.35 (louder files lower). UI pops ~0.35–0.4,
  typing ~0.14.
- Measure loudness with `ffmpeg -af volumedetect`. The voice was about −22 dB mean.
- Roughly one cue per claim, a couple in the opening, and a handful in the motion section.

| Moment | Sound |
| ------ | ----- |
| Headline number or claim lands ("cheat code", "10%", "Guaranteed") | low cinematic boom (~0.28) |
| Big claim ("600+ stores", "get started / install Upnova") | whoosh into impact (~0.24) |
| Card or section change | soft airy whoosh (~0.2) |
| AI prompt being typed | keyboard typing with a volume-lane fade in/out |
| Lead-in to a payoff ("in one go", "AOV takes off") | riser with a volume lane that swells then cuts |
| Payoff hit ("in one go") | low boom |
| Things going live, sending a prompt | UI pop |
| "3 minutes" | light clock ticking with a fade in/out |
| Strong denial ("Not at all") | heavy impact |

- Overlapping sounds go on separate tracks, or the check warns. Two videos with sound in different
  sections also need different `data-track-index` values (`duplicate_audio_track`).

**Music: ask first**
- On the free-gift reel Son **took the music out before the final render**. Don't add music by default;
  offer it in the plan and let Son decide.
- If Son wants it: **techy, exciting, important** (energetic electronic, bold synth pulses,
  product-launch energy). Son rejected a calm ambient bed as "too peaceful". Keep it low (~0.12–0.16)
  under the claim sections, with fades on the `data-automation` volume lane.
- Delete music candidates you don't use from `assets/`.

## 10. Checks before replying

- Run `hyperframes check` until it passes. Watch for these:
  - Style sub-composition children with `[data-composition-id="<id>"] .class`, not `#root .class`.
    The root id clashes with the main root's, the styles don't apply, and every caption group stacks
    down the page.
  - Give flex children in claim cards `flex-shrink: 0` so the small lines don't collapse onto the
    headline.
  - Don't use `z-index:-1`. Order the pill background before the text in the DOM instead.
  - Keep headline words inside the stage. Bold uppercase runs ~0.68 × font-size per character:
    shrink long words rather than letting them overflow.
  - Elements that move off-frame on purpose (logo rows, drifting backdrops, a drawer waiting off
    screen) need `data-layout-allow-overflow`; text pairs that cross-fade need
    `data-layout-allow-overlap`.
  - `<img>` inside a sub-composition gets a default 3s clip window and vanishes: use a div with
    `background-image` instead.
  - A filled bar that grows in steps: `fromTo` for the first step, `to` for the rest, or later steps'
    start values show at frame 0.
  - Studio adds attributes (`data-hf-id`, `=""`) to elements you wrote; match loosely when editing
    by script.
- Make sure no text is under 56px and nothing sits in the top half unless Son asked for it.
- Snapshot the opening, each claim, the changed sections and a few caption moments with
  `hyperframes snapshot . --at ... -o /tmp/<dir> --describe false`, then look at them.
- Clean up temp files, and ask before deleting anything you didn't create in this run.
- Tell Son in plain words what changed on screen. Say what wasn't verified (for example, the sound
  mix hasn't been listened to, or the motion hasn't been watched at full speed).
