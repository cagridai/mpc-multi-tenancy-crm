import { create } from "zustand";
import { activitiesAPI } from "@/services/api";
import type { Activity, Stats } from "@/types";

interface ActivitiesState {
  activities: Activity[];
  upcomingActivities: Activity[];
  stats: Stats | null;
  isLoading: boolean;
  isLoadingUpcoming: boolean;
  isLoadingStats: boolean;

  // Pagination for all activities
  page: number;
  total: number;
  totalPages: number;

  // Separate pagination for upcoming activities
  upcomingPage: number;
  upcomingTotal: number;
  upcomingTotalPages: number;

  fetchActivities: (page?: number) => Promise<void>;
  fetchUpcoming: (page?: number) => Promise<void>;
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
  isLoadingUpcoming: false,
  isLoadingStats: false,

  // Pagination for all activities
  page: 1,
  totalPages: 0,
  total: 0,

  // Separate pagination for upcoming activities
  upcomingPage: 1,
  upcomingTotalPages: 0,
  upcomingTotal: 0,

  fetchActivities: async (page = get().page) => {
    set({ isLoading: true });
    try {
      const response = await activitiesAPI.getAll(page);
      set({
        activities: response.data.data,
        page: response.data.meta.page,
        totalPages: response.data.meta.totalPages,
        total: response.data.meta.total,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchUpcoming: async (page = 1) => {
    set({ isLoadingUpcoming: true });
    try {
      const response = await activitiesAPI.getUpcoming(page);

      set({
        upcomingActivities: response.data.data || response.data,
        upcomingPage: response.data.meta?.page || page,
        upcomingTotalPages: response.data.meta?.totalPages || 1,
        upcomingTotal: response.data.meta?.total || response.data.length,
        isLoadingUpcoming: false,
      });
    } catch (error) {
      set({
        upcomingActivities: [],
        isLoadingUpcoming: false,
      });
      throw error;
    }
  },

  fetchStats: async () => {
    set({ isLoadingStats: true });
    try {
      const response = await activitiesAPI.getStats();
      set({
        stats: response.data,
        isLoadingStats: false,
      });
    } catch (error) {
      set({ isLoadingStats: false });
      throw error;
    }
  },

  createActivity: async (data) => {
    set({ isLoading: true });
    try {
      await activitiesAPI.create(data);
      // Refresh both activities and upcoming activities
      await Promise.all([get().fetchActivities(), get().fetchUpcoming()]);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateActivity: async (id, data) => {
    set({ isLoading: true });
    try {
      await activitiesAPI.update(id, data);
      // Refresh both activities and upcoming activities
      await Promise.all([get().fetchActivities(), get().fetchUpcoming()]);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteActivity: async (id) => {
    set({ isLoading: true });
    try {
      await activitiesAPI.delete(id);
      // Refresh both activities and upcoming activities
      await Promise.all([get().fetchActivities(), get().fetchUpcoming()]);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
