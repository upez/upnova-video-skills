// The real Upnova cart (cart-winston and its goals bar) for a video. It runs in cart-frame.html on the
// video's clock (virtual-clock.js), so everything it does (fetching, the count-ups, the bar, opening the
// claim sheet) plays with its own timing, as in a store.
//   UpnovaFreeGiftCart.mount(host, options) -> Promise<{ changeQuantity(q), ctx() }> once the cart is open
import { useContext, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import Cart from "~/components/page/cart-winston";
import { CartContext } from "~/utils/hooks/cart/context";
import { useCartOperations } from "~/utils/hooks/cart/hooks/useCartOperations";
import { setupCartFetchMocks } from "~/components/page/cart-winston/stories/mock-cart-fetch";
import { createMockCart } from "~/components/page/cart-winston/stories/mock-cart";
import LinearProgressMinimalistic from "~/components/shopping-goals-v-2/linear-progress-minimalistic";
import LinearProgress from "~/components/shopping-goals-v-2/linear-progress";

// The cart loads nested widgets (the goals bar) from Upnova's servers; a video can't. Hand them over
// through the cart's own component cache instead (the hook dev hot-reload uses).
const BUNDLED: Record<string, unknown> = {
  "shopping-goals-v-2:linear-progress-minimalistic": LinearProgressMinimalistic,
  "shopping-goals-v-2:linear-progress": LinearProgress,
};
(window as any).__UPNOVA_DEV__ = {
  registerComponentCache: (cache: Record<string, unknown>) => { Object.assign(cache, BUNDLED); },
  reportUsage: (model: string, name: string) => { if (!BUNDLED[model + ":" + name]) console.warn("[video] widget not bundled:", model + "/" + name); },
  getBundleVersion: () => undefined,
};


type Opts = { goalsTemplate?: string; goalsSettings?: Record<string, unknown>; brandColor?: string; localImages?: Record<string, string>; goals: { shipping: number; gift: number; discount: number }; giftTitle: string; giftImages: string[]; giftThumb: string; quantity: [number, number] };

function makeGiftProduct(id: number, title: string, image: string) {
  return {
    id, title, handle: title.toLowerCase().replace(/\s+/g, "-"), description: "", published_at: "2024-01-01T00:00:00Z", created_at: "2024-01-01T00:00:00Z",
    vendor: "Upnova", type: "Gift", tags: [], price: 0, price_min: 0, price_max: 0, available: true, price_varies: false,
    compare_at_price: null, compare_at_price_min: 0, compare_at_price_max: 0, compare_at_price_varies: false,
    variants: [{ id: id * 100, title: "Default", option1: "Default", option2: null, option3: null, sku: "GIFT-" + id, requires_shipping: false, taxable: false, featured_image: null, available: true, name: title, public_title: "Default", options: ["Default"], price: 0, weight: 0, compare_at_price: null, inventory_management: null, barcode: null, requires_selling_plan: false, selling_plan_allocations: [], quantity_rule: { min: 1, max: null, increment: 1 } }],
    images: [image], featured_image: image, options: ["Title"], media: [], requires_selling_plan: false, selling_plan_groups: [], content: "", short_description: null,
  };
}

function setupGlobals(o: Opts) {
  const w = window as any;
  // outside image links (the mock cart's Shopify photos) point at local files instead
  const swap = (v: any): any => {
    if (typeof v === "string") { for (const k in o.localImages || {}) if (v.includes(k)) return o.localImages![k]; return v; }
    if (Array.isArray(v)) return v.map(swap);
    if (v && typeof v === "object") { const out: any = {}; for (const key in v) out[key] = swap(v[key]); return out; }
    return v;
  };
  const mockCart = swap(createMockCart());
  setupCartFetchMocks(mockCart);
  w.Shopify = { routes: { root: "" }, currency: { active: "USD", rate: "1" } };
  w.upez__formatMoney = (amount: number, currency?: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", trailingZeroDisplay: "stripIfInteger" } as any).format(amount);
  w.upez__cart_settings = {
    ...(w.upez__cart_settings || {}),
    brand_color: o.brandColor || "#111", discount_color: "#555",
    goals_template: o.goalsTemplate || "linear-progress-minimalistic",
    goals_template__settings: o.goalsSettings || { progress_bar_filler_bg_color: "#111111", progress_bar_container_bg_color: "#e8e8e8" },
    enable_discount_form: false, enable_note: false, enable_shop_pay: false, enable_shipping_rates: false,
    __label_checkout: "Checkout", headlines: [],
  };
  w.UPEZ_FREE_SHIPPING_TIERS = [{ goal_label: "Free Shipping", goal_value: o.goals.shipping, thumbnail: "", currency_mode: "SHOP" }];
  w.UPEZ__FREE_GIFT_DISCOUNTS = [{
    title: o.giftTitle, discountCode: "FREE_GIFT",
    tiers: [{ title: o.giftTitle, minPurchaseValue: o.goals.gift, thumbnail: o.giftThumb, products: o.giftImages.map((img, i) => makeGiftProduct(101 + i, ["Rose", "Nude", "Berry"][i % 3] + " Lip Gloss", img)), collections: [] }],
  }];
  w.UPEZ__ORDER_VOLUME_DISCOUNTS = [{ discountType: "PERCENTAGE", tiers: [{ discountCode: "15% off", discountAmount: 15, requiredPurchase: o.goals.discount }] }];
}

let ctx: any = null;
let ops: any = null;
function Grab(): ReactNode {
  ctx = useContext(CartContext);
  ops = useCartOperations();
  return null;
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
async function until(test: () => boolean, ms = 8000) {
  const t0 = Date.now();
  while (!test()) { if (Date.now() - t0 > ms) throw new Error("cart did not settle"); await wait(30); }
}

async function mount(host: HTMLElement, o: Opts) {
  setupGlobals(o);
  const css = (window as any).__UPNOVA_VIDEO_CSS__ || "";
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
  flushSync(() => root.render(<Cart extraActions={<Grab />} />));
  await until(() => !!ctx && !!ctx.cart && ctx.cart.items.length > 0 && !ctx.isLoading);
  ctx.setIsOpen(true);
  await wait(800);
  return {
    // what a shopper does: change the line's quantity; the cart does the rest
    changeQuantity: (q: number) => ops.changeLineItem({ line: 1, quantity: q }),
    ctx: () => ctx,
  };
}

(window as any).UpnovaFreeGiftCart = { mount };
