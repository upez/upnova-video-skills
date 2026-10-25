// Capture a story from the Upnova widget Storybook (https://upnova-widgets.vercel.app) as static HTML:
// the real markup, each element's own computed styles inlined (only those that differ from the browser
// default or its parent), images saved next to it, plus a reference PNG to compare against.
//
//   node capture.cjs <story-id> <out-dir> <name> [root-selector] [--open-cart]
//   FG_TIERS='{"shipping":400,"gift":440,"discount":900}' node capture.cjs ...   (cart goal thresholds)
//
// Needs puppeteer-core and a Chrome. It looks for them in this order: $PUPPETEER_CORE / $CHROME_PATH,
// the HyperFrames app's own copy, a global `npm i -g puppeteer-core`, and Chrome for Testing in
// ~/.cache/puppeteer or Google Chrome in /Applications.
const fs = require("fs");
const path = require("path");
const https = require("https");
function firstExisting(list) { return list.find(p => p && fs.existsSync(p)); }
const puppeteerPath = firstExisting([
  process.env.PUPPETEER_CORE,
  "/Applications/HyperFrames.app/Contents/Resources/app.asar.unpacked/node_modules/puppeteer-core",
  (() => { try { return path.join(require("child_process").execSync("npm root -g").toString().trim(), "puppeteer-core"); } catch (e) { return null; } })(),
]);
if (!puppeteerPath) { console.error("puppeteer-core not found: npm i -g puppeteer-core, or set PUPPETEER_CORE"); process.exit(1); }
const puppeteer = require(puppeteerPath);
const cache = path.join(process.env.HOME, ".cache/puppeteer/chrome");
const exe = firstExisting([
  process.env.CHROME_PATH,
  ...(fs.existsSync(cache) ? fs.readdirSync(cache).map(d => path.join(cache, d, "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing")) : []),
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]);
if (!exe) { console.error("No Chrome found: set CHROME_PATH"); process.exit(1); }
const [id, outDir, name, rootSel] = process.argv.slice(2).filter(a => !a.startsWith("--"));
const openCart = process.argv.includes("--open-cart");

function get(url, dest, n = 0) {
  return new Promise((res, rej) => {
    const req = https.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 20000 }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location && n < 5) return res(get(new URL(r.headers.location, url).href, dest, n + 1));
      if (r.statusCode !== 200) return rej(new Error(url + " " + r.statusCode));
      const f = fs.createWriteStream(dest); r.pipe(f); f.on("finish", () => f.close(res));
    }); req.on("error", rej); req.on("timeout", () => { req.destroy(new Error("timeout")); });
  });
}

