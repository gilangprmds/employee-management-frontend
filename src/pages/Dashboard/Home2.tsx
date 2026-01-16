import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import { useEffect, useState } from "react";
import { PaginationData, userApi } from "../../api/userApi";

export default function Home2() {
  const [data, setData] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [totalEmployees, setTotalEmployees] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await userApi.getAllUsers();
        setData(result);
        setTotalEmployees(result.totalItems);
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error("Unexpected error"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          {/* <EcommerceMetrics /> */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
              </div>

              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Karyawan
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {totalEmployees}
                  </h4>
                </div>
                <Badge color="success">
                  <ArrowUpIcon />
                  11.01%
                </Badge>
              </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Orders
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    5,359
                  </h4>
                </div>

                <Badge color="error">
                  <ArrowDownIcon />
                  9.05%
                </Badge>
              </div>
            </div>
            {/* <!-- Metric Item End --> */}
          </div>

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
