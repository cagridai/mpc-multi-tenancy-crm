import { create } from "zustand";
import { contactsAPI } from "@/services/api";
import type { Contact, Stats } from "@/types";

interface ContactsState {
  contacts: Contact[];
  stats: Stats | null;
  isLoading: boolean;
  page: number;
  totalPages: number;
  fetchContacts: (page?: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  createContact: (data: Partial<Contact>) => Promise<void>;
  updateContact: (id: string, data: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  stats: null,
  isLoading: false,
  page: 1,
  totalPages: 0,

  fetchContacts: async (page = get().page) => {
    set({ isLoading: true });
    try {
      const response = await contactsAPI.getAll(page);
      set({
        contacts: response.data.data,
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
      const response = await contactsAPI.getStats();
      set({ stats: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createContact: async (data) => {
    set({ isLoading: true });
    try {
      await contactsAPI.create(data);
      await get().fetchContacts();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateContact: async (id, data) => {
    set({ isLoading: true });
    try {
      await contactsAPI.update(id, data);
      await get().fetchContacts();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteContact: async (id) => {
    set({ isLoading: true });
    try {
      await contactsAPI.delete(id);
      await get().fetchContacts();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
