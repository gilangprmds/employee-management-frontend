// dashboardDataDummy.ts
import { DashboardStats, AttendanceData, LeaveTypeData } from './dashboardTypes';

export const dummyDashboardStats: DashboardStats = {
  totalEmployees: 156,
  activeEmployees: 142,
  newHiresThisMonth: 12,
  pendingLeaves: 8,
  attritionRate: 2.4,
  avgAttendance: 94.8,
  departmentDistribution: [
    { department: 'Engineering', count: 65, percentage: 41.7 },
    { department: 'Design', count: 25, percentage: 16.0 },
    { department: 'Marketing', count: 35, percentage: 22.4 },
    { department: 'HR', count: 12, percentage: 7.7 },
    { department: 'Sales', count: 19, percentage: 12.2 },
  ],
  recentHires: [
    {
      id: 'EMP-001',
      name: 'Budi Santoso',
      position: 'Senior Developer',
      department: 'Engineering',
      joinDate: '2023-10-15',
      avatar: 'https://i.pravatar.cc/150?u=budi',
    },
    {
      id: 'EMP-002',
      name: 'Siti Aminah',
      position: 'UI/UX Designer',
      department: 'Design',
      joinDate: '2023-11-02',
      avatar: 'https://i.pravatar.cc/150?u=siti',
    },
    {
      id: 'EMP-003',
      name: 'Andi Wijaya',
      position: 'Marketing Specialist',
      department: 'Marketing',
      joinDate: '2023-11-20',
      avatar: 'https://i.pravatar.cc/150?u=andi',
    },
    {
      id: 'EMP-004',
      name: 'Rina Putri',
      position: 'Backend Developer',
      department: 'Engineering',
      joinDate: '2023-12-01',
    },
  ],
};

export const dummyAttendanceData: AttendanceData[] = [
  { month: 'Jul', present: 140, absent: 5, leave: 8, late: 30 },
  { month: 'Aug', present: 145, absent: 2, leave: 4, late: 5 },
  { month: 'Sep', present: 138, absent: 10, leave: 5, late: 3 },
  { month: 'Oct', present: 150, absent: 1, leave: 3, late: 2 },
  { month: 'Nov', present: 142, absent: 4, leave: 7, late: 3 },
  { month: 'Dec', present: 148, absent: 2, leave: 4, late: 2 },
];

// Mengasumsikan jumlah total karyawan adalah 156 sesuai dummy sebelumnya
export const dummyDailyAttendanceData: AttendanceData[] = [
  { month: '01 Dec', present: 98, absent: 2, leave: 14, late: 42 },
  { month: '02 Dec', present: 90, absent: 1, leave: 13, late: 42 },
  { month: '03 Dec', present: 95, absent: 3, leave: 15, late: 43 },
  { month: '04 Dec', present: 92, absent: 4, leave: 17, late: 43 },
  { month: '05 Dec', present: 97, absent: 2, leave: 14, late: 43 },
  { month: '06 Dec', present: 99, absent: 1, leave: 14, late: 42 },
  // { month: '07 Dec', present: 0,   absent: 0, leave: 0, late: 0 }, // Sabtu (Libur)
  // { month: '08 Dec', present: 0,   absent: 0, leave: 0, late: 0 }, // Minggu (Libur)
  { month: '09 Dec', present: 96, absent: 3, leave: 15, late: 42 },
  { month: '10 Dec', present: 94, absent: 4, leave: 16, late: 42 },
  { month: '11 Dec', present: 98, absent: 2, leave: 14, late: 42 },
  { month: '12 Dec', present: 91, absent: 1, leave: 13, late: 41 },
  { month: '13 Dec', present: 93, absent: 5, leave: 15, late: 43 },
  // { month: '14 Dec', present: 0,   absent: 0, leave: 0, late: 0 }, // Sabtu
  // { month: '15 Dec', present: 0,   absent: 0, leave: 0, late: 0 }, // Minggu
  { month: '16 Dec', present: 97, absent: 2, leave: 14, late: 43 },
  { month: '17 Dec', present: 99, absent: 1, leave: 14, late: 42 },
  { month: '18 Dec', present: 95, absent: 3, leave: 16, late: 42 },
  { month: '19 Dec', present: 98, absent: 2, leave: 14, late: 42 },
  { month: '20 Dec', present: 96, absent: 3, leave: 14, late: 43 },
  // { month: '21 Dec', present: 0,   absent: 0, leave: 0, late: 0 }, // Sabtu
  // { month: '22 Dec', present: 0,   absent: 0, leave: 0, late: 0 }, // Minggu
  { month: '23 Dec', present: 90, absent: 8, leave: 15, late: 43 },
  // { month: '24 Dec', present: 135, absent: 10, leave: 8, late: 3 }, // Cuti bersama
  // { month: '25 Dec', present: 0,   absent: 0, leave: 0, late: 0 }, // Libur Natal
  { month: '26 Dec', present: 88, absent: 6, leave: 20, late: 42 },
  { month: '27 Dec', present: 92, absent: 4, leave: 18, late: 42 },
  // { month: '28 Dec', present: 0,   absent: 0, leave: 0, late: 0 }, // Sabtu
  // { month: '29 Dec', present: 0,   absent: 0, leave: 0, late: 0 }, // Minggu
  { month: '30 Dec', present: 94, absent: 4, leave: 16, late: 42 },
  { month: '31 Dec', present: 90, absent: 6, leave: 18, late: 42 },
];

export const dummyLeaveTypeData: LeaveTypeData[] = [
  { type: 'Annual Leave', count: 45, percentage: 60, color: '#3B82F6' },
  { type: 'Sick Leave', count: 15, percentage: 20, color: '#EF4444' },
  { type: 'Maternity Leave', count: 10, percentage: 13, color: '#EC4899' },
  { type: 'Unpaid Leave', count: 5, percentage: 7, color: '#F59E0B' },
];