import { create } from "zustand";
import { activitiesAPI } from "@/services/api";
import type { Activity, Stats } from "@/types";

interface ActivitiesState {
  activities: Activity[];
  upcomingActivities: Activity[];
  stats: Stats | null;
  isLoading: boolean;
  page: number;
  totalPages: number;
  fetchActivities: (page?: number) => Promise<void>;
  fetchUpcoming: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createActivity: (data: Partial<Activity>) => Promise<void>;
  updateActivity: (id: string, data: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
}

export const useActivitiesStore = create<ActivitiesState>((set, get) => ({
  activities: [],
  upcomingActivities: [],
  stats: null,
  isLoading: false,
  page: 1,
  totalPages: 0,

  fetchActivities: async (page = get().page) => {
    set({ isLoading: true });
    try {
      const response = await activitiesAPI.getAll(page);
      set({
        activities: response.data.data,
        page: response.data.meta.page,
        totalPages: response.data.meta.totalPages,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchUpcoming: async () => {
    set({ isLoading: true });
    try {
      const response = await activitiesAPI.getUpcoming();
      set({ upcomingActivities: response.data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const response = await activitiesAPI.getStats();
      set({ stats: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createActivity: async (data) => {
    set({ isLoading: true });
    try {
      await activitiesAPI.create(data);
      await get().fetchActivities();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateActivity: async (id, data) => {
    set({ isLoading: true });
    try {
      await activitiesAPI.update(id, data);
      await get().fetchActivities();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteActivity: async (id) => {
    set({ isLoading: true });
    try {
      await activitiesAPI.delete(id);
      await get().fetchActivities();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
