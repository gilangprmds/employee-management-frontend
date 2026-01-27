import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { BuildingOfficeIcon } from "../../icons/icons2";
export default function DepartmentStats() {
  const [isOpen, setIsOpen] = useState(false);

  const departmentData = [
    { name: "Engineering", employees: 42, growth: "+12%", color: "#3B82F6" },
    { name: "Sales", employees: 28, growth: "+8%", color: "#10B981" },
    { name: "Marketing", employees: 24, growth: "+15%", color: "#8B5CF6" },
    { name: "HR", employees: 18, growth: "+5%", color: "#F59E0B" },
    { name: "Finance", employees: 16, growth: "+3%", color: "#EF4444" },
    { name: "Operations", employees: 22, growth: "+7%", color: "#06B6D4" },
  ];

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    colors: departmentData.map(d => d.color),
    labels: departmentData.map(d => d.name),
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "12px",
      // markers: {
      //   radius: 12,
      // },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Employees",
              fontSize: "16px",
              fontWeight: 600,
              color: "#374151",
            },
            value: {
              fontSize: "20px",
              fontWeight: 700,
              color: "#111827",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 2,
      colors: ["#fff"],
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} employees`,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const series = departmentData.map(d => d.employees);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <BuildingOfficeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Department Distribution
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Employee count by department
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
              View All Departments
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Export Report
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[300px]">
          <Chart options={options} series={series} type="donut" height={300} />
        </div>
        
        <div className="space-y-4">
          {departmentData.map((dept, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: dept.color }}
                />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {dept.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {dept.employees} employees
                  </p>
                </div>
              </div>
              
              {/* <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  dept.growth.startsWith('+') 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {dept.growth}
                </span>
                <span className="text-xs text-gray-500">this month</span>
              </div> */}
            </div>
          ))}
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Employees
              </p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {departmentData.reduce((sum, dept) => sum + dept.employees, 0)}
              </p>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Departments
              </p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {departmentData.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}