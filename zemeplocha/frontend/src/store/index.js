// frontend/src/store/index.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api.js';

// ── AUTH STORE ─────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          set({ user: data.user, token: data.token, loading: false });
          return { ok: true };
        } catch (err) {
          set({ loading: false });
          return { ok: false, error: err.response?.data?.error || 'Chyba přihlášení' };
        }
      },

      register: async (name, email, password, role = 'CUSTOMER') => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/register', { name, email, password, role });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          set({ user: data.user, token: data.token, loading: false });
          return { ok: true };
        } catch (err) {
          set({ loading: false });
          return { ok: false, error: err.response?.data?.error || 'Chyba registrace' };
        }
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data });
        } catch {
          get().logout();
        }
      },

      setToken: (token) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ token });
      },
    }),
    {
      name: 'zemeplocha-auth',
      partialize: (s) => ({ token: s.token }),
    }
  )
);

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

// ── NOTIFICATIONS STORE ────────────────────────────────────────────────────
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetch: async () => {
    try {
      const { data } = await api.get('/notifications');
      set({ notifications: data.notifications, unreadCount: data.unreadCount });
    } catch {}
  },

  markRead: async (id) => {
    await api.patch(`/notifications/${id}/read`);
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await api.patch('/notifications/read-all');
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
}));
