import api from './axios'; // Import instance yang telah dikonfigurasi

/**
 * Interface untuk objek Respons API Tingkat Atas yang membungkus data
 */
export interface ApiResponse<T> {
    message: string;
    data: T;
}


export interface PaginationData{
    attendances: AttendanceResponse[],
    currentPage: number,
    currentItem: number,
    totalItems: number,
    totalPages: number,
}

export interface AttendanceResponse{
    id: number,
    userId: number,
    userFullName: string,
    userRole: string,
    userEmail: string,
    userProfileImageUrl: string,
    date: string,
    checkinTime: string,
    checkinLat: number,
    checkinLng: number,
    checkinPhoto: string,
    checkoutTime: string | null,
    checkoutLat: number | null,
    checkoutLng: number | null,
    checkoutPhoto: string | null,
    status: string,
    note: string | null,
    createdAt: string,
    updatedAt: string,
}

export interface AttendanceQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  role?: string;
  status?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
}

export const attendanceApi = {
    
    // 1. Ambil semua user (GET) -> Mengembalikan Promise yang Resolved dengan List<User>
    getAllAttendances: async (params: AttendanceQueryParams ): Promise<PaginationData> => {
        // Axios menggunakan Generics untuk menentukan tipe respons: api.get<T>(...)
        const response = await api.get<ApiResponse<PaginationData>>('/api/attendance', {params});
        
        // response.data sekarang memiliki tipe List<User>
        return response.data.data;
    },
}