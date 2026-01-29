// api/dashboardApi.ts
import api from './axios';
import { DashboardStats, AttendanceData, LeaveTypeData } from './dashboardTypes';

const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get(`/api/dashboard/stats`);
    return response.data;
  },

  getAttendanceData: async (year: number = new Date().getFullYear()): Promise<AttendanceData[]> => {
    const response = await api.get(`/api/dashboard/attendance`, {
      params: { year }
    });
    return response.data;
  },

  getLeaveDistribution: async (): Promise<LeaveTypeData[]> => {
    const response = await api.get(`/api/dashboard/leave-distribution`);
    return response.data;
  }
};

export { dashboardApi };
export type { DashboardStats, AttendanceData, LeaveTypeData };