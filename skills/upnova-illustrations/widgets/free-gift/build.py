#!/usr/bin/env python3
"""Build the free gift templates from the captured real widgets.

    python3 build.py

Reads captures/*.html (made by ../capture.cjs from the Upnova widget Storybook) and writes
  ../../templates/free-gift-banner.html  (product page banner: progress fills, then unlocks)
  ../../templates/free-gift-cart.html    (cart drawer: one more item unlocks the gift, claim sheet opens)
and the gift photos into ../../assets/widgets/free-gift/.

Nothing about the widget is drawn here: the markup and every style come from the captures. This script
only gives the moving parts ids, layers two real states where the widget changes, and writes the timeline.
"""
import hashlib, io, os, re
from bs4 import BeautifulSoup
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(os.path.dirname(HERE))
CAP = os.path.join(HERE, "captures")
ASSET_DIR = "assets/widgets/free-gift"
os.makedirs(os.path.join(SKILL, ASSET_DIR), exist_ok=True)

_images = {}


def load(name):
    return BeautifulSoup(open(os.path.join(CAP, name + ".html")).read(), "html.parser")


def localise_images(soup):
    """<img> becomes a div with a background image (an <img> in a sub-composition gets a 3 s clip window);
    each photo is saved once, at most 480 px, under assets/widgets/free-gift/."""
    for img in soup.find_all("img"):
        src = img.get("src", "")
        path = os.path.join(CAP, src)
        if not os.path.isfile(path):
            continue
        data = open(path, "rb").read()
        h = hashlib.md5(data).hexdigest()
        if h not in _images:
            im = Image.open(io.BytesIO(data)).convert("RGB")
            im.thumbnail((480, 480))
            rel = "%s/photo-%d.jpg" % (ASSET_DIR, len(_images) + 1)
            im.save(os.path.join(SKILL, rel), quality=86)
            _images[h] = rel
        style = img.get("style", "")
        fit = "contain" if "object-fit:contain" in style else "cover"
        div = soup.new_tag("div")
        if img.get("part"):
            div["part"] = img["part"]
        div["role"] = "img"
        div["aria-label"] = img.get("alt", "")
        div["style"] = style + ";background:url('%s') center / %s no-repeat" % (_images[h], fit)
        img.replace_with(div)
    return soup


def part(soup, name, i=0):
    return soup.find_all(attrs={"part": name})[i]


def set_style(el, extra):
    el["style"] = el.get("style", "") + ";" + extra


# ---------------------------------------------------------------- product page banner
P = localise_images(load("banner-primary"))
U = localise_images(load("banner-unlocked"))

part(P, "upnova-free-gift-pdp-banner")["id"] = "free-gift-banner-widget"
badge = part(P, "upnova-free-gift-pdp-badge")
unl = part(U, "upnova-free-gift-pdp-unlocked")
unl["id"] = "free-gift-banner-unlocked"
badge.insert_after(unl)
part(P, "upnova-free-gift-pdp-headline").find("strong")["id"] = "free-gift-banner-threshold"
track = part(P, "upnova-free-gift-pdp-progress-track")
fill = part(P, "upnova-free-gift-pdp-progress-fill")
fill["id"] = "free-gift-banner-fill"
shim = part(P, "upnova-progress-line-shimmer")
shim["id"] = "free-gift-banner-shimmer"
okfill = part(U, "upnova-free-gift-pdp-progress-fill")
okfill["id"] = "free-gift-banner-fill-ok"
fill.insert_after(okfill)
msg = part(P, "upnova-free-gift-pdp-progress-message")
set_style(msg, "position:relative")
msg.find("p")["id"] = "free-gift-banner-msg"
msg.find("strong")["id"] = "free-gift-banner-away"
okp = part(U, "upnova-free-gift-pdp-progress-message").find("p")
okp["id"] = "free-gift-banner-msg-ok"
set_style(okp, "position:absolute;left:0;top:0;right:0")
msg.append(okp)
for i, g in enumerate(P.find_all(attrs={"part": "upnova-free-gift-pdp-gift"})):
    g["id"] = "free-gift-banner-g%d" % i
BANNER = str(P)

