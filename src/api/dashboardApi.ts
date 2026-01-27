// api/dashboardApi.ts
import axios from 'axios';
import { DashboardStats, AttendanceData, LeaveTypeData } from './dashboardTypes';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await axios.get(`${API_BASE}/dashboard/stats`);
    return response.data;
  },

  getAttendanceData: async (year: number = new Date().getFullYear()): Promise<AttendanceData[]> => {
    const response = await axios.get(`${API_BASE}/dashboard/attendance`, {
      params: { year }
    });
    return response.data;
  },

  getLeaveDistribution: async (): Promise<LeaveTypeData[]> => {
    const response = await axios.get(`${API_BASE}/dashboard/leave-distribution`);
    return response.data;
  }
};

export { dashboardApi };
export type { DashboardStats, AttendanceData, LeaveTypeData };