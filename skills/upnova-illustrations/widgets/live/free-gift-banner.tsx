// The real FreeGiftPdpBanner, mounted for a recording (widgets/record/). It runs on the browser's real clock
// with all its own animations (the bar fill, the shimmer, the unlocked state).
//   UpnovaFreeGiftBanner.mount(host, { tiers, settings, cart }) -> Promise<{ setCart(dollars) }>
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import FreeGiftPdpBanner from "~/components/product-page-upsell/free-gift-pdp-banner";
import css from "~/components/product-page-upsell/free-gift-pdp-banner/index.css?inline";

type Gift = { title: string; image: string };
type Tier = { title: string; minPurchaseValue: number; gifts: Gift[] };
type Options = { tiers: Tier[]; settings?: Record<string, unknown>; cart?: number };

function makeCart(dollars: number) {
  const cents = Math.round(dollars * 100);
  return {
    items: [{ id: 1, key: "line-1", quantity: 1, product_id: 1, variant_id: 1, title: "Cart product", line_price: cents, final_line_price: cents, price: cents, tags: [] }],
    item_count: 1, items_subtotal_price: cents, total_price: cents,
  };
}
function makeGift(id: number, g: Gift) {
  return { id, title: g.title, handle: "gift-" + id, description: "", tags: ["gift"], price: 0, available: true, compare_at_price: null, variants: [], images: [g.image], featured_image: g.image, options: [], media: [], requires_selling_plan: false, selling_plan_groups: [], in_collections: [], num_reviews: "0", avg_rating: null };
}

async function mount(host: HTMLElement, opts: Options) {
  const w = window as any;
  w.Shopify = w.Shopify || { locale: "en", currency: { active: "USD", rate: 1 } };
  let id = 900;
  w.UPEZ__FREE_GIFT_DISCOUNTS = [{
    title: "Free Gift with purchase", discountCode: "FREE_GIFT",
    tiers: opts.tiers.map(t => ({ title: t.title, minPurchaseValue: t.minPurchaseValue, products: t.gifts.map(g => makeGift(id++, g)), collections: [] })),
  }];
  w.upezFlows = [{ handle: "free-gift-pdp", template_settings: opts.settings || {} }];
  // @property rules only work at document level, not inside a shadow root
  const props = document.createElement("style");
  props.textContent = (css.match(/@property[^{]+\{[^}]*\}/g) || []).join("\n");
  document.head.appendChild(props);
  const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = css;
  shadow.appendChild(style);
  const point = document.createElement("div");
  shadow.appendChild(point);
  const root = createRoot(point);
  const setCart = (dollars: number) => flushSync(() => root.render(<FreeGiftPdpBanner flowHandle="free-gift-pdp" cart={makeCart(dollars) as any} />));
  setCart(opts.cart ?? 0);
  return { setCart };
}

(window as any).UpnovaFreeGiftBanner = { mount };
