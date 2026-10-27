#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");
const puppeteer = require("/Applications/HyperFrames.app/Contents/Resources/app.asar.unpacked/node_modules/puppeteer-core");

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const [root, mode, outPath] = process.argv.slice(2);
const stories = {
  // Zipster Baby — bundle builder (page + cart progress), teal #228b97, live zipsterbaby.ie feed
  "zipster-page": { id: "showcase-zipster-baby--zipster-baby-bundle-builder-page", length: 8.5, actions: [1.2, 2.6, 4.0, 5.4] },
  "zipster-cart": { id: "showcase-zipster-baby--zipster-baby-cart-bundle-progress", length: 7.5, actions: [1.7] },
  // Tru Supplements — product volume tiers on the real ACV Complete product
  "tru-volume": { id: "widgets-product-volume-upsell-blue-berry--tru-supplements-protein", length: 6.5, actions: [1.6] },
  // Pixi Beauty — buy X get Y cross-sell, bottom of cart and below the matching cart item
  "pixi-bxgy-bottom": { id: "showcase-pixi-beauty--pixi-beauty-buy-x-get-y", length: 7.5, actions: [1.8] },
  "pixi-bxgy-below-item": { id: "showcase-pixi-beauty--pixi-beauty-buy-x-get-y-below-item", length: 7.5, actions: [1.8] },
};
if (!root || !stories[mode] || !outPath) {
  console.error("usage: record-offer-story.cjs <storybook-dir> <mode> <out.mp4>");
  process.exit(1);
}
const story = stories[mode];
const size = { width: 430, height: 932 };
const SCALE = 2;
const FPS = 30;
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".woff": "font/woff", ".woff2": "font/woff2", ".webp": "image/webp" };

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Zipster products all have size variants, so the real mobile flow is: + opens the card's
// size picker, then tapping a size row adds that variant. Rows are always in the DOM
// (clipped when closed), so click only a row the topmost element at its centre.
async function clickChoosePlus(page, cardIndex) {
  const point = await page.evaluate(idx => {
    const buttons = [...document.querySelectorAll('[part="upnova-choose-item-btn"]')].filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom < innerHeight - 150;
    });
    const el = buttons[Math.min(idx, buttons.length - 1)];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, cardIndex);
  if (point) await page.mouse.click(point.x, point.y);
}

async function clickSizeRow(page, sizeText, plus) {
  const point = await page.evaluate(({ txt, plus }) => {
    const onTop = (el, x, y) => { const top = document.elementFromPoint(x, y); return top && (el === top || el.contains(top)); };
    const rows = [...document.querySelectorAll("button")].filter(b => {
      if (b.innerText?.trim() !== txt) return false;
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.x < 430 && onTop(b, r.x + r.width / 2, r.y + r.height / 2);
    });
    const row = rows[0];
    if (!row) return null;
    const r = row.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, { txt: sizeText, plus });
  if (point) await page.mouse.click(point.x, point.y);
}

async function perform(page) {
  if (mode === "zipster-page") {
    let plus = null;
    await sleep(story.actions[0] * 1000);
    await clickChoosePlus(page, 0);
    plus = await page.evaluate(() => {
      const el = [...document.querySelectorAll('[part="upnova-choose-item-btn"]')].find(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom < innerHeight - 150; });
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    await sleep((story.actions[1] - story.actions[0]) * 1000);
    await clickSizeRow(page, "6-9M (68/74)", plus);
    await sleep((story.actions[2] - story.actions[1]) * 1000);
    await clickChoosePlus(page, 1);
    plus = await page.evaluate(() => {
      const el = [...document.querySelectorAll('[part="upnova-choose-item-btn"]')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom < innerHeight - 150; })[1];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    await sleep((story.actions[3] - story.actions[2]) * 1000);
    await clickSizeRow(page, "3-6M (62/68)", plus);
    return;
  }
  await sleep(story.actions[0] * 1000);
  if (mode === "zipster-cart") {
    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll("button")].filter(button => button.getAttribute("part") === "upnova-7554472a099f");
      buttons[0]?.click();
    });
  } else if (mode === "tru-volume") {
    await page.evaluate(() => {
      const label = [...document.querySelectorAll("*")].find(element => element.children.length === 0 && element.textContent?.trim() === "Triple Bundle");
      let target = label;
      while (target && target !== document.body) {
        const style = getComputedStyle(target);
        if (style.cursor === "pointer" || target.getAttribute("role") === "button") break;
        target = target.parentElement;
      }
      (target || label)?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  } else {
    const point = await page.evaluate(() => {
      const add = [...document.querySelectorAll("button")].find(button => button.innerText?.trim() === "Add");
      if (!add) return null;
      const rect = add.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
    if (point) await page.mouse.click(point.x, point.y);
  }
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars", "--font-render-hinting=none"] });
  const page = await browser.newPage();
  await page.setViewport({ ...size, deviceScaleFactor: SCALE });
  await page.setRequestInterception(true);
  page.on("request", request => {
    const url = new URL(request.url());
    if (url.hostname !== "storybook.local") return request.continue();
    let relative = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
    let file = path.resolve(root, relative);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, "index.html");
    request.respond({ status: 200, contentType: mime[path.extname(file)] || "application/octet-stream", body: fs.readFileSync(file) });
  });
  await page.goto(`http://storybook.local/iframe.html?id=${story.id}&viewMode=story${story.query || ""}`, { waitUntil: "networkidle2", timeout: 60000 });
  console.log("loaded", mode);
  await sleep(5000);
  await page.evaluate(() => window.scrollTo(0, 0));

  const cdp = await page.target().createCDPSession();
  const frames = [];
  cdp.on("Page.screencastFrame", frame => {
    frames.push({ ts: frame.metadata.timestamp, data: frame.data });
    cdp.send("Page.screencastFrameAck", { sessionId: frame.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: size.width * SCALE, maxHeight: size.height * SCALE, everyNthFrame: 1 });
  console.log("capturing", mode);
  await sleep(300);
  const t0 = await page.evaluate(() => performance.timeOrigin / 1000 + performance.now() / 1000);
  const actionPromise = perform(page);
  await sleep(story.length * 1000 + 300);
  await actionPromise;
  await cdp.send("Page.stopScreencast");
  console.log("captured", mode, frames.length);
  await browser.close();
  console.log("encoding", mode);

  frames.sort((a, b) => a.ts - b.ts);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "upnova-offer-record-"));
  let frameIndex = 0;
  const count = Math.round(story.length * FPS);
  for (let index = 0; index < count; index++) {
    const time = t0 + index / FPS;
    while (frameIndex + 1 < frames.length && frames[frameIndex + 1].ts <= time) frameIndex++;
    fs.writeFileSync(path.join(directory, String(index).padStart(5, "0") + ".jpg"), Buffer.from(frames[frameIndex].data, "base64"));
  }
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  execFileSync("ffmpeg", ["-y", "-v", "error", "-framerate", String(FPS), "-i", path.join(directory, "%05d.jpg"), "-vf", `scale=${size.width * SCALE}:${size.height * SCALE}:flags=lanczos,format=yuv420p`, "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-movflags", "+faststart", outPath]);
  fs.rmSync(directory, { recursive: true, force: true });
  fs.writeFileSync(outPath.replace(/\.[a-z0-9]+$/i, ".json"), JSON.stringify({ mode, story: story.id, fps: FPS, length: story.length, actions: story.actions, size, scale: SCALE, paintedFrames: frames.length }, null, 2));
  console.log(`recorded ${mode}: ${frames.length} painted frames over ${story.length}s`);
})().catch(error => { console.error(error); process.exit(1); });
