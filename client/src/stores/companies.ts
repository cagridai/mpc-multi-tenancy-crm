import { create } from "zustand";
import { companiesAPI } from "@/services/api";
import type { Company, Stats } from "@/types";

interface CompaniesState {
  companies: Company[];
  stats: Stats | null;
  isLoading: boolean;
  fetchCompanies: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createCompany: (data: Partial<Company>) => Promise<void>;
  updateCompany: (id: string, data: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
}

export const useCompaniesStore = create<CompaniesState>((set, get) => ({
  companies: [],
  stats: null,
  isLoading: false,

  fetchCompanies: async () => {
    set({ isLoading: true });
    try {
      const response = await companiesAPI.getAll();
      set({ companies: response.data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const response = await companiesAPI.getStats();
      set({ stats: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createCompany: async (data) => {
    set({ isLoading: true });
    try {
      await companiesAPI.create(data);
      await get().fetchCompanies();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateCompany: async (id, data) => {
    set({ isLoading: true });
    try {
      await companiesAPI.update(id, data);
      await get().fetchCompanies();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteCompany: async (id) => {
    set({ isLoading: true });
    try {
      await companiesAPI.delete(id);
      await get().fetchCompanies();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
