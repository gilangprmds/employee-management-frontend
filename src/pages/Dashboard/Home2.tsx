import EmployeeMetrics from "../../components/dashboard/EmployeeMetrics";
import DepartmentStats from "../../components/dashboard/DepartmentStats";
// import RecruitmentTarget from "../../components/dashboard/RecruitmentTarget";
import RecentEmployees from "../../components/dashboard/RecentEmployees";
// import LeaveDistribution from "../../components/dashboard/LeaveDistribution";
import PageMeta from "../../components/common/PageMeta";
import { 
  // useEffect,
  useState
 } from "react";
// import { PaginationUserData, userApi } from "../../api/userApi";
import { 
  // dashboardApi,
  DashboardStats 
} from "../../api/dashboardApi";
import AttendanceChart from "../../components/dashboard/AttendanceChart";

export default function EmployeeDashboard() {
  // const [loading, setLoading] = useState(true);
  const [stats
    // , setStats
  ] = useState<DashboardStats | null>(null);
  // const [error, setError] = useState<Error | null>(null);

  // useEffect(() => {
  //   const fetchDashboardData = async () => {
  //     try {
  //       setLoading(true);
  //       const dashboardStats = await dashboardApi.getStats();
  //       setStats(dashboardStats);
  //     } catch (err: unknown) {
  //       setError(err instanceof Error ? err : new Error("Unexpected error"));
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchDashboardData();
  // }, []);

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-96">
  //       <div className="text-center">
  //         <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //         <p className="mt-4 text-gray-600">Loading dashboard...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="flex items-center justify-center h-96">
  //       <div className="text-center">
  //         <div className="text-red-500 text-2xl mb-2">⚠️</div>
  //         <p className="text-gray-600">Failed to load dashboard data</p>
  //         <button
  //           onClick={() => window.location.reload()}
  //           className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
  //         >
  //           Retry
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <PageMeta
        title="Employee Dashboard | Employee Attendance Dashboard"
        description="Employee Management System Dashboard - Overview of HR metrics and analytics"
      />
      
      <div className="space-y-6">
        {/* Header */}
        {/* <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Employee Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with your workforce today.
          </p>
        </div> */}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Employee Metrics */}
            <EmployeeMetrics stats={stats} />
            
            {/* Attendance Chart */}
            <AttendanceChart />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recruitment Target */}
            {/* <RecruitmentTarget /> */}
                      <DepartmentStats />

            {/* Leave Distribution */}
            {/* <LeaveDistribution /> */}
          </div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Statistics */}
          {/* <DepartmentStats /> */}
          
          {/* Recent Employees */}
          <RecentEmployees />
        </div>
      </div>
    </>
  );
}