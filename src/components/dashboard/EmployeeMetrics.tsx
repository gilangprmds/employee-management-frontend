import { DashboardStats } from "../../api/dashboardApi";
import {
  UsersIcon,
  UserCheckIcon,
  // UserPlusIcon,
  // CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon
} from "lucide-react";
import Badge from "../ui/badge/Badge";

interface EmployeeMetricsProps {
  stats: DashboardStats | null;
}

export default function EmployeeMetrics({ stats }: EmployeeMetricsProps) {
  const metrics = [
    {
      title: "Total Employees",
      value: stats?.totalEmployees || 0,
      icon: UsersIcon,
      change: "+2.5%",
      trend: "up",
      color: "bg-blue-50 text-blue-600",
      iconColor: "bg-blue-100 text-blue-600"
    },
    {
      title: "Active Today",
      value: stats?.activeEmployees || 0,
      icon: UserCheckIcon,
      change: "+5.2%",
      trend: "up",
      color: "bg-green-50 text-green-600",
      iconColor: "bg-green-100 text-green-600"
    },
    // {
    //   title: "New Hires (This Month)",
    //   value: stats?.newHiresThisMonth || 0,
    //   icon: UserPlusIcon,
    //   change: "+15.3%",
    //   trend: "up",
    //   color: "bg-purple-50 text-purple-600",
    //   iconColor: "bg-purple-100 text-purple-600"
    // },
    // {
    //   title: "Pending Leave Requests",
    //   value: stats?.pendingLeaves || 0,
    //   icon: CalendarIcon,
    //   change: "-3.1%",
    //   trend: "down",
    //   color: "bg-amber-50 text-amber-600",
    //   iconColor: "bg-amber-100 text-amber-600"
    // },
    {
      title: "Average Attendance",
      value: `${stats?.avgAttendance || 0}%`,
      icon: ClockIcon,
      change: "+1.8%",
      trend: "up",
      color: "bg-indigo-50 text-indigo-600",
      iconColor: "bg-indigo-100 text-indigo-600"
    },
    // {
    //   title: "Attrition Rate",
    //   value: `${stats?.attritionRate || 0}%`,
    //   icon: TrendingDownIcon,
    //   change: "-0.5%",
    //   trend: "down",
    //   color: "bg-red-50 text-red-600",
    //   iconColor: "bg-red-100 text-red-600"
    // }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-lg ${metric.iconColor}`}>
              <metric.icon className="w-6 h-6" />
            </div>
            <Badge color={metric.trend === "up" ? "success" : "error"}>
              {metric.trend === "up" ? <TrendingUpIcon className="w-4 h-4" /> : <TrendingDownIcon className="w-4 h-4" />}
              {metric.change}
            </Badge>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {metric.title}
            </p>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
              {metric.value}
            </h4>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${metric.color}`}>
              {metric.trend === "up" ? "Improving" : "Decreasing"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}