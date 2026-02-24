import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Helius
  heliusConfigured: boolean;
  setHeliusConfigured: (v: boolean) => void;

  // Active wallet
  activeWalletAddress: string | null;
  setActiveWalletAddress: (addr: string | null) => void;

  // Additional wallets for multi-wallet scanning
  additionalWallets: string[];
  addWallet: (addr: string) => void;
  removeWallet: (addr: string) => void;
  clearAdditionalWallets: () => void;
  getAllWallets: () => string[];

  // Portfolio cache
  portfolioCache: Record<string, { data: any; timestamp: number }>;
  setPortfolioCache: (wallet: string, data: any) => void;
  getPortfolioCache: (wallet: string) => any | null;

  // UI
  hideBalances: boolean;
  setHideBalances: (v: boolean) => void;
  currency: string;
  setCurrency: (c: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;

  // Last refresh
  lastRefresh: Record<string, number>;
  setLastRefresh: (wallet: string) => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      heliusConfigured: false,
      setHeliusConfigured: (v) => set({ heliusConfigured: v }),

      activeWalletAddress: null,
      setActiveWalletAddress: (addr) => set({ activeWalletAddress: addr }),

      additionalWallets: [],
      addWallet: (addr) =>
        set((state) => ({
          additionalWallets: state.additionalWallets.includes(addr)
            ? state.additionalWallets
            : [...state.additionalWallets, addr],
        })),
      removeWallet: (addr) =>
        set((state) => ({
          additionalWallets: state.additionalWallets.filter((w) => w !== addr),
        })),
      clearAdditionalWallets: () => set({ additionalWallets: [] }),
      getAllWallets: () => {
        const s = get();
        return s.activeWalletAddress
          ? [s.activeWalletAddress, ...s.additionalWallets]
          : [];
      },

      portfolioCache: {},
      setPortfolioCache: (wallet, data) =>
        set((state) => ({
          portfolioCache: { ...state.portfolioCache, [wallet]: { data, timestamp: Date.now() } },
        })),
      getPortfolioCache: (wallet) => {
        const cached = get().portfolioCache[wallet];
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
        return null;
      },

      hideBalances: false,
      setHideBalances: (v) => set({ hideBalances: v }),
      currency: 'USD',
      setCurrency: (c) => set({ currency: c }),
      sidebarCollapsed: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      lastRefresh: {},
      setLastRefresh: (wallet) =>
        set((state) => ({ lastRefresh: { ...state.lastRefresh, [wallet]: Date.now() } })),
    }),
    {
      name: 'monarch-store',
      partialize: (state) => ({
        hideBalances: state.hideBalances,
        currency: state.currency,
        sidebarCollapsed: state.sidebarCollapsed,
        activeWalletAddress: state.activeWalletAddress,
        additionalWallets: state.additionalWallets,
      }),
    }
  )
);
