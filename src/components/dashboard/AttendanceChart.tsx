import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon, CalenderIcon } from "../../icons";
import { dashboardApi, AttendanceData } from "../../api/dashboardApi";
import { dummyAttendanceData } from "../../api/dashboardDataDummy";

export default function AttendanceChart() {
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>(dummyAttendanceData);
  // const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

//   useEffect(() => {
//     fetchAttendanceData();
//   }, [selectedYear]);

//   const fetchAttendanceData = async () => {
//     try {
//       setLoading(true);
//       const data = await dashboardApi.getAttendanceData(selectedYear);
//       setAttendanceData(data);
//     } catch (error) {
//       console.error("Error fetching attendance data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      stacked: false,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: "55%",
      },
    },
    colors: ["#10B981", "#EF4444", "#3B82F6", "#F59E0B"],
    dataLabels: { enabled: false },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    xaxis: {
      categories: attendanceData.map(d => d.month),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          fontSize: "12px",
          colors: "#6B7280",
        },
      },
    },
    yaxis: {
      title: {
        text: "Number of Employees",
        style: {
          fontSize: "12px",
          color: "#6B7280",
        },
      },
      labels: {
        formatter: (val) => Math.floor(val).toString(),
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "14px",
      markers: {
        radius: 12,
      },
    },
    fill: {
      opacity: 0.9,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} employees`,
      },
    },
  };

  const series = [
    {
      name: "Present",
      data: attendanceData.map(d => d.present),
    },
        {
      name: "Late Arrival",
      data: attendanceData.map(d => d.late),
    },
    {
      name: "Absent",
      data: attendanceData.map(d => d.absent),
    },
    {
      name: "On Leave",
      data: attendanceData.map(d => d.leave),
    },
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const years = [2024, 2023, 2022];

  // if (loading) {
  //   return (
  //     <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 h-[400px] flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  //         <p className="mt-2 text-gray-600">Loading attendance data...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Monthly Attendance Overview
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Employee attendance distribution by month
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <CalenderIcon className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Export Data
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View Details
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="h-[250px]">
        <Chart options={options} series={series} type="bar" height={250} />
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">Avg. Attendance Rate</p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">94.2%</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">Perfect Attendance</p>
          <p className="text-xl font-bold text-green-700 dark:text-green-300">142</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
          <p className="text-sm text-amber-600 dark:text-amber-400">Late Arrivals</p>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300">28</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <p className="text-sm text-purple-600 dark:text-purple-400">Leave Balance Avg.</p>
          <p className="text-xl font-bold text-purple-700 dark:text-purple-300">8.5 days</p>
        </div>
      </div>
    </div>
  );
}