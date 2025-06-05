export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenant: Tenant;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  size?: "STARTUP" | "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE";
  status?: "ACTIVE" | "INACTIVE" | "PROSPECT";
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  status?: "ACTIVE" | "INACTIVE" | "PROSPECT";
  companyId?: string;
  company?: Company;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  title: string;
  value?: number;
  currency?: string;
  stage?:
    | "PROSPECTING"
    | "QUALIFICATION"
    | "PROPOSAL"
    | "NEGOTIATION"
    | "CLOSED_WON"
    | "CLOSED_LOST";
  status?: "OPEN" | "WON" | "LOST";
  probability?: number;
  closeDate?: string;
  companyId?: string;
  contactId?: string;
  ownerId: string;
  company?: Company;
  contact?: Contact;
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  title: string;
  type: "CALL" | "EMAIL" | "MEETING" | "TASK" | "NOTE";
  description?: string;
  status?: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dueDate?: string;
  assignedToId: string;
  companyId?: string;
  contactId?: string;
  dealId?: string;
  assignedTo?: User;
  company?: Company;
  contact?: Contact;
  deal?: Deal;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  content: string;
  companyId?: string;
  contactId?: string;
  dealId?: string;
  company?: Company;
  contact?: Contact;
  deal?: Deal;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Stats {
  total: number;
  active?: number;
  inactive?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
