import { create } from "zustand";
import { notesAPI } from "@/services/api";
import type { Note, Stats } from "@/types";

interface NotesState {
  notes: Note[];
  stats: Stats | null;
  isLoading: boolean;
  page: number;
  totalPages: number;
  fetchNotes: (page?: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  createNote: (data: Partial<Note>) => Promise<void>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  stats: null,
  isLoading: false,
  page: 1,
  totalPages: 0,

  fetchNotes: async (page = get().page) => {
    set({ isLoading: true });
    try {
      const response = await notesAPI.getAll(page);
      set({
        notes: response.data.data,
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
      const response = await notesAPI.getStats();
      set({ stats: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createNote: async (data) => {
    set({ isLoading: true });
    try {
      await notesAPI.create(data);
      await get().fetchNotes();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateNote: async (id, data) => {
    set({ isLoading: true });
    try {
      await notesAPI.update(id, data);
      await get().fetchNotes();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteNote: async (id) => {
    set({ isLoading: true });
    try {
      await notesAPI.delete(id);
      await get().fetchNotes();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