# ---------------------------------------------------------------- cart drawer
C = localise_images(load("cart-progress"))
CU = localise_images(load("cart-unlocked"))
S = localise_images(load("cart-claim-sheet"))


def cart_ids(soup, pre):
    root = soup.find()
    root["id"] = pre
    fills = soup.find_all(attrs={"part": "upnova-lpm-bar-fill"})
    for i, f in enumerate(fills):
        f["id"] = "%s-bar%d" % (pre, i)
    dist = part(soup, "upnova-lpm-distance-text")
    dist["id"] = pre + "-distance"
    # quantity and prices of the line item, so both states can show one more hoodie
    n = 0
    for el in soup.find_all(string=re.compile(r"^\s*4\s*$")):
        if el.parent.get("id") is None:
            el.parent["id"] = "%s-qty%d" % (pre, n)
            n += 1
    # prices change, so they lose the fixed width the capture measured
    for name, suffix in (("line-price", "-price"), ("original-price", "-compare")):
        el = soup.find(attrs={"part": name})
        if el:
            el["id"] = pre + suffix
            el["style"] = re.sub(r"(^|;)width:[^;]*", "", el.get("style", ""))
    return soup


cart_ids(C, "free-gift-cart-a")
cart_ids(CU, "free-gift-cart-b")
# the unlocked state was rendered with a $440 goal so the real widget would draw it; it reads $500 like the first
for t in CU.find_all(string=re.compile(r"Spend \$440")):
    t.replace_with(t.replace("$440", "$500"))
# the distance text in the first state counts down: wrap the amount
dist = C.find(id="free-gift-cart-a-distance")
dist.string = ""
dist["style"] = dist.get("style", "") + ";white-space:nowrap"
dist.append(BeautifulSoup('You are <span id="free-gift-cart-a-away">$58.40</span> away from Free Lip Gloss', "html.parser"))
shimc = CU.find(id="free-gift-cart-b-distance").find(attrs={"part": "upnova-progress-line-shimmer"})
if shimc:
    shimc["id"] = "free-gift-cart-b-shimmer"
S.find()["id"] = "free-gift-cart-sheet"
CART_A, CART_B, SHEET = str(C), str(CU), str(S)

STYLE_COMMON = """
        @font-face { font-family: "Inter"; src: url("assets/fonts/Inter-Regular.otf"); font-weight: 400; font-style: normal; }
        @font-face { font-family: "Inter"; src: url("assets/fonts/Inter-SemiBold.otf"); font-weight: 600; font-style: normal; }
        [data-composition-id="ID"] { position: absolute; inset: 0; overflow: hidden; font-family: "Inter", sans-serif; color: #fff; --fg-font: ui-sans-serif, system-ui, sans-serif; }
        [data-composition-id="ID"] .screen { position: absolute; inset: 0; overflow: hidden; background: #000; }
        [data-composition-id="ID"] .slats { position: absolute; left: -160px; width: 1400px; bottom: 0; height: 760px; background: url("assets/backgrounds/dark-slats.jpg") 50% 100% / cover no-repeat; opacity: 0.6; }
        [data-composition-id="ID"] .tag { position: absolute; left: 0; right: 0; margin: 0 auto; width: fit-content; height: 84px; padding: 0 34px 0 28px; border-radius: 42px; border: 2px solid rgba(255, 255, 255, 0.32); display: flex; align-items: center; gap: 18px; font-size: 56px; font-weight: 600; letter-spacing: -0.02em; text-transform: uppercase; white-space: nowrap; }
        [data-composition-id="ID"] .tag i { display: block; width: 18px; height: 18px; border-radius: 9px; background: #c5eea8; flex-shrink: 0; }
"""

EASES = """          (function () {
            if (window.__emilEases) return; window.__emilEases = true;
            if (window.CustomEase) { gsap.registerPlugin(CustomEase); CustomEase.create("emilOut", "0.23,1,0.32,1"); CustomEase.create("emilInOut", "0.77,0,0.175,1"); }
            else { gsap.registerEase("emilOut", gsap.parseEase("expo.out")); gsap.registerEase("emilInOut", gsap.parseEase("expo.inOut")); }
          })();"""


