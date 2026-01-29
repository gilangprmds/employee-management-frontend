import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";
import { AttendanceData } from "../../api/dashboardApi";
import { dummyDailyAttendanceData } from "../../api/dashboardDataDummy";

const aggregateWeeklyAverage = (dailyData: AttendanceData[]) => {
  const weeks = [
    { label: "Week 1", start: 0, end: 5 },
    { label: "Week 2", start: 5, end: 10 },
    { label: "Week 3", start: 10, end: 15 },
    { label: "Week 4", start: 15, end: dailyData.length },
  ];

  return weeks.map((week) => {
    const slice = dailyData.slice(week.start, week.end);
    const daysInWeek = slice.length || 1; // Hindari pembagian dengan nol

    return {
      month: week.label,
      // Kita gunakan Math.round agar tidak ada angka desimal di bar chart
      present: Math.round(
        slice.reduce((sum, d) => sum + d.present, 0) / daysInWeek,
      ),
      late: Math.round(slice.reduce((sum, d) => sum + d.late, 0) / daysInWeek),
      absent: Math.round(
        slice.reduce((sum, d) => sum + d.absent, 0) / daysInWeek,
      ),
      leave: Math.round(
        slice.reduce((sum, d) => sum + d.leave, 0) / daysInWeek,
      ),
    };
  });
};

export default function AttendanceChart() {
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");

  // Data yang akan ditampilkan
  const chartData =
    viewMode === "weekly"
      ? dummyDailyAttendanceData.slice(-7)
      : aggregateWeeklyAverage(dummyDailyAttendanceData);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: false,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 4,
      },
    },
    colors: ["#10B981", "#F59E0B", "#3B82F6", "#EF4444"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData.map((d) => d.month),
      labels: { style: { fontSize: "12px", colors: "#6B7280" } },
    },
    yaxis: {
      // Mengunci angka maksimal agar chart tidak 'melompat' saat toggle
      max: 120,
      min: 0,
      tickAmount: 3,
      labels: {
        style: { colors: "#6B7280" },
        formatter: (val) => Math.floor(val).toString(),
      },
    },
    tooltip: {
      shared: true, // Tetap true agar muncul semua kategori (Present, Late, dll)
      intersect: false, // UBAH INI JADI FALSE agar tidak bentrok dengan shared
      y: {
        formatter: (val) => {
          return viewMode === "weekly"
            ? `${val} Employees`
            : `${val} Employees (Avg/Day)`;
        },
      },
    },
    // Menambahkan grid transparan agar lebih estetik
    grid: {
      borderColor: "#F1F5F9",
      strokeDashArray: 4,
    },
  };

  const series = [
    { name: "Present", data: chartData.map((d) => d.present) },
    { name: "Late Arrival", data: chartData.map((d) => d.late) },
    { name: "On Leave", data: chartData.map((d) => d.leave) },
    { name: "Absent", data: chartData.map((d) => d.absent) },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Attendance Analytics
          </h3>
          <p className="text-sm text-gray-500">
            {viewMode === "weekly"
              ? "Real-time daily attendance"
              : "Average daily attendance per week"}
          </p>
        </div>

        {/* Toggle modern dengan background gray */}
        <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button
            onClick={() => setViewMode("weekly")}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
              viewMode === "weekly"
                ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-500 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
              viewMode === "monthly"
                ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-500 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <Chart options={options} series={series} type="bar" height="100%" />
      </div>
    </div>
  );
}
