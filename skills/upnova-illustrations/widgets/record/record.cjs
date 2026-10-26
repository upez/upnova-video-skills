#!/usr/bin/env node
// Record a real Upnova widget playing its own animations, on the browser's real clock.
//
//   node widgets/record/record.cjs cart   widgets/fixtures/rare-beauty-free-gift.json assets/widgets/free-gift/free-gift-cart.mp4
//   node widgets/record/record.cjs banner widgets/fixtures/rare-beauty-free-gift.json assets/widgets/free-gift/free-gift-banner.mp4
//
// It opens the capture page (cart.html / banner.html, which load the widget bundle built by widgets/live/build.sh),
// mounts the widget with the fixture, records the screen at 3x while it does what a shopper does, and writes a
// constant 30 fps MP4 where every frame shows the widget at that moment (frames keep their real timestamps).
// Next to the MP4 it writes <name>.json with the action times, so the section can time its camera to them.
//
// Cart: holds fixture.cart.hold s (1.5), sets the line quantity to fixture.cart.addTo, records fixture.cart.after
//       s more (6: update, prices, goals bar, Claim, the cart's own claim sheet). Set hold so the tap lands on the
//       section's beat and the recording can start at the section's 0.
// Banner: sets each fixture.banner.steps[].cart at its time (+1 s), records until fixture.banner.after s (2.5) after the last.
//
// Needs puppeteer-core and Chrome (found as in the comments below) and ffmpeg on PATH.
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync, execSync } = require("child_process");

function firstExisting(list) { return list.find(p => p && fs.existsSync(p)); }
const puppeteerPath = firstExisting([
  process.env.PUPPETEER_CORE,
  "/Applications/HyperFrames.app/Contents/Resources/app.asar.unpacked/node_modules/puppeteer-core",
  (() => { try { return path.join(execSync("npm root -g").toString().trim(), "puppeteer-core"); } catch (e) { return null; } })(),
]);
if (!puppeteerPath) { console.error("puppeteer-core not found: npm i -g puppeteer-core, or set PUPPETEER_CORE"); process.exit(1); }
const puppeteer = require(puppeteerPath);
const cache = path.join(os.homedir(), ".cache/puppeteer/chrome");
const chrome = firstExisting([
  process.env.CHROME_PATH,
  ...(fs.existsSync(cache) ? fs.readdirSync(cache).map(d => path.join(cache, d, "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing")) : []),
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]);
if (!chrome) { console.error("No Chrome found: set CHROME_PATH"); process.exit(1); }

const [kind, fixturePath, outPath] = process.argv.slice(2);
if (!["cart", "banner"].includes(kind) || !fixturePath || !outPath) { console.error("usage: record.cjs cart|banner <fixture.json> <out.mp4>"); process.exit(1); }
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const SCALE = 3, FPS = 30;
const size = kind === "cart" ? { width: 430, height: 932 } : { width: 430, height: 232 };

(async () => {
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--allow-file-access-from-files", "--hide-scrollbars", "--font-render-hinting=none"] });
  const page = await browser.newPage();
  page.on("pageerror", e => console.error("page error:", e.message));
  await page.setViewport({ ...size, deviceScaleFactor: SCALE });
  await page.goto("file://" + path.join(__dirname, kind + ".html"), { waitUntil: "load" });

  // mount with the fixture and let photos load
  await page.evaluate(async (kind, f) => {
    const host = document.getElementById("widget");
    if (kind === "cart") {
      window.__widget = await window.UpnovaFreeGiftCart.mount(host, f);
    } else {
      const b = f.banner;
      window.__widget = await window.UpnovaFreeGiftBanner.mount(host, {
        tiers: [{ title: b.tierTitle, minPurchaseValue: b.goal, gifts: f.goals.gifts.map(g => ({ title: g.title, image: g.image })) }],
        settings: {}, cart: b.steps[0].cart,
      });
    }
    const imgs = [...document.images];
    host.shadowRoot && imgs.push(...host.shadowRoot.querySelectorAll("img"));
    await Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
    await new Promise(r => setTimeout(r, 800));
  }, kind, fixture);

  // record: CDP screencast frames carry the real time they were painted
  const cdp = await page.target().createCDPSession();
  const frames = [];
  cdp.on("Page.screencastFrame", async f => {
    frames.push({ ts: f.metadata.timestamp, data: f.data });
    cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "png", maxWidth: size.width * SCALE, maxHeight: size.height * SCALE, everyNthFrame: 1 });
  await new Promise(r => setTimeout(r, 300));
  const t0 = await page.evaluate(() => performance.timeOrigin / 1000 + performance.now() / 1000);

  let actions, length;
  if (kind === "cart") {
    const hold = fixture.cart.hold || 1.5;
    actions = [{ at: hold, label: "add one more" }];
    length = hold + (fixture.cart.after || 6);
    await page.evaluate((q, at) => setTimeout(() => window.__widget.changeQuantity(q), at * 1000), fixture.cart.addTo, hold);
  } else {
    actions = fixture.banner.steps.slice(1).map(s => ({ at: s.at + 1, label: "cart " + s.cart }));
    length = actions[actions.length - 1].at + (fixture.banner.after || 2.5);
    await page.evaluate(steps => steps.forEach(s => setTimeout(() => window.__widget.setCart(s.cart), (s.at + 1) * 1000)), fixture.banner.steps.slice(1));
  }
  await new Promise(r => setTimeout(r, length * 1000 + 300));
  await cdp.send("Page.stopScreencast");
  await browser.close();
  if (!frames.length) { console.error("no frames recorded"); process.exit(1); }

  // constant frame rate: each output frame is the last screen painted at or before its time
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "upnova-record-"));
  frames.sort((a, b) => a.ts - b.ts);
  let k = 0;
  const n = Math.round(length * FPS);
  for (let i = 0; i < n; i++) {
    const t = t0 + i / FPS;
    while (k + 1 < frames.length && frames[k + 1].ts <= t) k++;
    fs.writeFileSync(path.join(dir, String(i).padStart(5, "0") + ".png"), Buffer.from(frames[k].data, "base64"));
  }
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  execFileSync("ffmpeg", ["-y", "-v", "error", "-framerate", String(FPS), "-i", path.join(dir, "%05d.png"),
    "-vf", "scale=" + size.width * SCALE + ":" + size.height * SCALE + ":flags=lanczos,format=yuv420p",
    "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-movflags", "+faststart", outPath]);
  fs.rmSync(dir, { recursive: true, force: true });
  const meta = { kind, fixture: path.basename(fixturePath), fps: FPS, length, scale: SCALE, size, actions, frames: frames.length, recorded: new Date().toISOString() };
  fs.writeFileSync(outPath.replace(/\.[a-z0-9]+$/i, ".json"), JSON.stringify(meta, null, 2));
  console.log("recorded", outPath, frames.length, "painted frames over", length + "s");
})().catch(e => { console.error(e); process.exit(1); });
