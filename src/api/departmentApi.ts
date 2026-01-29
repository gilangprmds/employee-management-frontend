import api from './axios';
import { Department, DepartmentFormData, PaginatedDepartmentResponse } from './departmentTypes';

const departmentApi = {
  getAll: async (params?: { page?: number; size?: number; search?: string }) => {
    const response = await api.get<PaginatedDepartmentResponse>(`/api/departments`, { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Department>(`/api/departments/${id}`);
    return response.data;
  },

  create: async (departmentData: DepartmentFormData) => {
    const response = await api.post<Department>(`/api/departments`, departmentData);
    return response.data;
  },

  update: async (id: string, departmentData: Partial<DepartmentFormData>) => {
    const response = await api.put<Department>(`/api/departments/${id}`, departmentData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/departments/${id}`);
    return response.data;
  },

  // Untuk mengambil daftar karyawan yang bisa menjadi manager
  getPotentialManagers: async (departmentId?: string) => {
    const response = await api.get<any[]>(`/api/departments/potential-managers`, {
      params: { departmentId }
    });
    return response.data;
  },

  // Untuk update status aktif/nonaktif
  toggleStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch<Department>(`/api/departments/${id}/status`, { isActive });
    return response.data;
  },
};

export default departmentApi;