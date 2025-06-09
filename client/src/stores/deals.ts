import { create } from "zustand";
import { dealsAPI } from "@/services/api";
import type { Deal, Stats } from "@/types";

interface DealsState {
  deals: Deal[];
  stats: Stats | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pipelines: any[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  fetchDeals: (page?: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchPipelines: () => Promise<void>;
  createDeal: (data: Partial<Deal>) => Promise<void>;
  updateDeal: (id: string, data: Partial<Deal>) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
}

export const useDealsStore = create<DealsState>((set, get) => ({
  deals: [],
  stats: null,
  pipelines: [],
  isLoading: false,
  page: 1,
  totalPages: 0,

  fetchDeals: async (page = get().page) => {
    set({ isLoading: true });
    try {
      const response = await dealsAPI.getAll(page);
      set({
        deals: response.data.data,
        page: response.data.meta.page,
        totalPages: response.data.meta.totalPages,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const response = await dealsAPI.getStats();
      set({ stats: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchPipelines: async () => {
    try {
      set({ isLoading: true });
      const response = await dealsAPI.getPipeline();
      set({ pipelines: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createDeal: async (data) => {
    set({ isLoading: true });
    try {
      await dealsAPI.create(data);
      await get().fetchDeals();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateDeal: async (id, data) => {
    set({ isLoading: true });
    try {
      await dealsAPI.update(id, data);
      await get().fetchDeals();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteDeal: async (id) => {
    set({ isLoading: true });
    try {
      await dealsAPI.delete(id);
      await get().fetchDeals();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
