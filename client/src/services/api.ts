import axios from "axios";
import type {
  AuthResponse,
  Company,
  Contact,
  Deal,
  Activity,
  Note,
  ApiResponse,
  Stats,
} from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token and tenant ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  const tenantId = localStorage.getItem("tenant_id");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenantId) {
    config.headers["x-tenant-id"] = tenantId;
  }

  return config;
});

// Auth API
export const authAPI = {
  createTenant: (data: {
    name: string;
    subdomain: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
    plan: string;
  }) => api.post<AuthResponse>("/auth/create-tenant", data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantId: string;
  }) => api.post<AuthResponse>("/auth/register", data),
};

// Companies API
export const companiesAPI = {
  getAll: (page: number = 1) =>
    api.get<ApiResponse<Company>>(`/companies?page=${page}`),
  getById: (id: string) => api.get<Company>(`/companies/${id}`),
  create: (data: Partial<Company>) => api.post<Company>("/companies", data),
  update: (id: string, data: Partial<Company>) =>
    api.patch<Company>(`/companies/${id}`, data),
  delete: (id: string) => api.delete(`/companies/${id}`),
  getStats: () => api.get<Stats>("/companies/stats"),
};

// Contacts API
export const contactsAPI = {
  getAll: (page: number = 1) =>
    api.get<ApiResponse<Contact>>(`/contacts?page=${page}`),
  getById: (id: string) => api.get<Contact>(`/contacts/${id}`),
  create: (data: Partial<Contact>) => api.post<Contact>("/contacts", data),
  update: (id: string, data: Partial<Contact>) =>
    api.patch<Contact>(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
  getStats: () => api.get<Stats>("/contacts/stats"),
};

// Deals API
export const dealsAPI = {
  getAll: (page: number = 1) =>
    api.get<ApiResponse<Deal>>(`/deals?page=${page}`),
  getById: (id: string) => api.get<Deal>(`/deals/${id}`),
  create: (data: Partial<Deal>) => api.post<Deal>("/deals", data),
  update: (id: string, data: Partial<Deal>) =>
    api.patch<Deal>(`/deals/${id}`, data),
  delete: (id: string) => api.delete(`/deals/${id}`),
  getStats: () => api.get<Stats>("/deals/stats"),
  getPipeline: () => api.get("/deals/pipeline"),
};

// Activities API
export const activitiesAPI = {
  getAll: (page: number = 1) =>
    api.get<ApiResponse<Activity>>(`/activities?page=${page}`),
  getById: (id: string) => api.get<Activity>(`/activities/${id}`),
  create: (data: Partial<Activity>) => api.post<Activity>("/activities", data),
  update: (id: string, data: Partial<Activity>) =>
    api.patch<Activity>(`/activities/${id}`, data),
  delete: (id: string) => api.delete(`/activities/${id}`),
  getStats: () => api.get<Stats>("/activities/stats"),
  getUpcoming: (page: number = 1) =>
    api.get<ApiResponse<Activity>>(`/activities/upcoming?page=${page}`),
};

// Notes API
export const notesAPI = {
  getAll: (page: number = 1) =>
    api.get<ApiResponse<Note>>(`/notes?page=${page}`),
  getById: (id: string) => api.get<Note>(`/notes/${id}`),
  create: (data: Partial<Note>) => api.post<Note>("/notes", data),
  update: (id: string, data: Partial<Note>) =>
    api.patch<Note>(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
  getStats: () => api.get<Stats>("/notes/stats"),
};
