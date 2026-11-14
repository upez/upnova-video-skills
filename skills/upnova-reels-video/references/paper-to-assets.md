# Paper to assets (widget and offer designs)

Supersedes `figma-to-html.md` for widget and offer assets. Son, 13 November 2026, on the
"Three Step AOV Framework" reel: "for the assets, instead of using Figma, use Paper MCP."
The Figma method stays in `figma-to-html.md` for the films already built with it.

## Where the designs live

- Paper file **"Upnova upsell widgets"**: https://app.paper.design/file/01M707RRJW9T96VDJ7T56KZQDV/p-1-0
- Son names the node when he wants a specific design. Examples from the AOV reel (November 2026):
  `/p-1-0/QR-0` (an upsell page design) and `/p-1-0/60J-0` (the plain cross-sell widget: product
  image, product title, price — no variant selector, no button).

## Reading and capturing a node

1. Load the Paper MCP guide first (`get_guide`, topic `paper-mcp-instructions`), then
   `get_basic_info` (omit `fileId` when Son has the file open) and `get_children` to find the named
   node on the page.
2. Capture the node with `get_screenshot` at its native size and save the PNG into the project's
   `assets/paper/` with a short descriptive name (`bundle-page-mobile.png`,
   `cross-sell-product-page.png`, ...).
3. Node ids change when Son edits the file: list the canvas again instead of trusting an old id.

## Using it in the reel

- **Never crop the widget image** unless the spoken line names one specific widget or small detail in
  the picture (Son, twice on the AOV reel: "NEVER crop them UNLESS we're talking about a specific
  widget or small detail in the picture", then "again, don't crop, check the other images too").
  When the voice points at one part, keep the whole frame and draw a red marker scribble around that
  part as it is said (an SVG path with `pathLength="1"` revealed by a `strokeDashoffset` tween —
  see the `.scrib` paths and `scribble()` in `compositions/props.html` of the AOV reel project).
- Place the PNG as a held card's `background-image` with `background-size: 100% 100%`, like the
  `.shot` cards in the AOV reel's `compositions/props.html`: black 5px border, 18px radius, drop
  shadow, rising from the desk (that project breaks the no-fade rule on purpose, reference-reel style).
- Keep the client products the design shows; change only the numbers the film needs.