def page(cid, style, body, script):
    return """<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
  </head>
  <body>
    <template>
      <style>%s%s      </style>
      <div id="%s-root" data-composition-id="%s" data-width="1080" data-height="1920">
%s
      </div>
      <script>
        (function () {
%s
%s
          window.__timelines["%s"] = tl;
        })();
      </script>
    </template>
  </body>
</html>
""" % (STYLE_COMMON.replace("ID", cid), style.replace("ID", cid), cid, cid, body, EASES, script, cid)


# ---------------------------------------------------------------- banner page
banner_style = """        /* the captured widget is 398 px wide, shown at 2.4x (zoom keeps its text sharp) */
        [data-composition-id="ID"] .stage { position: absolute; left: 62px; top: 720px; width: 956px; }
        [data-composition-id="ID"] .widget { width: 398px; zoom: 2.4; }
"""
banner_body = """        <div class="screen" id="free-gift-banner-screen">
          <div class="slats" id="free-gift-banner-slats" data-layout-allow-overflow></div>
          <div class="tag" id="free-gift-banner-tag" style="top: 580px"><i></i>Free gift</div>
          <div class="stage" id="free-gift-banner-stage" data-layout-allow-overlap>
            <div class="widget">
%s
            </div>
          </div>
        </div>""" % BANNER
banner_script = """          // FREE GIFT WITH PURCHASE, product page banner. The real Upnova widget (captured from the widget
          // Storybook, story "FreeGiftPdpBanner"): the bar fills toward the goal, then the gift unlocks.
          // Settings: the goal and the amounts still to go at each step (the bar shows the share spent).
          var GOAL = 50;              // "Spend $50, get a free gift"
          var STEPS = [25, 8];        // "You're $25 away", then "$8 away", then unlocked
          var B = { rise: 0.15, step1: 1.0, step2: 2.2, unlock: 3.3, gifts: 3.9, out: 6.2, end: 6.6 };

          var tl = gsap.timeline({ paused: true });
          var $ = function (id) { return document.getElementById("free-gift-banner-" + id); };
          var money = function (v) { return "$" + Math.round(v); };
          $("threshold").textContent = money(GOAL);
          $("away").textContent = money(GOAL);

          tl.fromTo($("screen"), { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0);
          tl.fromTo($("slats"), { x: -40 }, { x: 40, duration: B.end, ease: "none" }, 0);
          tl.fromTo($("tag"), { opacity: 0, y: 30, scale: 0.95, filter: "blur(10px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "emilOut" }, 0.02);
          tl.fromTo($("stage"), { opacity: 0, y: 60, scale: 0.94, filter: "blur(12px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "emilOut" }, B.rise);

          // the bar fills in steps; the amount left counts down with it (one proxy drives both)
          // the bars grow by revealing them (a clip, not a width change), so their rounded ends stay round
          var clip = function (pct) { return "inset(0% " + (100 - pct) + "% 0% 0% round 999px)"; };
          tl.set([$("fill"), $("fill-ok")], { width: "100%", right: "auto" }, 0);
          tl.set($("fill"), { clipPath: clip(0) }, 0);
          tl.set($("fill-ok"), { opacity: 0 }, 0);
          tl.set([$("unlocked"), $("msg-ok")], { opacity: 0 }, 0);
          var spent = { v: 0 };
          var paint = function () { $("away").textContent = money(GOAL - spent.v); };
          [STEPS[0], STEPS[1], 0].forEach(function (away, i) {
            var at = [B.step1, B.step2, B.unlock][i];
            var to = GOAL - away;
            tl.to(spent, { v: to, duration: i === 2 ? 0.5 : 0.8, ease: "emilInOut", onUpdate: paint }, at);
            tl.to($("fill"), { clipPath: clip(100 * to / GOAL), duration: i === 2 ? 0.5 : 0.8, ease: "emilInOut" }, at);
          });
          // the widget's own shimmer: a light band crosses the bar in the first 30% of every 3 s
          tl.fromTo($("shimmer"), { xPercent: -100 }, { xPercent: 100, duration: 0.9, ease: "power2.inOut", repeat: 1, repeatDelay: 2.1 }, 0.6);

          // unlocked: the green fill takes over, "Unlocked" appears next to the badge, the message swaps
          var u = B.unlock + 0.45;
          tl.to($("fill-ok"), { opacity: 1, duration: 0.35, ease: "emilOut" }, u);
          tl.fromTo($("unlocked"), { opacity: 0, x: -8, scale: 0.92 }, { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: "emilOut" }, u + 0.05);
          tl.to($("msg"), { opacity: 0, y: -4, duration: 0.25, ease: "emilOut" }, u);
          tl.fromTo($("msg-ok"), { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.4, ease: "emilOut" }, u + 0.1);
          // the gift thumbnails lift the way they do on hover in the real widget
          [0, 1, 2].forEach(function (i) {
            var g = $("g" + i); if (!g) return;
            tl.to(g, { y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", duration: 0.35, ease: "emilOut" }, B.gifts + i * 0.08);
          });
          tl.to($("stage"), { opacity: 0, filter: "blur(10px)", duration: 0.4, ease: "emilOut" }, B.out);
          tl.to($("tag"), { opacity: 0, duration: 0.4, ease: "emilOut" }, B.out);"""
