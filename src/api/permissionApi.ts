import api from "./axios";
import { Permission, PaginationData } from "./roleTypes";

const permissionApi = {
  getAll: () => api.get<PaginationData<Permission>>("/api/permissions"),
  getById: (id: string) => api.get<Permission>(`/api/permissions/${id}`),
  getByName: (name: string) => api.get<Permission>(`/api/permissions/name/${name}`),

  getByResource: (resource: string) => 
    api.get<Permission[]>(`/api/permissions/resource/${resource}`),
    
  getByAction: (action: string) => 
    api.get<Permission[]>(`/api/permissions/action/${action}`),
  getByCategory: (category: string) => 
    api.get<Permission[]>(`/api/permissions/category/${category}`),
    
  getActivePermissions: () => api.get<Permission[]>("/api/permissions/active"),
  getPermissionsByRole: (roleCode: string) => 
    api.get<Permission[]>(`/api/permissions/role/${roleCode}`),
  
  create: (resource: string, action: string, scope?: string) => 
    api.post<Permission>("/api/permissions", null, { 
      params: { resource, action, scope } 
    }),
  
  update: (id: string, description?: string, active?: boolean, sensitive?: boolean) => 
    api.put<Permission>(`/api/permissions/${id}`, null, {
      params: { description, active, sensitive } 
    }),
  
  activate: (id: string) => api.post<Permission>(`/api/permissions/${id}/activate`),
  deactivate: (id: string) => api.post<Permission>(`/api/permissions/${id}/deactivate`),
  
  search: (keyword: string) => 
    api.get<Permission[]>(`/api/permissions/search?keyword=${keyword}`),
};

export default permissionApi;