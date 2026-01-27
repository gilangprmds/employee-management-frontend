import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { UserCircleIcon, ArrowRightIcon } from "lucide-react";
import { useState } from "react";

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  joinDate: string;
  status: "Active" | "Probation" | "Onboarding";
  avatar?: string;
}

const employees: Employee[] = [
  {
    id: 1,
    name: "John Smith",
    position: "Senior Software Engineer",
    department: "Engineering",
    joinDate: "2024-01-15",
    status: "Active",
    avatar: "/images/avatar/avatar-01.jpg",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    position: "HR Manager",
    department: "Human Resources",
    joinDate: "2024-01-10",
    status: "Active",
    avatar: "/images/avatar/avatar-02.jpg",
  },
  {
    id: 3,
    name: "Michael Chen",
    position: "Sales Executive",
    department: "Sales",
    joinDate: "2024-01-05",
    status: "Probation",
    avatar: "/images/avatar/avatar-03.jpg",
  },
  {
    id: 4,
    name: "Emily Davis",
    position: "Marketing Specialist",
    department: "Marketing",
    joinDate: "2023-12-20",
    status: "Active",
    avatar: "/images/avatar/avatar-04.jpg",
  },
  {
    id: 5,
    name: "Robert Wilson",
    position: "Financial Analyst",
    department: "Finance",
    joinDate: "2023-12-15",
    status: "Onboarding",
    avatar: "/images/avatar/avatar-05.jpg",
  },
  {
    id: 6,
    name: "Lisa Anderson",
    position: "Product Manager",
    department: "Product",
    joinDate: "2023-12-10",
    status: "Active",
    avatar: "/images/avatar/avatar-06.jpg",
  },
  {
    id: 7,
    name: "David Brown",
    position: "DevOps Engineer",
    department: "Engineering",
    joinDate: "2023-12-05",
    status: "Active",
    avatar: "/images/avatar/avatar-07.jpg",
  },
  {
    id: 8,
    name: "Jennifer Lee",
    position: "Customer Success",
    department: "Operations",
    joinDate: "2023-11-30",
    status: "Active",
    avatar: "/images/avatar/avatar-08.jpg",
  },
];

export default function RecentEmployees() {
  const [showAll, setShowAll] = useState(false);
  const displayEmployees = showAll ? employees : employees.slice(0, 5);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "Active":
        return "success";
      case "Probation":
        return "warning";
      case "Onboarding":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Recent Employees
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            New hires and their status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Filter
            <svg
              className="stroke-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 10H15M2.5 5H17.5M7.5 15H12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {showAll ? "Show Less" : "See All"}
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-200 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 dark:text-gray-400">
                Employee
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 dark:text-gray-400">
                Position
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 dark:text-gray-400">
                Department
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 dark:text-gray-400">
                Join Date
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 dark:text-gray-400">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayEmployees.map((employee) => (
              <TableRow key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      {employee.avatar ? (
                        <img
                          src={employee.avatar}
                          className="h-10 w-10 object-cover"
                          alt={employee.name}
                        />
                      ) : (
                        <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {employee.name}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        #{employee.id.toString().padStart(4, '0')}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <p className="font-medium text-gray-800 dark:text-white">
                    {employee.position}
                  </p>
                </TableCell>
                <TableCell className="py-4">
                  <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                    {employee.department}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-gray-500 dark:text-gray-400">
                  {formatDate(employee.joinDate)}
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    size="sm"
                    // color={getStatusColor(employee.status)}
                  >
                    {employee.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!showAll && employees.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all {employees.length} employees →
          </button>
        </div>
      )}
    </div>
  );
}