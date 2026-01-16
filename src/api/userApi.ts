// src/api/userApi.js

import api from './axios'; // Import instance yang telah dikonfigurasi

// --- 1. Mendefinisikan Tipe Data ---


/**
 * Interface untuk objek User yang diterima dari backend (data penuh)
 */
export interface User {
  id: number
  email: string
  fullName: string
  firstName: string
  lastName: string
  phoneNumber: string
  profileImageUrl: string
  status: string
  accountNonExpired: boolean
  accountNonLocked: boolean
  credentialsNonExpired: boolean
  enabled: boolean
  roles: string[]
  permissions: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface UserQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  role?: string;
  status?: string;
  name?: string;
}

/**
 * Interface untuk objek data Pagination
 */
export interface PaginationUserData {
    content: User[]; // Array objek User
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
}

/**
 * Interface untuk objek Respons API Tingkat Atas yang membungkus data
 */
export interface ApiResponse<T> {
    message: string;
    data: T;
}

/**
 * Interface untuk data yang dibutuhkan saat membuat User baru (Request Body)
 * ID biasanya tidak diperlukan saat membuat.
 */
export interface CreateUserPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    roleCodes: string[]; // Asumsikan password opsional atau di-handle di tempat lain
}

/**
 * Interface untuk data yang dikirim saat mengupdate User
 * Semua field bisa opsional (Partial<T> juga bisa digunakan)
 */
export interface UpdateUserPayload {
    username?: string;
    email?: string;
    // ...
}


// --- 2. Implementasi API dengan Tipe yang Kuat ---

export const userApi = {
    
    // 1. Ambil semua user (GET) -> Mengembalikan Promise yang Resolved dengan List<User>
    getAllUsers: async (params: UserQueryParams): Promise<PaginationUserData> => {
        // Axios menggunakan Generics untuk menentukan tipe respons: api.get<T>(...)
        const response = await api.get<ApiResponse<PaginationUserData>>('/api/users', { params });

        // response.data sekarang memiliki tipe List<User>
        return response.data.data;
    },

    // 2. Buat user baru (POST) -> Mengembalikan Promise<User>
    createUser: async (userData: FormData): Promise<User> => {
        // POST dengan body userData (tipe CreateUserPayload) dan respons User (tipe User)
        const response = await api.post<User>('/api/users', userData);
        return response.data;
    },
    
    // 3. Update user (PUT/PATCH) -> Mengembalikan Promise<User>
    updateUser: async (userId: number, updateData: FormData): Promise<User> => {
        // Tipe userId diatur ke number (asumsi ID berupa angka)
        const response = await api.put<User>(`/api/users/${userId}`, updateData);
        return response.data;
    },

    // 4. Hapus user (DELETE) -> Mengembalikan Promise<boolean>
    deleteUser: async (userId: number): Promise<boolean> => {
        await api.delete(`/api/users/${userId}`);
        
        // Karena respons yang berhasil (200/204) tidak mengembalikan data, kita kembalikan boolean
        return true; 
    },

    // 5. Ambil user berdasarkan ID (GET) -> Mengembalikan Promise<User>
    getUserById: async (userId: number): Promise<User> => {
        const response = await api.get<User>(`/api/users/${userId}`);
        return response.data;
    },
};