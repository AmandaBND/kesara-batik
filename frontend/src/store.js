import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getAvailableStock, findVariant, hasVariants, getCartQtyForVariant } from './utils/stock'
import { getCartSubtotal, getShipping, getCartTotal } from './utils/pricing'

// ─── Auth Store ───────────────────────────────────────────
export const useAuthStore = create(persist((set, get) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
  isAdmin: () => get().user?.role === 'admin',
}), { name: 'kb-auth' }))

// ─── Cart Store ────────────────────────────────────────────
export const useCartStore = create(persist((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (product, variant = {}, qty = 1) => {
    if (hasVariants(product)) {
      if (!findVariant(product, variant)) {
        return { success: false, message: 'Please select a valid size and color combination' };
      }
    }

    const available = getAvailableStock(product, variant);
    const items = get().items;
    const key = `${product._id}-${variant.size || ''}-${variant.color || ''}`;
    const idx = items.findIndex(i => i.key === key);
    const currentQty = idx > -1 ? items[idx].quantity : 0;
    const requestedTotal = currentQty + qty;

    if (available === 0) {
      return { success: false, message: 'This item is out of stock' };
    }
    if (requestedTotal > available) {
      const canAdd = available - currentQty;
      if (canAdd <= 0) {
        return { success: false, message: `Only ${available} available in stock` };
      }
      qty = canAdd;
    }

    if (idx > -1) {
      const updated = [...items];
      updated[idx].quantity += qty;
      set({ items: updated, isOpen: true });
    } else {
      set({ items: [...items, { key, product, variant, quantity: qty, price: product.price }], isOpen: true });
    }

    const capped = requestedTotal > available;
    return {
      success: true,
      message: capped ? `Only ${available} available — quantity adjusted` : 'Added to cart',
      capped,
    };
  },

  removeItem: (key) => set({ items: get().items.filter(i => i.key !== key) }),

  updateQty: (key, qty) => {
    if (qty <= 0) return get().removeItem(key);
    const item = get().items.find(i => i.key === key);
    if (!item) return { success: false, message: 'Item not found in cart' };

    const available = getAvailableStock(item.product, item.variant);
    if (available === 0) {
      get().removeItem(key);
      return { success: false, message: 'This item is out of stock and was removed from your cart' };
    }
    if (qty > available) {
      set({ items: get().items.map(i => i.key === key ? { ...i, quantity: available } : i) });
      return { success: false, message: `Only ${available} available in stock`, capped: true };
    }
    set({ items: get().items.map(i => i.key === key ? { ...i, quantity: qty } : i) });
    return { success: true };
  },

  clear: () => set({ items: [] }),
  toggleCart: () => set({ isOpen: !get().isOpen }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  subtotal: () => {
    const { currency, rates } = useCurrencyStore.getState()
    return getCartSubtotal(get().items, currency, rates)
  },
  itemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
  shipping: () => {
    const { currency, rates } = useCurrencyStore.getState()
    return getShipping(get().items, currency, rates)
  },
  total: () => {
    const { currency, rates } = useCurrencyStore.getState()
    return getCartTotal(get().items, currency, rates)
  },
}), { name: 'kb-cart' }))

// ─── Wishlist Store ────────────────────────────────────────
export const useWishlistStore = create(persist((set, get) => ({
  items: [],
  toggle: (product) => {
    const items = get().items;
    const exists = items.find(i => i._id === product._id);
    if (exists) set({ items: items.filter(i => i._id !== product._id) });
    else set({ items: [...items, product] });
  },
  has: (id) => !!get().items.find(i => i._id === id),
}), { name: 'kb-wishlist' }))

// ─── Currency Store ────────────────────────────────────────
export const useCurrencyStore = create(persist((set, get) => ({
  currency: 'CAD',
  rates: { CAD: 1, USD: 0.74, GBP: 0.58, AED: 2.72, LKR: 225, JPY: 110, KRW: 1000 },
  symbols: { CAD: 'CA$', USD: 'US$', GBP: '£', AED: 'AED ', LKR: 'LKR ', JPY: '¥', KRW: '₩' },
  lastUpdated: null,
  isFromSriLanka: false,
  currencyLocked: false,
  
  setCurrency: (currency) => {
    const state = get();
    // Sri Lankan visitors use only the separate manual LKR price list.
    if (state.isFromSriLanka && currency !== 'LKR') return;
    // Overseas visitors cannot switch into the Sri Lankan price list.
    if (!state.isFromSriLanka && currency === 'LKR') return;
    set({ currency });
  },
  
  setRates: (rates, lastUpdated) => set({ rates, lastUpdated }),
  
  lockCurrency: (lock = true) => set({ currencyLocked: lock }),
  
  setCountryInfo: (isFromSriLanka) => {
    if (isFromSriLanka) {
      set({
        isFromSriLanka: true,
        currency: 'LKR',
        currencyLocked: true,
      });
    } else {
      const currentCurrency = get().currency;
      set({
        isFromSriLanka: false,
        currency: currentCurrency === 'LKR' ? 'CAD' : currentCurrency,
        currencyLocked: false,
      });
    }
  },
  
  format: (cadPrice, currentProduct = null) => {
    const state = get()
    const sym = state.symbols[state.currency] || state.currency + ' '

    if (state.currency === 'LKR') {
      return currentProduct?.priceLKR != null && Number(currentProduct.priceLKR) > 0
        ? sym + Number(currentProduct.priceLKR).toFixed(2)
        : `${sym}Not available`
    }

    const converted = cadPrice * (state.rates[state.currency] || 1)
    return sym + converted.toFixed(2)
  },

  formatAmount: (amount) => {
    const state = get()
    const sym = state.symbols[state.currency] || state.currency + ' '
    return sym + Number(amount).toFixed(2)
  },
}), { name: 'kb-currency' }))
