import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { CalendarDaysIcon } from "../../icons/icons2";
export default function LeaveDistribution() {
  const [isOpen, setIsOpen] = useState(false);

  const leaveData = [
    { type: "Annual Leave", count: 142, percentage: 42, color: "#3B82F6" },
    { type: "Sick Leave", count: 78, percentage: 23, color: "#10B981" },
    { type: "Maternity Leave", count: 45, percentage: 13, color: "#8B5CF6" },
    { type: "Paternity Leave", count: 18, percentage: 5, color: "#F59E0B" },
    { type: "Unpaid Leave", count: 32, percentage: 9, color: "#EF4444" },
    { type: "Other", count: 24, percentage: 7, color: "#6B7280" },
  ];

  const options: ApexOptions = {
    chart: {
      type: "pie",
      fontFamily: "Outfit, sans-serif",
    },
    colors: leaveData.map(d => d.color),
    labels: leaveData.map(d => d.type),
    legend: {
      position: "bottom",
      fontSize: "12px",
      markers: {
        radius: 6,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "45%",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} days`,
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const series = leaveData.map(d => d.count);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const upcomingLeaves = [
    { name: "Alex Johnson", type: "Annual Leave", days: 7, startDate: "Jan 25" },
    { name: "Maria Garcia", type: "Sick Leave", days: 3, startDate: "Jan 26" },
    { name: "Tom Wilson", type: "Paternity Leave", days: 14, startDate: "Feb 1" },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <CalendarDaysIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Leave Distribution
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Types of leave taken this year
            </p>
          </div>
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
              Leave Calendar
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Manage Requests
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[250px]">
          <Chart options={options} series={series} type="pie" height={250} />
        </div>
        
        <div>
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 dark:text-white mb-3">
              Leave Summary
            </h4>
            <div className="space-y-3">
              {leaveData.map((leave, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: leave.color }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {leave.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {leave.count} days
                    </span>
                    <span className="text-xs text-gray-500">
                      {leave.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-800 dark:text-white mb-3">
              Upcoming Leaves
            </h4>
            <div className="space-y-3">
              {upcomingLeaves.map((leave, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {leave.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {leave.type} • {leave.days} days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {leave.startDate}
                    </p>
                    <p className="text-xs text-gray-500">Starts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">Avg. Leave Days/Employee</p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">8.2</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">Leave Utilization Rate</p>
          <p className="text-xl font-bold text-green-700 dark:text-green-300">68%</p>
        </div>
      </div>
    </div>
  );
}