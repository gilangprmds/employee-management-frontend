// app/admin/attendance/records/page.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "../components/ui/table2";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button2";
import { Input } from "../components/ui/input";
import { Badge2 } from "../components/ui/badge2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Calendar,
  Filter,
  Search,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Users,
  CalendarDays,
  RefreshCw,
  Printer,
  FileText,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subMonths,
  addMonths,
} from "date-fns";
import { id } from "date-fns/locale";
import AttendanceCalendar from "../components/attendance/attendance-calendar";
import AttendanceChart from "../components/attendance/attendance-chart";

// Type definitions
interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;
  date: Date;
  day: string;
  checkIn: Date | null;
  checkOut: Date | null;
  workingHours: number;
  overtime: number;
  status:
    | "present"
    | "late"
    | "absent"
    | "on_leave"
    | "half_day"
    | "weekend"
    | "holiday";
  checkInLocation?: string;
  checkOutLocation?: string;
  checkInMethod: "mobile" | "fingerprint" | "face_recognition" | "manual";
  checkOutMethod: "mobile" | "fingerprint" | "face_recognition" | "manual";
  notes?: string;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  shift: "morning" | "afternoon" | "night" | "flexible";
}

interface AttendanceSummary {
  period: string;
  totalEmployees: number;
  totalWorkingDays: number;
  averageAttendance: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  totalLeave: number;
  totalOvertime: number;
  totalUndertime: number;
}

interface FilterState {
  dateRange: {
    from: Date;
    to: Date;
  };
  departments: string[];
  statuses: string[];
  shifts: string[];
  searchQuery: string;
  sortBy: "date" | "name" | "department" | "status" | "workingHours";
  sortOrder: "asc" | "desc";
}

const AttendanceRecordsPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>({
    period: format(new Date(), "MMMM yyyy", { locale: id }),
    totalEmployees: 45,
    totalWorkingDays: 22,
    averageAttendance: 89.5,
    totalPresent: 0,
    totalLate: 0,
    totalAbsent: 0,
    totalLeave: 0,
    totalOvertime: 0,
    totalUndertime: 0,
  });

  const [filter, setFilter] = useState<FilterState>({
    dateRange: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    },
    departments: [],
    statuses: [],
    shifts: [],
    searchQuery: "",
    sortBy: "date",
    sortOrder: "desc",
  });

  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [viewMode, setViewMode] = useState<"table" | "calendar" | "chart">(
    "table"
  );

  // Departments data
  const departments = [
    "All Departments",
    "Information Technology",
    "Human Resources",
    "Finance & Accounting",
    "Marketing",
    "Sales",
    "Operations",
    "Research & Development",
    "Customer Service",
    "Production",
    "Quality Assurance",
    "Logistics",
  ];

  // Status options
  const statusOptions = [
    {
      value: "present",
      label: "Present",
      color: "bg-green-100 text-green-800",
    },
    { value: "late", label: "Late", color: "bg-yellow-100 text-yellow-800" },
    { value: "absent", label: "Absent", color: "bg-red-100 text-red-800" },
    {
      value: "on_leave",
      label: "On Leave",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "half_day",
      label: "Half Day",
      color: "bg-purple-100 text-purple-800",
    },
    { value: "weekend", label: "Weekend", color: "bg-gray-100 text-gray-800" },
    {
      value: "holiday",
      label: "Holiday",
      color: "bg-indigo-100 text-indigo-800",
    },
  ];

  // Shift options
  const shiftOptions = [
    { value: "morning", label: "Morning Shift (08:00-17:00)" },
    { value: "afternoon", label: "Afternoon Shift (14:00-23:00)" },
    { value: "night", label: "Night Shift (22:00-07:00)" },
    { value: "flexible", label: "Flexible Hours" },
  ];

  // Mock data generation
  useEffect(() => {
    generateMockData();
  }, [currentDate]);

  const generateMockData = () => {
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const mockRecords: AttendanceRecord[] = [];
      const startDate = filter.dateRange.from;
      const endDate = filter.dateRange.to;
      const days = eachDayOfInterval({ start: startDate, end: endDate });

      const employees = [
        {
          id: "EMP001",
          name: "Budi Santoso",
          code: "BS001",
          department: "Information Technology",
          position: "Senior Software Engineer",
        },
        {
          id: "EMP002",
          name: "Siti Aminah",
          code: "SA002",
          department: "Human Resources",
          position: "HR Manager",
        },
        {
          id: "EMP003",
          name: "Andi Wijaya",
          code: "AW003",
          department: "Marketing",
          position: "Marketing Specialist",
        },
        {
          id: "EMP004",
          name: "Rina Melati",
          code: "RM004",
          department: "Finance & Accounting",
          position: "Accountant",
        },
        {
          id: "EMP005",
          name: "Joko Susilo",
          code: "JS005",
          department: "Sales",
          position: "Sales Executive",
        },
        {
          id: "EMP006",
          name: "Dewi Kusuma",
          code: "DK006",
          department: "Operations",
          position: "Operations Manager",
        },
        {
          id: "EMP007",
          name: "Ahmad Fauzi",
          code: "AF007",
          department: "Information Technology",
          position: "DevOps Engineer",
        },
        {
          id: "EMP008",
          name: "Maya Sari",
          code: "MS008",
          department: "Customer Service",
          position: "Customer Service Rep",
        },
        {
          id: "EMP009",
          name: "Hendra Pratama",
          code: "HP009",
          department: "Production",
          position: "Production Supervisor",
        },
        {
          id: "EMP010",
          name: "Linda Wati",
          code: "LW010",
          department: "Quality Assurance",
          position: "QA Analyst",
        },
      ];

      days.forEach((day) => {
        employees.forEach((employee) => {
          // Skip weekends (Saturday, Sunday) for some employees
          const dayOfWeek = day.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          // Generate random attendance data
          let status: AttendanceRecord["status"] = "present";
          let checkIn: Date | null = null;
          let checkOut: Date | null = null;
          let lateMinutes = 0;
          let workingHours = 8;
          let overtime = 0;

          if (isWeekend) {
            status = Math.random() > 0.7 ? "weekend" : "absent";
          } else {
            const rand = Math.random();
            if (rand < 0.7) {
              status = "present";
              // Normal check-in between 7:45 and 8:15
              const checkInHour = 7 + Math.floor(Math.random() * 3);
              const checkInMinute = Math.floor(Math.random() * 60);
              checkIn = new Date(
                day.getFullYear(),
                day.getMonth(),
                day.getDate(),
                checkInHour,
                checkInMinute
              );

              // Calculate late minutes if after 8:00
              if (checkInHour > 8 || (checkInHour === 8 && checkInMinute > 0)) {
                lateMinutes = (checkInHour - 8) * 60 + checkInMinute;
                if (lateMinutes > 15) status = "late";
              }

              // Check-out between 16:30 and 18:30
              const checkOutHour = 16 + Math.floor(Math.random() * 3);
              const checkOutMinute = Math.floor(Math.random() * 60);
              checkOut = new Date(
                day.getFullYear(),
                day.getMonth(),
                day.getDate(),
                checkOutHour,
                checkOutMinute
              );

              // Calculate working hours
              workingHours =
                (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

              // Calculate overtime if after 17:00
              if (checkOutHour >= 17) {
                overtime = checkOutHour - 17 + checkOutMinute / 60;
              }
            } else if (rand < 0.8) {
              status = "late";
              checkIn = new Date(
                day.getFullYear(),
                day.getMonth(),
                day.getDate(),
                8 + Math.floor(Math.random() * 3),
                Math.floor(Math.random() * 60)
              );
              lateMinutes =
                (checkIn.getHours() - 8) * 60 + checkIn.getMinutes();
              checkOut = new Date(
                day.getFullYear(),
                day.getMonth(),
                day.getDate(),
                17 + Math.floor(Math.random() * 2),
                Math.floor(Math.random() * 60)
              );
              workingHours =
                (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
            } else if (rand < 0.85) {
              status = "absent";
            } else if (rand < 0.9) {
              status = "on_leave";
            } else {
              status = "half_day";
              checkIn = new Date(
                day.getFullYear(),
                day.getMonth(),
                day.getDate(),
                8,
                0
              );
              checkOut = new Date(
                day.getFullYear(),
                day.getMonth(),
                day.getDate(),
                12,
                0
              );
              workingHours = 4;
            }
          }

          const record: AttendanceRecord = {
            id: `${employee.id}-${day.toISOString()}`,
            employeeId: employee.id,
            employeeName: employee.name,
            employeeCode: employee.code,
            department: employee.department,
            position: employee.position,
            date: day,
            day: format(day, "EEEE", { locale: id }),
            checkIn,
            checkOut,
            workingHours: parseFloat(workingHours.toFixed(2)),
            overtime: parseFloat(overtime.toFixed(2)),
            status,
            checkInLocation: checkIn ? "Main Office - Gate A" : undefined,
            checkOutLocation: checkOut ? "Main Office - Gate A" : undefined,
            checkInMethod: Math.random() > 0.5 ? "mobile" : "fingerprint",
            checkOutMethod: Math.random() > 0.5 ? "mobile" : "fingerprint",
            lateMinutes: lateMinutes > 0 ? lateMinutes : undefined,
            shift: ["morning", "afternoon", "night", "flexible"][
              Math.floor(Math.random() * 4)
            ] as any,
            notes:
              status === "absent"
                ? "Sick leave with doctor certificate"
                : status === "on_leave"
                ? "Annual leave"
                : status === "late"
                ? "Traffic jam"
                : undefined,
          };

          mockRecords.push(record);
        });
      });

      setRecords(mockRecords);

      // Calculate summary
      const presentCount = mockRecords.filter(
        (r) => r.status === "present" || r.status === "late"
      ).length;
      const lateCount = mockRecords.filter((r) => r.status === "late").length;
      const absentCount = mockRecords.filter(
        (r) => r.status === "absent"
      ).length;
      const leaveCount = mockRecords.filter(
        (r) => r.status === "on_leave"
      ).length;
      const totalOvertime = mockRecords.reduce((sum, r) => sum + r.overtime, 0);
      const totalUndertime =
        mockRecords.filter((r) => r.workingHours < 8 && r.status === "present")
          .length *
        (8 -
          mockRecords
            .filter((r) => r.workingHours < 8 && r.status === "present")
            .reduce((sum, r) => sum + r.workingHours, 0) /
            mockRecords.filter(
              (r) => r.workingHours < 8 && r.status === "present"
            ).length);

      setSummary((prev) => ({
        ...prev,
        totalPresent: presentCount,
        totalLate: lateCount,
        totalAbsent: absentCount,
        totalLeave: leaveCount,
        totalOvertime: parseFloat(totalOvertime.toFixed(2)),
        totalUndertime: parseFloat(totalUndertime.toFixed(2)),
      }));

      setIsLoading(false);
    }, 500);
  };

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    let filtered = [...records];

    // Apply search filter
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.employeeName.toLowerCase().includes(query) ||
          record.employeeCode.toLowerCase().includes(query) ||
          record.department.toLowerCase().includes(query) ||
          record.position.toLowerCase().includes(query)
      );
    }

    // Apply department filter
    if (
      filter.departments.length > 0 &&
      !filter.departments.includes("All Departments")
    ) {
      filtered = filtered.filter((record) =>
        filter.departments.includes(record.department)
      );
    }

    // Apply status filter
    if (filter.statuses.length > 0) {
      filtered = filtered.filter((record) =>
        filter.statuses.includes(record.status)
      );
    }

    // Apply shift filter
    if (filter.shifts.length > 0) {
      filtered = filtered.filter((record) =>
        filter.shifts.includes(record.shift)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filter.sortBy) {
        case "date":
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case "name":
          comparison = a.employeeName.localeCompare(b.employeeName);
          break;
        case "department":
          comparison = a.department.localeCompare(b.department);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "workingHours":
          comparison = a.workingHours - b.workingHours;
          break;
      }

      return filter.sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [records, filter]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = filteredRecords.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleExport = (format: "excel" | "pdf" | "csv") => {
    // In real app, this would trigger download
    alert(`Exporting data to ${format.toUpperCase()}...`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRefresh = () => {
    generateMockData();
  };

  const handleBulkAction = (action: "approve" | "reject" | "delete") => {
    // In real app, this would send request to API
    alert(`Performing ${action} on ${selectedRecords.size} records...`);
    setSelectedRecords(new Set());
    setBulkActionDialogOpen(false);
  };

  const getStatusIcon = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4" />;
      case "late":
        return <Clock className="h-4 w-4" />;
      case "absent":
        return <XCircle className="h-4 w-4" />;
      case "on_leave":
        return <CalendarDays className="h-4 w-4" />;
      case "half_day":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border-green-200";
      case "late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "absent":
        return "bg-red-100 text-red-800 border-red-200";
      case "on_leave":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "half_day":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "weekend":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "holiday":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCheckMethodIcon = (method: string) => {
    switch (method) {
      case "mobile":
        return "📱";
      case "fingerprint":
        return "👆";
      case "face_recognition":
        return "👤";
      case "manual":
        return "✏️";
      default:
        return "❓";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Attendance Records
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage employee attendance records
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export to Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export to PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export to CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Present</p>
                  <p className="text-xl font-bold mt-1 text-green-600">
                    {summary.totalPresent}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Late</p>
                  <p className="text-xl font-bold mt-1 text-yellow-600">
                    {summary.totalLate}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Absent</p>
                  <p className="text-xl font-bold mt-1 text-red-600">
                    {summary.totalAbsent}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On Leave</p>
                  <p className="text-xl font-bold mt-1 text-blue-600">
                    {summary.totalLeave}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                  <p className="text-xl font-bold mt-1">
                    {summary.averageAttendance}%
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overtime (Hrs)</p>
                  <p className="text-xl font-bold mt-1 text-purple-600">
                    {summary.totalOvertime}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Period</p>
                  <p className="text-sm font-medium mt-1 truncate">
                    {summary.period}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg">Filters & Controls</CardTitle>

              <Tabs
                value={viewMode}
                onValueChange={(v: any) => setViewMode(v)}
                className="w-full md:w-auto"
              >
                <TabsList className="grid grid-cols-3 w-full md:w-auto">
                  <TabsTrigger value="table">
                    <Table className="h-4 w-4 mr-2" />
                    Table
                  </TabsTrigger>
                  <TabsTrigger value="calendar">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar
                  </TabsTrigger>
                  <TabsTrigger value="chart">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Chart
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={format(filter.dateRange.from, "yyyy-MM-dd")}
                    onChange={(e) =>
                      setFilter({
                        ...filter,
                        dateRange: {
                          ...filter.dateRange,
                          from: new Date(e.target.value),
                        },
                      })
                    }
                  />
                  <Input
                    type="date"
                    value={format(filter.dateRange.to, "yyyy-MM-dd")}
                    onChange={(e) =>
                      setFilter({
                        ...filter,
                        dateRange: {
                          ...filter.dateRange,
                          to: new Date(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <Select
                  value={filter.departments[0] || "All Departments"}
                  onValueChange={(value) =>
                    setFilter({
                      ...filter,
                      departments: value === "All Departments" ? [] : [value],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={filter.statuses[0] || "all"}
                  onValueChange={(value) =>
                    setFilter({
                      ...filter,
                      statuses: value === "all" ? [] : [value],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-10"
                    value={filter.searchQuery}
                    onChange={(e) =>
                      setFilter({ ...filter, searchQuery: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {selectedRecords.size > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-700 font-medium">
                      {selectedRecords.size} records selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRecords(new Set())}
                    >
                      Clear Selection
                    </Button>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setBulkActionDialogOpen(true)}
                  >
                    Bulk Actions
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content based on View Mode */}
        {viewMode === "table" && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                Showing {paginatedRecords.length} of {filteredRecords.length}{" "}
                records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={
                              selectedRecords.size === paginatedRecords.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRecords(
                                  new Set(paginatedRecords.map((r) => r.id))
                                );
                              } else {
                                setSelectedRecords(new Set());
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Date & Day</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Working Hours</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRecords.map((record) => (
                        <TableRow
                          key={record.id}
                          className={
                            selectedRecords.has(record.id) ? "bg-blue-50" : ""
                          }
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={selectedRecords.has(record.id)}
                              onChange={(e) => {
                                const newSelected = new Set(selectedRecords);
                                if (e.target.checked) {
                                  newSelected.add(record.id);
                                } else {
                                  newSelected.delete(record.id);
                                }
                                setSelectedRecords(newSelected);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {record.employeeName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {record.employeeCode} • {record.department}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{format(record.date, "dd/MM/yyyy")}</div>
                              <div className="text-sm text-gray-500">
                                {record.day}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.checkIn ? (
                              <div>
                                <div>{format(record.checkIn, "HH:mm")}</div>
                                <div className="text-xs text-gray-500">
                                  {record.checkInLocation}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.checkOut ? (
                              <div>
                                <div>{format(record.checkOut, "HH:mm")}</div>
                                <div className="text-xs text-gray-500">
                                  {record.checkOutLocation}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{record.workingHours}h</div>
                              {record.overtime > 0 && (
                                <div className="text-xs text-purple-600">
                                  +{record.overtime}h OT
                                </div>
                              )}
                              {record.lateMinutes && record.lateMinutes > 0 && (
                                <div className="text-xs text-yellow-600">
                                  {record.lateMinutes}m late
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge2
                              className={`${getStatusColor(
                                record.status
                              )} flex items-center gap-1 w-fit`}
                            >
                              {getStatusIcon(record.status)}
                              {statusOptions.find(
                                (s) => s.value === record.status
                              )?.label || record.status}
                            </Badge2>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <span
                                className="text-lg"
                                title={`Check-in: ${record.checkInMethod}`}
                              >
                                {getCheckMethodIcon(record.checkInMethod)}
                              </span>
                              {record.checkOut && (
                                <span
                                  className="text-lg"
                                  title={`Check-out: ${record.checkOutMethod}`}
                                >
                                  {getCheckMethodIcon(record.checkOutMethod)}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setViewDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Record
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={9}>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              Showing {(page - 1) * pageSize + 1} to{" "}
                              {Math.min(
                                page * pageSize,
                                filteredRecords.length
                              )}{" "}
                              of {filteredRecords.length} entries
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                              >
                                <ChevronsLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <span className="text-sm">
                                Page {page} of {totalPages}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(totalPages)}
                                disabled={page === totalPages}
                              >
                                <ChevronsRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {viewMode === "calendar" && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Calendar View</CardTitle>
              <CardDescription>
                Visual overview of attendance patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceCalendar
                records={records}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
              />
            </CardContent>
          </Card>
        )}

        {viewMode === "chart" && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Analytics</CardTitle>
              <CardDescription>
                Statistical analysis of attendance patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceChart records={records} />
            </CardContent>
          </Card>
        )}

        {/* View Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Attendance Record Details</DialogTitle>
              <DialogDescription>
                Complete information for attendance record
              </DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Employee Information
                    </h4>
                    <div className="mt-2 space-y-2">
                      <p>
                        <strong>Name:</strong> {selectedRecord.employeeName}
                      </p>
                      <p>
                        <strong>Employee Code:</strong>{" "}
                        {selectedRecord.employeeCode}
                      </p>
                      <p>
                        <strong>Department:</strong> {selectedRecord.department}
                      </p>
                      <p>
                        <strong>Position:</strong> {selectedRecord.position}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Attendance Information
                    </h4>
                    <div className="mt-2 space-y-2">
                      <p>
                        <strong>Date:</strong>{" "}
                        {format(selectedRecord.date, "EEEE, dd MMMM yyyy", {
                          locale: id,
                        })}
                      </p>
                      <p>
                        <strong>Shift:</strong>{" "}
                        {selectedRecord.shift.charAt(0).toUpperCase() +
                          selectedRecord.shift.slice(1)}
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <Badge2
                          className={`ml-2 ${getStatusColor(
                            selectedRecord.status
                          )}`}
                        >
                          {
                            statusOptions.find(
                              (s) => s.value === selectedRecord.status
                            )?.label
                          }
                        </Badge2>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Check-in Details
                    </h4>
                    <div className="space-y-2">
                      <p>
                        <strong>Time:</strong>{" "}
                        {selectedRecord.checkIn
                          ? format(selectedRecord.checkIn, "HH:mm:ss")
                          : "N/A"}
                      </p>
                      <p>
                        <strong>Location:</strong>{" "}
                        {selectedRecord.checkInLocation || "N/A"}
                      </p>
                      <p>
                        <strong>Method:</strong>{" "}
                        {selectedRecord.checkInMethod
                          .replace("_", " ")
                          .toUpperCase()}
                      </p>
                      {selectedRecord.lateMinutes &&
                        selectedRecord.lateMinutes > 0 && (
                          <p className="text-yellow-600">
                            <strong>Late by:</strong>{" "}
                            {selectedRecord.lateMinutes} minutes
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Check-out Details
                    </h4>
                    <div className="space-y-2">
                      <p>
                        <strong>Time:</strong>{" "}
                        {selectedRecord.checkOut
                          ? format(selectedRecord.checkOut, "HH:mm:ss")
                          : "N/A"}
                      </p>
                      <p>
                        <strong>Location:</strong>{" "}
                        {selectedRecord.checkOutLocation || "N/A"}
                      </p>
                      <p>
                        <strong>Method:</strong>{" "}
                        {selectedRecord.checkOutMethod
                          .replace("_", " ")
                          .toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Working Hours
                    </h4>
                    <div className="mt-2 space-y-2">
                      <p>
                        <strong>Total Hours:</strong>{" "}
                        {selectedRecord.workingHours} hours
                      </p>
                      <p>
                        <strong>Overtime:</strong> {selectedRecord.overtime}{" "}
                        hours
                      </p>
                      <p>
                        <strong>Expected Hours:</strong> 8.0 hours
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Additional Information
                    </h4>
                    <div className="mt-2 space-y-2">
                      <p>
                        <strong>Notes:</strong>{" "}
                        {selectedRecord.notes || "No notes"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setViewDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  setEditDialogOpen(true);
                }}
              >
                Edit Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Actions Dialog */}
        <Dialog
          open={bulkActionDialogOpen}
          onOpenChange={setBulkActionDialogOpen}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bulk Actions</DialogTitle>
              <DialogDescription>
                Apply action to {selectedRecords.size} selected records
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleBulkAction("approve")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve All
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleBulkAction("reject")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject All
                </Button>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleBulkAction("delete")}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Selected
              </Button>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBulkActionDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AttendanceRecordsPage;