open(os.path.join(SKILL, "templates/free-gift-banner.html"), "w").write(page("free-gift-banner", banner_style, banner_body, banner_script))

# ---------------------------------------------------------------- cart page
cart_style = """        /* the captured cart drawer is 430 x 932; its top 480 px are shown at 2x in a rounded phone card */
        [data-composition-id="ID"] .card { position: absolute; left: 110px; top: 520px; width: 860px; height: 960px; border-radius: 56px; overflow: hidden; background: #fff; }
        [data-composition-id="ID"] .phone { position: absolute; left: 0; top: 0; width: 430px; height: 480px; zoom: 2; overflow: hidden; }
        [data-composition-id="ID"] .pan { position: absolute; left: 0; top: 0; width: 430px; height: 932px; }
        [data-composition-id="ID"] .state { position: absolute; left: 0; top: 0; width: 430px; }
        /* the cart's own layers sit at z-index 10, so the dim and the sheet go above them */
        [data-composition-id="ID"] .dim { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 50; }
        [data-composition-id="ID"] .sheet { position: absolute; left: 16px; top: 170px; width: 398px; height: 746px; z-index: 60; }
"""
cart_body = """        <div class="screen" id="free-gift-cart-screen">
          <div class="slats" id="free-gift-cart-slats" data-layout-allow-overflow></div>
          <div class="tag" id="free-gift-cart-tag" style="top: 400px"><i></i>Free gift</div>
          <div class="card" id="free-gift-cart-card">
            <div class="phone">
             <div class="pan" id="free-gift-cart-pan" data-layout-allow-overflow>
              <div class="state" id="free-gift-cart-state-a" data-layout-allow-overlap>
%s
              </div>
              <div class="state" id="free-gift-cart-state-b" data-layout-allow-overlap>
%s
              </div>
              <div class="dim" id="free-gift-cart-dim"></div>
              <div class="sheet" id="free-gift-cart-sheet-wrap" data-layout-allow-overflow data-layout-allow-overlap>
%s
              </div>
             </div>
            </div>
          </div>
        </div>""" % (CART_A, CART_B, SHEET)
