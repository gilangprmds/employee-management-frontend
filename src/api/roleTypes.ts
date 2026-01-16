// types/role.ts
export interface PaginationData<T> {
    content: T[]; // Array objek User
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  isSystem?: boolean;
  isActive?: boolean;
  permissions: Permission[];
  createdAt?: string;
  updatedAt?: string;
  userCount?: number;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  scope?: string;
  isSensitive?: boolean;
  active?: boolean;
  category?: string;
}

export interface CreateRoleRequest {
  name: string;
  code: string;
  description?: string;
  permissionNames?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionNames?: string[];
  isActive?: boolean;
}

export interface PermissionAssignRequest {
  permissionNames: string[];
}