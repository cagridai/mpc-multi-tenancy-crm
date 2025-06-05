export interface ITenant {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
}

export interface ITenantRequest extends Request {
  tenant: ITenant;
  user: {
    id: string;
    email: string;
    tenantId: string;
    roles: string;
  };
}
