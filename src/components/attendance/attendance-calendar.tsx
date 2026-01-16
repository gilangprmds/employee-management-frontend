// components/attendance/attendance-calendar.tsx
import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button2";
import { Badge2 } from "../ui/badge2";

interface AttendanceRecord {
  id: string;
  date: Date;
  status:
    | "present"
    | "late"
    | "absent"
    | "on_leave"
    | "half_day"
    | "weekend"
    | "holiday";
  employeeName: string;
}

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  records,
  currentDate,
  onDateChange,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500";
      case "late":
        return "bg-yellow-500";
      case "absent":
        return "bg-red-500";
      case "on_leave":
        return "bg-blue-500";
      case "half_day":
        return "bg-purple-500";
      case "weekend":
        return "bg-gray-300";
      case "holiday":
        return "bg-indigo-500";
      default:
        return "bg-gray-200";
    }
  };

  const getDayRecords = (day: Date) => {
    return records.filter((record) => isSameDay(record.date, day));
  };

  const getDayStatusSummary = (day: Date) => {
    const dayRecords = getDayRecords(day);
    if (dayRecords.length === 0) return null;

    const counts: Record<string, number> = {};
    dayRecords.forEach((record) => {
      counts[record.status] = (counts[record.status] || 0) + 1;
    });

    return counts;
  };

  const handlePrevMonth = () => {
    const prevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    onDateChange(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    onDateChange(nextMonth);
  };

  const dayNames = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy", { locale: id })}
          </h3>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Badge2 className="bg-green-500">Present</Badge2>
          <Badge2 className="bg-yellow-500">Late</Badge2>
          <Badge2 className="bg-red-500">Absent</Badge2>
          <Badge2 className="bg-blue-500">Leave</Badge2>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {dayNames.map((day, index) => (
            <div
              key={index}
              className="p-3 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayOfWeek = day.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isToday = isSameDay(day, new Date());
            const statusSummary = getDayStatusSummary(day);

            return (
              <div
                key={index}
                className={`min-h-32 border p-2 ${
                  isWeekend ? "bg-gray-50" : "bg-white"
                } ${isToday ? "ring-2 ring-blue-500" : ""} ${
                  isSameDay(day, selectedDate) ? "bg-blue-50" : ""
                }`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-sm font-medium ${
                      isWeekend ? "text-gray-500" : "text-gray-900"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {isToday && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                      Today
                    </span>
                  )}
                </div>

                {/* Status Dots */}
                {statusSummary && (
                  <div className="space-y-1 mt-2">
                    {Object.entries(statusSummary).map(([status, count]) => (
                      <div key={status} className="flex items-center gap-1">
                        <div
                          className={`h-2 w-2 rounded-full ${getStatusColor(
                            status
                          )}`}
                        ></div>
                        <span className="text-xs text-gray-600">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-2">
          {format(selectedDate, "EEEE, d MMMM yyyy", { locale: id })}
        </h4>
        <div className="space-y-2">
          {getDayRecords(selectedDate).map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-2 bg-white rounded border"
            >
              <span className="font-medium">{record.employeeName}</span>
              <Badge2
                className={getStatusColor(record.status).replace("bg-", "bg-")}
              >
                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
              </Badge2>
            </div>
          ))}
          {getDayRecords(selectedDate).length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No attendance records for this day
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
