// api/dashboardTypes.ts
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  newHiresThisMonth: number;
  pendingLeaves: number;
  attritionRate: number;
  avgAttendance: number;
  departmentDistribution: {
    department: string;
    count: number;
    percentage: number;
  }[];
  recentHires: {
    id: string;
    name: string;
    position: string;
    department: string;
    joinDate: string;
    avatar?: string;
  }[];
}

export interface AttendanceData {
  month: string;
  present: number;
  absent: number;
  leave: number;
  late: number;
}

export interface LeaveTypeData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}