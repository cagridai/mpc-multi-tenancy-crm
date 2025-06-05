import { create } from "zustand";
import type { User } from "@/types";
import { authAPI } from "@/services/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantId: string;
  }) => Promise<void>;
  createTenant: (data: {
    name: string;
    subdomain: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
    plan: string;
  }) => Promise<void>;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login(email, password);
      const { access_token, user } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("tenant_id", user.tenant.id);
      localStorage.setItem("email", user.email);

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.register(data);
      const { access_token, user } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("tenant_id", user.tenant.id);
      localStorage.setItem("email", user.email);

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createTenant: async (data) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.createTenant(data);
      const { access_token, user } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("tenant_id", user.tenant.id);
      localStorage.setItem("email", user.email);

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("tenant_id");
    localStorage.removeItem("email");
    set({ user: null, isAuthenticated: false });
  },

  initAuth: () => {
    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");
    const tenantId = localStorage.getItem("tenant_id");
    const email = localStorage.getItem("email");

    if (token && userId && tenantId && email) {
      set({
        isAuthenticated: true,
        user: {
          id: userId,
          email,
          firstName: "",
          lastName: "",
          tenant: {
            id: tenantId,
            name: "",
            subdomain: "",
            plan: "",
          },
        },
      });
    }
  },
}));
