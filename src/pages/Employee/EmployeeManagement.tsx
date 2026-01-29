import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { userApi, UserQueryParams } from "../../api/userApi";
import { useEffect, useState } from "react";
import { PaginationUserData } from "../../api/userApi";
// import { useAuth } from "../../context/AuthContext";
import { Button as Button2 } from "../../components/ui/button2";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Edit,
  Eye,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "../../components/ui/dropdown-menu";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";

export default function UserManagement() {
  // 1. Definisikan state untuk data, loading, dan error
  const [data, setData] = useState<PaginationUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState<number>(5);

  // filter
  const [filter, setFilter] = useState<UserQueryParams>({
    page: 0,
    size: pageSize,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const pageSizeOptions = [
    { value: 5, label: "5" },
    { value: 10, label: "10" },
    { value: 20, label: "20" },
    { value: 50, label: "50" },
  ];
  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value);
    setPageSize(newSize);
    setFilter((prev) => ({ ...prev, size: newSize, page: 0 }));
    setCurrentPage(1);
  };

  // Departement & Status Filter
  const departmentOptions = [
    { value: "ALL", label: "Semua Department" },
    { value: "ADMIN", label: "Admin" },
    { value: "EMPLOYEE", label: "Employee" },
  ];
  const handleDepartmentChange = (value: string) => {
    const departmentValue = value === "ALL" ? "" : value;
    setFilter((prev) => ({ ...prev, role: departmentValue, page: 0 }));
  };

  const statusOptions = [
    { value: "ALL", label: "Semua Status" },
    { value: "ACTIVE", label: "Aktif" },
    { value: "INACTIVE", label: "Non-Aktif" },
    // { value: "RESIGN", label: "Resign" },
  ];
  const handleStatusChange = (value: string) => {
    const statusValue = value === "ALL" ? "" : value;

    setFilter((prev) => ({ ...prev, status: statusValue, page: 0 }));
  };

  // Untuk debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilter((prev) => ({ ...prev, name: searchTerm, page: 0 }));
    }, 500); // Tunggu 500ms setelah user berhenti mengetik

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Fungsi penanganan perubahan input pencarian
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 2. Gunakan useEffect untuk mengambil data saat komponen dimount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await userApi.getAllUsers(filter);
        setData(result);
        setCurrentPage(result.page + 1);
        setTotalPages(result.totalPages);
        setTotalItems(result.totalElements);
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error("Unexpected error"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]); // ✔ rerun HANYA setelah token muncul

  // 3. Tangani state loading dan error
  if (error) return <div>Terjadi kesalahan: {error.message}</div>;

  // Dropdown state

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Handler untuk toggle
  const handleToggleDropdown = (id: string) => {
    // Jika ID yang diklik sudah terbuka, maka tutup (set null)
    // Jika belum, maka buka ID tersebut
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // Kita buat komponen wrapper agar state tidak bercampur antar baris
  const EmployeeActions = ({
    index,
    totalData,
    EmployeeId,
    isOpen,
    onToggle,
    onClose,
  }: {
    index: number;
    totalData: number;
    EmployeeId: string;
    isOpen: boolean; // Diterima dari parent
    onToggle: () => void; // Fungsi untuk memberitahu parent
    onClose: () => void; // Fungsi untuk menutup
  }) => {
    // Logika sederhana: jika ini adalah 2 data terakhir, arahkan ke atas
    const direction =
      index >= totalData - 2 ? "bottom-full mb-2" : "top-full mt-2";

    return (
      <div className="relative inline-block text-left">
        {/* Tombol Titik Tiga (Trigger) */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Mencegah event bubbling
            onToggle();
          }}
          className="dropdown-toggle p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <MoreVertical className="size-5 text-gray-500" />
        </button>

        {/* Gunakan Komponen Reusable Kamu */}
        <Dropdown
          isOpen={isOpen}
          onClose={onClose}
          className={`w-44 ${direction}`}
        >
          <DropdownItem
            onItemClick={onClose}
            tag="a" // Beritahu komponen untuk merender Link
            to={`/employee/${EmployeeId}`} // Path dinamis
            // onClick={() => console.log("View detail", EmployeeId)}
            className="flex items-center gap-2"
          >
            <Eye className="size-4" /> View Detail
          </DropdownItem>

          <DropdownItem
            onItemClick={onClose}
            onClick={() => console.log("Edit detail", EmployeeId)}
            className="flex items-center gap-2"
          >
            <Edit className="size-4" /> Edit Detail
          </DropdownItem>

          <hr className="my-1 border-gray-100 dark:border-gray-800" />

          <DropdownItem
            onItemClick={onClose}
            onClick={() =>
              confirm("Hapus data?") && console.log("Delete", EmployeeId)
            }
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="size-4" /> Delete
          </DropdownItem>
        </Dropdown>
      </div>
    );
  };

  return (
    <>
      <PageMeta
        title="Employee Management | Employee Attendance Dashboard"
        description="Employee management page"
      />
      <PageBreadcrumb
        pageTitle="Employee Management"
        pageCrumb="Employee Management"
      />
      {/* <ComponentCard>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="rounded-full bg-emerald-600/10 p-3 text-emerald-600">
                <Eye className="w-5 h-5" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Total Pengguna
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{totalItems}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="rounded-full bg-green-500/10 p-3 text-green-500">
                <Eye className="w-5 h-5" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Total Pengguna Aktif
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{totalItems}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="rounded-full bg-red-500/10 p-3 text-red-500">
                <Eye className="w-5 h-5" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Total Pengguna Non-Aktif
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{totalItems}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-500/10 p-3 text-yellow-500">
                <Eye className="w-5 h-5" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Total Pengguna Pending
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{totalItems}</p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard> */}
      <div className="flex items-center justify-end border-b border-gray-100 p-5 dark:border-white/[0.05]">
        <Button
          variant="outline"
          size="sm"
          startIcon={<Download className="w-4 h-4" />}
          className="w-30 mx-4"
        >
          Export
        </Button>
        <Button
          variant="primary"
          size="sm"
          startIcon={<Plus className="w-4 h-4" />}
          className="w-50"
          onClick={() => (window.location.href = "/employee/add-employee")}
        >
          Tambah Karyawan
        </Button>
      </div>
      <ComponentCard>
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 m-5">
            <div>
              <Label>Departement</Label>
              <Select
                options={departmentOptions}
                defaultValue={
                  filter.role ? filter.role : filter.role === "" ? "ALL" : ""
                }
                placeholder="Pilih Departement"
                onChange={handleDepartmentChange}
                className="dark:bg-dark-900"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                options={statusOptions}
                defaultValue={
                  filter.status
                    ? filter.status
                    : filter.status === ""
                      ? "ALL"
                      : ""
                }
                placeholder="Pilih Status"
                onChange={handleStatusChange}
                className="dark:bg-dark-900"
              />
            </div>
            <div>
              <Label htmlFor="input">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  id="search"
                  className="pl-[35px]"
                  placeholder="Cari karyawan..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-black/20 backdrop-blur-sm">
              <span>Memuat data...</span>
            </div>
          )}
          <div className="max-w-full overflow-x-auto">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium  text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Nama Karyawan
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    ID Karyawan
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Departement
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Jabatan
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Tanggal Bergabung
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {data?.content.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                          <img
                            width={40}
                            height={40}
                            src={order.profileImageUrl}
                            alt={order.fullName}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {order.fullName}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {order.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.id}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.roles[0]}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.roles[0]}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      -
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          order.status === "ACTIVE"
                            ? "success"
                            : order.status === "PENDING"
                              ? "warning"
                              : "error"
                        }
                      >
                        {order.status === "ACTIVE"
                          ? "Aktif"
                          : order.status === "PENDING"
                            ? "Pending"
                            : "Non-Aktif"}
                      </Badge>{" "}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <EmployeeActions
                        EmployeeId={order.id}
                        // Cek apakah ID baris ini sama dengan ID yang sedang terbuka di state parent
                        isOpen={openDropdownId === order.id}
                        // Saat diklik, panggil handler di parent
                        onToggle={() => handleToggleDropdown(order.id)}
                        // Saat disuruh tutup (klik luar), reset state parent ke null
                        onClose={() => setOpenDropdownId(null)}
                        index={
                          data?.content.findIndex(
                            (user) => user.id === order.id,
                          ) || 0
                        }
                        totalData={data?.content.length || 0}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-5 py-3 font-normal text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Showing {(currentPage - 1) * pageSize + 1} -{" "}
                        {Math.min(currentPage * pageSize, totalItems)} of{" "}
                        {totalItems}
                      </div>
                      <div className="flex items-center ">
                        <div className="relative flex items-center mr-2">
                          <div className="text-xs text-gray-500 px-2">
                            Items per page
                          </div>
                          <select
                            className="h-8 w-12 appearance-none rounded-lg border border-gray-300
                          bg-transparent px-2 py-1 pr-1 text-xs shadow-theme-xs focus:border-brand-300
                          focus:outline-hidden focus:ring-3 focus:ring-emerald-600/10 dark:border-gray-700
                          dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800
                          text-gray-500 dark:text-gray-400"
                            onChange={(e) =>
                              handlePageSizeChange(e.target.value)
                            }
                          >
                            {/* Map over options */}
                            {pageSizeOptions.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                                className="text-xs text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 -right-0.5 flex items-center px-2 text-gray-700">
                            <svg
                              className="h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        <Button2
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setCurrentPage(1);
                            setFilter((prev) => ({ ...prev, page: 0 }));
                          }}
                          disabled={currentPage === 1}
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button2>
                        <Button2
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setCurrentPage(currentPage - 1);
                            setFilter((prev) => ({
                              ...prev,
                              page: currentPage - 1 - 1,
                            }));
                          }}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button2>
                        <span className="text-xs">
                          {currentPage} of {totalPages}
                        </span>
                        <Button2
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setCurrentPage(currentPage + 1);
                            setFilter((prev) => ({
                              ...prev,
                              page: currentPage - 1 + 1,
                            }));
                          }}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button2>
                        <Button2
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setCurrentPage(currentPage + 1);
                            setFilter((prev) => ({
                              ...prev,
                              page: totalPages - 1,
                            }));
                          }}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button2>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}
