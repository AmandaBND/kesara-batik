import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
    const key = `${product._id}-${variant.size || ''}-${variant.color || ''}`;
    const items = get().items;
    const idx = items.findIndex(i => i.key === key);
    if (idx > -1) {
      const updated = [...items];
      updated[idx].quantity += qty;
      set({ items: updated });
    } else {
      set({ items: [...items, { key, product, variant, quantity: qty, price: product.price }] });
    }
    set({ isOpen: true });
  },

  removeItem: (key) => set({ items: get().items.filter(i => i.key !== key) }),

  updateQty: (key, qty) => {
    if (qty <= 0) return get().removeItem(key);
    set({ items: get().items.map(i => i.key === key ? { ...i, quantity: qty } : i) });
  },

  clear: () => set({ items: [] }),
  toggleCart: () => set({ isOpen: !get().isOpen }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
  itemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
  shipping: () => get().subtotal() > 120 ? 0 : 18,
  total: () => get().subtotal() + get().shipping(),
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
export const useCurrencyStore = create(persist((set) => ({
  currency: 'CAD',
  rates: { CAD: 1, USD: 0.74, GBP: 0.58, AED: 2.72, LKR: 225, JPY: 110, KRW: 1000 },
  symbols: { CAD: 'CA$', USD: 'US$', GBP: '£', AED: 'AED ', LKR: 'LKR ', JPY: '¥', KRW: '₩' },
  setCurrency: (currency) => set({ currency }),
  format: (cadPrice) => {
    const state = useCurrencyStore.getState();
    const converted = cadPrice * (state.rates[state.currency] || 1);
    const sym = state.symbols[state.currency] || state.currency + ' ';
    return sym + converted.toFixed(2);
  },
}), { name: 'kb-currency' }))
