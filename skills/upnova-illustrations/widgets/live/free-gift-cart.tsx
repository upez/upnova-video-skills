// The real Upnova cart (cart-winston with its goals bar), mounted with a real store's products for a recording.
// It runs on the browser's real clock with all its own animations (see widgets/record/).
//   UpnovaFreeGiftCart.mount(host, fixture) -> Promise<{ changeQuantity(q) }> once the cart is open
// fixture: widgets/fixtures/*.json ("cart" and "goals")
import { useContext, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import Cart from "~/components/page/cart-winston";
import { CartContext } from "~/utils/hooks/cart/context";
import { useCartOperations } from "~/utils/hooks/cart/hooks/useCartOperations";
import { setupCartFetchMocks } from "~/components/page/cart-winston/stories/mock-cart-fetch";
import LinearProgressMinimalistic from "~/components/shopping-goals-v-2/linear-progress-minimalistic";
import LinearProgress from "~/components/shopping-goals-v-2/linear-progress";

// The cart loads nested widgets (the goals bar) from Upnova's servers; a recording page can't rely on that.
// Hand them over through the cart's own component cache (the hook dev hot-reload uses).
const BUNDLED: Record<string, unknown> = {
  "shopping-goals-v-2:linear-progress-minimalistic": LinearProgressMinimalistic,
  "shopping-goals-v-2:linear-progress": LinearProgress,
};
(window as any).__UPNOVA_DEV__ = {
  registerComponentCache: (cache: Record<string, unknown>) => { Object.assign(cache, BUNDLED); },
  reportUsage: (model: string, name: string) => { if (!BUNDLED[model + ":" + name]) console.warn("[video] widget not bundled:", model + "/" + name); },
  getBundleVersion: () => undefined,
};

type Line = { productId: number; variantId: number; title: string; handle: string; vendor: string; productType: string; price: number; compareAt?: number; image: string; quantity: number };
type Gift = { productId: number; variantId: number; title: string; handle: string; image: string };
type Fixture = {
  currency: string;
  cart: { lines: Line[] };
  goals: { template: string; settings: Record<string, unknown>; brandColor: string; shipping: number; gift: number; discount: number; giftTitle: string; giftThumb: string; gifts: Gift[] };
};

const cents = (dollars: number) => Math.round(dollars * 100);

function cartLine(l: Line, i: number) {
  const price = cents(l.price);
  const compare = l.compareAt ? cents(l.compareAt) : price;
  return {
    key: "line-" + l.variantId + "-" + i, identifier: "line-" + l.variantId + "-" + i,
    id: l.variantId, variant_id: l.variantId, product_id: l.productId, quantity: l.quantity,
    title: l.title, product_title: l.title, variant_title: "", vendor: l.vendor, product_type: l.productType, handle: l.handle,
    url: "/products/" + l.handle, sku: "", grams: 0, taxable: true, gift_card: false, requires_shipping: true,
    product_has_only_default_variant: true, variant_options: ["Default Title"], options_with_values: [],
    price, original_price: price, discounted_price: price, final_price: price,
    line_price: price * l.quantity, original_line_price: price * l.quantity, final_line_price: price * l.quantity,
    compare_at_price: compare, total_discount: 0, discounts: [], line_level_discount_allocations: [], line_level_total_discount: 0,
    image: l.image, featured_image: { url: l.image, alt: l.title, aspect_ratio: 800 / 1084, width: 800, height: 1084 },
    properties: {}, tags: [], in_collections: [], product_description: "", metafields: {},
  };
}

function giftProduct(g: Gift) {
  return {
    id: g.productId, title: g.title, handle: g.handle, description: "", published_at: "2025-01-01T00:00:00Z", created_at: "2025-01-01T00:00:00Z",
    vendor: "Rare Beauty", type: "Sample", tags: [], price: 0, price_min: 0, price_max: 0, available: true, price_varies: false,
    compare_at_price: null, compare_at_price_min: 0, compare_at_price_max: 0, compare_at_price_varies: false,
    variants: [{ id: g.variantId, title: "Default Title", option1: "Default Title", option2: null, option3: null, sku: "", requires_shipping: true, taxable: true, featured_image: null, available: true, name: g.title, public_title: null, options: ["Default Title"], price: 0, weight: 0, compare_at_price: null, inventory_management: null, barcode: null, requires_selling_plan: false, selling_plan_allocations: [], quantity_rule: { min: 1, max: null, increment: 1 } }],
    images: [g.image], featured_image: g.image, options: ["Title"], media: [], requires_selling_plan: false, selling_plan_groups: [], content: "", short_description: null,
  };
}

function setupGlobals(f: Fixture) {
  const w = window as any;
  const items = f.cart.lines.map(cartLine);
  const total = items.reduce((s, it) => s + it.line_price, 0);
  setupCartFetchMocks({
    token: "video-cart", note: null, attributes: {}, currency: f.currency, requires_shipping: true, total_weight: 0,
    original_total_price: total, total_price: total, items_subtotal_price: total, total_discount: 0,
    item_count: items.reduce((s, it) => s + it.quantity, 0), discount_codes: [], cart_level_discount_applications: [], items,
  } as any);
  w.Shopify = { routes: { root: "" }, currency: { active: f.currency, rate: "1" } };
  w.upez__formatMoney = (amount: number, currency?: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currency || f.currency, trailingZeroDisplay: "stripIfInteger" } as any).format(amount);
  w.upez__cart_settings = {
    ...(w.upez__cart_settings || {}),
    brand_color: f.goals.brandColor, discount_color: "#555",
    goals_template: f.goals.template, goals_template__settings: f.goals.settings,
    enable_discount_form: false, enable_note: false, enable_shop_pay: false, enable_shipping_rates: false,
    __label_checkout: "Checkout", headlines: [],
  };
  w.UPEZ_FREE_SHIPPING_TIERS = [{ goal_label: "Free Shipping", goal_value: f.goals.shipping, thumbnail: "", currency_mode: "SHOP" }];
  w.UPEZ__FREE_GIFT_DISCOUNTS = [{
    title: f.goals.giftTitle, discountCode: "FREE_GIFT",
    tiers: [{ title: f.goals.giftTitle, minPurchaseValue: f.goals.gift, thumbnail: f.goals.giftThumb, products: f.goals.gifts.map(giftProduct), collections: [] }],
  }];
  w.UPEZ__ORDER_VOLUME_DISCOUNTS = [{ discountType: "PERCENTAGE", tiers: [{ discountCode: "15% off", discountAmount: 15, requiredPurchase: f.goals.discount }] }];
}

let ctx: any = null;
let ops: any = null;
function Grab(): ReactNode {
  ctx = useContext(CartContext);
  ops = useCartOperations();
  return null;
}
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
async function until(test: () => boolean, ms = 10000) {
  const t0 = Date.now();
  while (!test()) { if (Date.now() - t0 > ms) throw new Error("cart did not settle"); await wait(30); }
}

async function mount(host: HTMLElement, fixture: Fixture) {
  setupGlobals(fixture);
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
  await wait(1200);
  return {
    // what a shopper does: change the line's quantity; the cart does the rest
    changeQuantity: (q: number) => ops.changeLineItem({ line: 1, quantity: q }),
  };
}

(window as any).UpnovaFreeGiftCart = { mount };
