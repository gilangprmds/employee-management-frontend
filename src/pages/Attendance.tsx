// app/admin/attendance/page.tsx
import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Event, SlotInfo } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Badge2 } from "../components/ui/badge2";
import { Button } from "../components/ui/button2";
import { Input } from "../components/ui/input";
import {
  Calendar as CalendarIcon,
  Filter,
  Download,
  Search,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const localizer = momentLocalizer(moment);

// Type definitions
interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  status: "present" | "late" | "absent" | "on_leave" | "half_day";
  location: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  avatar?: string;
}

interface CalendarEvent extends Event {
  type: "attendance" | "holiday" | "leave";
  status?: string;
  employeeName?: string;
  department?: string;
}

interface AttendanceStats {
  totalEmployees: number;
  present: number;
  late: number;
  absent: number;
  onLeave: number;
  attendanceRate: number;
}

const AttendanceCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">(
    "month"
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalEmployees: 45,
    present: 32,
    late: 5,
    absent: 8,
    onLeave: 5,
    attendanceRate: 82.2,
  });
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - in real app, this would come from API
  const departments = [
    "All Departments",
    "IT",
    "HR",
    "Marketing",
    "Finance",
    "Operations",
  ];
  const employees: Employee[] = [
    {
      id: "1",
      name: "Budi Santoso",
      department: "IT",
      position: "Software Engineer",
    },
    { id: "2", name: "Siti Aminah", department: "HR", position: "HR Manager" },
    {
      id: "3",
      name: "Andi Wijaya",
      department: "Marketing",
      position: "Marketing Specialist",
    },
    {
      id: "4",
      name: "Rina Melati",
      department: "Finance",
      position: "Accountant",
    },
    {
      id: "5",
      name: "Dewi Kusuma",
      department: "Operations",
      position: "Operations Manager",
    },
  ];

  // Generate mock attendance data
  useEffect(() => {
    const generateMockData = () => {
      const records: AttendanceRecord[] = [];
      const calendarEvents: CalendarEvent[] = [];
      const startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      // Generate data for each employee for the current month
      employees.forEach((employee) => {
        let date = new Date(startDate);
        while (date <= endDate) {
          // Skip weekends
          if (date.getDay() !== 0 && date.getDay() !== 6) {
            const status = getRandomStatus();
            const checkIn =
              status !== "absent" && status !== "on_leave"
                ? new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    7 + Math.floor(Math.random() * 3),
                    Math.floor(Math.random() * 60)
                  )
                : null;

            const checkOut = checkIn
              ? new Date(
                  checkIn.getTime() +
                    8 * 60 * 60 * 1000 +
                    Math.floor(Math.random() * 60) * 60000
                )
              : null;

            const record: AttendanceRecord = {
              id: `${employee.id}-${date.toISOString()}`,
              employeeId: employee.id,
              employeeName: employee.name,
              department: employee.department,
              date: new Date(date),
              checkIn,
              checkOut,
              status,
              location: {
                latitude: -6.2088 + (Math.random() - 0.5) * 0.01,
                longitude: 106.8456 + (Math.random() - 0.5) * 0.01,
              },
            };

            records.push(record);

            // Create calendar event
            if (status !== "absent") {
              const event: CalendarEvent = {
                title: `${employee.name} - ${getStatusLabel(status)}`,
                start: checkIn || new Date(date),
                end: checkOut || new Date(date.getTime() + 8 * 60 * 60 * 1000),
                type: "attendance",
                status,
                employeeName: employee.name,
                department: employee.department,
              };
              calendarEvents.push(event);
            }
          }
          date.setDate(date.getDate() + 1);
        }
      });

      // Add holidays
      const holidays = [
        {
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
          title: "New Year",
        },
        {
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 17),
          title: "Company Anniversary",
        },
        {
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25),
          title: "Christmas",
        },
      ];

      holidays.forEach((holiday) => {
        calendarEvents.push({
          title: holiday.title,
          start: holiday.date,
          end: holiday.date,
          allDay: true,
          type: "holiday",
        });
      });

      setAttendanceRecords(records);
      setEvents(calendarEvents);
    };

    generateMockData();
  }, [currentDate]);

  const getRandomStatus = (): AttendanceRecord["status"] => {
    const rand = Math.random();
    if (rand < 0.7) return "present";
    if (rand < 0.8) return "late";
    if (rand < 0.9) return "absent";
    return "on_leave";
  };

  const getStatusLabel = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "present":
        return "Present";
      case "late":
        return "Late";
      case "absent":
        return "Absent";
      case "on_leave":
        return "On Leave";
      case "half_day":
        return "Half Day";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "on_leave":
        return "bg-blue-100 text-blue-800";
      case "half_day":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <MoreVertical className="h-4 w-4" />;
    }
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedDate(slotInfo.start);
    setView("day");
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    const record = attendanceRecords.find(
      (r) =>
        r.employeeName === event.employeeName &&
        new Date(r.date).toDateString() === event.start.toDateString()
    );
    if (record) {
      setSelectedRecord(record);
      setShowDetailsDialog(true);
    }
  };

  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesDate =
      record.date.toDateString() === selectedDate.toDateString();
    const matchesDepartment =
      selectedDepartment === "all" || record.department === selectedDepartment;
    const matchesEmployee =
      selectedEmployee === "all" || record.employeeId === selectedEmployee;
    const matchesSearch =
      searchQuery === "" ||
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDate && matchesDepartment && matchesEmployee && matchesSearch;
  });

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "";
    switch (event.status) {
      case "present":
        backgroundColor = "#10b981";
        break;
      case "late":
        backgroundColor = "#f59e0b";
        break;
      case "absent":
        backgroundColor = "#ef4444";
        break;
      case "on_leave":
        backgroundColor = "#3b82f6";
        break;
      case "holiday":
        backgroundColor = "#8b5cf6";
        break;
      default:
        backgroundColor = "#6b7280";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0",
        display: "block",
      },
    };
  };

  const exportToExcel = () => {
    // In real app, this would generate and download Excel file
    alert("Exporting to Excel...");
  };

  const exportToPDF = () => {
    // In real app, this would generate and download PDF
    alert("Exporting to PDF...");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Attendance Calendar
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage employee attendance
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={exportToPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats and Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Employees</p>
                      <p className="text-2xl font-bold mt-1">
                        {stats.totalEmployees}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Present Today</p>
                      <p className="text-2xl font-bold mt-1">{stats.present}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Late Today</p>
                      <p className="text-2xl font-bold mt-1">{stats.late}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Attendance Rate</p>
                      <p className="text-2xl font-bold mt-1">
                        {stats.attendanceRate}%
                      </p>
                    </div>
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.slice(1).map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee
                  </label>
                  <Select
                    value={selectedEmployee}
                    onValueChange={setSelectedEmployee}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
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
                      placeholder="Search by name or department..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Legend</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Late</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">On Leave</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm">Holiday</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowBulkEditDialog(true)}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Bulk Edit Attendance
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report Missing Attendance
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Monthly Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Calendar and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar View */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Attendance Calendar</CardTitle>
                  <div className="flex gap-2">
                    <Select value={view} onValueChange={(v: any) => setView(v)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="agenda">Agenda</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentDate(new Date())}
                    >
                      Today
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[600px]">
                  <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    date={currentDate}
                    onNavigate={setCurrentDate}
                    view={view}
                    onView={setView}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    selectable
                    eventPropGetter={eventStyleGetter}
                    popup
                    messages={{
                      today: "Today",
                      previous: "Previous",
                      next: "Next",
                      month: "Month",
                      week: "Week",
                      day: "Day",
                      agenda: "Agenda",
                      date: "Date",
                      time: "Time",
                      event: "Event",
                      noEventsInRange: "No attendance records for this period",
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Daily Attendance Details */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Attendance Details -{" "}
                    {format(selectedDate, "EEEE, MMMM d, yyyy", { locale: id })}
                  </CardTitle>
                  <Badge2 variant="outline">
                    {filteredRecords.length} Records
                  </Badge2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Working Hours</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => {
                          const workingHours =
                            record.checkIn && record.checkOut
                              ? (
                                  (record.checkOut.getTime() -
                                    record.checkIn.getTime()) /
                                  (1000 * 60 * 60)
                                ).toFixed(1)
                              : "-";

                          return (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold text-sm">
                                      {record.employeeName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </span>
                                  </div>
                                  <div>
                                    <p>{record.employeeName}</p>
                                    <p className="text-xs text-gray-500">
                                      ID: {record.employeeId}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{record.department}</TableCell>
                              <TableCell>
                                {record.checkIn
                                  ? format(record.checkIn, "HH:mm")
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {record.checkOut
                                  ? format(record.checkOut, "HH:mm")
                                  : "-"}
                              </TableCell>
                              <TableCell>{workingHours}h</TableCell>
                              <TableCell>
                                <Badge2
                                  className={getStatusColor(record.status)}
                                >
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(record.status)}
                                    {getStatusLabel(record.status)}
                                  </div>
                                </Badge2>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setShowDetailsDialog(true);
                                  }}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-gray-500"
                          >
                            No attendance records found for this date
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Attendance Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Employee
                  </h4>
                  <p className="mt-1">{selectedRecord.employeeName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Department
                  </h4>
                  <p className="mt-1">{selectedRecord.department}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date</h4>
                  <p className="mt-1">
                    {format(selectedRecord.date, "MMMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <Badge2
                    className={`mt-1 ${getStatusColor(selectedRecord.status)}`}
                  >
                    {getStatusLabel(selectedRecord.status)}
                  </Badge2>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Check In
                  </h4>
                  <p className="mt-1">
                    {selectedRecord.checkIn
                      ? format(selectedRecord.checkIn, "HH:mm:ss")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Check Out
                  </h4>
                  <p className="mt-1">
                    {selectedRecord.checkOut
                      ? format(selectedRecord.checkOut, "HH:mm:ss")
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Location</h4>
                <p className="mt-1 text-sm">
                  Lat: {selectedRecord.location.latitude.toFixed(6)}, Long:{" "}
                  {selectedRecord.location.longitude.toFixed(6)}
                </p>
                <a
                  href={`https://maps.google.com/?q=${selectedRecord.location.latitude},${selectedRecord.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View on Google Maps
                </a>
              </div>

              {selectedRecord.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded">
                    {selectedRecord.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsDialog(false)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="text-yellow-600 border-yellow-200"
                >
                  Edit Record
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200"
                >
                  Report Issue
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkEditDialog} onOpenChange={setShowBulkEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Edit Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date Range
              </label>
              <div className="flex gap-2">
                <Input type="date" placeholder="Start Date" />
                <Input type="date" placeholder="End Date" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept.toLowerCase()}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status to Apply
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <Input placeholder="Enter reason for bulk edit..." />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowBulkEditDialog(false)}
              >
                Cancel
              </Button>
              <Button>Apply Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceCalendarView;
