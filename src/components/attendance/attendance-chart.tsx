// components/attendance/attendance-chart.tsx
import React, { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent } from '../../components/ui/card';

interface AttendanceRecord {
  date: Date;
  status: 'present' | 'late' | 'absent' | 'on_leave' | 'half_day';
}

interface AttendanceChartProps {
  records: AttendanceRecord[];
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

const AttendanceChart: React.FC<AttendanceChartProps> = ({ records }) => {
  // Weekly attendance data
  const weeklyData = useMemo(() => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return weekDays.map(day => {
      const dayRecords = records.filter(record => isSameDay(record.date, day));
      const counts = {
        present: dayRecords.filter(r => r.status === 'present').length,
        late: dayRecords.filter(r => r.status === 'late').length,
        absent: dayRecords.filter(r => r.status === 'absent').length,
        on_leave: dayRecords.filter(r => r.status === 'on_leave').length,
        half_day: dayRecords.filter(r => r.status === 'half_day').length,
        total: dayRecords.length
      };
      
      return {
        name: format(day, 'EEE', { locale: id }),
        date: format(day, 'dd/MM'),
        ...counts
      };
    });
  }, [records]);

  // Status distribution data
  const statusDistribution = useMemo(() => {
    const counts = {
      present: records.filter(r => r.status === 'present').length,
      late: records.filter(r => r.status === 'late').length,
      absent: records.filter(r => r.status === 'absent').length,
      on_leave: records.filter(r => r.status === 'on_leave').length,
      half_day: records.filter(r => r.status === 'half_day').length
    };
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
      .filter(item => item.value > 0);
  }, [records]);

  // Department-wise attendance
  const departmentData = [
    { name: 'IT', attendance: 95, late: 5, absent: 0 },
    { name: 'HR', attendance: 92, late: 6, absent: 2 },
    { name: 'Marketing', attendance: 88, late: 8, absent: 4 },
    { name: 'Finance', attendance: 96, late: 3, absent: 1 },
    { name: 'Sales', attendance: 85, late: 10, absent: 5 },
  ];

  return (
    <Tabs defaultValue="weekly">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="weekly">Weekly Trend</TabsTrigger>
        <TabsTrigger value="distribution">Status Distribution</TabsTrigger>
        <TabsTrigger value="department">By Department</TabsTrigger>
      </TabsList>
      
      <TabsContent value="weekly">
        <Card>
          <CardContent className="pt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" name="Present" fill="#10B981" />
                  <Bar dataKey="late" name="Late" fill="#F59E0B" />
                  <Bar dataKey="absent" name="Absent" fill="#EF4444" />
                  <Bar dataKey="on_leave" name="On Leave" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="distribution">
        <Card>
          <CardContent className="pt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="department">
        <Card>
          <CardContent className="pt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendance" name="Attendance %" fill="#10B981" />
                  <Bar dataKey="late" name="Late %" fill="#F59E0B" />
                  <Bar dataKey="absent" name="Absent %" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AttendanceChart;