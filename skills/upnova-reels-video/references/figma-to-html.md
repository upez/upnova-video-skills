# Figma design to video illustration (Figma to HTML)

Learned on the Audience Segment launch film (HyperFrames project "New video 2", 29 October 2026).
Son: "too squeezed here. Why is the design so hard for you to match? Isn't there a Figma to HTML
tool?" Redrawing a Figma screen by eye from a screenshot drifted every time (wrong spacing, wrong
tiers, squeezed cards). Converting the frame's own code fixed it in one pass.

**Rule: when Son gives a Figma link for a screen (a cart, a product page, a widget), convert the
frame to HTML. Never redraw it by eye, and never crop a screenshot of it.**

## Where Upnova's designs live

- File `XkRTHbJxUbfjmYEJ8lZMiJ` ("Upnova-website"). Son names the frames so they are easy to find.
- Canvas `1850:356` "Upnova upsells": the real offers on real client stores (Zipster, Leelo Active),
  desktop and mobile, as `html.to.design` imports. Frames used so far:
  `1850:11508` "Bundle builder page mobile", `1850:19540` "Cart with bundle builder progress bar",
  `1851:22797` "Free gift mobile", `1851:23182` free gift.
- Node ids change when Son edits the file ("node not found"): list the canvas again with
  `get_metadata` and find the frame by its name.
- Keep the products that are in the Figma (Zipster, Leelo Active). Change only the numbers and copy
  the film needs.

## Steps

1. **Session and target.** Figma MCP `create_session` with the file key, then `get_screenshot` of the
   frame (`maxDimension` 2400) and download it with curl. That picture is the target to match, never
   an asset. Its `original_width` is the frame's real width (402 for the Zipster mobile frames).
2. **Load the guidance, then the code.** Read the MCP resource `skill://figma/figma-design-to-code/SKILL.md`
   first (the tool requires it), then call `get_design_context` on the frame with
   `skillNames: "resource:figma-design-to-code"` and `excludeScreenshot: true`. A whole page is too big
   for the reply: the tool saves it to a file and gives the path.
3. **Convert.** Run the script in this skill:

   ```
   python3 "$SKILL/scripts/figma-to-html/figma2html.py" <saved-context-file> <project> <name> \
     --edits edits.json --font "Roboto=assets/fonts/Roboto-Variable.ttf"
   ```

   It downloads every image and icon into `assets/figma/<name>/`, renders the React + Tailwind code to
   static HTML (esbuild + react-dom/server from `~/Projects/upnova/upez-frontend/node_modules`; pass
   `--node-modules` for another copy), applies the edits, compiles only the Tailwind classes it uses,
   scoped under `.figma-<name>`, and writes `fragment.html`, `fragment.css` and `preview.html` to
   `/tmp/figma2html-<name>/`.
4. **Edit the content, not the layout** (`edits.json`):
   - `replace`: the film's numbers and copy. Match whole strings ("Buy 3 pieces, 10% off"), since a
     short one like "15% off" also hits other lines.
   - `remove`: Figma node ids (`data-node-id`) of elements to drop, e.g. extra bundle slots.
   - `style`: inline styles for a node, e.g. re-centre a row after removing items from it.
   - `pin_bottom`: the sticky bar (bundle bar, checkout bar) to lift out and pin to the bottom of the
     phone screen. In the Figma frame it sits at the bottom of a page taller than a phone.
5. **The real font.** Figma names fonts `'Roboto:Medium'` and `'SF Pro:Regular'`; the HyperFrames lint
   rejects them. Download the real family into `assets/fonts/` (Roboto: Google Fonts on GitHub,
   `ofl/roboto/Roboto[wdth,wght].ttf`) and pass it with `--font`; the script maps every Figma font name
   to it.
6. **Check before wiring it in.** Screenshot `preview.html` with Chrome headless at the frame's width
   (`--window-size=402,870 --allow-file-access-from-files`, with an `assets` symlink next to it) and put
   it beside the Figma screenshot. Fix differences in the edits, not by hand in the output.
7. **Wire it into the scene.** Paste `fragment.css` into the composition's `<style>` and the fragment
   inside `<div class="figma-<name>" data-layout-allow-overlap>`. Size that wrapper to the Figma frame's
   width and the visible height, and scale it to the phone screen with a static CSS `transform` on the
   wrapper (GSAP never animates that element). A sticky bar over the content needs
   `data-layout-allow-overlap`, or `check` reports overlapping text. To show more of the page, scroll it
   with a GSAP `y` tween on `.figma-scroll`.

## Pitfalls that cost time

- Tailwind v3 turns `_` into spaces, so classes like `leading-[var(--line-height/31_5,31.5px)]` produce
  nothing and the text collapses into one line. The script keeps the fallback value of every `var()`
  in a class (`leading-[31.5px]`).
- Python's `urllib` fails on this Mac's certificates; the script downloads with curl.
- The Figma asset URLs expire after 7 days: always copy assets into the project.
- `html.to.design` frames are huge (160 KB of code for one mobile page). Never read the whole reply into
  the chat; work from the saved file.
- A composition's script runs before layout, so `getBoundingClientRect` returns 0. Measure text widths in
  Chrome headless once and hard-code them.
- Without the Figma MCP, the app's `hyperframes figma component '<url>'` does the same job but needs
  `FIGMA_TOKEN` (figma.com, Settings, Security, Personal access tokens).