cart_script = """          // FREE GIFT WITH PURCHASE, in the cart. The real Upnova cart with the minimal goals bar (captured from
          // the widget Storybook, "Linear Progress Minimalistic / In Cart"): one more hoodie pushes the cart past
          // the $500 goal, the gift tier fills and turns to "Claim", and the claim sheet slides up as it does in
          // the real cart. Line item: 4 hoodies at $110.40 ($138 before the 20% off) become 5.
          var QTY = [4, 5];
          var PRICE = [441.6, 552];     // line price after 20% off
          var COMPARE = [552, 690];     // struck-through price
          var AWAY = 58.4;              // "You are $58.40 away from Free Lip Gloss"
          var B = { rise: 0.15, add: 2.3, unlock: 3.0, sheet: 4.0, out: 7.6, end: 8.0 };

          var tl = gsap.timeline({ paused: true });
          var $ = function (id) { return document.getElementById("free-gift-cart-" + id); };
          var money = function (v) { return "$" + v.toFixed(2).replace(/\\.00$/, ""); };
          var cents = function (v) { return "$" + v.toFixed(2); };

          tl.fromTo($("screen"), { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0);
          tl.fromTo($("slats"), { x: -40 }, { x: 40, duration: B.end, ease: "none" }, 0);
          tl.fromTo($("tag"), { opacity: 0, y: 30, scale: 0.95, filter: "blur(10px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "emilOut" }, 0.02);
          tl.fromTo($("card"), { opacity: 0, y: 70, scale: 0.94, filter: "blur(12px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "emilOut" }, B.rise);
          tl.set([$("state-b"), $("dim")], { opacity: 0 }, 0);
          tl.set($("sheet-wrap"), { yPercent: 110 }, 0);

          // one more hoodie: the quantity steps up, prices and the distance count with it, the gift bar fills
          var c = { v: 0 };
          var paint = function () {
            var p = PRICE[0] + (PRICE[1] - PRICE[0]) * c.v, cp = COMPARE[0] + (COMPARE[1] - COMPARE[0]) * c.v;
            ["a", "b"].forEach(function (s) {
              var pr = $(s + "-price"), co = $(s + "-compare");
              if (pr) pr.textContent = money(p);
              if (co) co.textContent = money(cp);
            });
            $("a-away").textContent = cents(Math.max(0, AWAY * (1 - c.v)));
          };
          paint();
          // the cart count in the header and the quantity box both go 4 -> 5
          var qtys = [].slice.call(document.querySelectorAll('[id^="free-gift-cart-a-qty"], [id^="free-gift-cart-b-qty"]'));
          qtys.forEach(function (q) { tl.set(q, { textContent: QTY[0] }, 0); tl.set(q, { textContent: QTY[1] }, B.add); });
          var box = $("a-qty1");
          if (box) tl.fromTo(box.parentElement, { scale: 1 }, { scale: 0.94, duration: 0.12, ease: "emilOut", yoyo: true, repeat: 1 }, B.add - 0.12);
          tl.to(c, { v: 1, duration: 0.7, ease: "emilInOut", onUpdate: paint }, B.add);
          // the gift bar grows by revealing it (a clip, not a width change), so its rounded ends stay round
          var bar = $("a-bar1"), track = bar.parentElement;
          var startPct = 100 * bar.getBoundingClientRect().width / track.getBoundingClientRect().width;
          var clip = function (pct) { return "inset(0% " + (100 - pct) + "% 0% 0% round 999px)"; };
          tl.set(bar, { width: "100%", right: "auto", clipPath: clip(startPct) }, 0);
          tl.to(bar, { clipPath: clip(100), duration: 0.7, ease: "emilInOut" }, B.add);

          // unlocked: the goals switch to the real unlocked state ("Claim", the gift node outlined)
          tl.to($("state-b"), { opacity: 1, duration: 0.3, ease: "emilOut" }, B.unlock);
          if ($("b-shimmer")) tl.fromTo($("b-shimmer"), { xPercent: -100 }, { xPercent: 100, duration: 0.9, ease: "none" }, B.unlock + 0.2);

          // the claim sheet slides up over a dim, as the real cart opens it
          tl.to($("dim"), { opacity: 1, duration: 0.4, ease: "emilOut" }, B.sheet);
          tl.to($("sheet-wrap"), { yPercent: 0, duration: 0.6, ease: "emilOut" }, B.sheet);
          // then the view moves down the cart so the whole gift choice (photos, names, "Choose gift") shows
          tl.to($("pan"), { y: -175, duration: 0.8, ease: "emilInOut" }, B.sheet + 0.7);

          tl.to([$("card"), $("tag")], { opacity: 0, filter: "blur(10px)", duration: 0.4, ease: "emilOut" }, B.out);"""
open(os.path.join(SKILL, "templates/free-gift-cart.html"), "w").write(page("free-gift-cart", cart_style, cart_body, cart_script))
print("templates written; photos:", sorted(_images.values()))
