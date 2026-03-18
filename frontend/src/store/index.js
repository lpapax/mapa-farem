// frontend/src/store/index.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../supabase.js';

// Map Supabase user → app user shape { id, name, email, role }
function mapUser(u) {
  if (!u) return null;
  // user_metadata.role is set on email signup (RegisterPage passes it);
  // Google OAuth users and older accounts default to CUSTOMER.
  const role = u.user_metadata?.role;
  const validRole = ['CUSTOMER', 'FARMER', 'ADMIN'].includes(role) ? role : 'CUSTOMER';
  return {
    id: u.id,
    name: u.user_metadata?.name || u.email?.split('@')[0] || 'Uživatel',
    email: u.email,
    role: validRole,
  };
}

// ── AUTH STORE ─────────────────────────────────────────────────────────────
export const useAuthStore = create((set) => ({
  user: null,
  loading: false,

  // Call once on app mount — syncs Supabase session to store
  init: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: mapUser(session?.user ?? null) });
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: mapUser(session?.user ?? null) });
    });
  },

  login: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });
    if (error) return { ok: false, error: error.message === 'Invalid login credentials' ? 'Špatný email nebo heslo.' : error.message };
    return { ok: true };
  },

  register: async (name, email, password, role = 'CUSTOMER') => {
    set({ loading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    set({ loading: false });
    if (error) return { ok: false, error: error.message === 'User already registered' ? 'Tento email je již registrován.' : error.message };
    return { ok: true, needsConfirm: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));

// ── MAP / FILTER STORE ─────────────────────────────────────────────────────
export const useMapStore = create((set) => ({
  filter: 'all',
  search: '',
  selectedFarmId: null,
  mapCenter: [49.75, 15.5],
  mapZoom: 8,
  showSidebar: true,

  setFilter: (filter) => set({ filter, selectedFarmId: null }),
  setSearch: (search) => set({ search }),
  selectFarm: (id) => set({ selectedFarmId: id }),
  setMapView: (center, zoom) => set({ mapCenter: center, mapZoom: zoom }),
  toggleSidebar: () => set((s) => ({ showSidebar: !s.showSidebar })),
}));

// ── CART STORE ─────────────────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],     // { product, quantity, farmId }
      farmId: null,

      addItem: (product, farmId) => {
        const { items, farmId: currentFarm } = get();
        // cart is per-farm
        if (currentFarm && currentFarm !== farmId) {
          const confirm = window.confirm('Košík obsahuje produkty z jiné farmy. Vyprázdnit a přidat nový produkt?');
          if (!confirm) return;
          set({ items: [], farmId: null });
        }
        const existing = items.find(i => i.product.id === product.id);
        if (existing) {
          set({ items: items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
          set({ items: [...items, { product, quantity: 1, farmId }], farmId });
        }
      },

      removeItem: (productId) => {
        const items = get().items.filter(i => i.product.id !== productId);
        set({ items, farmId: items.length ? get().farmId : null });
      },

      updateQty: (productId, quantity) => {
        if (quantity < 1) { get().removeItem(productId); return; }
        set({ items: get().items.map(i => i.product.id === productId ? { ...i, quantity } : i) });
      },

      clearCart: () => set({ items: [], farmId: null }),

      get total() {
        return get().items.reduce((s, i) => s + i.product.price * i.quantity, 0);
      },
      get count() {
        return get().items.reduce((s, i) => s + i.quantity, 0);
      },
    }),
    { name: 'zemeplocha-cart' }
  )
);

// ── FAVORITES STORE ────────────────────────────────────────────────────────
export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      ids: [], // array of farm id strings

      toggle: (farmId) => {
        const id = String(farmId);
        const ids = get().ids;
        set({ ids: ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id] });
      },

      has: (farmId) => get().ids.includes(String(farmId)),
    }),
    { name: 'zemeplocha-favorites' }
  )
);

// ── ORDERS STORE ───────────────────────────────────────────────────────────
export const useOrdersStore = create(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order) => {
        set({ orders: [order, ...get().orders] });
      },
    }),
    { name: 'zemeplocha-orders' }
  )
);

// ── NOTIFICATIONS STORE ────────────────────────────────────────────────────
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetch: async () => {
    // No backend — notifications not available
  },

  markRead: async (id) => {
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
}));
