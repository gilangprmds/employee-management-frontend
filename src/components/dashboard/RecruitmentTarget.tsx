import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon, CheckCircleIcon } from "../../icons";
import { TargetIcon } from "../../icons/icons2";
export default function RecruitmentTarget() {
  const [isOpen, setIsOpen] = useState(false);

  const progress = 82;
  const target = 25;
  const achieved = 21;
  const remaining = target - achieved;

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      height: 280,
      sparkline: {
        enabled: true,
      },
    },
    colors: ["#10B981"],
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "70%",
        },
        track: {
          background: "#E5E7EB",
          strokeWidth: "100%",
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#111827",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        gradientToColors: ["#10B981"],
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Completion"],
  };

  const series = [progress];

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const recruitmentStats = [
    { label: "Open Positions", value: 8, color: "bg-blue-500" },
    { label: "Interviews Scheduled", value: 15, color: "bg-purple-500" },
    { label: "Offers Sent", value: 5, color: "bg-green-500" },
    { label: "Onboarding", value: 3, color: "bg-amber-500" },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TargetIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Recruitment Target
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monthly hiring progress
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
              Set New Target
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View Candidates
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative w-64 h-64">
          <Chart options={options} series={series} type="radialBar" height={280} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <CheckCircleIcon className="w-12 h-12 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {achieved}/{target}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Hires</p>
          </div>
        </div>
        
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-md">
          {remaining > 0 
            ? `You need ${remaining} more hires to reach this month's target.`
            : "Congratulations! You've exceeded this month's target!"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {recruitmentStats.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center`}>
                <span className="text-white font-bold">{stat.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Time to Hire (Avg.)
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              24 days
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Cost per Hire
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              $4,280
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}