(async () => {
  fs.mkdirSync(path.join(outDir, "img"), { recursive: true });
  const b = await puppeteer.launch({ executablePath: exe, headless: true, args: ["--hide-scrollbars"] });
  const p = await b.newPage();
  await p.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });
  if (process.env.FG_TIERS) {
    // re-set the story's goal thresholds so the real component renders the state we want
    await p.evaluateOnNewDocument((t) => {
      const T = JSON.parse(t);
      const hook = (name, fix) => { let v; Object.defineProperty(window, name, { configurable: true, get: () => v, set: (nv) => { v = fix(nv); } }); };
      hook("UPEZ_FREE_SHIPPING_TIERS", a => (a || []).map(x => ({ ...x, goal_value: T.shipping ?? x.goal_value })));
      hook("UPEZ__FREE_GIFT_DISCOUNTS", a => (a || []).map(d => ({ ...d, tiers: d.tiers.map(x => ({ ...x, minPurchaseValue: T.gift ?? x.minPurchaseValue })) })));
      hook("UPEZ__ORDER_VOLUME_DISCOUNTS", a => (a || []).map(d => ({ ...d, tiers: d.tiers.map(x => ({ ...x, requiredPurchase: T.discount ?? x.requiredPurchase })) })));
    }, process.env.FG_TIERS);
  }
  await p.goto("https://upnova-widgets.vercel.app/iframe.html?id=" + id + "&viewMode=story", { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise(r => setTimeout(r, 1200));
  if (openCart) {
    await p.evaluate(() => { const el = document.querySelector("#CartButton"); if (el) el.click(); });
    await new Promise(r => setTimeout(r, 2500));
  }
  // stop shimmer and transitions so the capture is a still state
  // settle every animation at its end state (looping shimmers are cancelled) so the capture is a still state
  await new Promise(r => setTimeout(r, 1500));
  await p.evaluate(() => document.getAnimations().forEach(a => { try { const t = a.effect.getComputedTiming(); if (t.iterations === Infinity) a.cancel(); else a.finish(); } catch (e) {} }));
  await new Promise(r => setTimeout(r, 300));
  const result = await p.evaluate((rootSel) => {
    const root = rootSel ? document.querySelector(rootSel) : document.querySelector("#storybook-root").firstElementChild;
    const sandbox = document.createElement("iframe");
    sandbox.style.cssText = "position:absolute;width:0;height:0;border:0";
    document.body.appendChild(sandbox);
    const sdoc = sandbox.contentDocument;
    const defaults = {};
    const SKIP = /^(transition|animation|cursor|caret|pointer-events|user-select|-webkit-tap|will-change|outline|touch-action|scroll|overscroll|text-size-adjust|-webkit-text-size|-webkit-font-smoothing|-moz|tab-size|perspective-origin|transform-origin|inline-size|block-size|min-inline|min-block|max-inline|max-block|border-block|border-inline|inset-block|inset-inline|margin-block|margin-inline|padding-block|padding-inline|overflow-block|overflow-inline|-webkit-border|-webkit-mask|x$|y$|r$|rx|ry|cx|cy|d$)/;
    function defaultsFor(el) {
      const key = el.namespaceURI + el.tagName;
      if (!defaults[key]) {
        const d = sdoc.createElementNS(el.namespaceURI, el.tagName.toLowerCase());
        (el.namespaceURI.includes("svg") ? (sdoc.body.querySelector("svg") || sdoc.body.appendChild(sdoc.createElementNS(el.namespaceURI, "svg"))) : sdoc.body).appendChild(d);
        const cs = sandbox.contentWindow.getComputedStyle(d);
        defaults[key] = {};
        for (const prop of cs) defaults[key][prop] = cs.getPropertyValue(prop);
      }
      return defaults[key];
    }
    const imgs = [];
    const clone = root.cloneNode(true);
    const src = [root, ...root.querySelectorAll("*")];
    const dst = [clone, ...clone.querySelectorAll("*")];
    src.forEach((el, i) => {
      const c = dst[i];
      const cs = getComputedStyle(el);
      const def = defaultsFor(el);
      const parentCs = el.parentElement ? getComputedStyle(el.parentElement) : null;
      const out = [];
      for (const prop of cs) {
        if (prop.startsWith("--") || prop === "-webkit-locale" || SKIP.test(prop)) continue;
        const v = cs.getPropertyValue(prop);
        const inherited = /^(color|font|letter-spacing|line-height|text-|white-space|word|visibility|direction|fill|stroke)/.test(prop);
        const bodyDef = defaultsFor(sdoc.body);
        const tagOverrides = def[prop] !== bodyDef[prop];
        if (inherited && parentCs && parentCs.getPropertyValue(prop) === v && i > 0 && !tagOverrides) continue;
        const borderWidth = /^border-(top|right|bottom|left)-width$/.test(prop) && cs.getPropertyValue(prop.replace("-width", "-style")) !== "none";
        // inherited properties are compared with the parent (written when they differ), the rest with the tag default
        if (!inherited && def[prop] === v && !borderWidth) continue;
        // these read back as the current colour; writing them down would pin that colour on every descendant
        if (/^(-webkit-text-fill-color|-webkit-text-stroke-color|text-decoration-color|text-emphasis-color|caret-color|column-rule-color)$/.test(prop) && v === cs.getPropertyValue("color")) continue;
        if (prop === "font-family") { out.push("font-family:var(--fg-font)"); continue; }
        out.push(prop + ":" + v);
      }
      [...c.attributes].forEach(a => { if (!/^(part|viewBox|d|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|fill-rule|clip-rule|xmlns|width|height|x|y|cx|cy|r|rx|ry|points|transform|src|alt|role|aria-valuenow)$/.test(a.name)) c.removeAttribute(a.name); });
      if (c.tagName === "IMG") {
        if (el.currentSrc && !/width=8\b/.test(el.currentSrc) && el.naturalWidth > 0) imgs.push(el.currentSrc);
        c.setAttribute("src", el.currentSrc || el.src);
      }
      const r = el.getBoundingClientRect();
      if (i === 0) out.push("width:" + r.width + "px");
      if (out.length) c.setAttribute("style", out.join(";"));
    });
    // drop the blurred low-res image placeholders
    clone.querySelectorAll('[part$="image-low-res"]').forEach(n => n.parentElement && n.parentElement.remove());
    const r = root.getBoundingClientRect();
    return { html: clone.outerHTML, imgs, rect: { x: r.x, y: r.y, width: r.width, height: r.height } };
  }, rootSel || null);
  const el = rootSel ? await p.$(rootSel) : await p.$("#storybook-root > *");
  await el.screenshot({ path: path.join(outDir, name + ".png") });
  // save images at a sharper size and point the markup at them
  let html = result.html;
  let k = 0;
  const map = {};
  for (const u of [...new Set(result.imgs)]) {
    const big = u.replace(/([?&]width=)\d+/, "$1600").replace(/picsum\.photos\/seed\/([^/?]+)\/(\d+)(?:\/(\d+))?/, (m, seed, w, h) => "picsum.photos/seed/" + seed + "/" + (+w * 6) + (h ? "/" + (+h * 6) : ""));
    const file = "img/" + name + "-" + (++k) + (/\.png/i.test(u) ? ".png" : ".jpg");
    try { await get(big, path.join(outDir, file)); map[u] = file; } catch (e) { console.error("image failed", u, e.message); }
  }
  html = html.replace(/src="([^"]+)"/g, (m, u) => { const raw = u.replace(/&amp;/g, "&"); return map[raw] ? 'src="' + map[raw] + '"' : m; });
  fs.writeFileSync(path.join(outDir, name + ".html"), html);
  console.log(name, JSON.stringify(result.rect), "images", Object.keys(map).length, "chars", html.length);
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
