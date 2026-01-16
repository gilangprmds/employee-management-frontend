import api from "./axios";
import { Role, CreateRoleRequest, UpdateRoleRequest, PermissionAssignRequest, PaginationData } from "./roleTypes";

const roleApi = {
  getAll: () => api.get<PaginationData<Role>>("/api/roles"),
  getById: (id: string) => api.get<Role>(`/api/roles/${id}`),
  getByCode: (code: string) => api.get<Role>(`/api/roles/code/${code}`),
  create: (data: CreateRoleRequest) => api.post<Role>("/api/roles", data),
  update: (id: string, data: UpdateRoleRequest) => api.put<Role>(`/api/roles/${id}`, data),
  delete: (id: string) => api.delete(`/api/roles/${id}`),
  
  assignPermissions: (id: string, data: PermissionAssignRequest) => 
    api.post<Role>(`/api/roles/${id}/permissions`, data),

  addPermission: (id: string, permissionName: string) =>
    api.post<Role>(`/api/roles/${id}/permissions/${permissionName}`),
  
  removePermission: (id: string, permissionName: string) => 
    api.delete(`/api/roles/${id}/permissions/${permissionName}`),

  activate: (id: string) => api.post<Role>(`/api/roles/${id}/activate`),
  deactivate: (id: string) => api.post<Role>(`/api/roles/${id}/deactivate`),

  search: (keyword: string) =>
    api.get<Role[]>(`/api/roles/search?keyword=${keyword}`),
    
  getActiveRoles: () => api.get<Role[]>("/api/roles/active"),
  getDefaultRoles: () => api.get<Role[]>("/api/roles/default"),
};

export default roleApi;