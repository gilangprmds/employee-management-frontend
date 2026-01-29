export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  employeeCount?: number;
  manager?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentFormData {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  managerId?: string;
}

export interface PaginatedDepartmentResponse {
  content: Department[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}