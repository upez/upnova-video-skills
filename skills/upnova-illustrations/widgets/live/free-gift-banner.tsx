// The real FreeGiftPdpBanner, mounted for a HyperFrames video.
// window.UpnovaFreeGiftBanner.mount(host, options) renders it into a shadow root (as on a store) and
// returns { setCart(dollars) } which re-renders synchronously, so a video timeline can drive it frame by frame.
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { MotionGlobalConfig } from "motion/react";
import FreeGiftPdpBanner from "~/components/product-page-upsell/free-gift-pdp-banner";
import css from "~/components/product-page-upsell/free-gift-pdp-banner/index.css?inline";

// motion's own tweens run on the browser clock; the video timeline drives every change instead
MotionGlobalConfig.skipAnimations = true;

type Gift = { title: string; image: string };
type Tier = { title: string; minPurchaseValue: number; gifts: Gift[] };
type Options = { tiers: Tier[]; settings?: Record<string, unknown>; cart?: number };

function makeCart(dollars: number) {
  const cents = Math.round(dollars * 100);
  return {
    items: [{ id: 1, key: "line-1", quantity: 1, product_id: 1, variant_id: 1, title: "Cart product", line_price: cents, final_line_price: cents, price: cents, tags: [] }],
    item_count: 1,
    items_subtotal_price: cents,
    total_price: cents,
  };
}

function makeGift(id: number, g: Gift) {
  return { id, title: g.title, handle: "gift-" + id, description: "", tags: ["gift"], price: 0, available: true, compare_at_price: null, variants: [], images: [g.image], featured_image: g.image, options: [], media: [], requires_selling_plan: false, selling_plan_groups: [], in_collections: [], num_reviews: "0", avg_rating: null };
}

let propertiesInjected = false;
function injectProperties(text: string) {
  // @property rules only work at document level, not inside a shadow root
  if (propertiesInjected) return;
  propertiesInjected = true;
  const props = text.match(/@property[^{]+\{[^}]*\}/g) || [];
  const s = document.createElement("style");
  s.textContent = props.join("\n");
  document.head.appendChild(s);
}

function mount(host: HTMLElement, opts: Options) {
  const w = window as any;
  w.Shopify = w.Shopify || { locale: "en", currency: { active: "USD", rate: 1 } };
  let id = 900;
  w.UPEZ__FREE_GIFT_DISCOUNTS = [{
    title: "Free Gift with purchase",
    discountCode: "FREE_GIFT",
    tiers: opts.tiers.map(t => ({ title: t.title, minPurchaseValue: t.minPurchaseValue, products: t.gifts.map(g => makeGift(id++, g)), collections: [] })),
  }];
  w.upezFlows = [{ handle: "free-gift-pdp", template_settings: opts.settings || {} }];

  injectProperties(css);
  const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = css;
  shadow.appendChild(style);
  const mountPoint = document.createElement("div");
  shadow.appendChild(mountPoint);
  const root = createRoot(mountPoint);
  let last = -1;
  const setCart = (dollars: number) => {
    const v = Math.round(dollars * 100) / 100;
    if (v === last) return;
    last = v;
    flushSync(() => root.render(<FreeGiftPdpBanner flowHandle="free-gift-pdp" cart={makeCart(v) as any} />));
  };
  // The widget's own CSS animations (the bar shimmer) and transitions run on the browser clock; sync(t)
  // pauses them and sets them to the video's time so every rendered frame is the same.
  const sync = (seconds: number) => {
    shadow.getAnimations().forEach(a => {
      a.pause();
      if (a instanceof CSSTransition) a.finish();
      else a.currentTime = seconds * 1000;
    });
  };
  setCart(opts.cart ?? 0);
  return { setCart, sync, shadow };
}

(window as any).UpnovaFreeGiftBanner = { mount };
