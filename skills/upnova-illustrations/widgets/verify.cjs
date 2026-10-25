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
// Check a capture: render <out-dir>/<name>.html on its own and compare it with <name>.png from Storybook.
//   node verify.cjs <out-dir> <name>
// Writes <name>.copy.png and prints how many pixels differ by more than a little (photos saved sharper
// than Storybook's thumbnails account for a few hundred).
const [dir, name] = process.argv.slice(2);
(async () => {
  const frag = fs.readFileSync(path.join(dir, name + ".html"), "utf8");
  const test = path.join(dir, name + ".test.html");
  fs.writeFileSync(test, `<!doctype html><html><head><style>:root{--fg-font:ui-sans-serif, system-ui, sans-serif}body{margin:0;background:#fff}#w{display:inline-block}</style></head><body><div id="w">${frag}</div></body></html>`);
  const b = await puppeteer.launch({ executablePath: exe, headless: true });
  const p = await b.newPage();
  await p.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });
  await p.goto("file://" + path.resolve(test), { waitUntil: "networkidle0" });
  await (await p.$("#w > *")).screenshot({ path: path.join(dir, name + ".copy.png") });
  const a = fs.readFileSync(path.join(dir, name + ".png")).toString("base64"), c = fs.readFileSync(path.join(dir, name + ".copy.png")).toString("base64");
  const diff = await p.evaluate(async (a, c) => {
    const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = "data:image/png;base64," + s; });
    const [A, C] = await Promise.all([load(a), load(c)]);
    if (A.width !== C.width || A.height !== C.height) return "size differs: " + A.width + "x" + A.height + " vs " + C.width + "x" + C.height;
    const px = img => { const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height; const x = cv.getContext("2d"); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height).data; };
    const da = px(A), dc = px(C); let n = 0;
    for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - dc[i]) + Math.abs(da[i + 1] - dc[i + 1]) + Math.abs(da[i + 2] - dc[i + 2]) > 120) n++;
    return n + " of " + (da.length / 4) + " pixels differ";
  }, a, c);
  console.log(name + ": " + diff);
  fs.unlinkSync(test);
  await b.close();
})();
